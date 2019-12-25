/**
 * Copyright (c) 2018-present, https://github.com/devloco
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const postInstallerName = "post_installer.php";

class PostInstallerException {
    constructor(message) {
        this.message = message;
        this.name = "PostInstallerException";
    }
}

const postInstallerInfo = {
    postInstallerExists: function(paths) {
        if (!paths) {
            throw new PostInstallerException("'paths' not provided.");
        }

        try {
            fs.accessSync(path.join(paths.appPublic, postInstallerName), fs.constants.F_OK);
            return true;
        } catch (err) {
            return false;
        }
    },
    postInstallerName: postInstallerName
};

module.exports = postInstallerInfo;
