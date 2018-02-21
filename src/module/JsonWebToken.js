/**
 * 
 */
Nodext.define("Nodext.module.JsonWebToken", {
    extend: "Ext.Base",
    $configPrefixed: false,
    alternateClassName: ["Nodext.JWT"],
    singleton: true,
    /**
     * @property {NodeModule} jwt
     */
    jwt: null,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        this.jwt = require('jsonwebtoken');
        this.initConfig();
    },
    verify: function (token, tokenString, fn) {
        this.jwt.verify(token, tokenString, fn);
    },
    sign: function (data, token, fn) {
        return this.jwt.sign(data, token, fn);
    }
});