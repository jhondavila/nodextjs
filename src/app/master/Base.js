/**
 * 
 */
Nodext.define("Nodext.app.master.Base", {
    extend: "Nodext.BaseConfig",
    requires: ["Nodext.app.master.Redis", "Nodext.app.master.ClusterManager"],
    $configPrefixed: false,
    $configStrict: false,
    mixins: {
        observable: 'Ext.util.Observable'
    },
    config: {
        /**
        * @cfg {Nodext.app.Node} appNode
        * @requires
        */
        appNode: null,
        /**
        * @cfg {String} fileCfg
        */
        fileCfg: "cluster.json",
        /**
         * @cfg {Number} totalServer
         * Total de workers activos.No debe ser mayor a {@link #totalThread}
         */
        totalServer: 1,
        /**
         * @cfg {Number} totalThread
         * total de workers maximos permitidos.
         */
        totalThread: 1,
        /**
         * @cfg {String} id
         * id del Cluster
         */
        id: null,
        /**
         * @cfg {String} name
         * Nombre del Cluster
         */
        name: null,
        /**
         * @cfg {Nodext.app.master.Redis|Object} redis
         */
        redis: null
    },
    /**
     * @property {Number} numCPUs
     * Numero de nucleos del procesador 
     */
    numCPUs: null,
    /**
     * @property {Object} actionWorkers
     * @private
     * Almacena la lista de acciones pendientes a ejecutar para cada worker
     */
    actionWorkers: null,
    /**
     * @property {Ext.util.Collection} workers
     * Almacena los workers generados por la instancia maestra
     */
    workers: null,
    /**
     * @property {NodeModule} os
     * Carga la Libreria os de NodeJS, de esta manera obtenemos informacion del SO.
     */
    os: null,
    generateId: function () {
        this.id = Nodext.id(null, "Cluster-");
    },
    constructor: function (config) {
        this.callParent(arguments);
        
        this.mixins.observable.constructor.call(this, config);
        this.workers = Nodext.create("Ext.util.Collection", {});
        Nodext.app.ClusterMgr.register(this);

        this.actionWorkers = {};
        this.os = require('os');

        // if (this.monitoring) {
        //     Nodext.require("Nodext.system.cluster.manager.SocketIO");
        //     Nodext.SocketIOMgr.on({
        //         afterload: 'addListenerMonitor',
        //         scope: this,
        //         single: true
        //     });
        // }
        // if (this.clusterServer) {
        this.addClusterHook();

        this.initRedis();
        // console.log(this)
        this.detectThread();
        // }
    },
    setRedis: function (redis) {
        if (!redis) {
            return this.redis;
        }
        var clsRedis = Nodext.app.master.Redis;
        if (this.redis instanceof clsRedis && redis !== this.redis) {
            this.redis.unlistenCluster(this);
        }
        if (!(this.redis instanceof clsRedis)) {
            this.redis = Nodext.create("Nodext.app.master.Redis", redis);
        } else {
            this.redis = redis;
        }
    },
    /**
     * @method initRedis
     */
    initRedis: function () {
        if (!(this.redis instanceof Nodext.app.master.Redis)) {
            this.redis = Nodext.create("Nodext.app.master.Redis", this.redis);
        }
        this.redis.listenCluster(this);
    },
    /**
     * @method detectThread
     * Detecta el numero maximo de Thread/Workers que se pueden generar en base al numero de nucleos
     * del procesador del equipo.
     * @private 
     */
    detectThread: function () {
        this.numCPUs = this.os.cpus().length;
        this.totalThread = this.totalThread || 'MAX';

        if (Nodext.isString(this.totalThread) && this.totalThread === 'MAX') {
            this.totalThread = this.numCPUs;
        } else if (Nodext.isNumeric(this.totalThread)) {
            if (this.totalThread > this.numCPUs || this.totalThread < 1) {
                this.totalThread = this.numCPUs;
            } else {
                this.totalThread = parseInt(this.totalThread);
            }
        }
    },
    /**
     * @method onClusterMessage
     * @private
     * Genera un relayEvent al process para el evento "message""
     */
    onClusterMessage: function (worker, msg) {
        if (this.id !== worker.idCluster) {
            return;
        }
        if (msg.ename) {
            this.fireEvent.apply(this, [msg.ename, this].concat(msg.params));
        }
        this.fireEvent("message", this, worker, worker.process.pid, msg);
    },
    /**
     * @method onClusterOnline
     * @private
     * Genera un relayEvent al process para el evento "online"
     */
    onClusterOnline: function (worker) {
        if (this.id !== worker.idCluster) {
            return;
        }
        this.fireEvent("online", this, worker, worker.process.pid);
    },
    /**
     * @method onClusterListening
     * @private
     * Genera un relayEvent al process para el evento "listening"
     */
    onClusterListening: function (worker, address) {
        if (this.id !== worker.idCluster) {
            return;
        }
        // console.log(address);
        this.fireEvent("listening", this, worker, worker.process.pid, address);
    },
    /**
     * @method onClusterExit
     * @private
     * Genera un relayEvent al process para el evento "exit"
     */
    onClusterExit: function (worker, code, signal) {
        var cluster = worker.Cls.cluster;
        var thread = worker.Cls;
        var pid = worker.process.pid;
        if (worker.suicide === true || (worker.Cls && worker.Cls.typeExit)) {
            Nodext.logEvent("worker " + worker.process.pid + " it was just suicide\' – no need to worry");
            this.fireEvent("exitbysuicide", this, cluster, thread, pid, signal);
        } else if (signal) {
            Nodext.logEvent("worker " + worker.process.pid + " exit signal.");
            this.fireEvent("exitbysignal", this, cluster, thread, pid, signal);
        } else if (code !== 0) {
            Nodext.logEvent("worker " + worker.process.pid + " error code " + code);
            this.fireEvent("exitbyerror", this, cluster, thread, pid, code);
        } else {
            Nodext.logEvent("exit not identified");
        }
        cluster = thread = pid = null;
    },
    /**
     * @method onClusterDisconnect
     * @private
     * Genera un relayEvent al process para el evento "disconnect"
     */
    onClusterDisconnect: function (worker) {
        if (this.id !== worker.idCluster) {
            return;
        }
        this.fireEvent("disconnect", this, worker, worker.process.pid);
    },
    /**
     * @method onClusterFork
     * @private
     * Genera un relayEvent al process para el evento "fork"
     */
    onClusterFork: function (worker) {
        if (this.id !== worker.idCluster) {
            return;
        }
        Nodext.logWorkerFork("worker " + worker.process.pid + " fork");
        this.fireEvent("fork", this, worker, worker.process.pid);
    },
    /**
     * @method addClusterHook
     * @private
     * Genera los hook para los eventos del process
     */
    addClusterHook: function () {
        this.clusterLs = {
            message: this.onClusterMessage.bind(this),
            online: this.onClusterOnline.bind(this),
            listening: this.onClusterListening.bind(this),
            exit: this.onClusterExit.bind(this),
            disconnect: this.onClusterDisconnect.bind(this),
            fork: this.onClusterFork.bind(this)
        };
        Nodext.cluster.on("message", this.clusterLs.message);
        Nodext.cluster.on("online", this.clusterLs.online);
        Nodext.cluster.on("listening", this.clusterLs.listening);
        Nodext.cluster.on('exit', this.clusterLs.exit);
        Nodext.cluster.on('disconnect', this.clusterLs.disconnect);
        Nodext.cluster.on('fork', this.clusterLs.fork);
    },
    destroy: function () {
        if (this.clusterLs) {
            for (var e in this.clusterLs) {
                Nodext.cluster.removeListener(e, this.clusterLs[e]);
            }
        }
    }
    ///////////////
    ///////////////
    ///////////////
    ///////////////
    ///////////////    

    // addListenerMonitor: function (Manager, items) {
    //     this.SpaceMonitor = Nodext.SocketIOMgr.getByKey("Monitor");
    //     if (!this.SpaceMonitor) {
    //         return;
    //     }
    //     this.SpaceMonitor.relayEvents(this, ['monitor'], "cluster")
    // },

    // getServers
    // getWorkers: function (fn) {
    //     var list = [];
    //     this.clusters.each(function (cluster) {
    //         list.push(cluster.encodeCluster());
    //     });
    //     fn(list);
    // },
    // resetWorker: function (data, socket) {
    //     Nodext.logEvent("resetWorker")
    //     var cluster = this.clusters.get(data.id_cluster);
    //     if (!cluster) {
    //         return { success: false, message: "Cluster No Found" };
    //     }
    //     var thread = cluster.get(data.id_thread);
    //     if (!thread) {
    //         return { success: false, message: "Thread No Found" };
    //     }

    //     thread.setStatus("resetingworker", {});
    //     Nodext.logEvent("eliminando worker pid " + thread.getPid());
    //     var wSocket;
    //     for (var p in this.netSocket) {
    //         wSocket = this.netSocket[p];
    //         if (wSocket.removeByKey(thread.equip + "#" + thread.getPid())) {
    //             thread.setStatus("removefromnetserver", {});
    //         }
    //     }
    //     this.addActionThread(thread, "reset");
    //     thread.send({
    //         from: 'Nodext.Cluster',
    //         event: 'resetworker',
    //         params: []
    //     });
    // },
    // addActionThread: function (worker, action) {
    //     this.actionWorkers[worker.clusterId + worker.id] = action;
    // },
    // findActionWorker: function (worker) {
    //     if (this.actionWorkers[worker.clusterId + worker.id]) {
    //         return this.actionWorkers[worker.clusterId + worker.id];
    //     } else {
    //         return false;
    //     }
    // },
    // removeActionWorker: function (worker) {
    //     delete this.actionWorkers[worker.clusterId + worker.id];
    // },
    // emitAppServer: function (event, data) {
    //     if (!Nodext.SocketIOMgr) {
    //         Nodext.logError("No existe Nodext.SocketIOMgr");
    //         return false;
    //     }
    //     Nodext.SocketIOMgr.emitSpace("Server", event, data);
    // },
    // startWorker: function (data, socket) {
    //     Nodext.logEvent("startWorker");
    //     var cluster = this.clusters.get(data.id_cluster);
    //     if (!cluster) {
    //         return { success: false, message: "Cluster No Found" };
    //     }
    //     var thread = cluster.get(data.id_thread);
    //     if (!thread) {
    //         return { success: false, message: "Thread No Found" };
    //     }
    //     if (!thread.worker) {
    //         thread.generateWorker();
    //         thread.worketInit();
    //     }
    // },
    // stopWorker: function (data, socket) {
    //     Nodext.logEvent("stopWorker");
    //     var cluster = this.clusters.get(data.id_cluster);
    //     if (!cluster) {
    //         return { success: false, message: "Cluster No Found" };
    //     }
    //     var thread = cluster.get(data.id_thread);
    //     if (!thread) {
    //         return { success: false, message: "Thread No Found" };
    //     }
    //     thread.setStatus("stopingworker", {});
    //     Nodext.logEvent("eliminando worker pid " + thread.getPid());
    //     var wSocket;
    //     for (var p in this.netSocket) {
    //         wSocket = this.netSocket[p];
    //         if (wSocket.removeByKey(thread.equip + "#" + thread.getPid())) {
    //             thread.setStatus("removefromnetserver", {});
    //         }
    //     }
    //     this.addActionThread(thread, "stop");
    //     thread.send({
    //         from: 'Nodext.Cluster',
    //         event: 'stopworker',
    //         params: []
    //     });
    // }
});