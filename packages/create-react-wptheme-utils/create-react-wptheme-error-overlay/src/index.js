/**
 * Copyright (c) 2018-present, https://github.com/devloco
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

var stripAnsi = require("strip-ansi");
var ErrorOverlay = require("react-error-overlay");
var formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");

// Remember some state related to hot module replacement.
var isFirstCompilation = true;
var mostRecentCompilationHash = null;
var hasCompileErrors = false;

// We need to keep track of if there has been a runtime error.
// Essentially, we cannot guarantee application state was not corrupted by the
// runtime error. To prevent confusing behavior, we forcibly reload the entire
// application. This is handled below when we are notified of a compile (code
// change).
// See https://github.com/facebookincubator/create-react-app/issues/3096
var hadRuntimeError = false;
var runtimeOptions = {
    onError: function() {
        hadRuntimeError = true;
    },
    filename: "/static/js/bundle.js"
};
ErrorOverlay.startReportingRuntimeErrors(runtimeOptions);

export function clearConsole() {
    // Clean up outdated compile errors, if any.
    if (typeof console !== "undefined" && typeof console.clear === "function") {
        console.clear();
    }
}

export function handleSuccess() {
    // Successful compilation.
    clearConsole();
    isFirstCompilation = false;
    hasCompileErrors = false;
    hadRuntimeError = false;
}

export function handleWarnings(warnings) {
    //clearConsole();

    // var isHotUpdate = !isFirstCompilation;
    isFirstCompilation = false;
    hasCompileErrors = false;

    function printWarnings() {
        // Print warnings to the console.
        var formatted = formatWebpackMessages({
            warnings: warnings,
            errors: []
        });

        if (typeof console !== "undefined" && typeof console.warn === "function") {
            for (var i = 0; i < formatted.warnings.length; i++) {
                if (i === 5) {
                    console.warn("There were more warnings in other files.\n" + "You can find a complete log in the terminal.");
                    break;
                }

                console.warn(stripAnsi(formatted.warnings[i]));
            }
        }
    }

    printWarnings();
}

export function handleErrors(errors) {
    //clearConsole();

    isFirstCompilation = false;
    hasCompileErrors = true;

    // Format webpack messages.
    var formatted = formatWebpackMessages({
        errors: errors,
        warnings: []
    });

    if (Array.isArray(formatted.errors) && formatted.errors.length > 0) {
        // Only show the first error.
        ErrorOverlay.reportBuildError(formatted.errors[0]);
    } else {
        if (typeof console !== "undefined" && typeof console.error === "function") {
            console.error("UNKNOWN ERROR from react-scripts-wptheme-error-overlay:handleErrors:", errors);
        }
    }

    // Do not attempt to reload now.
    // We will reload on next success instead.
}
