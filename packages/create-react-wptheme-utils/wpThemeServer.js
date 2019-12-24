/**
 * Copyright (c) 2018-present, https://github.com/devloco
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const url = require("url");
const https = require("https");
const WebSocket = require("ws");

const _getUserConfig = require("@devloco/react-scripts-wptheme-utils/getUserConfig");
const _typeBuildError = "errors";
const _typeBuildContentChanged = "content-changed";
const _typeBuildSuccess = "success";
const _typeBuildWarning = "warnings";

const _wsHeartbeat = function() {
    this.isAlive = true;
};

const _noop = function() {};

let _clientInjectString = null;
let _intervalWsClientCheck;
let _webServer;
let _webSocketServer;

let _lastBuildEvent = null;
let _lastStats = {
    hash: undefined
};

let _configHost = null;
let _configPort = null;
let _configSslCert = null;
let _configSslKey = null;

let _webSocketServerProtocol = null;

let _serverConfig = null;
let _serverPort = null;

function _sendMessage(buildEvent, stats) {
    if (_webSocketServer && stats && stats.hash && stats.hash !== _lastStats.hash) {
        // Initial build... there are no clients for the clients.forEach below.
        if (_lastStats.hash === undefined) {
            _lastBuildEvent = buildEvent;
            _lastStats = stats;
        }

        _webSocketServer.clients.forEach((ws) => {
            _lastBuildEvent = buildEvent;
            _lastStats = stats;

            if (ws.isAlive === true) {
                let theStats = {};
                if (typeof stats.toJson === "function") {
                    theStats = stats.toJson("normal");
                } else {
                    switch (buildEvent) {
                        case _typeBuildError:
                            theStats.errors = [stats[0]];
                            break;
                        case _typeBuildWarning:
                            theStats.warnings = [stats[0]];
                            break;
                        default:
                            theStats.errors = [];
                            theStats.warnings = [];
                    }
                }

                const msg = JSON.stringify({
                    stats: theStats,
                    type: buildEvent
                });

                ws.hash = stats.hash;
                ws.send(msg);

                if (buildEvent === _typeBuildContentChanged) {
                    console.log("Browser refresh sent.");
                }
            }
        });
    }
}

function _webSocketServerSetup() {
    _webSocketServer.on("connection", function connection(ws) {
        ws.isAlive = true;
        ws.on("pong", _wsHeartbeat);

        const msgJson = JSON.stringify({
            type: "hash-check",
            hash: _lastStats.hash
        });
        ws.send(msgJson);

        ws.on("message", function incoming(message) {
            const messageObj = JSON.parse(message);

            switch (messageObj.type) {
                case "hash-check":
                    const msgJson = JSON.stringify({
                        type: "hash-check",
                        stats: {
                            hash: _lastStats.hash
                        }
                    });
                    ws.send(msgJson);
                    break;
                case "ssl-client-test":
                    console.log("websocket message received: %s", messageObj.type);
                    ws.send("ssl-server-test");
                    break;
            }
        });
    });

    _webSocketServer.on("close", (code) => {
        console.error(`wpThemeServer exited with code ${code}`);
    });

    _intervalWsClientCheck = setInterval(() => {
        _webSocketServer.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                console.log("Browser refresh server: CONNECTION TERMINATED", ws);
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping(_noop);
        });
    }, 30000);
}

function _startNonSslServer() {
    _webSocketServer = new WebSocket.Server({ port: _serverPort });
    _webSocketServerSetup();
}

function _startSslServer() {
    function getWsClientResp(hostName, portNum) {
        return `
        <script>
            var host = "wss://${hostName}:${portNum}";
            var socket = new WebSocket(host);
            socket.onmessage = function(event) {
                console.log("websocket message received: %s", event.data);
                if (event.data === "ssl-server-test") {
                    setTimeout(function() {
                        document.write("If you can read this, then the Browser Refresh Server is working with SSL!");
                    }, 0);
                }
            }
            socket.onopen = function (event) {
                var msgJson = JSON.stringify({
                    type: "ssl-client-test"
                });

                socket.send(msgJson);
            };
        </script>
        `;
    }

    try {
        _webServer = new https.createServer(
            {
                cert: fs.readFileSync(_configSslCert),
                key: fs.readFileSync(_configSslKey)
            },
            (req, res) => {
                res.writeHead(200);
                res.end(getWsClientResp(_configHost, _serverPort));
            }
        );
    } catch (err) {
        console.log("Failed to start SSL server. ERR:", err);
        process.exit(1);
    }

    _webSocketServer = new WebSocket.Server({ server: _webServer });
    _webSocketServerSetup();

    _webServer.listen(_serverPort);
}

const wpThemeServer = {
    getClientInjectString: function(mode, token) {
        if (_serverConfig.enable !== true || typeof mode !== "string") {
            return "";
        }

        if (_clientInjectString) {
            return _clientInjectString;
        }

        const phpStuff = `<?php $BRC_TEMPLATE_PATH = parse_url(get_template_directory_uri(), PHP_URL_PATH); ?>`;
        const jsTags = [
            "<script src='<?php echo $BRC_TEMPLATE_PATH; ?>/react-src/node_modules/@devloco/react-scripts-wptheme-utils/wpThemeClient.js'></script>",
            "<script src='<?php echo $BRC_TEMPLATE_PATH; ?>/react-src/node_modules/@devloco/react-scripts-wptheme-error-overlay/wpThemeErrorOverlay.js'></script>\n"
        ];
        const jsCall = `<script> wpThemeClient.start("${_webSocketServerProtocol}", "${_configHost}", "${_serverPort}"); </script>\n`;

        let toInject = [];
        switch (mode) {
            case "afterToken":
                // note in this case, we put the token back into the file (i.e. the token is something you want to keep in the file like "</body>").
                toInject = [token, phpStuff, jsTags.join("\n"), jsCall];
                break;
            case "beforeToken":
                // note in this case, we put the token back into the file (i.e. the token is something you want to keep in the file like "</body>").
                toInject = [phpStuff, jsTags.join("\n"), jsCall, token];
                break;
            case "endOfFile":
            case "replaceToken":
                toInject = [phpStuff, jsTags.join("\n"), jsCall];
                break;
            default:
                console.log(chalk.magenta(`wpstart::injectWpThemeClient: unknown inject mode: ${mode}.`));
                console.log(`Available inject modes: ${chalk.cyan("disable, afterToken, beforeToken, replaceToken, endOfFile")}`);
                process.exit();
        }

        _clientInjectString = toInject.join("\n");

        return _clientInjectString;
    },
    startServer: function(paths) {
        try {
            _serverConfig = _getUserConfig(paths, process.env.NODE_ENV).wpThemeServer;
        } catch (err) {
            console.log("unable to get wpThemeServer config from user config. Err:", err);
            process.exit(1);
        }

        _configHost = _serverConfig && typeof _serverConfig.host === "string" && _serverConfig.host.length > 0 ? _serverConfig.host : "127.0.0.1";
        _configPort = _serverConfig && typeof _serverConfig.port === "number" ? _serverConfig.port : null;
        _serverPort = parseInt(process.env.PORT, 10) || _configPort || 8090;

        if (_serverPort > 0) {
            _configSslCert = _serverConfig && typeof _serverConfig.sslCert === "string" && _serverConfig.sslCert.length > 0 ? _serverConfig.sslCert : null;
            _configSslKey = _serverConfig && typeof _serverConfig.sslKey === "string" && _serverConfig.sslKey.length > 0 ? _serverConfig.sslKey : null;

            if (typeof _configSslCert === "string" && typeof _configSslKey === "string") {
                _webSocketServerProtocol = "wss";
                _startSslServer();
            } else {
                _webSocketServerProtocol = "ws";
                _startNonSslServer();
            }

            console.log("Browser Refresh Server ready.");
        }
    },
    update: function(stats, msgType) {
        if (stats) {
            if (typeof stats.hasErrors === "undefined") {
                // This is probably a TypeScript deferred message
                switch (msgType) {
                    case _typeBuildError:
                        _sendMessage(_typeBuildError, stats);
                        break;
                    case _typeBuildWarning:
                        _sendMessage(_typeBuildWarning, stats);
                        break;
                }
            } else {
                // Normal Webpack compile message
                if (typeof stats.hasErrors === "function " && stats.hasErrors()) {
                    _sendMessage(_typeBuildError, stats);
                } else if (typeof stats.hasWarnings === "function " && stats.hasWarnings()) {
                    _sendMessage(_typeBuildWarning, stats);
                } else {
                    _sendMessage(_typeBuildContentChanged, stats);
                }
            }
        }
    }
};

module.exports = wpThemeServer;
