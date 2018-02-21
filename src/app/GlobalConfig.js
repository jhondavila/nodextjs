/**
 * Almacena los path y configuraciones de {@link Nodext.app.Node}
 * Mediante esta clase podras acceder a configuraciones :
 * 
 * - `Globales`
 * - `Cluster`
 * - `Worker`
 */
Nodext.define("Nodext.app.GlobalConfig", {
    extend: "Ext.Base",
    $configPrefixed: false,
    $configStrict: false,
    alternateClassName: ["Nodext.GlobalCfg"],
    config: {
        /**
         * @cfg {Nodext.app.Node} appNode
         */
        appNode: null,
        /**
         * @cfg {String} [tokenKey=null]
         * cadena Token , si no es suministrada es generada automaticamente
         */
        tokenKey: null,
        /**
         * @cfg {Number} [tokenKeyLength=30]
         * Longitud de Token generada
         */
        tokenKeyLength: 30,
        /**
         * @cfg {Boolean} [useSocketIO=false]
         */
        useSocketIO: false,
        /**
         * @cfg {Boolean} [useServerHttp=false]
         */
        useServerHttp: false,
        /**
         * @cfg {Boolean} [closeHttp=false]
         */
        closeHttp: false,
        /**
         * @cfg {Boolean} [closeSocketIO=false]
         */
        closeSocketIO: false,
        /**
         * @cfg {Boolean} [socketIOInit=false]
         */
        socketIOInit: false,
        /**
         * @cfg {Boolean} [httpInit=false]
         */
        httpInit: false,
        /**
         * @cfg {String} [pathWorkerCfg='config/worker']
         * Path de las configuraciones del worker
         */
        pathWorkerCfg: "config/worker",
        /**
        * @cfg {String} [pathClusterCfg='config/cluster']
        * Path de las configuraciones del Cluster
        */
        pathClusterCfg: "config",
        /**
        * @cfg {String} [pathGlobalCfg='config']
        * Path de las configuraciones Globales
        */
        pathGlobalCfg: "config",
        /**
        * @cfg {String} [fileNameGlobal='global.json']
        * Nombre del archivo de las configuraciones globales
        */
        fileNameGlobal: "global.json"
    },

    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        this.initConfig(cfg);
        var globalCfg = this.getGlobalConfig(this.fileNameGlobal);
        Nodext.apply(this, globalCfg);
        this.generateTokenString();
        this.callParent();
    },
    /**
     * @method
     * Devuelve un archivo de configuracion detectando si la aplicacion es el proceso Maestro o es un worker
     * @param {String} file
     * @return {Object}
     */
    getFileCfg: function (file) {
        if (this.appNode.isMaster()) {
            return this.getFileCfgCluster(file);
        } else {
            return this.getFileCfgWorker(file)
        }
    },
    /**
     * @method 
     * Devuelve un archivo Json de la ruta de configuraciones del Cluster
     * @param {String} file
     * @return {Object}
     */
    getFileCfgCluster: function (file) {
        var path = this.appNode.path + "/" + this.pathClusterCfg + "/" + file;
        try {
            return require(path);
        } catch (e) {
            Nodext.logError("No found file" + path);
            return {};
        }
    },
    /**
    * @method 
    * Devuelve un archivo Json de la ruta de configuraciones del Worker
    * @param {String} file
    * @return {Object}
    */
    getFileCfgWorker: function (file) {
        var path = this.appNode.path + "/" + this.pathWorkerCfg + "/" + file;
        try {
            return require(path);
        } catch (e) {
            Nodext.logError("No found file" + path);
            return {};
        }
    },
    /**
    * @method 
    * Devuelve un archivo Json de la ruta de configuraciones Globales
    * @param {String} file
    * @return {Object}
    */
    getGlobalConfig: function (file) {
        var path = this.appNode.path + "/" + this.pathGlobalCfg + "/" + file;
        try {
            return require(path);
        } catch (e) {
            Nodext.logError("No found file" + path);
            return {};
        }
    },
    /**
    * @method 
    * Genera una token aleatoria en caso que la configuracion {@link Nodext.app.GlobalConfig#tokenKey} = null
    */
    generateTokenString: function () {
        this.tokenKey = this.tokenKey || this.randString(this.tokenKeyLength);
    },
    /**
     * @method
     * Genera una cadena aleatoria en base a la logintud del paremetro
     * @param {Number} length
     */
    randString: function (x) {
        var s = "";
        while (s.length < x && x > 0) {
            var r = Math.random();
            s += (r < 0.1 ? Math.floor(r * 100) : String.fromCharCode(Math.floor(r * 26) + (r > 0.5 ? 97 : 65)));
        }
        return s;
    }
});