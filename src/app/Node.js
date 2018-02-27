/**
 * 
 */
Nodext.define("Nodext.app.Node", {
    extend: "Ext.Base",
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: [
        "Nodext.console.Color"
    ],
    $configPrefixed: false,
    $configStrict: false,
    /**
    * @property {Nodext.app.GlobalConfig|Object} Global
    * Crear una instancia de Nodext.app.GlobalConfig el cual contiene las configuraciones y paths.
    */
    Global: null,
    config: {
        appProperty: 'app',
        /**
         * @cfg {String} appName
         * Nombre de la aplicacion
         */
        appName: null,
        /**
         * @cfg {String} path
         * Ruta de la aplicacion
         */
        path: null,
        /**
         * @cfg {String} version
         * Version de la aplicacion
         */
        version: null,
        /**
         * @cfg {Object} fileCfg
         * Configuraciones app.json
         */
        fileCfg: null,
        /**
        * @cfg {Boolean} [enabledCluster=false]
        * Habilita el modo Cluster para crecimiento vertical
        */
        enabledCluster: false,
        /**
         * @cfg {String} idWorker
         */
        idWorker: null,
        /**
         * @cfg {String} idCluster
         */
        idCluster: null,
        /**
         * @cfg {String} pathBase
         * ruta base de la aplicacion
         */
        pathBase: null
    },

    setPath: function (path) {
        path = this.pathBase + "/" + path;
        this.path = path;
        Nodext.Loader.setPath(this.appName, path);
    },
    constructor: function (cfg) {
        cfg = cfg || {};
        Nodext.apply(this, cfg);
        this.initConfig(cfg);
        this.mixins.observable.constructor.call(this, cfg);
        this.setConfig(this.fileCfg);


        this.initNamespace();

        var Global = this.Global || {};
        Global.appNode = this;
        this.Global = Nodext.create("Nodext.app.GlobalConfig", Global);
        Nodext.ConsoleColor.loadCfgFromAppNode(this);
        Global = null;
        Nodext.appActive.add(this);
        Nodext.db.Manager.loadCnx(this);
        this.initialize();
    },
    initNamespace: function () {
        var me = this,
            appProperty = me.getAppProperty(),
            ns;

        ns = Ext.namespace(me.getAppName());

        if (ns) {
            ns.getApplication = function () {
                return me;
            };

            if (appProperty) {
                if (!ns[appProperty]) {
                    ns[appProperty] = me;
                }
                //<debug>
                else if (ns[appProperty] !== me) {
                    Ext.log.warn('An existing reference is being overwritten for ' + name + '.' + appProperty +
                        '. See the appProperty config.'
                    );
                }
                //</debug>
            }
        }
    },
    initialize: function () {
        if (Nodext.argv.test) {
            this.launchTest();
        } else if (this.enabledCluster) {
            if (this.isMaster()) {
                this.launch();
            } else {
                this.launchWorker();
            }
        } else {
            this.launch();
        }
    },
    destroy: function () {
        Nodext.appActive.remove(this);
    },
    /**
     * @method
     * Determina si el proceso actual esta configurado como maestro o Thread
     */
    isMaster: function () {
        if (this.enabledCluster) {
            return Nodext.isMaster();
        } else {
            return true;
        }
    },
    /**
     * @method
     * @template
     * Llamada automaticamente cuando la aplicacion es el proceso principal
     */
    launch: Nodext.emptyFn,
    /**
    * @method
    * @template
    * Llamada automaticamente cuando la aplicacion es el proceso worker, para eso se requiere que
    *  {@link Nodext.app.Node#enabledCluster} = 'true'
    */
    launchWorker: Nodext.emptyFn,
    /**
     * @method fireEventMaster
     * @private 
     */
    fireEventMaster: function (event, params) {
        if (process.send) {
            process.send({ ename: event, params: params });
        }
    },
    httpListen: function (server) {
        this.fireEventMaster("workerhttpinit", [Nodext.idCluster, Nodext.idWorker, server.getId()]);
    },
    socketListen: function (socket) {
        this.fireEventMaster("wokrersocketioinit", [Nodext.idCluster, Nodext.idWorker, socket.getId()]);
    }
});