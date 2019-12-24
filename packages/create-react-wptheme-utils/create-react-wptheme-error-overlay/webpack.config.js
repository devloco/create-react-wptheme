/**
 * Copyright (c) 2018-present, https://github.com/devloco
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

const path = require("path");

module.exports = {
    mode: "none",
    entry: path.join(__dirname, "src", "index.js"),
    watch: false,
    watchOptions: {
        aggregateTimeout: 600,
        ignored: [__dirname, "node_modules", "webpack.config.js", "wpThemeErrorOverlay.js"]
    },
    output: {
        path: path.join(__dirname, ".."),
        filename: "wpThemeErrorOverlay.js",
        library: "wpThemeErrorOverlay",
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.join(__dirname, "src"),
                use: "babel-loader"
            }
        ]
    }
};
