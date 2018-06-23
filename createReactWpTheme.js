/**
 * Copyright (c) 2018-present devloco
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
// Also be careful with new language features.
// This file must work on Node 6+.
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

"use strict";

const validateProjectName = require("validate-npm-package-name");
const chalk = require("chalk");
const commander = require("commander");
const fs = require("fs-extra");
const path = require("path");
const execSync = require("child_process").execSync;
const spawn = require("cross-spawn");
const semver = require("semver");
const dns = require("dns");
const url = require("url");
const envinfo = require("envinfo");

const packageJson = require("./package.json");

// Check this!!!!
const getScriptsPath = function() {
    return scriptsFromNpm();
};

const scriptsFromNpm = function() {
    return {
        scriptsPath: "@devloco/react-scripts-wptheme",
        callback: function() {}
    };
};

const scriptsFromGit = function() {
    const tempFolderName = "temp";
    fs.ensureDirSync(tempFolderName);
    process.chdir(tempFolderName);
    const tempPath = process.cwd();
    console.log(chalk.magenta("Cloning react-scripts-wptheme from GitHub..."));
    execSync("git clone https://github.com/devloco/react-scripts-wptheme.git");
    process.chdir("..");
    let scriptsPath = "file:" + path.join(tempPath, "react-scripts-wptheme");
    return {
        scriptsPath: scriptsPath,
        callback: function() {
            deleteFolderRecursive(tempPath);
        }
    };
};

const scriptsFromFile = function() {
    return {
        scriptsPath: "file:E:\\WPDev\\github\\devloco\\react-scripts-wptheme",
        callback: function() {}
    };
};

let projectName;

const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments("<project-directory>")
    .usage(`${chalk.green("<project-directory>")} [options]`)
    .action((name) => {
        projectName = name;
    })
    .option("--info", "print environment debug info (ignore 'package.json not found' errors)")
    .option("--use-npm", "force downloading packages using npm instead of yarn (if both are installed)")
    .option("--verbose", "force create-react-app to print additional logs (NOTE: create-react-wptheme is always verbose)")
    .option("--version", "print version")
    .allowUnknownOption()
    .parse(process.argv);

if (typeof projectName === "undefined") {
    if (program.info) {
        envinfo.print({
            packages: ["react-scripts-wptheme"],
            noNativeIDE: true,
            duplicates: true
        });
        process.exit(0);
    }

    console.error("Please specify the project directory:");
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`);

    console.log();
    console.log("For example:");
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green("my-react-wptheme")}`);
    console.log();
    process.exit(1);
}

createApp(projectName, program.useNpm, program.verbose);

function createApp(name, useNpm, verbose) {
    if (!semver.satisfies(process.version, ">=6.0.0")) {
        console.log(chalk.yellow(`You are using Node ${process.version}. Please update to Node 6 or higher for the best experience.\n`));
        process.exit(1);
    }

    const useYarn = useNpm ? false : shouldUseYarn();
    if (!useYarn) {
        const npmInfo = checkNpmVersion();
        if (!npmInfo.hasMinNpm) {
            if (npmInfo.npmVersion) {
                console.log(chalk.yellow(`You are using npm ${npmInfo.npmVersion}. Please update to npm 3 or higher for the best experience.\n`));
                process.exit(1);
            }
        }
    }

    const gitInfo = checkGitVersion();
    if (!gitInfo.hasMinGit) {
        console.log(chalk.yellow(`You need Git installed to use this version of create-react-wptheme. Non-Git version coming soon.`));
        process.exit(1);
    }

    const root = path.resolve(name);
    const appName = path.basename(root);
    checkAppName(appName);

    console.log(`Creating a new React WP theme in ${chalk.green(root)}.`);
    console.log();

    fs.ensureDirSync(name);
    if (!isSafeToCreateProjectIn(root, name)) {
        process.exit(1);
    }

    const originalDirectory = process.cwd();
    process.chdir(root);
    if (!useYarn && !checkThatNpmCanReadCwd()) {
        process.exit(1);
    }

    run(root, appName, originalDirectory, verbose, useNpm, useYarn);
}

function run(root, appName, originalDirectory, verbose, useNpm, useYarn) {
    const packageToInstall = "create-react-app";
    const allDependencies = [packageToInstall];

    return Promise.resolve(packageToInstall)
        .then((packageName) =>
            checkIfOnline(useYarn).then((isOnline) => ({
                isOnline: isOnline,
                packageName: packageName
            }))
        )
        .then((info) => {
            const isOnline = info.isOnline;
            const packageName = info.packageName;
            console.log(`Installing ${chalk.cyan("create-react-app")}.`);
            console.log();

            return installCreateReactApp(root, allDependencies, verbose, useYarn, isOnline).then(() => packageName);
        })
        .then((packageName) => {
            return createReactApp("react-src", useNpm, verbose).then(() => packageName);
        })
        .catch((reason) => {
            console.log();
            console.log("Aborting installation.");
            if (reason.command) {
                console.log(`  ${chalk.cyan(reason.command)} has failed.`);
            } else {
                console.log(chalk.red("Unexpected error. Please report it as a bug:"));
                console.log(reason);
            }
            console.log();
            console.log("Done.");
            process.exit(1);
        });
}

function installCreateReactApp(root, dependencies, verbose, useYarn, isOnline) {
    return new Promise((resolve, reject) => {
        let command;
        let args;
        if (useYarn) {
            command = "yarnpkg";
            args = ["global", "add"];
            if (!isOnline) {
                args.push("--offline");
            }
            [].push.apply(args, dependencies);

            if (!isOnline) {
                console.log(chalk.yellow("You appear to be offline."));
                console.log(chalk.yellow("Falling back to the local Yarn cache."));
                console.log();
            }
        } else {
            command = "npm";
            args = ["install", "-g"].concat(dependencies);
        }

        if (verbose) {
            args.push("--verbose");
        }

        const child = spawn(command, args, { stdio: "inherit" });
        child.on("close", (code) => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(" ")}`
                });
                return;
            }
            resolve();
        });
    });
}

function createReactApp(appName, useNpm, verbose) {
    return new Promise((resolve, reject) => {
        let command = "create-react-app";
        let args = [appName];

        if (verbose) {
            args.push("--verbose");
        }

        if (useNpm) {
            args.push("--use-npm");
        }

        let scriptsPath = getScriptsPath();
        args.push("--scripts-version");
        args.push(scriptsPath.scriptsPath);

        const child = spawn(command, args, { stdio: "inherit" });
        child.on("close", (code) => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(" ")}`
                });
                return;
            }

            scriptsPath.callback();
            resolve();
        });
    });
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file) {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(path);
    }
}

function checkGitVersion() {
    let hasMinGit = false;
    let gitVersion = null;
    try {
        gitVersion = execSync("git --version")
            .toString()
            .trim();
        //hasMinGit = semver.gte(gitVersion, "2.17.0");
        hasMinGit = true;
    } catch (err) {
        // ignore
    }

    return {
        hasMinGit: hasMinGit,
        gitVersion: gitVersion
    };
}

function checkNpmVersion() {
    let hasMinNpm = false;
    let npmVersion = null;
    try {
        npmVersion = execSync("npm --version")
            .toString()
            .trim();
        hasMinNpm = semver.gte(npmVersion, "3.0.0");
    } catch (err) {
        // ignore
    }
    return {
        hasMinNpm: hasMinNpm,
        npmVersion: npmVersion
    };
}

function checkAppName(appName) {
    const validationResult = validateProjectName(appName);
    if (!validationResult.validForNewPackages) {
        console.error(`Could not create a project called ${chalk.red(`"${appName}"`)} because of npm naming restrictions:`);

        printValidationResults(validationResult.errors);
        printValidationResults(validationResult.warnings);
        process.exit(1);
    }
}

function printValidationResults(results) {
    if (typeof results !== "undefined") {
        results.forEach((error) => {
            console.error(chalk.red(`  *  ${error}`));
        });
    }
}

// If project only contains files generated by GH, it’s safe.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebookincubator/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root, name) {
    const validFiles = [
        ".DS_Store",
        "Thumbs.db",
        ".git",
        ".gitignore",
        ".idea",
        "README.md",
        "LICENSE",
        "web.iml",
        ".hg",
        ".hgignore",
        ".hgcheck",
        ".npmignore",
        "mkdocs.yml",
        "docs",
        ".travis.yml",
        ".gitlab-ci.yml",
        ".gitattributes"
    ];
    console.log();

    const conflicts = fs.readdirSync(root).filter((file) => !validFiles.includes(file));
    if (conflicts.length < 1) {
        return true;
    }

    console.log(`The directory ${chalk.green(name)} contains files that could conflict:`);
    console.log();
    for (const file of conflicts) {
        console.log(`  ${file}`);
    }
    console.log();
    console.log("Either try using a new directory name, or remove the files listed above.");

    return false;
}

function checkThatNpmCanReadCwd() {
    const cwd = process.cwd();
    let childOutput = null;
    try {
        // Note: intentionally using spawn over exec since
        // the problem doesn't reproduce otherwise.
        // `npm config list` is the only reliable way I could find
        // to reproduce the wrong path. Just printing process.cwd()
        // in a Node process was not enough.
        childOutput = spawn.sync("npm", ["config", "list"]).output.join("");
    } catch (err) {
        // Something went wrong spawning node.
        // Not great, but it means we can't do this check.
        // We might fail later on, but let's continue.
        return true;
    }
    if (typeof childOutput !== "string") {
        return true;
    }
    const lines = childOutput.split("\n");
    // `npm config list` output includes the following line:
    // "; cwd = C:\path\to\current\dir" (unquoted)
    // I couldn't find an easier way to get it.
    const prefix = "; cwd = ";
    const line = lines.find((line) => line.indexOf(prefix) === 0);
    if (typeof line !== "string") {
        // Fail gracefully. They could remove it.
        return true;
    }
    const npmCWD = line.substring(prefix.length);
    if (npmCWD === cwd) {
        return true;
    }
    console.error(
        chalk.red(
            `Could not start an npm process in the right directory.\n\n` +
                `The current directory is: ${chalk.bold(cwd)}\n` +
                `However, a newly started npm process runs in: ${chalk.bold(npmCWD)}\n\n` +
                `This is probably caused by a misconfigured system terminal shell.`
        )
    );
    if (process.platform === "win32") {
        console.error(
            chalk.red(`On Windows, this can usually be fixed by running:\n\n`) +
                `  ${chalk.cyan("reg")} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n` +
                `  ${chalk.cyan("reg")} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n` +
                chalk.red(`Try to run the above two lines in the terminal.\n`) +
                chalk.red(`To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/`)
        );
    }
    return false;
}

function shouldUseYarn() {
    try {
        execSync("yarnpkg --version", { stdio: "ignore" });
        return true;
    } catch (e) {
        return false;
    }
}

function checkIfOnline(useYarn) {
    if (!useYarn) {
        // Don't ping the Yarn registry.
        // We'll just assume the best case.
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        dns.lookup("registry.yarnpkg.com", (err) => {
            let proxy;
            if (err != null && (proxy = getProxy())) {
                // If a proxy is defined, we likely can't resolve external hostnames.
                // Try to resolve the proxy name as an indication of a connection.
                dns.lookup(url.parse(proxy).hostname, (proxyErr) => {
                    resolve(proxyErr == null);
                });
            } else {
                resolve(err == null);
            }
        });
    });
}
