/**
 * 
 */
Nodext.define("Nodext.model.Manager", {
    extend: "Nodext.app.FileLoader",
    alternateClassName: ["Nodext.ModelRegister"],
    loaderPath: "models",
    autoLoad: false,
    config: {
        server: null
    },
    getIdItem: function (item) {
        return item._keyItem;
    },
    getModel: function (key) {
        return this.items.get(key);
    },
    buildClass: function (className) {
        var item = Nodext.create(className, {
            appNode: this.appNode,
            server: this.server
        });
        item._keyItem = className;
        this.items.add(item);
    }
});