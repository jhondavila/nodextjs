/**
 * 
 */
Nodext.define("Nodext.app.master.Thread", {
    $configPrefixed: false,
    $configStrict: false,
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: [
        "Nodext.module.FileSystem"
    ],
    config: {
        /**
         * @cfg {String|Number} id 
         * Id del Thread
         */
        id: null,
        /**
         * @cfg {Nodext.app.master.Cluster} cluster
         * Cluster del Thread
         */
        cluster: null,
        /**
         * @cfg {Object} env
         * Información sobre el worker actual vinculado
         */
        env: null
    },
    /**
     * @property {String} status
     * Indica el estado actual del thread
     */
    status: null,
    /**
     * @property {NodeInstance} worker
     * Almacena el worker generado
     * @private
     */
    worker: null,
    constructor: function (cfg) {
        Nodext.apply(this, cfg);
        this.id = this.id || Nodext.id(null, "Thread-");
        this.initConfig();
        this.mixins.observable.constructor.call(this, cfg);
    },
    /**
     * @method buildWorker
     * Genera un worker y lo vincula a esta instancia
     */
    buildWorker: function () {
        /**
         * @event buildworker
         * @param {Nodext.app.master.Thread} thread
         */
        this.setStatus("buildworker");
        this.worker = this.worker || Nodext.cluster.fork();
        this.worker.Cls = this;
        this.setWorkerIdentified();
    },
    setWorkerIdentified: function () {
        this.worker.idCluster = this.cluster.id;
        this.worker.idThread = this.id;
    },
    /**
     * @method workerStart
     * Envia un mensaje de Inicio al worker vinculado
     */
    workerStart: function () {
        /**
         * @event workerstart
         * @param {Nodext.app.master.Thread} thread
         */
        this.setStatus("workerstart");
        this.send({
            to: 'Nodext',
            from: 'Nodext.app.master.Thread',
            event: "workerstart",
            params: [this.id, this.internalId, this.cluster.getId()]
        });
    },
    /**
     * @method send
     * Envia mensajes al worker vinculado
     * @param {Object} data
     */
    send: function (data) {
        this.worker.send(data);
    },
    /**
     * @method getPid
     * Retorna el Pid del worker vinculado
     * @return {Number}
     */
    getPid: function () {
        if (this.worker) {
            return this.worker.process.pid;
        } else {
            return null;
        }
    },
    /**
     * @method encodeThread
     * Devuelve un JSON con los datos actuales del Thread 
     * @return {Object}
     */
    encodeThread: function () {
        var cfg = {
            id: this.cluster.getId() + "#" + this.id,
            text: this.text || Nodext.String.format("Thread {0} ({1})", this.id, this.getPid()),
            status: this.status,
            type: "thread",
            run: this.getPid() ? true : false,
            id_thread: this.id,
            id_cluster: this.cluster.getId(),
            leaf: true
        };
        Nodext.apply(cfg, this.env || {});
        cfg["max.heap.size"] = Nodext.FS.getSizeMB(cfg["max.heap.size"]);
        cfg["max.old.space.size"] = Nodext.FS.getSizeMB(cfg["max.old.space.size"]);
        cfg["max.semi.space.size"] = Nodext.FS.getSizeMB(cfg["max.semi.space.size"]);
        cfg["heap.size.limit"] = Nodext.FS.getSizeMB(cfg["heap.size.limit"]);
        return cfg;
    },
    /**
     * @method setStatus
     * Indica el estado actual del Thread
     * @param {String} event
     * @param {Object} data
     */
    setStatus: function (event, data) {
        this.status = event;
        this.fireEvent(event, this, data);
        var obj = this.getThreadIdentified();
        Nodext.apply(obj, data || {});
        obj.status = event;
        /**
         * @event changestatus
         * @param {Nodext.app.master.Thread} thread
         * @param {Object} obj
         */
        this.fireEvent("changestatus", this, obj);
    },
    /**
     * @method getThreadIdentified
     * Returna los identificadores del thread actual
     */
    getThreadIdentified: function () {
        return {
            id: this.id,
            clusterId: this.cluster.getId(),
            type: "thread",
            equip: this.cluster.equip
        };
    },
    // emitAppServer: function (event, data) {

    //     // if (!Nodext.SocketIOMgr) {
    //     //     Nodext.logError("No existe Nodext.SocketIOMgr");
    //     //     return false;
    //     // }
    //     // Nodext.SocketIOMgr.emitSpace("Server", event, data);
    // },


    /**
     * @method disconnect
     * Desconecta el worker vinculado
     */
    disconnect: function () {
        this.worker.disconnect();
    },
    /**
     * @method kill
     * Mata el worker vinculado
     */
    kill: function () {
        this.worker.kill();
    },
    /**
     * @method cleanThread
     * Limpia el Thread actual del worker vinculado
     */
    cleanThread: function () {
        this.worker = this.worker.idCluster = this.worker.idThread = this.worker.Cls = null;
        this.env = null;
        this.text = Nodext.String.format("Thread {0} ({1})", this.id, this.getPid());
        this.run = false;
        this.status = "off";
        /**
         * @event off
         * @param {Nodext.app.master.Thread} thread
         * @param {Object} data
         */
        this.setStatus("off", {
            data: this.encodeThread()
        });
    }
});