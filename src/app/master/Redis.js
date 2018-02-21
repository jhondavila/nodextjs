/**
 * 
 */
Nodext.define("Nodext.app.master.Redis", {
    extend: "Ext.Base",

    mixins: {
        observable: 'Ext.util.Observable'
    },
    $configPrefixed: false,
    $configStrict: false,
    config: {
    },
    /**
     * @property {Object} netSrvList
     * Lista de NetServerActivos
     */
    netSrvList: null,
    /**
     * @property {Ext.util.Collection} netSocket
     * Lista de Socket Workers Activos
     */
    netSocket: null,
    /**
     * @property {Object} listListen
     * Lista de Cluster escuchando
     */
    listListen: null,
    /**
    * @property {NodeModule} net
    * Carga la Libreria net de NodeJS, esta libreria nos permitira crear un servidor net el cual redireccionara
    * las solicitudes TCP/IPC entrantes (Conexiones Socket) a los workers.
    */
    net: null,
    /**
     * @method listenCluster
     * Añade listeners al cluster para identificar que worker soliciten redis.
     */
    listenCluster: function (cluster) {
        if (cluster) {
            this.listListen[cluster.getId()] = {
                cluster: cluster,
                listeners: cluster.on({
                    destroyable: true,
                    socketbyredis: this.socketByRedis,
                    scope: this
                })
            };
        }
    },
    /**
     * @method unlistenCluster
     * Desvincula los listeners añadidos al cluster.
     */
    unlistenCluster: function (cluster) {
        var obj = this.listListen[cluster.getId()];
        if (obj) {
            obj.listeners.destroy();
            obj.cluster = null;
        }
    },
    constructor: function (config) {
        this.net = require('net');
        this.netSocket = {};
        this.netSrvList = {};
        this.listListen = {};
        Nodext.apply(this, config);
        this.initConfig(config);
        this.mixins.observable.constructor.call(this, config);

    },
    /**
     * @method socketByRedis
     * Añade al thread que solicito una conexion redis a una lista netSocket, la cual permitira 
     * balancear la carga de conexion Socket entrantes
     * @private
     * @param cluster Cluster que disparo el evento
     * @param pid Pid del Treah solicitante de redis 
     * @param idCluster Id del cluster
     * @param idThread Id del Trhead solicitante de redis
     * @param portInternal Puerto Interno
     * @param portListen Puerto con salida externa
     */
    socketByRedis: function (cluster, pid, idCluster, idThread, portInternal, portListen) {
        // console.log(idCluster)
        var wpCluster = this.listListen[idCluster];
        if (!wpCluster) {
            return;
        }

        var cluster = wpCluster.cluster;
        var thread = cluster.workers.get(idThread);
        if (!thread) {
            return;
        }

        var wSocket = this.netSocket[portListen];
        if (!wSocket) {
            this.netSocket[portListen] = Nodext.create("Ext.util.Collection", {
                keyFn: function (item) {
                    return item.equip + "#" + item.getPid();
                }
            });
            wSocket = this.netSocket[portListen];
        }

        wSocket.add(thread);
        if (wSocket.getCount() > 1) {
            if (!this.netSrvList[portListen]) {
                this.createNetServer(wSocket, portListen);
            }
        }
        cluster = thread = wSocket = null;
    },
    /**
     * @method createNetServer
     * Crea un netServer el cual atendera peticiones por el puerto configurado.
     * @private
     * @param wSocket
     * @param portListen
     */
    createNetServer: function (wSocket, portListen) {
        var netSrv = this.net.createServer({ pauseOnConnect: true }, this.netSrvCnx.bind(this, wSocket));
        this.netSrvList[portListen] = netSrv;
        var fnSrvListen = this.netSrvListen.bind(this, netSrv, portListen, wSocket);
        netSrv.on("error", this.errorNetSrv.bind(this));
        netSrv.listen(portListen, fnSrvListen);
        netSrv = fnSrvListen = null;
    },
    /**
     * @method
     * @private
     * @param {Object} error
     * Es ejecutado cuando hay un problema al iniciar un net Server
     */
    errorNetSrv: function (e) {
        if (e.code === 'EADDRINUSE') {
            Nodext.logError("Net Server Port Busy : " + e.port);
            /**
             * @event errorportbusy
             * Se dispara cuando el puerto configurado ya se encuentra en uso por otra aplicacion o proceso.
             * @param this
             * @param {Object} error
             * @param {Number} portNetServer
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
     * @method netSrvCnx
     * Balancea las conexiones entrantes en el puerto
     * @private
     * @param wSocket
     * @param connection
     */
    netSrvCnx: function (wSocket, connection) {
        var wCls;
        wCls = wSocket.getAt(this.workerIndex(connection.remoteAddress, wSocket.length));
        if (wCls) {
            wCls.worker.send('sticky-session:connection', connection);
        } else {
            connection.write("GET / HTTP/1.0\r\n\r\n");
            connection.end();
        }
    },
    /**
     * @method netSrvListen
     * Dispara el evento netserverlisten el cual indica que el servidor esta activo
     * @private
     */
    netSrvListen: function (netServer, portListen, wSocket) {
        var message = "NetServer Listen Port : " + portListen + "\n";
        Nodext.logEvent(message);
        /**
         * @event netserverlisten
         * @param {Nodext.app.master.Redis} redis
         * @param {NodeInstance} netServer
         * @param {Number} portListen
         * @param {Ext.util.Collection} wSocket
         */
        this.fireEvent("netserverlisten", this, netServer, portListen, wSocket);
    },
    /**
     * @method hash
     * Metodo balanceador de conexiones entrantes.
     * @private
     */
    hash: function (str) {
        var hash = 5381,
            i = str.length;
        while (i)
            hash = (hash * 33) ^ str.charCodeAt(--i)
        return hash >= 0 ? hash : (hash & 0x7FFFFFFF) + 0x80000000;
    },
    /**
     * @method workerIndex
     * Devuelve el index del Thread que atendera la conexion entrante.
     * @private
     */
    workerIndex: function (ip, len) {
        return this.hash(ip) % len;
    },
});