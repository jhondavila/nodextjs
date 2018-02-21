/**
 * 
 */
Nodext.define("Nodext.socket.IO.Instance", {
    extend: "Nodext.BaseInstance",
    socket: null,
    socketErrorMsg: null,
    DBErrorDestroy: true,
    autoClear: true,


    // DBEndDestroy: true,
    nameSpace: this,
    nsp: this,

    activeAuth: null,
    auths: null,
    emit: function () {
        this.socket.emit.apply(this.socket, arguments);
    },
    constructor: function (config) {
        this.id = Nodext.id();
        Nodext.apply(this, config);
        if (this.autoInit) {
            this.initBuild();
        }
    },
    getParams: function () {
        if (this.destroyed) {
            return;
        }
        var obj = {

        };
        if (this.socket.handshake.query) {
            Nodext.apply(obj, this.socket.handshake.query);
        }
        return obj;
    },
    getParam: function (item) {
        if (this.destroyed) {
            return;
        }
        var handshake = this.socket.handshake;
        if (handshake.query[item]) {
            return handshake.query[item];
        }
        return;
    },
    getIp: function (socket) {
        if (socket.request.connection.remoteAddress) {
            return socket.request.connection.remoteAddress;
        }
        if (socket.handshake.address) {
            return socket.handshake.headers.host;
        }
        if (socket.request.connection._peername.address) {
            return socket.request.connection._peername.address;
        }
        return false;
    },
    getHostName: function (socket) {
        if (socket.handshake.headers.host) {
            return socket.handshake.headers.host.split(":").shift();
        }
        return false;
    },
    getIpFamily: function (socket) {
        if (socket.request.connection._peername.family) {
            return socket.request.connection._peername.family;
        }
        return false;
    },
    getPeerPort: function (socket) {
        if (socket.request.connection._peername.port) {
            return socket.request.connection._peername.port;
        }
        return false;
    },
    broadcast: function (socket, name, data) {
        socket.broadcast.emit(name, data);
    },
    onError: function (fn) {
        this.fn = fn;
    },
    sendError: function (err, code, log) {
        if (log) {
            Nodext.logError(err);
        }
        if (this.fn) {
            this.fn(err, code);
        }
        if (this.DBErrorDestroy) {
            this.destroy();
        }
    },
    destroy: function () {
        this.socket = this.nsp = this.nameSpace = this.fn = null;
        this.callParent();
        delete this;
    },
    exit: function () {
        this.destroy();
    },
    clear: function () {
        this.destroy();
    },
    getId: function () {
        if (this.destroyed) {
            return false;
        }
        return this.socket.id;
    },
    getCnxId: function () {
        if (this.destroyed) {
            return false;
        }
        return this.socket.conn.id;
    },
    disconnect: function () {
        if (!this.socket) {
            return false;
        } else {
            this.socket.disconnect();
            return true;
        }
    },






    /**
    * Crea una session para el cliente
    */
    setSession: function () {
        var args = arguments,
            obj, auth;
        if (args.length === 1) {
            auth = this.activeAuth;
            obj = args[0];
        } else if (args.length > 1) {
            auth = this.auths.getByKey(args[0]);
            obj = args[1];
        }
        return auth ? auth.setSession(this, obj) : false;
    },
    /**
     * Destruye la session de cliente
     */
    destroySession: function () {
        var args = arguments,
            fn, auth;
        if (args.length === 1) {
            auth = this.activeAuth;
            fn = args[0];
        } else if (args.length > 1) {
            auth = this.auths.getByKey(args[0]);
            fn = args[1];
        }
        return auth ? auth.destroySession(this, fn) : false;
    },

    /**
     * Valida que exista una session
     */
    authenticate: function (key) {
        var args = arguments,
            auth;
        if (args.length === 0) {
            auth = this.activeAuth;
        } else if (args.length === 1) {
            auth = this.auths.getByKey(args[0]);
        }
        return auth ? auth.authenticate(this) : false;
    },

    /**
     * Valida que exista una session
     */
    exitsSession: function (key) {
        var args = arguments,
            auth;
        if (args.length === 0) {
            auth = this.activeAuth;
        } else if (args.length === 1) {
            auth = this.auths.getByKey(args[0]);
        }
        return auth ? auth.exitsSession(this) : false;
    },
    getAuthParam: function () {
        var args = arguments,
            prop, auth;
        if (args.length === 1) {
            auth = this.activeAuth;
            prop = args[0];
        } else if (args.length === 2) {
            auth = this.auths.getByKey(args[0]);
            prop = args[1];
        }
        // var auth = this.auths.getByKey(key);
        return auth ? auth.getDataSession(this, prop) : false;
    },
    /**
     * Obtiene los datos de la session actual
     */
    getValOfToken: function () {
        var args = arguments,
            prop, auth;
        if (args.length === 1) {
            auth = this.activeAuth;
            prop = args[0];
        } else if (args.length === 2) {
            auth = this.auths.getByKey(args[0]);
            prop = args[1];
        }
        // var auth = this.auths.getByKey(key);
        return auth ? auth.getDataSession(this, prop) : false;
    }
});