/*
 * View model for OctoPrint-CostEstimation
 *
 * Author: Sven Lohrmann <malnvenshorn@mailbox.org>
 * License: AGPLv3
 */

$(function() {

    function CostEstimationViewModel(parameters) {
        var self = this;

        self.printerState = parameters[0];
        self.settings = parameters[1];
        self.loginState = parameters[2];
        self.filamentManager = parameters[3];

        self.showEstimatedCost = ko.pureComputed(function() {
            return self.settings.settings.plugins.costestimation.requiresLogin() ?
                self.loginState.isUser() : true;
        });

        self.showFilamentGroup = ko.pureComputed(function() {
            return self.filamentManager === null || !self.settings.settings.plugins.costestimation.useFilamentManager();
        });

        self.estimatedCostString = ko.pureComputed(function() {
            if (!self.showEstimatedCost()) return "user not logged in";
            if (self.printerState.filename() === undefined) return "no filename";
            if (self.printerState.filament().length == 0) return "no filament from meta";

            var pluginSettings = self.settings.settings.plugins.costestimation;
            var jobFilament =  self.printerState.filament();

            var withDefaultSpoolValues = false;
            var noSpoolValues = false;
            var spoolData = null;
            if (self.filamentManager !== null && pluginSettings.useFilamentManager()) {
                spoolData = self.filamentManager.selectedSpools();
            }

            // calculating filament cost
            var filamentCost = 0;
            for (var i = 0; i < jobFilament.length; ++i) {
                var result = /(\d+)/.exec(jobFilament[i].name()); // extract tool id from name
                var tool = result === null ? 0 : result[1];

                if (spoolData !== null && spoolData[tool] === undefined) {
                    noSpoolValues = true;
                    continue;  // skip tools with no selected spool
                }

                var costOfFilament, weightOfFilament, densityOfFilament, diameterOfFilament;

                if (spoolData !== null) {
                    costOfFilament = spoolData[tool].cost;
                    weightOfFilament =  spoolData[tool].weight;
                    densityOfFilament = spoolData[tool].profile.density;
                    diameterOfFilament = spoolData[tool].profile.diameter;
                } else {
                    withDefaultSpoolValues = true;
                    costOfFilament = parseFloat(pluginSettings.costOfFilament());
                    weightOfFilament = parseFloat(pluginSettings.weightOfFilament());
                    densityOfFilament = parseFloat(pluginSettings.densityOfFilament());
                    diameterOfFilament = parseFloat(pluginSettings.diameterOfFilament());
                }

                var costPerWeight = weightOfFilament > 0 ? costOfFilament / weightOfFilament : 0;
                var filamentLength = jobFilament[i].data().length;
                var filamentVolume = self.calculateVolume(filamentLength, diameterOfFilament) / 1000;

                filamentCost += costPerWeight * filamentVolume * densityOfFilament;
            }

            // calculating electricity cost
            var powerConsumption = parseFloat(pluginSettings.powerConsumption());
            var costOfElectricity = parseFloat(pluginSettings.costOfElectricity());
            var costPerHour = powerConsumption * costOfElectricity;
            var estimatedPrintTime = self.printerState.estimatedPrintTime() / 3600;  // h
            var electricityCost = costPerHour * estimatedPrintTime;

            // calculating printer cost
            var purchasePrice = parseFloat(pluginSettings.priceOfPrinter());
            var lifespan = parseFloat(pluginSettings.lifespanOfPrinter());
            var depreciationPerHour = lifespan > 0 ? purchasePrice / lifespan : 0;
            var maintenancePerHour = parseFloat(pluginSettings.maintenanceCosts());
            var printerCost = (depreciationPerHour + maintenancePerHour) * estimatedPrintTime;

            // assembling string
            var estimatedCost = filamentCost + electricityCost + printerCost;
            var currencySymbol = pluginSettings.currency();
            var currencyFormat = pluginSettings.currencyFormat();
            var costResult = currencyFormat.replace("%v", estimatedCost.toFixed(2)).replace("%s", currencySymbol);
            if (withDefaultSpoolValues == true){
                costResult += " (with default Spool-Values)";
            }
            if (noSpoolValues == true){
                costResult += " (no Spool-Values)";
            }
            return costResult;
        });

        self.tooltipCostBreakdown = ko.pureComputed(function() {
            if (!self.showEstimatedCost()) return "-";
            if (self.printerState.filename() === undefined) return "-";
            if (self.printerState.filament().length == 0) return "-";

            var pluginSettings = self.settings.settings.plugins.costestimation;
            var jobFilament =  self.printerState.filament();
            var spoolData = null;

            if (self.filamentManager !== null && pluginSettings.useFilamentManager()) {
                spoolData = self.filamentManager.selectedSpools();
            }

            // calculating filament cost
            var filamentCost = 0;
            for (var i = 0; i < jobFilament.length; ++i) {
                var result = /(\d+)/.exec(jobFilament[i].name()); // extract tool id from name
                var tool = result === null ? 0 : result[1];

                if (spoolData !== null && spoolData[tool] === undefined) continue;  // skip tools with no selected spool

                var costOfFilament, weightOfFilament, densityOfFilament, diameterOfFilament;

                if (spoolData !== null) {
                    costOfFilament = spoolData[tool].cost;
                    weightOfFilament =  spoolData[tool].weight;
                    densityOfFilament = spoolData[tool].profile.density;
                    diameterOfFilament = spoolData[tool].profile.diameter;
                } else {
                    costOfFilament = parseFloat(pluginSettings.costOfFilament());
                    weightOfFilament = parseFloat(pluginSettings.weightOfFilament());
                    densityOfFilament = parseFloat(pluginSettings.densityOfFilament());
                    diameterOfFilament = parseFloat(pluginSettings.diameterOfFilament());
                }

                var costPerWeight = weightOfFilament > 0 ? costOfFilament / weightOfFilament : 0;
                var filamentLength = jobFilament[i].data().length;
                var filamentVolume = self.calculateVolume(filamentLength, diameterOfFilament) / 1000;

                filamentCost += costPerWeight * filamentVolume * densityOfFilament;
            }

            // calculating electricity cost
            var powerConsumption = parseFloat(pluginSettings.powerConsumption());
            var costOfElectricity = parseFloat(pluginSettings.costOfElectricity());
            var costPerHour = powerConsumption * costOfElectricity;
            var estimatedPrintTime = self.printerState.estimatedPrintTime() / 3600;  // h
            var electricityCost = costPerHour * estimatedPrintTime;

            // calculating printer cost
            var purchasePrice = parseFloat(pluginSettings.priceOfPrinter());
            var lifespan = parseFloat(pluginSettings.lifespanOfPrinter());
            var depreciationPerHour = lifespan > 0 ? purchasePrice / lifespan : 0;
            var maintenancePerHour = parseFloat(pluginSettings.maintenanceCosts());
            var printerCost = (depreciationPerHour + maintenancePerHour) * estimatedPrintTime;

            // assembling string
            var tooltipCostBreakdown = "Filament: "+ filamentCost.toFixed(2) + "Electricity: " + electricityCost.toFixed(2) + "Printer: "+ printerCost.toFixed(2);
            return tooltipCostBreakdown;
        });

        self.calculateVolume = function(length, diameter) {
            var radius = diameter / 2;
            return length * Math.PI * radius * radius;
        };

        self.tooltipCostBreakdown = ko.pureComputed(function() {
            if (!self.showEstimatedCost()) return "-";
            if (self.printerState.filename() === undefined) return "-";
            if (self.printerState.filament().length == 0) return "-";

            var pluginSettings = self.settings.settings.plugins.costestimation;
            var jobFilament =  self.printerState.filament();
            var spoolData = null;

            if (self.filamentManager !== null && pluginSettings.useFilamentManager()) {
                spoolData = self.filamentManager.selectedSpools();
            }

            // calculating filament cost
            var filamentCost = 0;
            for (var i = 0; i < jobFilament.length; ++i) {
                var result = /(\d+)/.exec(jobFilament[i].name()); // extract tool id from name
                var tool = result === null ? 0 : result[1];

                if (spoolData !== null && spoolData[tool] === undefined) continue;  // skip tools with no selected spool

                var costOfFilament, weightOfFilament, densityOfFilament, diameterOfFilament;

                if (spoolData !== null) {
                    costOfFilament = spoolData[tool].cost;
                    weightOfFilament =  spoolData[tool].weight;
                    densityOfFilament = spoolData[tool].profile.density;
                    diameterOfFilament = spoolData[tool].profile.diameter;
                } else {
                    costOfFilament = parseFloat(pluginSettings.costOfFilament());
                    weightOfFilament = parseFloat(pluginSettings.weightOfFilament());
                    densityOfFilament = parseFloat(pluginSettings.densityOfFilament());
                    diameterOfFilament = parseFloat(pluginSettings.diameterOfFilament());
                }

                var costPerWeight = weightOfFilament > 0 ? costOfFilament / weightOfFilament : 0;
                var filamentLength = jobFilament[i].data().length;
                var filamentVolume = self.calculateVolume(filamentLength, diameterOfFilament) / 1000;

                filamentCost += costPerWeight * filamentVolume * densityOfFilament;
            }

            // calculating electricity cost
            var powerConsumption = parseFloat(pluginSettings.powerConsumption());
            var costOfElectricity = parseFloat(pluginSettings.costOfElectricity());
            var costPerHour = powerConsumption * costOfElectricity;
            var estimatedPrintTime = self.printerState.estimatedPrintTime() / 3600;  // h
            var electricityCost = costPerHour * estimatedPrintTime;

            // calculating printer cost
            var purchasePrice = parseFloat(pluginSettings.priceOfPrinter());
            var lifespan = parseFloat(pluginSettings.lifespanOfPrinter());
            var depreciationPerHour = lifespan > 0 ? purchasePrice / lifespan : 0;
            var maintenancePerHour = parseFloat(pluginSettings.maintenanceCosts());
            var printerCost = (depreciationPerHour + maintenancePerHour) * estimatedPrintTime;

            // assembling string
            var currencySymbol = pluginSettings.currency();
            return "Filament: " + currencySymbol + filamentCost.toFixed(2) + " / Electricity: " + currencySymbol + electricityCost.toFixed(2) + " / Printer: "+ currencySymbol + printerCost.toFixed(2);
        });
        
        
        self.onBeforeBinding = function() {
            var element = $("#state").find("hr:nth-of-type(2)");
            if (element.length) {
                var name = gettext("Cost");
                var text = gettext("Estimated print cost based on required quantity of filament and print time");
                element.before("<div id='costestimation_string' data-bind='visible: showEstimatedCost()'><span title='" + text + "'>" + name + "</span>: <span data-bind='attr: {title: tooltipCostBreakdown }'><strong data-bind='text: estimatedCostString'></strong></span></div>");
            }
        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: CostEstimationViewModel,
        dependencies: ["printerStateViewModel", "settingsViewModel",
                       "loginStateViewModel", "filamentManagerViewModel"],
        optional: ["filamentManagerViewModel"],
        elements: ["#costestimation_string", "#settings_plugin_costestimation"]
    });
});

