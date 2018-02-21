/**
 * 
 */
Nodext.define("Nodext.module.FileSystem", {
    extend: "Ext.Base",
    $configPrefixed: false,
    alternateClassName: ["Nodext.FS"],
    singleton: true,
    /**
     * @property {NodeModule} fs
     */
    fs: null,
    /**
     * @property {NodeModule} filesize
     */
    filesize: null,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        this.initConfig();
        this.fs = require('fs');
        this.filesize = require('file-size');
    },
    // readdirSync: function (dir) {
    //     return this.fs.readdirSync(dir);
    // },
    // statSync: function (name) {
    //     return this.fs.statSync(name);
    // },
    getSizeMB: function (value) {
        if (value) {
            return this.filesize(parseInt(value)).to('MB') + ' MB';
        } else {
            return "";
        }
    }

}, function () {
    Nodext.apply(this.__proto__, require('fs'));
});
// console.log(require("path"))