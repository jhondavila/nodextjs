/**
 * 
 */
Nodext.define("Nodext.database.action.Base", {
    extend: "Ext.Base",
    $configPrefixed: false,
    $configStrict: false,
    alias: 'dbaction.base',
    mixins: [
        'Ext.mixin.Factoryable',
        'Ext.util.Observable'
    ],
    factoryConfig: {
        defaultType: 'base',
        defaultProperty: "action"
    },
    config: {
        id: null,
        query: null,
        idGroup: null,
        result: null,
        inst: null,
        params: null,
        qb: null,
        type: null,
        onErrorResMsg: true,
        onErrorContinue: false,
        onTransFailContinue: false,
        action: 'base'
    },
    constructor: function (cfg) {
        cfg = cfg || {};
        Nodext.apply(this, cfg);
        this.initConfig(cfg);
        this.mixins.observable.constructor.call(this, cfg);
        this.init();
        if (this.debug) {
            console.log('------------------------');
            if (Array.isArray(this.query)) {
                for (var x = 0; x < this.query.length; x++) {
                    console.log(this.query[x]);
                }
            } else {
                console.log(this.query);
            }
            console.log('>>>>>>>>>>><<<<<<<<<<<<');
        }
    },
    init: Nodext.emptyFn,
    getParams: function (item) {
        if (this.params && this.params.hasOwnProperty(item)) {
            return this.params[item];
        } else {
            return null;
        }
    },
    destroy: function () {
        this.clearListeners();
        this.qb = this.inst = this.listeners = null;
        Nodext.destroyObject(this.params);
        this.callParent();
    }
});