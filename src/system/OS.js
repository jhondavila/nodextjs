/**
 * 
 */
Nodext.define("Nodext.system.OS", {
    extend: "Ext.Base",
    $configPrefixed: false,
    alternateClassName: ["Nodext.OS"],
    singleton: true,
    /**
     * @property {NodeModule} fs
     */
    os: null,
    /**
     * @property {NodeModule} filesize
     */
    // filesize: null,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        this.initConfig();
        this.os = require('os');
        this.nodeMachine = require('node-machine-id');
    },
    getUnniqueID: function () {
        return this.nodeMachine.machineIdSync();
    },
    // readdirSync: function (dir) {
    //     return this.fs.readdirSync(dir);
    // },
    // statSync: function (name) {
    //     return this.fs.statSync(name);
    // },
    // getSizeMB: function (value) {
    //     if (value) {
    //         return this.filesize(parseInt(value)).to('MB') + ' MB';
    //     } else {
    //         return "";
    //     }
    // }

}, function () {
    Nodext.apply(this.__proto__, require('os'));
});
// console.log(require("path"))