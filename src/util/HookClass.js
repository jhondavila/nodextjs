/**
 * 
 */
Nodext.define("Nodext.util.HookClass", {
    extend: "Ext.Mixin",
    config: {
        load: null
    },
    mixinConfig: {
        id: 'hookclass'
    },
    /**
     * @private
     * @method
     * Vincula clases al controlador mediante un alias, de manera que se vuelve mas practico usar metodos de otras clases.
     */
    hookLoad: function () {
        var load = this.load || {};
        var group, hookAlias, alias, g, ha, cls, clsAlias;
        for (g in load) {
            group = load[g];
            for (ha in group) {
                hookAlias = group[ha];
                clsAlias = Nodext.String.format("{0}.{1}", g, hookAlias);
                cls = Nodext.ClassManager.getNameByAlias(clsAlias);
                if (cls) {
                    var clsInst = this.getClassOfMgr(g, cls);
                    if (clsInst) {
                        if (!this[ha]) {
                            this[ha] = clsInst;
                        } else {
                            Nodext.logError(Nodext.String.format("You can not use the alias {0} because an variable or method already exists with this name", ha));
                        }
                    }
                } else {
                    Nodext.logError("No found class with alias :" + clsAlias)
                }
            }
        }
    },
    getClassOfMgr: Ext.emptyFn
});