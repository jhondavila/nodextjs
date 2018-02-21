/**
 * 
 */
Nodext.define("Nodext.auth.store.Base", {
    extend: "Ext.Base",
    alias: 'SExpressStore.Base',

    mixins: [
        'Ext.mixin.Factoryable'
    ],
    $configPrefixed: false,
    $configStrict: false,
    factoryConfig: {
        defaultType: 'Base'
    },

    libSession: null,

    constructor: function () {
        console.log("soy store base")
    },
    getConnection: function () {

    }
});