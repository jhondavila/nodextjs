/**
 * 
 */
Nodext.define("Nodext.socket.IO.Redis", {
    extend: "Ext.Base",
    mixins: {
        observable: 'Ext.util.Observable'
    },
    $configPrefixed: false,
    $configStrict: false,
    config: {
        /**
         * Maximo reintentos de conexion al servidor Redis 
         */
        maxAttemptsRedis: 3,
        /**
         * Puerto Socket el cual escuchara a los clientes
         */
        socketPort: 3000,
        /**
         * Puerto interno para la comunicacion entre procesos de otros Thread
         */
        portInternal: 0,
        /**
         * Puerto del servidor Redis
         */
        portRedis: 6379,
        /**
         * Host del servidor Redis
         */
        hostRedis: 'localhost'
    },
    /**
     * @property {NodeInstance}
     */
    redisAdapter: null,
    /**
     * @property {NodeModule} ioRedis
     */
    ioRedis: null,
    /**
     * Indica que el proceso de conexion con el servidor Redis a iniciado
     * @private
     */
    starting: false,
    /**
     * Contandor de intentos fallidos con el servidor Redis
     */
    countRcnxRedis: 0,
    /**
     * @cfg {Array}
     * @private
     * Indica si se genero pubclient y subclient al momento de conectarse al servidor Redis, de
     * esta manera nos aseguramos que el servidor este activo.
     */
    redisActive: null,
    constructor: function (config) {
        config = config || {};
        Nodext.apply(this, config);
        this.initConfig(config);
        this.mixins.observable.constructor.call(this, config);
        try {
            this.ioRedis = require('socket.io-redis');
        } catch (e) {
            this.ioRedis = null;
            Nodext.logError("No se pudo cargar el modulo socket.io-redis");
        }
    },
    /**
     * @method
     */
    connect: function () {
        this.starting = true;
        this.redisActive = ["pubclient", "subclient"];
        this.redisAdapter = this.ioRedis({ host: this.hostRedis, port: this.portRedis });
        this.hookRedis();
    },
    /**
     * @method
     * @private
     */
    hookRedis: function () {
        var me = this;
        this.redisAdapter.pubClient.on("error", function (err) {
            me.countRcnxRedis++;
            if (me.countRcnxRedis > me.maxAttemptsRedis && me.starting) {
                me.failConnectRedis();
            }
        });
        this.redisAdapter.subClient.on("error", function (err) {
            me.countRcnxRedis++;
            if (me.countRcnxRedis > me.maxAttemptsRedis && me.starting) {
                me.failConnectRedis();
            }
        });
        this.redisAdapter.pubClient.on("connect", function () {
            me.successRedis("pubclient");
        });
        this.redisAdapter.subClient.on("connect", function () {
            me.successRedis("subclient");
        });
    },
    /**
     * @method
     * @private
     */
    failConnectRedis: function () {
        this.starting = false;
        this.redisAdapter.pubClient.end(true);
        this.redisAdapter.subClient.end(true);
        /**
         * @event fail
         * Se dispara cuando falla la conexion al servidor Redis
         * @param {Nodext.socket.IO.Redis} this
         * @param {String} hostRedis
         * @param {Number} portRedis
         */
        this.fireEvent("fail", this, this.hostRedis, this.portRedis);
    },
    /**
     * @method
     * @private
     */
    successRedis: function (type) {
        if (this.redisActive.indexOf(type) > -1) {
            this.redisActive[this.redisActive.indexOf(type)] = true;
        }
        var ready = true;
        for (var x = 0; x < this.redisActive.length; x++) {
            if (this.redisActive[x] !== true) {
                ready = false;
            }
        }
        if (ready && this.starting) {
            this.starting = false;
            /**
             * @event
             * Se dispara cuando se conecta correctamente al servidor Redis
             * @param {Nodext.socket.IO.Redis} this
             * @param {String} hostRedis
             * @param {Number} portRedis
             */
            this.fireEvent("success", this, this.hostRedis, this.portRedis, this.redisAdapter)
        }
    },
});