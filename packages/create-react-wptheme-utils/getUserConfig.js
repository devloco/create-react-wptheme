/**
 * Copyright (c) 2018-present, https://github.com/devloco
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const fs = require("fs-extra");
const chalk = require("chalk");
const path = require("path");
const wpThemePostInstallerInfo = require("@devloco/react-scripts-wptheme-utils/postInstallerInfo");

const _userDevConfigName = "user.dev.json";
const _userProdConfigName = "user.prod.json";

function _writeUserConfig(paths, configName, configString) {
    let configPath = path.join(paths.appPath, configName);
    fs.writeFileSync(configPath, configString);
}

function _getUserConfig(paths, configName, defaultConfig) {
    let userConfig = null;
    try {
        userConfig = require(path.join(paths.appPath, configName));
    } catch (err) {
        userConfig = JSON.stringify(defaultConfig, null, 4);
        _writeUserConfig(paths, configName, userConfig);
        return defaultConfig;
    }

    return userConfig;
}

module.exports = function(paths, nodeEnv) {
    const appPackageJson = require(paths.appPackageJson);

    const defaultUserDevConfig = {
        fileWatcherPlugin: {
            touchFile: "./public/index.php",
            ignored: "./public/index.php",
            watchFileGlobs: ["./public/**/*.js", "./public/**/*.css", "./public/**/*.php"]
        },
        wpThemeServer: {
            enable: true,
            host: "127.0.0.1",
            port: 8090,
            sslCert: null,
            sslKey: null,
            watchFile: "../index.php"
        },
        injectWpThemeClient: {
            override: null,
            file: "./build/index.php"
        }
    };

    const defaultUserProdConfig = {
        finalBuildPath: null,
        homepage: appPackageJson.homepage
    };

    // Create both files ASAP.
    if (!wpThemePostInstallerInfo.postInstallerExists(paths)) {
        _getUserConfig(paths, _userDevConfigName, defaultUserDevConfig);
        _getUserConfig(paths, _userProdConfigName, defaultUserProdConfig);
    }

    if (wpThemePostInstallerInfo.postInstallerExists(paths)) {
        return null;
    }

    if (typeof nodeEnv !== "string") {
        nodeEnv = process.env.NODE_ENV;
    }

    switch (nodeEnv) {
        case "dev":
        case "development":
            return _getUserConfig(paths, _userDevConfigName, defaultUserDevConfig);
        case "build":
        case "prod":
        case "production":
            return _getUserConfig(paths, _userProdConfigName, defaultUserProdConfig);
        default:
            console.log(chalk.red(`Unknown env.NODE_ENV: ${nodeEnv}`));
            return null;
    }
};
