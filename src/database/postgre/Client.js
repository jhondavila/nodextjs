/**
 * 
 */
Nodext.define("Nodext.database.postgre.Client", {
    extend: "Ext.Base",
    cnx: null,
    open: false,
    init: false,
    type: "client",
    errorCnx: false,
    connection: null,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
    },
    setErrorCnx: function (value) {
        this.cnx.end();
        this.errorCnx = value;
    },
    connect: function (fn) {
        if (!this.cnx) {
            this.cnx = this.connection.newClientInst();
        }
        return this.cnx.connect(fn);
    },
    query: function (query, fn) {
        return this.cnx.query(query, fn);
    },
    close: function () {
        this.open = false;
        if (!this.errorCnx && this.cnx) {
            this.cnx.end();
            this.cnx = null;
        }
    },
    destroy: function () {
        this.close();
        this.cnx = this.connection = null;
        this.callParent();
        Nodext.destroyClass(this);
        delete this;
    }
});