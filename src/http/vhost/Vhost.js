/**
 * 
 */
Nodext.define("Nodext.http.vhost.Vhost", {
    extend: "Ext.Base",
    $configPrefixed: false,
    config: {
        hostname: null,
        path: null,
        fn: null
    },
    middleware: null,
    express: null,
    vhost: null,
    constructor: function (config) {
        Nodext.apply(this, config);
        this.initConfig(config);
        var vhost = this.vhost || require('vhost');
        var express = this.express || require('express');
        if (this.path) {
            this.middleware = vhost(this.hostname, express.static(this.path));
        }
    },
    get: function () {
        return this.middleware;
    }
});