/**
 * 
 */
Nodext.define("Nodext.module.EasyXML", {
    extend: "Ext.Base",
    $configPrefixed: false,
    alternateClassName: ["Nodext.EasyXML"],
    singleton: true,
    /**
     * @property {NodeModule} easyxmlLib
     */
    easyxmlLib: null,
    /**
     * @property {NodeInstance} easyxml
     */
    easyxml: null,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        this.easyxmlLib = require('easyxml');
        this.easyxml = new this.easyxmlLib({
            singularizeChildren: true,
            allowAttributes: true,
            rootElement: 'response',
            dateFormat: 'ISO',
            indent: 2,
            manifest: true
        });
        this.initConfig();
    },
    render: function (message) {
        return this.easyxml.render(message);
    }
});