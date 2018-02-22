/**
 * 
 */
Nodext.define("Nodext.socket.IO.Client", {
    extend: "Nodext.Base",
    $configPrefixed: false,
    $configStrict: false,
    mixins: ["Ext.util.Observable"],
    config: {
        url: null,
        nameSpace: "/",
        params: null,
        autoConnect: true,
        multiplex: false,
    },
    cnx: null,
    urlSpace: null,
    io: require('socket.io-client'),
    ss: require('socket.io-stream'),
    constructor: function (config) {
        Nodext.apply(this, config || {});
        this.initConfig(config);
        this.id = this.id || Ext.id("Socket-");
        this.mixins.observable.constructor.call(this, config);
        this.urlSpace = (this.url) + this.nameSpace;
        var params;
        if (this.params) {
            var listParams = [];
            for (var p in this.params) {
                listParams.push(p + "=" + this.params[p]);
            }
            params = listParams.join("&");
        }
        this.socket = this.cnx = this.io.connect(this.urlSpace, {
            multiplex: this.multiplex,
            autoConnect: false,
            query: params
        });
        this.cnx._extSocket = this;
        if (this.autoConnect) {
            this.connect();
        }
    },
    destroy: function () {
        this.disconnect();
        this.cnx.destroy();
        this.callParent();
    },
    disconnect: function () {
        this.cnx.disconnect();
    },
    connect: function () {
        if (this.cnx.connected) {
            return this;
        }
        this.urlSpace = (this.url) + this.nameSpace;
        this.cnx.io.uri = this.urlSpace;
        this.cnx.connect();
        return this;
    },
    isConnect: function () {
        return (this.cnx) ? this.cnx.connected : false;
    },
    reconnect: function () {
        this.cnx.reconnect();
    },
    emit: function (event) {
        if (!event || event === "") {
            return false;
        }
        this.cnx.emit.apply(this.cnx, arguments);
        return this;
    }
});

(function () {
    var IOproto = Nodext.socket.IO.Client.prototype.io.prototype.constructor;
    var Socket = IOproto.Socket.prototype;
    var Manager = IOproto.Manager.prototype;
    var Emitter = require('component-emitter');
    var emit = Emitter.prototype.emit;

    Socket.onevent = function (t) {
        var e = t.data || [];
        null != t.id && e.push(this.ack(t.id));
        if (this.connected) {

            emit.apply(this, e);
            if (this._extSocket) {
                var date = new Date();
                e.splice(1, 0, this._extSocket);
                this._extSocket.fireEvent.apply(this._extSocket, e);
                e.splice(0, e.length);
                console.log("ms : " + (new Date() - date));
            }
        } else {
            this.receiveBuffer.push(e)
        }
    };

    Socket.onconnect = function () {
        this.connected = !0,
            this.disconnected = !1,
            this.emit("connect"),
            this.emitBuffered();
        if (this._extSocket) {
            this._extSocket.fireEvent("connect", this._extSocket);
        }
    };
    Socket.onclose = function (t) {
        this.connected = !1,
            this.disconnected = !0,
            delete this.id,
            this.emit("disconnect", t);
        if (this._extSocket) {
            this._extSocket.fireEvent("disconnect", this._extSocket);
        }
    };
    Manager.onreconnect = function () {
        var t = this.backoff.attempts;
        this.reconnecting = !1,
            this.backoff.reset(),
            this.updateSocketIds(),
            this.emitAll("reconnect", t);
        if (Ext.isObject(this.nsps)) {
            var x, i;
            for (x in this.nsps) {
                i = this.nsps[x];
                if (i._extSocket) {
                    i._extSocket.fireEvent("reconnect", i._extSocket);
                }
            }
        }
    };

    // Manager.reconnect = function () {
    //     if (this.reconnecting || this.skipReconnect)
    //         return this;
    //     var t = this;
    //     if (this.backoff.attempts >= this._reconnectionAttempts)
    //         this.backoff.reset(), this.emitAll("reconnect_failed"), this.reconnecting = !1;
    //     else {
    //         var e = this.backoff.duration();
    //         this.reconnecting = !0;
    //         var r = setTimeout(function () {
    //             if (!t.skipReconnect) {
    //                 t.emitAll("reconnect_attempt", t.backoff.attempts);
    //                 t.emitAll("reconnecting", t.backoff.attempts);
    //                 if (Ext.isObject(t.nsps)) {
    //                     var x, i;
    //                     for (x in t.nsps) {
    //                         i = t.nsps[x];
    //                         if (i._extSocket) {
    //                             i._extSocket.fireEvent("reconnecting", i._extSocket, t.backoff.attempts);
    //                         }
    //                     }
    //                 }
    //                 t.skipReconnect || t.open(function (e) {
    //                     e ? (t.reconnecting = !1, t.reconnect(), t.emitAll("reconnect_error", e.data)) : t.onreconnect()
    //                 });
    //             }
    //         }, e);
    //         this.subs.push({
    //             destroy: function () {
    //                 clearTimeout(r);
    //             }
    //         });
    //     }
    // };

    Manager.reconnect = function () {
        if (this.reconnecting || this.skipReconnect) return this;

        var self = this;

        if (this.backoff.attempts >= this._reconnectionAttempts) {
            this.backoff.reset();
            this.emitAll('reconnect_failed');
            this.reconnecting = false;
        } else {
            var delay = this.backoff.duration();

            this.reconnecting = true;
            var timer = setTimeout(function () {
                if (self.skipReconnect) return;

                self.emitAll('reconnect_attempt', self.backoff.attempts);
                self.emitAll('reconnecting', self.backoff.attempts);

                if (Ext.isObject(self.nsps)) {
                    var x, i;
                    for (x in self.nsps) {
                        i = self.nsps[x];
                        if (i._extSocket) {
                            i._extSocket.fireEvent("reconnecting", i._extSocket, self.backoff.attempts);
                        }
                    }
                }

                // check again for the case socket closed in above events
                if (self.skipReconnect) return;

                self.open(function (err) {
                    if (err) {
                        self.reconnecting = false;
                        self.reconnect();
                        self.emitAll('reconnect_error', err.data);
                    } else {
                        self.onreconnect();
                    }
                });
            }, delay);

            this.subs.push({
                destroy: function () {
                    clearTimeout(timer);
                }
            });
        }
    };
})();