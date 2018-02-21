/**
 * 
 */
Nodext.define("Nodext.socket.IO.ISpace", {
    extend: "Nodext.BaseInstance",
    // socketErrorMsg: null,
    DBErrorDestroy: true,
    // DBEndDestroy: true,
    space: this,
    // emit: function () {
    //     this.socket.emit.apply(this.socket, arguments);
    // },
    constructor: function (config) {
        this.id = Nodext.id();
        Nodext.apply(this, config);
        if (this.autoInit) {
            this.initBuild();
        }
    },
    // getIp: function (socket) {
    //     if (socket.request.connection.remoteAddress) {
    //         return socket.request.connection.remoteAddress;
    //     }
    //     if (socket.handshake.address) {
    //         return socket.handshake.headers.host;
    //     }
    //     if (socket.request.connection._peername.address) {
    //         return socket.request.connection._peername.address;
    //     }
    //     return false;
    // },
    // getHostName: function (socket) {
    //     if (socket.handshake.headers.host) {
    //         return socket.handshake.headers.host.split(":").shift();
    //     }
    //     return false;
    // },
    // getIpFamily: function (socket) {
    //     if (socket.request.connection._peername.family) {
    //         return socket.request.connection._peername.family;
    //     }
    //     return false;
    // },
    // getPeerPort: function (socket) {
    //     if (socket.request.connection._peername.port) {
    //         return socket.request.connection._peername.port;
    //     }
    //     return false;
    // },
    // broadcast: function (socket, name, data) {
    //     socket.broadcast.emit(name, data);
    // },
    sendError: function (err, code, log) {
        if (log) {
            Nodext.logError(err);
        }
        if (this.DBErrorDestroy) {
            this.destroy();
        }
    },
    destroy: function () {
        this.space = null;
        this.callParent();
        delete this;
    },
    exit: function () {
        this.destroy();
    },
    clear: function () {
        this.destroy();
    }
    // onSendError: Nodext.emptyFn,
    // destroy: function () {
    //     this.socket = this.onSendError = this.socketErrorMsg = null;
    //     this.callParent();
    //     delete this;
    // },
    // getSpace: function () {
    //     if (!this.destroyed) {
    //         return this.socket.space;
    //     }
    // },
    // sendError: function (err) {
    //     if (this.socket && !this.socket.destroyed) {
    //         if (this.socketErrorMsg) {
    //             err.message = this.socketErrorMsg;
    //         }
    //         this.socket.emit("systemerror", err);
    //     }
    //     this.onSendError(this, err);
    //     this.destroy();
    // }
});