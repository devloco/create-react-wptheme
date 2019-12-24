/**
 * Copyright (c) 2018-present, https://github.com/devloco
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///
/// big thanks to:
/// https://www.npmjs.com/package/filewatcher-webpack-plugin
///
/// this plugin causes WebPack to do a rebuild by touching a file under WebPack's control when
/// a file *not* under WebPack's control changes.
///
/// Usage example: (to watch all JS, CSS and PHP files under the "public" folder in a create-react-wptheme project (or create-react-app project))
///     NOTE: "touchFile" is used to force WebPack to do a rebuild. It must be a file that WebPack is watching.
///
/// const FileWatcherPlugin = require("./fileWatcherPlugin.wptheme");
/// ...
/// plugins: [
//      new FileWatcherPlugin({
//          touchFile: "./public/index.php",  // create-react-wptheme emits index.php and thus it is watched by WebPack...
//          ignored: "./public/index.php",    // ... so no need to watch it here as well. Without ignoring it, you'd cause infinite build loops.
//          watchFileGlobs: ["./public/**/*.js", "./public/**/*.css", "./public/**/*.php"]
//      }),
/// ],
/// ...
///

"use strict";

const chokidar = require("chokidar");
const { touch } = require("shelljs");

function FileWatcherPlugin(options) {
    this.options = options;
}

FileWatcherPlugin.prototype.apply = function (compiler) {
    if (!this.options) {
        return;
    }

    const options = this.options;
    const touchFile = options.touchFile;
    const forceBuild = function (touchFileName) {
        // -c to not create a file if one doesn't already exist.
        // Remember this file needs to be watched by WebPack, thus it should already exist
        touch("-c", touchFileName);
    };

    compiler.hooks.done.tap("FileWatcherPlugin", function (compilation) {
        var watcher = chokidar.watch(options.watchFileGlobs, {
            persistent: options.persistance || true,
            ignored: options.ignored || false,
            ignoreInitial: options.ignoreInitial || false,
            followSymlinks: options.followSymlinks || true,
            cwd: options.cwd || ".",
            disableGlobbing: options.disableGlobbing || false,
            usePolling: options.usePolling || true,
            interval: options.interval || 100,
            binaryInterval: options.binaryInterval || 300,
            alwaysStat: options.alwaysStat || false,
            depth: options.depth || 99,
            awaitWriteFinish: {
                stabilityThreshold: options.stabilityThreshold || 250,
                pollInterval: options.pollInterval || 100
            },

            ignorePermissionErrors: options.ignorePermissionErrors || false,
            atomic: options.atomic || true
        });

        watcher
            .on(
                "add",
                options.onAddCallback ||
                function (path) {
                    //forceBuild(touchFile); // causes infinite loops for "add"
                    return null;
                }
            )
            .on(
                "change",
                options.onChangeCallback ||
                function (path) {
                    // console.log(`\n\n Compilation Started  after change of - ${path} \n\n`);
                    // compiler.run(function(err) {
                    //     if (err) throw err;
                    //     watcher.close();
                    // });
                    //console.log(`\n\n Compilation ended  for change of - ${path} \n\n`);
                    forceBuild(touchFile);
                }
            )
            .on(
                "unlink",
                options.onUnlinkCallback ||
                function (path) {
                    // console.log(`File ${path} has been removed`);
                    forceBuild(touchFile);
                }
            );

        watcher
            .on(
                "addDir",
                options.onAddDirCallback ||
                function (path) {
                    // console.log(`Directory ${path} has been added`);
                    forceBuild(touchFile);
                }
            )
            .on(
                "unlinkDir",
                options.unlinkDirCallback ||
                function (path) {
                    // console.log(`Directory ${path} has been removed`);
                    forceBuild(touchFile);
                }
            )
            .on(
                "error",
                options.onErrorCallback ||
                function (error) {
                    console.log(`FileWatcherPlugin error: ${error}`);
                    return null;
                }
            )
            .on(
                "ready",
                options.onReadyCallback ||
                function () {
                    console.log("Watching for changes in the Public folder.");
                }
            )
            .on(
                "raw",
                options.onRawCallback ||
                function (event, path, details) {
                    return null;
                }
            );
    });
};

module.exports = FileWatcherPlugin;
