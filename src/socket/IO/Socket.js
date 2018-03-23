/**
 * 
 */
Nodext.define("Nodext.socket.IO.Socket", {
    extend: "Ext.Base",
    requires: ["Nodext.socket.IO.Instance"],
    $configPrefixed: false,
    $configStrict: false,
    mixins: ["Ext.util.Observable", "Nodext.util.HookClass"],
    config: {
        io: null,
        events: null,
        nameSpace: null,
        nsp: null,
        DBcnxName: null,
        DBCnxAuto: false,
        authUser: false,
        socketMgr: null,
        socketIO: null,
        activeAuth: null,
        stream: null
    },
    constructor: function (config) {
        Nodext.apply(this, config);
        this.initConfig(config);
        this.mixins.observable.constructor.call(this, config);
        this.initNameSpace();
        this.hookLoad();
        this.initSocket();
    },
    getClassOfMgr: function (g, cls) {
        return this.socketIO.getClassOfMgr(g, cls);
    },
    initNameSpace: function () {
        var nameSpace = this.nameSpace;
        if (nameSpace) {
            this.nsp = this.io.of(nameSpace);
            this.nsp._space = this;
        } else {
            this.nsp = this.io.of("/");
            this.nsp._space = this;
        }
        if (this.authUser) {
            var auth;
            if (Nodext.isBoolean(this.authUser)) {
                auth = this.socketIO.auths.getAt(0);
            } else {
                auth = this.socketIO.auths.getByKey(this.authUser);
            }
            this.activeAuth = auth;
            this.nsp.use(auth.libSessionSocket(auth.session));
        }
        nameSpace = null;
    },

    /**
     * Inicia el espacio para las instancias socket y llama a la funcion initSpace pasandole un parametro del tipo instancia.
     */
    initSocket: function () {

        var me = this;

        if (this.initSpace) {

            var space = this.newInstanceSpace(this);
            this.initSpace(space);
        }
    },
    /**
     * 
     * Crea una instancia basica
     */
    newInstanceSpace: function (space) {
        var cfg = {
            space: space,

            autoInit: true,
            DBScope: this,
            DBcnxName: this.DBcnxName
        };
        return Ext.create("Nodext.socket.IO.ISpace", cfg);
    },
    /**
     * 
     * Crea una instancia de tipo socket
     */
    newInstance: function (socket) {
        var cfg = {
            socket: socket,
            nameSpace: this,
            nsp: this,
            autoInit: true,
            auths: this.socketIO.auths,
            activeAuth: this.activeAuth,
            // idDomain: req.idDomain || undefined,
            DBScope: this,
            DBcnxName: this.DBcnxName
        };
        return Ext.create("Nodext.socket.IO.Instance", cfg);
    },

    emitNsp: function (name, data) {
        this.nsp.emit(name, data);
    },
    emitDistinct: function (sktInst) {
        if (sktInst.destroyed) {
            return;
        }
        // debugger
        var args = Array.prototype.slice.call(arguments, 1);
        sktInst.socket.broadcast.emit.apply(sktInst.socket, args);
    },
    emitIdList: function (sktInst, array) {
        if (sktInst.destroyed) {
            return;
        }
        var socket = sktInst.socket;
        socket._rooms = socket._rooms.concat(array);
        var args = Array.prototype.slice.call(arguments, 2);
        socket.emit.apply(socket, args);
    },
    emitBasicIdList: function (sktInst, array, nsp) {
        if (sktInst.destroyed) {
            return;
        }
        var emitter;
        if (nsp) {
            emitter = this.io.of(nsp);
        } else {
            emitter = sktInst.socket;
        }
        if (!emitter) {
            Nodext.logError("No se logro resolver el emisor en los parametros");
        }
        for (var x = 0; x < array.length; x++) {
            if (emitter._rooms) {
                emitter._rooms.push((nsp ? nsp : emitter.name) + "#" + array[x]);
            } else {
                emitter.rooms.push((nsp ? nsp : emitter.name) + "#" + array[x]);
            }
        }
        var args = Array.prototype.slice.call(arguments, nsp ? 3 : 2);
        emitter.emit.apply(emitter, args);
    }
    ///////////////////////
    ///////////////////////
    ///////////////////////
    ///////////////////////
    ///////////////////////
});