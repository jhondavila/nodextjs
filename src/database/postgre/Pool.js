/**
 * 
 */
Nodext.define("Nodext.database.postgre.Pool", {
    cnx: null,
    open: false,
    init: false,
    errorCnx: false,
    type: "pool",
    connection: null,
    strCon: null,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
    },
    setErrorCnx: function (value) {
        this.done();
        this.errorCnx = value;
    },
    connect: function (fn) {
        var me = this;
        return this.cnx.connect(function (err, client, done) {
            me.client = client;
            me.done = done;
            fn.call(null, err);
            me = null;
        });
    },
    query: function (query, fn) {
        return this.client.query(query, fn);
    },
    close: function () {
        this.open = false;
        if (!this.errorCnx && this.done) {
            this.done();
        }
        this.done = this.client = null;
    },
    destroy: function () {
        this.close();
        this.cnx = this.connection = null;
        this.callParent();
        Nodext.destroyClass(this);
        delete this;
    }
});