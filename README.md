## Fork Notes: 
Forked original in order to add a tooltip over the cost estimate. The tooltip breaks down the individual cost components and shows the cost separately for Filament, Electricity, Printer. 

-----------------

# OctoPrint-CostEstimation

## UNDER NEW MANAGEMENT

    Hi everybody,
    because there was no activtiy in the last month on the origial GitHub-Repository from @malnvenshorn,
    the community deceided to find a new home of this OctoPrint-Plugin and here it it ;-)
    See https://github.com/OctoPrint/plugins.octoprint.org/issues/623 for more details

    What is my roadmap/stratagy of "hosting" this plugin?
    - First: Plugin should run under the latest versions of Python and OctoPrint
    - Analysing/fixing issues that prevent using the plugin
    - An open mind for new ideas

# Overview

[![Version](https://img.shields.io/badge/dynamic/json.svg?color=brightgreen&label=version&url=https://api.github.com/repos/OllisGit/OctoPrint-CostEstimation/releases&query=$[0].name)]()
[![Released](https://img.shields.io/badge/dynamic/json.svg?color=brightgreen&label=released&url=https://api.github.com/repos/OllisGit/OctoPrint-CostEstimation/releases&query=$[0].published_at)]()
![GitHub Releases (by Release)](https://img.shields.io/github/downloads/OllisGit/OctoPrint-CostEstimation/latest/total.svg)

This OctoPrint plugin displays the estimated print cost for the loaded model. The print cost includes the price for the used filament the maintenance and operating cost for the printer as well as the depreciation of the printer.

## Features
- Calculation based on the provided filament length
- Customizable currency symbol
- Hide cost if not logged in (optional)
- Support for multiple extruders
- Support for filament profiles with [Filament Manager Plugin](https://github.com/OllisGit/OctoPrint-FilamentManager)

## Screenshots

![CostEstimation](screenshots/costestimation.png?raw=true)

![CostEstimation Settings](screenshots/costestimation_settings.png?raw=true)

## Setup

Install manually using this URL:

    https://github.com/mdelecate/OctoPrint-CostEstimation/archive/master.zip
