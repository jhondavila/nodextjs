/**
 * @class Nodext
 * @extend Ext
 * @singleton
 */
(function () {
    var value, param;

    /**
     * Contiene los comandos de inicio pasadas a la aplicación.
     */
    Nodext.argv = {};

    process.argv.forEach(function (val, index) {
        param = val.split('=');
        if (param.length === 1) {
            Nodext.argv[index] = param[0];
        } else if (param.length > 1) {
            value = Nodext.isString(param[1]) ? param[1].toLowerCase().trim() : undefined;
            if (Nodext.isNumeric(value)) {
                Nodext.argv[param[0]] = parseFloat(value);
            } else if (value === "true") {
                Nodext.argv[param[0]] = true;
            } else if (value === "false") {
                Nodext.argv[param[0]] = false;
            } else {
                Nodext.argv[param[0]] = param[1];
            }
        }
    });
    value = param = null;

    Nodext.apply(Nodext, {
        /**
         * @method
         * Añade propiedades a una funccion
         * @param {Function} fn
         * @param {Object} cfg
         */
        addPropToFn: function (fn, cfg, opts) {
            var value;
            for (var p in cfg) {
                value = { value: cfg[p] };
                Nodext.apply(value, opts || {});
                Object.defineProperty(fn, p, value);
            }
        },
        /**
            * @method launch
            * Lanza una applicacion a partir de la configuracion json suministrada y su directorio.
            * @param {String} app
            * @param {String} pathBase
            * @param {Function} fn 
            */
        launch: function (app, pathBase, fn) {
            var ready = function () {
                var fullPathApp = pathBase + "\/" + app.path;
                if (!Nodext.currentLaunch) {
                    Nodext.currentLaunch = {
                        fullPathApp: fullPathApp,
                        appLoadCfg: app,
                        pathBase: pathBase
                    };
                    require(fullPathApp + "\/" + app.init);
                    if (fn) {
                        Nodext.onReady(fn);
                    }
                } else {
                    setImmediate(function () {
                        Nodext.Launch(app, pathBase, fn);
                    }, 200);
                }
            };
            Nodext.onReady(ready);
        },
        /**
         * @method application
         * Crea una nueva aplicacion, por defecto es una instancia de {@link Nodext.app.Node}
         * @param {Object} app
         */
        application: function (config) {
            var ready = function () {
                // var obj = Nodext.currentLaunch;
                // if (obj) {
                //     config.fileCfg = obj.appLoadCfg;
                //     config.fileCfg.path = config.path || obj.appLoadCfg.path;
                //     config.pathBase = config.pathBase || obj.pathBase;
                // }
                // Nodext.currentLaunch = null;

                config = Ext.apply({
                    extend: 'Nodext.app.Node'
                }, config);
                console.log(config)


                // Ext.app.setupPaths(config.name, config.appFolder, config.paths);

                // Ext.Loader.setPath

                // Ext.Loader.setPath(ns, paths[ns]);

                // Ext.Loader.setPath(config.name, (appFolder === undefined) ? 'app' : appFolder);
                for (var p in config.paths) {
                    Ext.Loader.setPath(p, config.paths[p]);
                }

                Ext.define(config.name + ".$application", config,
                    function () {
                        new this();
                    });
            };
            Nodext.onReady(ready);
        },
        /**
         * @method destroy
         * Destruye un Arreglo/Objetos
         */
        destroy: function () {
            var ln = arguments.length,
                i, arg, x;
            for (i = 0; i < ln; i++) {
                arg = arguments[i];
                if (arg) {
                    if (Ext.isArray(arg)) {
                        this.destroy.apply(this, arg);
                    } else if (Ext.isFunction(arg.destroy)) {
                        arg.destroy();
                    } else if (Ext.isObject(arg)) {
                        for (var index in arg) {
                            arg[index] = null;
                            delete arg[index];
                        }
                        arg = null;
                        delete arg;
                    }
                }
            }
            return null;
        },

        /**
         * @method destroyArray
         * Destruye Arreglos explicitamente,limpiando sus elementos.
         */
        destroyArray: function () {
            var ln = arguments.length,
                i, arg, x;
            for (i = 0; i < ln; i++) {
                arg = arguments[i];
                if (Array.isArray(arg)) {
                    arg.splice(0, arg.length);
                }
            }
            arg = null;
        },

        /**
         * @method destroyClass
         * Destruye Clases explicitamente
         */
        destroyClass: function () {
            var ln = arguments.length,
                i, arg, x;
            for (i = 0; i < ln; i++) {
                arg = arguments[i];
                if (arg) {
                    if (Ext.isObject(arg)) {
                        for (var index in arg) {
                            arg[index] = null;
                            delete arg[index];
                        }
                        arg.isDestroyed = arg.destroyed = true;
                    }
                }
            }
            arg = null;
            return null;
        },

        /**
         * @method destroyObject
         * Destruye Objetos explicitamente
         */
        destroyObject: function () {
            var ln = arguments.length,
                i, arg, x;
            for (i = 0; i < ln; i++) {
                arg = arguments[i];
                if (arg) {
                    if (Ext.isObject(arg)) {
                        for (var index in arg) {
                            if (Array.isArray(arg[index])) {
                                arg[index].splice(0, arg[index].length);
                            } else {
                                arg[index] = null;
                            }
                            delete arg[index];
                        }
                    }
                }
            }
            arg = null;
            return null;
        },

        /**
        * @method destroyMembers
        * Destruye los nombres de los mienbros especificados usando Nodext.destroy, todas las propiedades van a ser
        * configuradas a nulo.
        * @param {Object} object
        * @param {String...} args
        */
        destroyMembers: function (object) {
            for (var ref, name, i = 1, a = arguments, len = a.length; i < len; i++) {
                ref = object[name = a[i]];
                if (ref != null) {
                    object[name] = Ext.destroy(ref);
                }
            }
        },

        /**
         * @method copyData
         * Copia las propiedades de los elementos de un arreglo en uno nuevo.
         * @param {Array} array
         * @param {Array} properties
         */
        copyData: function (array, properties) {
            var x;
            var data = [], item, p;
            if (!properties) {
                properties = {};
                for (x = 0; x < array.length; x++) {
                    item = {};
                    for (p in array[x]) {
                        item[p] = array[x][p];
                    }
                    data.push(item);
                }
            } else {
                for (x = 0; x < array.length; x++) {
                    item = {};
                    for (p in properties) {
                        item[properties[p]] = array[x][p];
                    }
                    data.push(item);
                }
            }
            return data;
        },

        /**
         * @method instDeath
         * Valida que la instancia no halla realizado la respuesta al cliente.
         */
        instDeath: function (inst) {
            if (!inst || (inst.hasOwnProperty("sendRes") && !inst.sendRes)) {
                Nodext.logError("Esta instacia ya ha ha muerto...valimos madres... -.-");
                return true;
            } else {
                return false;
            }
        },
        /**
         * @property {NodeModule} cluster
         * Carga la Libreria Cluster de NodeJS, de esta manera detectamos si el proceso es un Maestro o worker.
         */
        cluster: require('cluster'),
        /**
         * @method isMaster
         * Indica si el proceso actual es el maestro o el worker
         */
        isMaster: function () {
            if (this.cluster.isMaster) {
                return true;
            } else {
                return false;
            }
        }
    });

})();
