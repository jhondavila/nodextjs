/**
 * 
 */
Nodext.define("Nodext.model.Model", {
    extend: "Ext.Base",
    requires: ["Nodext.database.QBManager"],
    db: Nodext.database.QBManager,
    $configPrefixed: false,
    constructor: function (config) {
        Nodext.apply(this, config);
        this.initConfig(config);
        this.initModel();
    },
    initModel: Nodext.emptyFn
});