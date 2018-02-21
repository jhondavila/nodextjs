/**
 * 
 */
Nodext.define("Nodext.http.controller.Controller", {
    extend: "Ext.Base",
    mixins: ["Nodext.util.HookClass"],
    requires: ["Nodext.http.controller.Script"],
    $configPrefixed: false,
    config: {
        /**
         * Lista de clases a vincular mediante un alias a este controlador
         */
        load: null,
        /**
         * Servidor del controller
         */
        server: null,
        /**
         * Router del controller
         */
        router: null,
        /**
         * Nombre de la conexion BD por defecto a usar en la instacia 
         */
        DBcnxName: null,
        /**
         * Habilita la conexion automatica a la BD para la instancia
         */
        DBCnxAuto: false,
        /**
         * Valida la session del usuario existente antes de continuar con la peticion http
         */
        authUser: false,
        /**
         * Deshabilita toda url que atienda este controller
         */
        disabledRequest: false,
        /**
         * Mensaje a emitir al cliente cuando el controller no atienda sus url
         */
        disabledReqMsg: "la ruta se encuentra <br> actualmente deshabilitada",
        /**
         * Header por defecto ah añadir a la respuesta http 
         */
        defaultHeaders: {}
    },
    /**
    * Indica si el controllador es parte de la aplicacion
    */
    isServerCtrl: true,
    /**
     * Metodos habilitados para el controlador GET,POST,DELETE,PUT
     */
    methods: null,
    /**
     * Rutas URL del controlador
     */
    routes: null,
    constructor: function (config) {
        Nodext.apply(this, config);
        this.initConfig(config);
        this.init();
        this.script = Nodext.http.controller.Script;
        this.methods = this.methods || ["get", "post", "delete", "put"];
        this.routes = this.routes || {};
        this.router = this.server.router;
        this.hookLoad();
        if (this.isServerCtrl) {
            this.initPathMethod();
        }
    },
    getClassOfMgr: function (g, cls) {
        return this.server.getClassOfMgr(g, cls);
    },
    /**
     * @template
     * @method
     */
    init: Nodext.emptyFn,
    /**
     * @method
     * @private
     */
    escapeUrl: function (string) {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
    /**
     * @method
     * @private
     * Inicializa la creacion de enrutadores para esta clase
     */
    initPathMethod: function () {
        if (!Nodext.isObject(this.routes)) {
            return false;
        }
        var x, method;
        if (!Array.isArray(this.methods)) {
            this.methods = [this.methods];
        }
        for (var x = 0; x < this.methods.length; x++) {
            method = this.methods[x];
            if (Nodext.isObject(this.routes[method])) {
                this.createMethod(method, this.routes[method])
            }
        }
    },
    /**
     * @method
     * @private
     * Crea los path de un determinado metodo
     */
    createMethod: function (method, routes) {
        var key, route;
        var fns = [], fn, regex, url;
        for (key in routes) {
            this.addPath(method, key, routes[key]);
        }
    },
    /**
     * @method
     * @private
     * Funcion por defecto en caso de no encontrar la funcion configurada
     */
    _defaultPath: function (inst) {
        inst.send({
            message: "Default Response, no path Function Resolve"
        })
    },
    /**
     * @method
     * Monta un enrutador limpio en el servidor, el cual respondera al cliente con las funciones configuradas.
     * 
     * Si utiliza la opcion "initMount" esta se ejecutara y debe devolver una funcion o un arreglo de funciones
     * encargadas de responder al cliente. Esto es muy util en caso que necesite inicializar algunas variables 
     * para su route.
     * 
     *      Nodext.define("MyApp.controllers.MiRouter",{
     *          extends : "Nodext.http.controller.Controller",
     *          routes : {
     *              'inicio' : {
     *                  initMount : 'initMyPath'
     *              }
     *          },
     *          initMyPath : function() {
     *              var cont = 0;
     *              var fn = function(req,res,next){
     *                  cont++;
     *                  res.send({
     *                      message : "La pagina ha sido visitada "+ cont;
     *                  });
     *              };
     *              return fn;
     *          }
     *      });
     * 
     *      //Tambien puede devolver un arreglo con el nombre de las funciones a utilizar.
     *      Nodext.define("MyApp.controllers.MiRouter",{
     *          extends : "Nodext.http.controller.Controller",
     *          routes : {
     *              get : {
     *                  'inicio' : {
     *                      initMount : 'initMyPath'
     *                  }              
     *              }
     *          },
     *          initMyPath : function() {
     *              var me = this;
     *              me.cont = 0;
     *              var fn = function(req,res,next){
     *                  me.cont++;
     *                  next();
     *              };
     *              return [fn,"responseClient"];
     *          },
     *          responseClient : function(){
     *              res.send({
     *                  message : "La pagina ha sido visitada "+ this.cont
     *              });
     *          }
     *      });
     * 
     * Si solo desea montar una serie de funciones sin inicializar ninguna variable puede utilizar 
     * "mount" el cual acepta funciones o arreglo de funciones.
     * 
     *      Nodext.define("MyApp.controllers.MiRouter",{
     *          extends : "Nodext.http.controller.Controller",
     *          routes : {
     *              get : {
     *                  'inicio' : {
     *                      mount : ["incrementCount","responseClient"]
     *                  }              
     *              }
     *          },
     *          incrementCount : function(req,res,next){
     *              this.cont = this.cont || 0;
     *              this.cont++;
     *              next();
     *          },
     *          responseClient : function(){
     *              res.send({
     *                  message : "La pagina ha sido visitada "+ this.cont
     *              });
     *          }
     *      });
     *      
     * 
     */
    pathMount: function (method, path, config) {
        var mount, initMount, fn;
        if (Nodext.isString(config.initMount)) {
            initMount = this[config.initMount];
            mount = initMount.call(this, config, this, this.server);
        } else if (Nodext.isFunction(config.initMount)) {
            initMount = config.initMount;
            mount = initMount.call(this, config, this, this.server);
        }

        mount = mount || config.mount;
        if (mount) {
            if (!Array.isArray(mount)) {
                mount = [mount];
            }
            var id = Nodext.id("CtrlPath-");;
            for (var x = 0; x < mount.length; x++) {
                if (Nodext.isString(mount[x])) {
                    if (this[mount[x]]) {
                        mount[x] = this[mount[x]];
                    } else {
                        Nodext.logWarn("No found function to mount : ==>" + mount[x] + "<== in controller " + Nodext.getClassName(this));
                        mount[x] = this._defaultPath;
                    }
                }
                if (!Nodext.isFunction(mount[x])) {
                    Nodext.logWarn("Mount single accept function, check path ==>" + path + "<== in controller " + Nodext.getClassName(this));
                    mount[x] = this._defaultPath;
                }

                if (mount[x]._id) {
                    Nodext.addPropToFn(mount[x], {
                        name: "ctrl.path",
                        _id: id,
                        _type: "ctrlpath",
                        _subType: "pathmount",
                        _controller: this
                    }, { configurable: true });
                }
            }
            this.router[method](path, mount);
            return true;
        } else {
            Nodext.logWarn("No mount function ==>" + path + "<== in controller " + Nodext.getClassName(this) + "\n" +
                "Check initMount and mount return Function or Array[Functions]");
            return false;
        }
    },
    /**
     * @method
     * Monta un enrutador el cual realiza una validacion previa de controlador,session cuando
     * hay una solicitud http. Despues es esta previa validacion, la funcion configurada es llamada.A esta funcion
     * se la pasara el parametro inst.
     * 
     *      //Montar un route basico
     *      Nodext.define("MyApp.controllers.MiRouter",{
     *          extends : "Nodext.http.controller.Controller",
     *          routes : {
     *              get : {
     *                  'inicio' : 'responseClient'             
     *              }
     *          },
     *          responseClient : function(){
     *              this.cont = this.cont || 0;
     *              this.cont++;
     *              res.send({
     *                  message : "La pagina ha sido visitada "+ this.cont
     *              });
     *          }
     *      });
     * 
     * 
     *      //Si desea validar que el usuario este autentificado
     *      Nodext.define("MyApp.controllers.MiRouter",{
     *          extends : "Nodext.http.controller.Controller",
     *          routes : {
     *              get : {
     *                  'inicio' : {
     *                      fn : 'responseClient',
     *                      authUser : true
     *                  }             
     *              }
     *          },
     *          responseClient : function(){
     *              this.cont = this.cont || 0;
     *              this.cont++;
     *              res.send({
     *                  message : "La pagina ha sido visitada "+ this.cont
     *              });
     *          }
     *      });
     * 
     *      //En caso necesite un path con soporte regExp puede especificar la variable path
     *      Nodext.define("MyApp.controllers.MiRouter",{
     *          extends : "Nodext.http.controller.Controller",
     *          routes : {
     *              get : {
     *                  'inicio' : {
     *                      path : /\/inicio/g,
     *                      fn : 'responseClient',
     *                      authUser : true
     *                  }             
     *              }
     *          },
     *          responseClient : function(inst){
     *              this.cont = this.cont || 0;
     *              this.cont++;
     *              inst.send({
     *                  message : "La pagina ha sido visitada "+ this.cont
     *              });
     *          }
     *      });
     * 
     * **Nota:** A diferencia del metodo {@link #pathMount} que carga un route limpio, la otra 
     * principal diferencia es que a la funcion configurada solo se le pasara el parametro inst,
     * sin embargo desde este parametro puede acceder a los parametros req,res en caso que los necesite.
     */
    pathInst: function (method, path, config) {
        var fnName, fn, fnHandler;

        fnName = Nodext.isString(config.fn) ? config.fn : undefined;
        if (Nodext.isFunction(config.fn)) {
            fn = config.fn;
        } else {
            if (this[fnName]) {
                fn = this[fnName];
            } else {
                fn = this._defaultPath;
                Nodext.logWarn("No found function ==>" + fnName + "<== in controller " + Nodext.getClassName(this));
            }
        }
        fnHandler = this.routeHandler.bind(undefined, {
            path: path,
            config: config,
            fn: fn,
            controller: this
        });
        var id = Nodext.id("CtrlPath-");
        Nodext.addPropToFn(fnHandler, {
            name: "ctrl.path",
            _id: id,
            _type: "ctrlpath",
            _subType: "pathinst",
            _controller: this
        }, { configurable: true });
        this.router[method](path, fnHandler);
        return true;
    },
    /**
     * @method
     * Añade un metodo de enrutamiento HTTP el cual respondera ejecutando una o mas funciones.
     * Los metodos comunes son get,post,put,delete. Tambien se puede configurar otros tipos de metodo
     * de acuerdo usted necesite.
     * 
     * Lista de los metodos son soportados :
     * 
     *  - `get`
     *  - `post`
     *  - `put`
     *  - `head`
     *  - `delete`
     *  - `options`
     *  - `trace`
     *  - `copy`
     *  - `lock`
     *  - `mkcol`
     *  - `move`
     *  - `purge`
     *  - `propfind`
     *  - `proppatch`
     *  - `unlock`
     *  - `report`
     *  - `mkactivity`
     *  - `checkout`
     *  - `merge`
     *  - `m-search`
     *  - `notify`
     *  - `subscribe`
     *  - `unsubscribe`
     *  - `patch`
     *  - `search`
     *  - `connect`
     * 
     * @param {String} method
     * @param {String|RegExp} path
     * @param {String|Object} config
     * @param {String|Function} [config.fn]
     * @param {Boolean} [config.authUser]
     * @param {String|Function} [config.initMount]
     * @param {Array|Function} [config.mount]
     * 
     * 
     */
    addPath: function (method, path, config) {
        if (Nodext.isObject(config) && config.path) {
            path = config.path;
        }
        if (typeof path === "string") {
            // path = this.escapeUrl(path);
            if (path.indexOf("/") !== 0) {
                path = "/" + path;
            }
        }
        if (typeof config === "string") {
            return this.pathInst(method, path, { fn: config });
        } else if (Nodext.isObject(config)) {
            if (config.mount || config.initMount) {
                return this.pathMount(method, path, config);
            } else {
                return this.pathInst(method, path, config);
            }
        } else {
            return false;
        }
    },
    /**
     * @method
     * @private
     */
    routeHandler: function (params, req, res, next) {
        var ctrl = params.controller,
            fnConfig = params.config,
            fn = params.fn,
            server = ctrl.server || {},
            inst = ctrl.newInstance(req, res);

        if (ctrl.disabledRequest) {
            inst.sendError({
                success: false,
                message: ctrl.disabledReqMsg || "la ruta se encuentra <br> actualmente deshabilitada"
            });
            inst = req = res = null;
            return false;
        }
        // debugger
        var auth;
        if (typeof fnConfig === "string") {
            auth = server.auths.getByKey(ctrl.getAuthUser());
        } else if (Nodext.isObject(fnConfig)) {
            if (fnConfig.authUser === false) {
                auth = false;
            } else if (Nodext.isString(fnConfig.authUser)) {
                auth = server.auths.getByKey(fnConfig.authUser);
            } else {
                auth = server.auths.getByKey(ctrl.getAuthUser());
            }
        }
        // debugger
        if (auth) {
            inst.activeAuth = auth;
            auth.authenticate(inst, ctrl, fn);
        } else {
            inst.initBuild();
            fn ? fn.call(ctrl, inst) : inst.sendError({
                success: false,
                message: "Ruta no configurada/acceso denegado"
            });
        }
        ctrl = fnConfig = server = inst = authUser = null;
    },
    /**
     * @method
     */
    newInstance: function (req, res) {
        return Ext.create("Nodext.http.controller.Instance", {
            orgDomain: req.orgDomain || undefined,
            req: req,
            res: res,
            controller: this,
            DBScope: this,
            auths: this.server.auths,
            // session: this.server.session,
            ctrl: this,
            DBcnxName: this.DBcnxName,
            DBCnxAuto: this.DBCnxAuto,
        });
    },
    newBaseInst: function (options) {
        var cfg = {
            controller: this,
            ctrl: this,
            DBScope: this,
            autoInit: true,
            DBErrorDestroy: true,
            DBcnxName: this.DBcnxName,
            DBCnxAuto: this.DBCnxAuto,
        };
        Nodext.apply(cfg, options);
        return Ext.create("Nodext.BaseInstance", cfg);
    },
    /**
     * Codifica una cadena al formato MD5
     */
    parseMd5: function (string) {
        try {
            return Nodext.Crypto.createHashMD5(string);
        } catch (e) {
            return null;
        }
    },
    getOrgDomain: function () {
        return this.server.domain ? this.server.domain : null;
    }
});