/**
 * 
 */
Nodext.define("Nodext.module.Crypto", {
    extend: "Ext.Base",
    $configPrefixed: false,
    alternateClassName: ["Nodext.Crypto"],
    singleton: true,
    /**
     * @property {NodeModule} crypto
     */
    crypto: null,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        this.crypto = require('crypto');
        this.initConfig();
    },
    createHashMD5: function (string) {
        return this.crypto.createHash("md5").update(string).digest("hex");
    }

});