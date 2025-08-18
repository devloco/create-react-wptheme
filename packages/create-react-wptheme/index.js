#!/usr/bin/env node

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// create-react-wptheme is installed globally on people's computers. This means
// that it is extremely difficult to have them upgrade the version and
// because there's only one global version installed, it is very prone to
// breaking changes.
//
// The only job of create-react-wptheme is to init the repository and then
// forward all the commands to the local version of create-react-wptheme.
//
// If you need to add a new command, please add it to the scripts/ folder.
//
// The only reason to modify this file is to add more warnings and
// troubleshooting information for the `create-react-wptheme` command.
//
// Do not make breaking changes! We absolutely don't want to have to
// tell people to update their global version of create-react-wptheme.
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

"use strict";

var chalk = require("chalk");

var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split(".");
var major = semver[0];

if (major < 14) {
    console.error(chalk.red(`You are running Node ${currentNodeVersion}.`));
    console.error(chalk.red("Create React WP Theme requires Node 14 or higher."));
    console.error(chalk.red("Please update your version of Node."));
    process.exit(1);
}

require("./createReactWpTheme");
