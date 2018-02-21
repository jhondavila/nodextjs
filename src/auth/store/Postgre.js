/**
 * 
 */
Nodext.define("Nodext.auth.store.Postgre", {
    extend: "Nodext.auth.store.Base",
    alias: 'SExpressStore.postgre',
    config: {
        /**
         * @cfg {NodeModule} lib
         * Modulo de session para express
         */
        lib: null,
        store: null,
        hostname: "",
        username: "",
        password: "",
        database: "",
        table: "",
        nameConnection: null
    },
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        this.initConfig();

        var eSession = require('express-session');
        var pgSimple = require('connect-pg-simple');
        var pgStore = pgSimple(eSession);

        if (this.nameConnection) {
            var cnx = Nodext.db.Mgr.getCnx(this.nameConnection);
            if (cnx) {
                this.hostname = cnx.hostname;
                this.username = cnx.username;
                this.password = cnx.password;
                this.database = cnx.database;
            }
            cnx = null;
        }
        this.store = new pgStore({
            pg: require('pg'),
            conString: this.getStringCnx(),
            tableName: this.table
        });
        pgSimple = eSession = null;
    },
    getConnection: function () {
        return this.store;
    },
    getStringCnx: function () {
        return Ext.String.format("postgres://{0}:{1}@{2}/{3}", this.username, this.password, this.hostname, this.database);
    },
});