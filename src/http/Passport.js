/**
 * 
 */
Nodext.define("Nodext.http.Passport", {
    extend: "Ext.Base",
    $configPrefixed: false,
    $configStrict: false,
    config: {

    },
    passport: null,
    localStrategy: null,
    constructor: function (config) {
        config = config || {};
        Nodext.apply(this, config);
        this.passport = require('passport');

        var server = this.server,
            app = server.app;

        app.use(this.passport.initialize());
        app.use(this.passport.session());

        // this.use();
    },
    use: function () {
        this.passport.use.apply(this.passport, arguments);
    },
    serializeUser: function (fn) {
        this.passport.serializeUser(fn);
    },
    deserializeUser: function (fn) {
        this.passport.deserializeUser(fn);
    },
    authenticate: function () {
        return this.passport.authenticate.apply(this.passport, arguments);
    }
});