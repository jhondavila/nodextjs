/**
 * 
 */
Nodext.define("Nodext.util.MapClass", {
    extend: "Ext.Mixin",
    config: {
        clsManager: null
    },
    mixinConfig: {
        id: 'mapclass'
    },
    constructor: function (config) {
        this.setClsManager({});
    },
    /**
     * @method
     * @private
     * Añade al mapeo de managers un nuevo elemento mediante una alias.
     */
    addMapClsManager: function (groupAlias, clsMgr) {
        var clsManager = this.getClsManager();
        if (!clsManager[groupAlias]) {
            clsManager[groupAlias] = clsMgr;
        } else {
            Nodext.logError("Alias para administrador de clases duplicado : " + groupAlias);
        }
    },
    /**
     * @method
     */
    getClassOfMgr: function (manager, clsName) {
        var clsManager = this.clsManager[manager], cls;
        if (clsManager) {
            cls = clsManager.getClsByKey(clsName);
        }
        return cls;
    },
});