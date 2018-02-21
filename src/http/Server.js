/**
 * 
 */
Nodext.define("Nodext.http.Server", {
    extend: "Nodext.http.Base",
    mixins: [
        "Nodext.util.MapClass",
        "Nodext.model.Mixin",
        "Nodext.http.vhost.Mixin",
    ],
    requires: [
        "Nodext.module.JsonWebToken",
        "Nodext.module.EasyXML",
        "Nodext.module.FileSystem",
        "Nodext.module.Crypto",
        "Nodext.http.Domain",
        "Nodext.http.controller.Manager",
        // "Nodext.auth.*",
        "Nodext.http.auth.*"
    ],
    $configPrefixed: false,

    config: {
        /**
         * @cfg {NodeInstance} router
         * @private
         * Una instancia de Express.app.Router la cual direcciona las peticiones 
         * http asignadas por los controllers
         */
        router: null,
        /**
         * @cfg {Array} [ignoreFilesWith=null]
         * Permite ignorar la carga de controllerss mediante un prefijo
         * 
         * Por ejemplo:
         * 
         *  - `escapeMyFile.json`
         *  - `ignoreOtherFile.json`
         */
        ignoreFilesWith: null,
        /**
         * @cfg {Nodext.http.Domain} domain
         */
        domain: null,
        /**
         * @cfg {Nodext.http.controller.Manager} controllerMgr 
         */
        controllerMgr: null,
        /**
         * @cfg {Boolean} autoRun
         * Inicio automatico del servidor 
         */
        autoRun: true,
        /**
         * @cfg {Object} public
         * Permite publicar rutas del servidor de modo publico
         */
        public: null,
        modelMgr: true
    },
    auths: null,
    /**
     * @property {Array} checkRunServer
     * @private
     * Guarda un listado de librerias o clases las cuales esten pendientes de iniciar, retrasando el inicio del servidor,
     * hasta que estas se encuentren listas.
     */
    checkRunServer: null,
    /**
     * @property bodyParser
     * @private
     */
    bodyParser: null,
    /**
     * @property methodOverride
     * @private
     */
    methodOverride: null,
    /**
     * @private
     * Contiene un listado de los clsManager configurados, en esta lista se encuentra modelMgr(models) y controllerMgr(controllers)
     */
    clsManager: null,
    constructor: function (config) {
        this.callParent(arguments);
        this.checkRunServer = [];
        this.fnListen = this.listenMessage.bind(this);
        this.mixins.mapclass.constructor.call(this, config);
        this.mixins.modelmgr.constructor.call(this);
        process.on('message', this.fnListen);
        this.init();
    },
    /**
     * @method init
     * @private
     */
    init: function () {
        this.beforeConfigServer();
        this.configServer();
        // this.mixins.mapclass.constructor.call(this);        
        // this.configModelManager();
        this.configControllerManager();
        this.serverReady();
    },
    /**
     * @method beforeConfigServer
     * @template
     */
    beforeConfigServer: Nodext.emptyFn,
    /**
     * @method configServer
     * @private
     */
    configServer: function () {
        this.bodyParser = require("body-parser"),
            this.methodOverride = require("method-override"),
            this.router = this.express.Router();

        this.addMiddleware(this.bodyParser.json({ limit: '50mb' }), {
            name: "server.jsonParser",
            _type: "jsonparser",
            _id: Nodext.id(null, "JsonParser-")
        });
        this.addMiddleware(this.bodyParser.urlencoded({ limit: '50mb', extended: true }), {
            name: "server.urlEncodedParser",
            _type: "urlencodedparser",
            _id: Nodext.id(null, "UrlEncodedParser-")
        });
        this.addMiddleware(this.methodOverride(), {
            name: "server.methodOverride",
            _type: "methodoverride",
            _id: Nodext.id(null, "MethodOverride-")
        });

        this.middlewareHeader();


        this.initVhosts();

        


        this.initializeAuths();


        if (this.domain) {
            this.domain.server = this;
            if (!(this.domain instanceof Nodext.http.Domain)) {
                this.domain = Nodext.create("Nodext.http.Domain", this.domain);
            }
            this.addMiddleware(this.domain.middleware());
        }


        if (this.public) {
            for (var p in this.public) {
                this.router.use(p, this.express.static(this.public[p]));
            }
        }

        this.passport = Nodext.create("Nodext.http.Passport", {
            server: this
        });




        this.fireEvent("afterbaseconfig", this, this.app);
        this.beforeCfgRouter(this.router);
        this.fireEvent("beforeaddrouter", this, this.app);
        this.addMiddleware(this.router, {
            name: "server.router",
            _type: "router",
            _id: Nodext.id("Router-")
        });
        this.afterCfgRouter(this.router);
        this.middlewareError404();



        // this.removeMiddleware(this.getMiddlewareByType("session"));
    },
    initializeAuths: function () {
        var authList = this.auths || [];

        this.auths = Nodext.create("Ext.util.Collection", {
            keyFn: function (i) {
                return i.itemId || i.id || i.typeAuth;
            }
        });

        // if (this.session) {
        //     var session = Nodext.http.session.Base.create({
        //         type: "express",
        //         appNode: this.appNode
        //     });
        //     session.applyServer(this, this.app);
        //     this.session = session;
        // }



        var item;
        for (var x = 0; x < authList.length; x++) {
            // item = authList[x];
            if (Nodext.isObject(authList[x])) {
                item = Nodext.apply({}, authList[x]);
            } else if (Nodext.isString(authList[x])) {
                item = {
                    type: authList[x]
                }
            }
            Nodext.apply(item, {
                appNode: this.appNode
            });
            item = Nodext.auth.Base.create(item);
            item.applyServer(this, this.app);
            // debugger
            // console.log(item);
            this.auths.add(item);
        }
        // console.log(this.auths);
    },
    /**
    * @method beforeCfgRouter
    * @template
    * Añade una funccion middleware al servidor antes de configurar el router.
    *
    * Las funciones de middleware son funciones que tienen acceso al objeto de solicitud (req),
    * al objeto de respuesta (res) y a la siguiente función de middleware en el ciclo de solicitud/respuestas
    * de la aplicación. La siguiente función de middleware se denota normalmente con una variable denominada next.
    * 
    * Las funciones de middleware pueden realizar las siguientes tareas:
    * 
    * - `Ejecutar cualquier código.`
    * - `Realizar cambios en la solicitud y los objetos de respuesta`
    * - `Finalizar el ciclo de solicitud/respuestas.`
    * - `Invocar la siguiente función de middleware en la pila.`
    * 
    * Si la función de middleware actual no finaliza el ciclo de solicitud/respuestas, 
    * debe invocar next() para pasar el control a la siguiente función de middleware. 
    * De lo contrario, la solicitud quedará colgada.    
    * @param router 
    */
    beforeCfgRouter: Nodext.emptyFn,
    /**
     * @method afterCfgRouter
     * @template
     * Añade una funccion middleware al servidor despues de configurar el router, para mayor referencia vea 
     * {@link Nodext.http.Server#beforeCfgRouter}
     * @param router 
     */
    afterCfgRouter: Nodext.emptyFn,
    /**
     * @method configControllerManager
     * @private
     */
    configControllerManager: function () {
        this.controllerMgr = this.controllerMgr || {};
        Nodext.apply(this.controllerMgr, {
            appNode: this.appNode,
            server: this
        });
        var groupAlias = this.controllerMgr.groupAlias || "controllers";
        if (!(this.controllerMgr instanceof Nodext.http.controller.Manager)) {
            this.controllerMgr = Nodext.create("Nodext.http.controller.Manager", this.controllerMgr);
            if (!this.controllerMgr.autoLoad) {
                this.controllerMgr.start();
            }
        }
        this.addMapClsManager(groupAlias, this.controllerMgr);
    },
    /**
     * @method serverReady
     * Dispara el evento beforerunserver para que las otras clases escuchen y puedan añadir sus dependencias 
     * antes del inicio del servidor.
     * @private
     */
    serverReady: function () {
        this.fireEvent("beforerunserver", this, this.srv);
        if (this.autoRun) {
            this.runServer();
        }
    },
    /**
     * @method runServer
     * Valida que el servidor no tenga dependencias pendientes de finalizar y ejecuta el inicio del
     * servidor.
     * @private
     */
    runServer: function () {
        var checkInvalid = false;
        for (var x = 0; x < this.checkRunServer.length; x++) {
            if (this.checkRunServer[x] !== true) {
                checkInvalid = true;
                break;
            }
        }
        if (checkInvalid) {
            Nodext.logEvent("Queda pendiente el inicio de :");
            console.log(this.checkRunServer);
            return false;
        }
        this.callParent();
    },
    /**
     * @method addTaskLib
     * Añade una dependencia al servidor.
     */
    addTaskLib: function (task) {
        var index = this.checkRunServer.length;
        this.checkRunServer.push(task);
        return index;
    },
    /**
     * @method completeTask
     * Marca como completada una dependencia.
     */
    completeTask: function (index) {
        this.checkRunServer[index] = true;
    },

    /**
     * @method listenMessage
     * Escucha los eventos resetworker y stopworker que provienen del proceso maestro
     */
    listenMessage: function (message) {
        if (message.from === "Nodext.Cluster") {
            if (message.event === "resetworker") {
                this.closeWorker.apply(this, message.params);
            } else if (message.event === "stopworker") {
                this.closeWorker.apply(this, message.params);
            }
        }
    },
    /**
     * @method closeWorker
     * Cierra el servidor y comunica al proceso maestro que el servidor ya no se encuentra activo.
     */
    closeWorker: function () {
        if (Nodext.AppMetricsDash) {
            Nodext.AppMetricsDash.monitoring.removeAllListeners();
        }
        this.srv.close(function () {
            Nodext.IPC.setCloseHttp(true);
            process.send({ ename: "httpserverclose", params: [Nodext.idCluster, Nodext.idWorker] });
            Nodext.logEvent("Server Http Close");
        });
    },


});


    // onLoadClass: function (init) {
    //     this.path = init.path;
    //     var srvCfg = this.getServerConfig();
    //     //        if (srvCfg.defaults) {
    //     Nodext.apply(this, srvCfg);
    //     //        }
    //     init.on({
    //         librariesload: "initLibrariesComplete",
    //         scope: this
    //     });
    // },
    // getServerConfig: function () {
    //     try {
    //         var json = require(Nodext.GlobalCfg.getFileCfgServer("server.json"));
    //         var cfg = {};
    //         if (Nodext.isObject(json.defaults)) {
    //             Nodext.apply(cfg, json.defaults);
    //         }
    //         var id = Nodext.GlobalCfg.idWorker.toString();
    //         if (Nodext.isObject(json.workers[id])) {
    //             Nodext.apply(cfg, json.workers[id]);
    //         }
    //         return cfg;
    //     } catch (e) {
    //         return {};
    //     }
    // },
    // initLibrariesComplete: function () {
    //     this.initializeServer();
    // },
//        var me = this;
//        setTimeout(function () {
////            console.log(me.router.stack);
//            console.log(me.router);
//            me.router.stack.forEach(function (item, index) {
////                console.log("------------");
////                console.log(item);
////                console.log(item.route)
////                console.log(item.route.path)
//            });
//
//        }, 3000);