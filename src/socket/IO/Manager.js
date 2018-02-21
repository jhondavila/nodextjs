/**
 * 
 */
Nodext.define("Nodext.socket.IO.Manager", {
    extend: "Nodext.app.FileLoader",
    alternateClassName: ["Nodext.SocketMgr"],
    loaderPath: "sockets",
    autoLoad: false,
    config: {
        io: null,
        socketIO: null,
        appNode: null,
        stream: null
    },
    getIdItem: function (item) {
        return item._keyItem;
    },
    getSpace: function () {

    },
    buildClass: function (className) {
        var item = Ext.create(className, {
            io: this.io,
            socketMgr: this,
            socketIO: this.socketIO,
            stream: this.stream,
            ss: this.stream
        });
        item._keyItem = className;
        this.items.add(item);
    }
});