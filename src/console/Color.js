/**
 * 
 */
Nodext.define("Nodext.console.Color", {
    extend: "Ext.Base",
    $configPrefixed: false,
    alternateClassName: ["Nodext.ConsoleColor"],
    singleton: true,
    config: {
        color: true
    },
    /**
     * @property {NodeModule} lib
     */
    lib: null,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        try {
            this.lib = require('colors');
        } catch (e) {

        }
        this.initConfig(cfg);
    },
    loadCfgFromAppNode: function (appNode) {
        this.setColor(appNode.Global.consoleColor);
    },
    setColor: function (color) {
        if (color) {
            Nodext.apply(Nodext, {
                logPid: function () {
                    console.log("run in Pid :".cyan + process.pid.toString().cyan)
                },
                trace: function (message, color) {
                    if (typeof message === "string") {
                        console.trace(message[color]);
                    } else {
                        console.trace(message);
                    }
                },
                logMsg: function (message, color) {
                    if (typeof message === "string" && color) {
                        console.log(message[color]);
                    } else {
                        console.log(message.green);
                    }
                },
                logClassReady: function (message, color) {
                    if (typeof message === "string") {
                        console.log(message["cyan"]);
                    } else {
                        console.log(message.cyan);
                    }
                },
                logWorkerFork: function (message) {
                    if (typeof message === "string") {
                        console.log(message["cyan"]);
                    } else {
                        console.log(message.cyan);
                    }
                },
                logWorkerListen: function (message) {
                    if (typeof message === "string") {
                        console.log(message["cyan"]["bgYellow"]);
                    } else {
                        console.log(message.cyan);
                    }
                },
                logEvent: function (message) {
                    Nodext.logMsg(message, "yellow");
                },
                logWarn: function (message) {
                    Nodext.logMsg(message, "yellow");
                },
                logDestroy: function (message) {
                    if (typeof message === "string") {
                        console.log(message.bgGreen.white);
                    } else {
                        console.log(message);
                    }
                },
                logError: function (message) {
                    if (typeof message === "string") {
                        console.log(message.bgRed.white);
                    } else {
                        console.log(message);
                    }
                },
            });
        } else {
            Nodext.apply(Nodext, {
                trace: function (message, color) {
                    console.trace(message);
                },
                logMsg: function (message, color) {
                    console.log(message);
                },
                logEvent: function (message) {
                    Nodext.logMsg(message, "yellow");
                },
                logDestroy: function (message) {
                    console.log(message);
                },
                logError: function (message) {
                    console.log(message);
                },
                logPid: function () {
                    console.log("run in Pid :" + process.pid);
                },
            });
        }
    }
});