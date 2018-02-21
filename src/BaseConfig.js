/**
 * 
 */
Nodext.define("Nodext.BaseConfig", {
    extend: "Ext.Base",
    requires: [
        "Nodext.app.Node"
    ],
    config: {
        /**
         * @cfg {Nodext.app.Node} appNode
         * @requires
         */
        appNode: null,
        /**
         * Nombre del archivo de las configuraciones
         */
        fileCfg: null
    },
    $configPrefixed: false,
    $configStrict: false,
    constructor: function (config) {
        this.initConfig();
        this.callParent();
        config = config || {};
        this.resolveAppNode(config);
        config = this.formatCfg(config);
        Nodext.apply(this, config);
    },
    /**
     * @method
     * @private
     */
    resolveAppNode: function (config) {
        var appNode = config.appNode || this.appNode;
        if (Nodext.isString(appNode)) {
            appNode = Nodext.appActive.get(appNode);
        } else if (appNode instanceof Nodext.app.Node) {
            appNode = appNode;
        } else if (!appNode) {
            var totalApp = Nodext.appActive.count();
            if (totalApp === 1) {
                appNode = Nodext.appActive.getAt(0);
            } else if (totalApp > 1) {
                Nodext.logError("Mayor de una aplicacion activa, debe pasar el parametro appNode a las clases que usen la propieda fileCfg")
            } else {
                Nodext.logError("No se encontro ninguna aplicación")
            }
        }
        this.appNode = appNode;
    },
    /**
    * @method formatCfg
    * @private
    * Obtiene las configuraciones y las formatea de acuerdo al tipo de proceso (Maestro o Worker).
    */
    formatCfg: function (config) {
        var json;
        if (config.fileCfg === false || this.fileCfg === false) {
            json = {};
        } else {
            json = this.appNode.Global.getFileCfg(config.fileCfg || this.fileCfg);
            if (Nodext.isObject(json.defaults)) {
                Nodext.apply(json, json.defaults);
            }
        }
        Nodext.apply(json, config);
        return json;
    }
});