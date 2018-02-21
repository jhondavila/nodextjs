/**
 * 
 */
Nodext.define("Nodext.auth.Base", {
    extend: "Nodext.BaseConfig",
    mixins: [
        'Ext.mixin.Factoryable'
    ],
    $configPrefixed: false,
    $configStrict: false,
    alias: 'auth.Base',
    factoryConfig: {
        defaultType: 'Base'
    },
    libSession: null,

    constructor: function () {
        this.callParent(arguments);
    }
});