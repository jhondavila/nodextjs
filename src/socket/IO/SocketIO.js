/**
 * 
 */
Nodext.define("Nodext.socket.IO.SocketIO", {
    extend: "Nodext.BaseConfig",
    mixins: [
        "Ext.util.Observable",
        "Nodext.util.MapClass",
        "Nodext.model.Mixin"
    ],
    requires: [
        "Nodext.socket.IO.Redis",
        "Nodext.socket.IO.Manager",
        "Nodext.socket.IO.auth.*"
    ],
    $configPrefixed: false,
    $configStrict: false,
    config: {
        /**
         * nombre del archivo de configuración
         */
        fileCfg: "socketIO.json",
        /**
         * @cfg {Boolean|Object}
         * Habilita el uso de redis
         */
        redis: false,
        /**
         * Puerto que escuchara los clientes
         */
        port: 3000,
        /**
         * Habilita el modo seguro en caso de que el servidor redis no se encuentre disponible
         */
        safeMode: true,
        server: null,
        socketMgr: null,
        modelMgr: true
    },
    /**
     * @property {NodeModule} socketIO
     * Carga la libreria socket.io de NodeJs, esta libreria nos permite realizar actividades a tiempo real
     */
    socketIO: null,
    /**
     * @property {NodeModule} socketIO
     * Carga la libreria socket.io-stream de NodeJs, esta libreria nos permite realizar actividades a tiempo real
     */
    IOStream: null,


    /**
    * @property {NodeModule} http
    * Carga la Libreria http de NodeJS.
    */
    http: null,
    /**
     * @property {NodeInstance}
     * Instancia del modulo socket.io
     */
    io: null,
    /**
     * @property
     * @private
     * Mensaje del listen
     */
    stringMessage: "",
    /**
     * @property
     * @private
     * El modo en el cual se ejecuta el socketIo puede ser NormalMode,RedisMode,SafeMode
     */
    typeMode: "",
    /**
     * @property
     * true cuando se inicia el modo seguro
     */
    initSafe: false,

    auths: null,
    constructor: function (config) {
        this.callParent(arguments);
        this.mixins.observable.constructor.call(this, config);
        this.mixins.mapclass.constructor.call(this, config);
        this.mixins.modelmgr.constructor.call(this);
        try {
            this.socketIO = require('socket.io');
            this.overrideIO();
        } catch (e) {
            this.socketIO = null;
            Nodext.logError("No se encontro el modulo socket.io");
        }
        this.fnListen = this.listenMessage.bind(this);
        process.on('message', this.fnListen);
        this.initializeAuths();
    },
    initializeAuths: function () {
        var authList = this.auths || [];
        this.auths = Nodext.create("Ext.util.Collection", {
            keyFn: function (i) {
                return i.itemId || i.id || i.typeAuth;
            }
        });
        var item;
        for (var x = 0; x < authList.length; x++) {
            if (Nodext.isObject(authList[x])) {
                item = Nodext.apply({}, authList[x]);
            } else if (Nodext.isString(authList[x])) {
                item = {
                    type: authList[x]
                };
            }
            Nodext.apply(item, {
                appNode: this.appNode
            });
            item = Nodext.auth.Base.create(item);
            // item.applyServer(this, this.app);
            this.auths.add(item);
        }
    },
    /**
    * @method formatCfg
    * @private
    * Obtiene las configuraciones y las formatea de acuerdo al tipo de proceso (Maestro o Worker).
    */
    formatCfg: function (config) {
        var json = this.appNode.Global.getFileCfg(config.fileCfg || this.fileCfg);
        if (Nodext.isObject(json.defaults)) {
            Nodext.apply(json, json.defaults);
        }
        Nodext.apply(json, config);
        return json;
    },
    /**
     * @method
     * Escucha los eventos resetworker y stopworker que provienen del proceso maestro
     * @private
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
     * @method
     * Cierra las atenciones socket.io
     * @private
     */
    closeWorker: function () {
        if (Nodext.AppMetricsDash) {
            Nodext.AppMetricsDash.monitoring.removeAllListeners();
        }
        this.io.close = function (fn) {
            for (var id in this.nsps['/'].sockets) {
                if (this.nsps['/'].sockets.hasOwnProperty(id)) {
                    this.nsps['/'].sockets[id].onclose();
                }
            }
            this.engine.close();
            if (this.httpServer) {
                this.httpServer.close(fn);
            }
        };
        this.io.close(function () {
            Nodext.IPC.setCloseSocketIO(true);
            process.send({ ename: "socketioserverclose", params: [Nodext.GlobalCfg.idCluster, Nodext.GlobalCfg.idWorker] });
            Nodext.logEvent("Server SocketIO Close");
        });
    },
    configSocketManager: function () {
        this.socketMgr = this.socketMgr || {};
        Nodext.apply(this.socketMgr, {
            appNode: this.appNode,
            socketIO: this,
            io: this.io,
            stream: require('socket.io-stream'),

        });
        var groupAlias = this.socketMgr.groupAlias || "sockets";
        if (!(this.socketMgr instanceof Nodext.socket.IO.Manager)) {
            this.socketMgr = Nodext.create("Nodext.socket.IO.Manager", this.socketMgr);
            if (!this.socketMgr.autoLoad) {
                this.socketMgr.start();
            }
        }
        this.addMapClsManager(groupAlias, this.socketMgr);
    },
    /**
     * @method
     * Inicia el soporte SocketIO
     */
    listen: function () {
        if (!this.server || this.redis !== false) {
            this.server = Nodext.create("Nodext.http.Base", {
                fileCfg: false,
                isSocketServer: true
            });
            this.server.on("error", this.errorSrv);
        }
        this.io = this.socketIO(this.server.srv);
        this.configSocketManager();
        if (this.redis === false || this.redis && Nodext.isMaster()) {
            var port = this.server.isSocketServer ? this.port : this.server.port;
            this.typeMode = "NormalMode";
            this.stringMessage = "Listen Port : " + port;
            this.initListen(port);
        } else {
            if (!(this.redis instanceof Nodext.socket.IO.Redis)) {
                this.redis = Nodext.create("Nodext.socket.IO.Redis", this.redis);
            }
            this.redis.on({
                fail: 'onFailRedis',
                success: 'onSuccessRedis',
                scope: this
            });
            this.redis.connect();
        }
    },
    /**
     * @method
     * @private
     * @param {Object} error
     */
    errorSrv: function (e) {
        if (e.code === 'EADDRINUSE') {
            Nodext.logError("Socket IO Port Busy : " + e.port);
            /**
             * @event errorportbusy
             * Se dispara cuando el puerto configurado ya se encuentra en uso por otra aplicacion o proceso.
             * @param this
             * @param {Object} error
             * @param {Number} portServer
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
     * @private
     * Se ejecuta cuando la conexion redis falla.
     */
    onFailRedis: function (redis) {
        if (!this.safeMode) {
            return false;
        }
        if (this.initSafe) {
            return false;
        }
        this.initSafe = true;
        this.typeMode = "SafeMode";
        var port = redis.port || this.port;
        this.stringMessage = "Listen Port : " + port;
        this.initListen(port);
    },
    /**
     * Se ejecuta cuando la conexion redis fue satisfactoria
     */
    onSuccessRedis: function (redis, hostRedis, portRedis, redisAdapter) {
        this.io.adapter(redisAdapter);
        var me = this;
        process.on('message', function (message, connection) {
            if (message === "sticky-session:connection") {
                me.server.emit('connection', connection);
                connection.resume();
            }
        });
        this.typeMode = "RedisMode";
        this.stringMessage = "Internal Port : " + redis.portInternal + ",Listen Port : " + redis.port;
        this.server.on({
            listen: 'redisRun',
            scope: this
        });
        this.server.setPortServer(redis.portInternal);
        this.server.runServer('localhost');
    },
    /**
     * @method
     * Inicia la escucha del servidor socketIo
     * @private
     */
    initListen: function (port) {
        this.server.on({
            listen: 'defaultRun',
            scope: this
        });
        this.server.setPort(port);
        this.server.runServer();
    },
    /**
     * @method
     * @private
     * Se ejecuta despues de iniciar la atencion de conexiones SocketIO
     */
    defaultRun: function () {
        Nodext.logEvent("Run Socket IO " + this.typeMode + " | " + this.stringMessage);
    },
    /**
     * @method
     * @private
     * Se ejecuta despues de iniciar la atencion de conexiones SocketIO con Redis habilitado
     */
    redisRun: function () {
        var redis = this.redis,
            port = redis.port,
            portInternal = redis.portInternal;
        Nodext.logEvent("Run Socket IO " + this.typeMode + " | " + this.stringMessage);
        process.send({ ename: "socketbyredis", params: [process.pid, Nodext.idCluster, Nodext.idWorker, portInternal, port] });
    },
    overrideIO: function () {
        var io = this.socketIO.prototype;

        var Namespace = require('socket.io/lib/namespace');
        var Socket = require('socket.io/lib/socket');

        Socket.prototype.onclose = function (reason) {
            if (!this.connected) return this;
            this.emit('disconnecting', reason);
            this.leaveAll();
            this.nsp.remove(this);
            this.client.remove(this);
            this.connected = false;
            this.disconnected = true;
            delete this.nsp.connected[this.id];
            if (this._space) {
                var inst = this._space.newInstance(this);
                try {
                    this._space.fireEvent("disconnect", inst, reason, this._space);
                } catch (error) {
                    console.log(error);
                }
                if (!inst.destroyed && inst.autoClear && inst.DBCompiles.length === 0) {
                    inst.clear();
                }
            }
            this.emit('disconnect', reason);
            this._space = null;
        };

        Socket.prototype.dispatch = function (event) {
            var self = this;
            function dispatchSocket(err) {
                process.nextTick(function () {
                    if (err) {
                        return self.error(err.data || err.message);
                    }
                    if (self._space) {
                        var date = new Date();
                        var inst = self._space.newInstance(self);
                        event.splice(1, 0, inst);
                        try {
                            self._space.fireEvent.apply(self._space, event);
                        } catch (error) {
                            console.log(error);
                        }
                        event.splice(1, 1);
                        self.__proto__.__proto__.emit.apply(self, event);
                        event.splice(0, event.length);
                        console.log("ms : " + (new Date() - date))
                        // console.log(inst);
                        // debugger
                        if (!inst.destroyed && inst.autoClear && inst.DBCompiles.length === 0) {
                            inst.clear();
                        }
                    }
                });
            }
            this.run(event, dispatchSocket);
        };


        Namespace.prototype.add = function (client, query, fn) {
            var socket = new Socket(this, client, query);
            var self = this;
            this.run(socket, function (err) {
                process.nextTick(function () {
                    if ('open' == client.conn.readyState) {
                        if (err) return socket.error(err.data || err.message);

                        // track socket
                        self.sockets[socket.id] = socket;

                        // it's paramount that the internal `onconnect` logic
                        // fires before user-set events to prevent state order
                        // violations (such as a disconnection before the connection
                        // logic is complete)
                        socket.onconnect();
                        if (fn) fn();

                        // fire user-set events
                        self.emit('connect', socket);
                        self.emit('connection', socket);
                        if (self._space) {
                            socket._space = self._space;
                            var inst = self._space.newInstance(socket);
                            try {
                                self._space.fireEvent("connect", inst, self);
                            } catch (error) {
                                console.log(error);
                            }
                            if (!inst.destroyed && inst.autoClear && inst.DBCompiles.length === 0) {
                                inst.clear();
                            }
                        }

                    } else {
                        debug('next called after client was closed - ignoring socket');
                    }
                });
            });
            return socket;
        };

        io.of = function (name, fn) {
            if (String(name)[0] !== '/') name = '/' + name;

            var nsp = this.nsps[name];
            if (!nsp) {
                nsp = new Namespace(this, name);
                this.nsps[name] = nsp;
            }
            if (fn) nsp.on('connect', fn);
            return nsp;
        };
    }
});