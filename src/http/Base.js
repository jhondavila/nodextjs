/**
 * 
 */
Nodext.define("Nodext.http.Base", {
    extend: "Nodext.BaseConfig",
    $configPrefixed: false,
    $configStrict: false,
    mixins: ['Ext.util.Observable'],
    /**
     * @property {NodeModule} express
     * Carga la Libreria express de NodeJS.
     */
    express: null,
    /**
     * @property {NodeModule} http
     * Carga la Libreria http de NodeJS.
     */
    http: null,
    config: {
        /**
         * @cfg {String} id
         * Id del servidor
         */
        id: null,
        /**
         * @cfg {Nodext.app.Node} appNode
         * @requires
         */
        appNode: null,
        /**
         * @cfg {NodeInstance} app
         */
        app: null,
        /**
         * @cfg {NodeInstance} srv
         */
        srv: null,
        /**
         * @cfg {String} [fileCfg='server.json']
         */
        fileCfg: "server.json",
        /**
         * @cfg {Number} [port=3000]
         */
        port: 3000,
        /**
         * @cfg {Object} [defaultHeaders=null]
         * Modifica los Headers de respuesta del servidor 
         */
        defaultHeaders: null,
        /**
         * @cfg {Boolean} [corsByOrigin=false]
         * Cuando esta habilitado, el servidor atendera toda peticion sin importar su origen de dominio.
         */
        corsByOrigin: false,
        /**
         * @cfg {Object}
         */
        https: null
    },
    constructor: function (config) {
        this.callParent(arguments);

        this.mixins.observable.constructor.call(this, config);
        this.id = this.id || Nodext.id(null, "Server-");
        this.express = require("express");
        this.http = require('http');
        this.httpsLib = require('https');


        this.app = this.express();

        if (this.https) {
            this.readHttpsCredentials(this.https);
            this.srv = this.httpsLib.createServer(this.https, this.app);
        } else {
            this.srv = this.http.Server(this.app);
        }

        this.appNode.Global.setUseServerHttp(true);
        this.defaultHeaders = this.defaultHeaders || {};
    },
    readHttpsCredentials: function (cred) {
        var fs = require('fs');
        if (cred.ca) {
            cred.ca = fs.readFileSync(cred.ca);
        }
        if (cred.key) {
            cred.key = fs.readFileSync(cred.key);
        }
        if (cred.cert) {
            cred.cert = fs.readFileSync(cred.cert);
        }
    },
    /**
     * @method formatCfg
     * @private
     * Obtiene las configuraciones y las formatea de acuerdo al tipo de proceso (Maestro o Worker).
     */
    formatCfg: function (config) {
        // config = config || {};
        var json;
        if (config.fileCfg === false || this.fileCfg === false) {
            json = {};
        } else {
            var json = this.appNode.Global.getFileCfg(config.fileCfg || this.fileCfg);
            // var cfg = {};
            if (Nodext.isObject(json.defaults)) {
                Nodext.apply(json, json.defaults);
            }
        }
        // Nodext.apply
        // var id = Nodext.GlobalCfg.idWorker.toString();
        // if (Nodext.isObject(json.workers[id])) {
        //     Nodext.apply(cfg, json.workers[id]);
        // }
        // Nodext.apply(config, json);
        Nodext.apply(json, config);
        return json;
    },
    /**
     * @method runServer
     * Inicia la ejecucion del servidor
     */
    runServer: function (hostname, backlog) {
        /**
         * @event
         * Se dispara antes de que el servidor empiece a escuchar las peticiones por el puerto configurado.
         * @param {Nodext.http.Base} this
         * @param {NodeInstance} server
         * @param {Number} port
         */
        this.fireEvent("beforelisten", this, this.srv, this.port);
        this.srv.on("error", this.errorSrv.bind(this));
        if (hostname) {
            this.srv.listen(this.port, hostname, this.listenServer.bind(this));
        } else {
            this.srv.listen(this.port, this.listenServer.bind(this));
        }
    },
    /**
     * @method
     * @private
     * @param {Object} error
     */
    errorSrv: function (e) {
        if (e.code === 'EADDRINUSE') {
            Nodext.logError("Http Server Port Busy : " + e.port);
            /**
             * @event errorportbusy
             * Se dispara cuando el puerto configurado ya se encuentra en uso por otra aplicacion o proceso.
             * @param this
             * @param {Object} error
             * @param {Number} port
             */
            this.fireEvent("errorportbusy", this, e, e.port);
        }
        /**
         * @event error
         * Se dispara cuando el servidor presenta algun problema
         * @param this
         * @param {Object} error
         */
        this.fireEvent("error", this, e);

    },
    /**
     * @method
     * @protected
     */
    listenServer: function () {
        this.appNode.httpListen(this);
        Nodext.logClassReady("Node server running on http://localhost:" + this.port);
        /**
         * @event
         * Se dispara cuando el servidor empieza a escuchar peticiones a travez del puerto configurado.
         * @param {Nodext.http.Base} this
         * @param {Nodext.app.Node} appNode
         */
        this.fireEvent("listen", this, this.appNode);
    },
    /**
     * @method middlewareHeader
     * @template
     * Añade una funccion middleware al servidor antes de configurar el router, la cual asignara los headers por defecto.
     */
    middlewareHeader: function () {
        var me = this;
        var fn = function (req, res, next) {
            me.setHeader(req, res);
            next();
        };
        this.addMiddleware(fn, {
            name: "server.headers",
            _type: "headers",
            _id: Nodext.id(null, "ServerHeaders-")
        });
    },
    /**
     * @method middlewareError404
     * @template
     * Añade una funccion middleware al servidor despues de configurar el router,la cual emitira mensajes de error 
     * en caso de no encontrar el recurso solicitado.
     */
    middlewareError404: function () {
        var fn = function (req, res, next) {
            res.status(404);
            if (req.accepts('html')) {
                res.send({ success: false, message: 'Pagina no encontrada', page: req.url });
                return;
            }
            if (req.accepts('json')) {
                res.send({ success: false, message: 'Pagina no encontrada', page: req.url });
                return;
            }
            res.type('txt').send('Not found');
        };
        this.addMiddleware(fn, {
            name: "server.error404",
            _type: "error404",
            _id: Nodext.id(null, "ServerError-")
        });
    },
    /**
     * @method setHeader
     * @private
     * Asigna los header por defecto al atender peticiones http/https
     */
    setHeader: function (req, res) {
        if (this.corsByOrigin && req.headers.origin) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        }
        Nodext.Object.each(this.defaultHeaders, function (key, value) {
            res.setHeader(key, value);
        });
        res.setHeader('X-Powered-By', 'Nodext');
    },
    /**
    * @method
    * Añade una logica intermediaria al servidor
    */
    addMiddleware: function (middleware, cfg) {
        for (var p in cfg) {
            Object.defineProperty(middleware, p, { value: cfg[p] });
        }
        this.app.use(middleware);
    },
    /**
     * @method
     * Remueve una logica intermediaria del servidor
     */
    removeMiddleware: function (middleware) {
        var _router = this.app._router,
            stack = _router.stack;
        Nodext.Array.remove(stack, middleware);
    },
    /**
     * @method
     * Obtiene una logica intermediaria del servidor de acuerdo a su tipo.
     */
    getMiddlewareByType: function (type) {
        var _router = this.app._router,
            stack = _router.stack, layer, x, handle, findLayer;
        for (x = 0; x < stack.length; x++) {
            layer = stack[x];
            handle = layer.handle;
            if (typeof handle === "function" && handle._type === type) {
                findLayer = layer;
                break;
            }
        }
        return findLayer;
    },
});