/**
 * 
 */
Nodext.define("Nodext.model.Mixin", {
    extend: "Ext.Mixin",
    requires: [
        "Nodext.model.Manager"
    ],
    mixinConfig: {
        id: 'modelmgr'
    },
    config: {
        modelMgr: false
    },
    constructor: function () {
        if (this.modelMgr !== false) {
            this.modelMgr = Ext.isBoolean(this.modelMgr) ? {} : this.modelMgr;
            Nodext.apply(this.modelMgr, {
                appNode: this.appNode,
            });
            var groupAlias = this.modelMgr.groupAlias || "models";
            if (!(this.modelMgr instanceof Nodext.model.Manager)) {
                this.modelMgr = Nodext.create("Nodext.model.Manager", this.modelMgr);
                if (!this.modelMgr.autoLoad) {
                    this.modelMgr.start();
                }
            }
            if (this.addMapClsManager) {
                this.addMapClsManager(groupAlias, this.modelMgr);
            } else {
                Nodext.logError("No found method addMapClsManager,please mixin your class with Nodext.util.MapClass");
            }
        }
    }
});