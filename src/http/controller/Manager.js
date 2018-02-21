/**
 * 
 */
Nodext.define("Nodext.http.controller.Manager", {
    extend: "Nodext.app.FileLoader",
    requires: ["Nodext.module.Crypto"],
    alternateClassName: ["Nodext.ControllerMgr", "Nodext.CtrlMgr"],
    loaderPath: "controllers",
    autoLoad: false,
    config: {
        /**
         * @cfg server {@link Nodext.http.Server}
         */
        server: null
    },
    getIdItem: function (item) {
        return item._keyItem;
    },
    getController: function () {

    },
    buildClass: function (className) {
        var item = Ext.create(className, {
            appNode: this.appNode,
            server: this.server
        });
        item._keyItem = className;
        this.items.add(item);
    }
});