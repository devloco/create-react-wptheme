/**
 * Copyright (c) 2018-present, https://github.com/devloco
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const fs = require("fs-extra");
const path = require("path");
const { rm, cp } = require("shelljs");
const wpThemePostInstallerInfo = require("@devloco/react-scripts-wptheme-utils/postInstallerInfo");
const wpThemeUserConfig = require("@devloco/react-scripts-wptheme-utils/getUserConfig"); //(paths, process.env.NODE_ENV);

const _doNotEditFileName = "!DO_NOT_EDIT_THESE_FILES!.txt";
const _readyToDeployFileName = "!READY_TO_DEPLOY!.txt";
const _forBuild = () => {
    const nodeEnv = process.env.NODE_ENV;
    switch (nodeEnv) {
        case "dev":
        case "development":
            return false;
        case "build":
        case "prod":
        case "production":
            return true;
        default:
            console.log(chalk.red(`Unknown env.NODE_ENV: ${nodeEnv}`));
            return false;
    }
};

const fileFunctions = {
    copyPublicFolder: function(paths) {
        fs.copySync(paths.appPublic, paths.appBuild, {
            dereference: true,
            filter: (file) => file !== paths.appHtml && file.indexOf("index.html") == -1 && file.indexOf(wpThemePostInstallerInfo.postInstallerName) == -1
        });
    },
    copyToThemeFolder: function(paths) {
        const userConfig = wpThemeUserConfig(paths, process.env.NODE_ENV);
        const forBuild = _forBuild();
        let actionPath = (forBuild && userConfig && userConfig.finalBuildPath) || "..";

        const copyFrom = path.join(paths.appBuild, "/*");

        if (forBuild === true) {
            fileFunctions.cleanThemeFolder(paths, true);
            fileFunctions.deleteDeployFolder(paths);

            const themeName = require(paths.appPackageJson).name;
            actionPath = (userConfig && userConfig.finalBuildPath) || path.join("..", themeName);
            fs.ensureDirSync(actionPath);
        }

        cp("-rf", copyFrom, actionPath);
    },
    cleanThemeFolder: function(paths) {
        const userConfig = wpThemeUserConfig(paths, process.env.NODE_ENV);
        const forBuild = _forBuild();
        let actionPath = (forBuild && userConfig && userConfig.finalBuildPath) || "..";

        rm("-rf", path.join(actionPath, "static"));

        if (forBuild === true) {
            const doNotEditFile = path.join(actionPath, _doNotEditFileName);
            rm("-f", doNotEditFile);

            const readyToDeployFile = path.join(actionPath, _readyToDeployFileName);
            rm("-f", readyToDeployFile);

            const assetManifest = path.join(actionPath, "asset-manifest*");
            rm("-r", assetManifest);

            const favIconIco = path.join(actionPath, "favicon.ico");
            rm("-r", favIconIco);

            const indexPhp = path.join(actionPath, "index.php");
            rm("-r", indexPhp);

            const logoFiles = path.join(actionPath, "logo*");
            rm("-r", logoFiles);

            const precacheFiles = path.join(actionPath, "precache*");
            rm("-r", precacheFiles);

            const manifestJson = path.join(actionPath, "manifest.json");
            rm("-r", manifestJson);

            const robotsTxt = path.join(actionPath, "robots.txt");
            rm("-r", robotsTxt);

            const screenShotPng = path.join(actionPath, "screenshot.png");
            rm("-r", screenShotPng);

            const serviceWorker = path.join(actionPath, "service-worker.js");
            rm("-r", serviceWorker);

            const styleCss = path.join(actionPath, "style.css");
            rm("-r", styleCss);
        }
    },
    deleteDeployFolder: function(paths) {
        const userConfig = wpThemeUserConfig(paths, process.env.NODE_ENV);
        const forBuild = _forBuild();
        const themeName = require(paths.appPackageJson).name;

        let deployFolder = (forBuild && userConfig && userConfig.finalBuildPath) || path.join("..", themeName);
        if (fs.existsSync(deployFolder)) {
            var files = fs.readdirSync(deployFolder);
            files.forEach((file) => {
                if (file !== "react-src") {
                    const fileDir = path.join(deployFolder, file);
                    rm("-rf", fileDir);
                }
            });
        }
    },
    setupCopyToThemeFolder: function(paths) {
        const userConfig = wpThemeUserConfig(paths, process.env.NODE_ENV);
        const forBuild = _forBuild();
        let actionPath = (forBuild && userConfig && userConfig.finalBuildPath) || "..";

        const indexPhp = path.join(paths.appPublic, "index.php");
        cp("-rf", indexPhp, actionPath);

        const styleCss = path.join(paths.appPublic, "style.css");
        cp("-rf", styleCss, actionPath);

        const screenShotPng = path.join(paths.appPublic, "screenshot.png");
        cp("-rf", screenShotPng, actionPath);

        const favIconIco = path.join(paths.appPublic, "favicon.ico");
        cp("-rf", favIconIco, actionPath);
    },
    writeDoNotEditFile: function(paths) {
        const userConfig = wpThemeUserConfig(paths, process.env.NODE_ENV);
        const forBuild = _forBuild();
        let actionPath = (forBuild && userConfig && userConfig.finalBuildPath) || "..";
        const readyToDeployFile = path.join(actionPath, _readyToDeployFileName);
        fs.access(readyToDeployFile, fs.constants.F_OK, (err) => {
            if (!err) {
                rm("-f", readyToDeployFile);
            }
        });

        let doNotEditContent = `Instead, edit the files in the "react-src/src" and "react-src/public" folders.`;
        doNotEditContent += "\nThese files are overwritten by Webpack every time you make edits to the files in those folders.";
        doNotEditContent += "\nYou will lose all changes made to these files when that happens.";

        const doNotEditFile = path.join(actionPath, _doNotEditFileName);
        fs.access(doNotEditFile, fs.constants.F_OK, (err) => {
            if (err) {
                fs.writeFile(doNotEditFile, doNotEditContent, "utf8", (err) => {});
            }
        });
    },
    writeReadyToDeployFile: function(paths) {
        const userConfig = wpThemeUserConfig(paths, process.env.NODE_ENV);
        const forBuild = _forBuild();
        let actionPath = (forBuild && userConfig && userConfig.finalBuildPath) || "..";
        const doNotEditFile = path.join(actionPath, _doNotEditFileName);
        fs.access(doNotEditFile, fs.constants.F_OK, (err) => {
            if (!err) {
                rm("-f", doNotEditFile);
            }
        });

        const themeName = require(paths.appPackageJson).name;
        let readyToDeployContent = `The theme named "${themeName}" is ready to deploy to your production server.`;
        readyToDeployContent += '\n\nIf you need to continue developing your theme, simply change to the "react-src" folder and type the command: npm run start';

        const readyToDeployFile = path.join(actionPath, _readyToDeployFileName);
        fs.access(readyToDeployFile, fs.constants.F_OK, (err) => {
            if (err) {
                fs.writeFile(readyToDeployFile, readyToDeployContent, "utf8", (err) => {});
            }
        });
    }
};

module.exports = fileFunctions;
