/**
 * 
 */
Nodext.define("Nodext.module.Path", {
    extend: "Ext.Base",
    $configPrefixed: false,
    alternateClassName: ["Nodext.Path"],
    singleton: true,
    /**
     * @property {NodeModule} path
     */
    path: null,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        this.initConfig();
    }
},function(){
    Nodext.apply(this.__proto__,require('path'));
});

// Nodext.Path.prototype = ;