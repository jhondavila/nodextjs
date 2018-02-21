/**
 * 
 */
Nodext.define('Nodext.GlobalEvents', {
    extend: 'Ext.mixin.Observable',
    alternateClassName: ['Ext.globalEvents', 'Nodext.globalEvents'], 
    requires: [
    ],
    observableType: 'global',
    singleton: true,
    constructor: function () {
        var me = this;
        me.callParent();
    },

}, function (GlobalEvents) {
    Nodext.on = function () {
        return GlobalEvents.addListener.apply(GlobalEvents, arguments);
    };

    Nodext.un = function () {
        return GlobalEvents.removeListener.apply(GlobalEvents, arguments);
    };
    Nodext.fireEvent = GlobalEvents.fireEvent;
});
