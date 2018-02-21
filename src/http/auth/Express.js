/**
 * 
 */
Nodext.define("Nodext.http.auth.Express", {
    extend: "Nodext.auth.Express",
    alias: 'auth.express',
    typeAuth: "session",

    /**
     * Valida que la session en la instancia sea autentica.
     */
    authenticate: function (inst, ctrl, fn) {
        if (this.exitsSession(inst)) {
            inst.req.session.touch().save();
            inst.initBuild();
            fn ? fn.call(ctrl, inst) : inst.sendError({
                success: false,
                message: "Ruta no configurada/acceso denegado"
            });
        } else {
            return inst.sendErrorToken();
        }
    },
    /**
     * Valida que existe una session con login en la instancia.
     */
    exitsSession: function (inst) {
        if (inst.req.session && inst.req.session.hasLogin) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * Obtiene los datos de la session en la instancia.
     */
    getDataSession: function (inst, key) {
        if (this.exitsSession(inst)) {
            if (inst.req.session.hasOwnProperty(key)) {
                return inst.req.session[key];
            } else {
                return;
            }
        } else {
            return;
        }
    },
    /**
     * Crea una session en la instancia.
     */
    setSession: function (inst, obj) {
        if (Nodext.isObject(obj) && !inst.isDestroyed) {
            Nodext.apply(inst.req.session, obj);
        }
    },
    /**
     * Elimina la session de la instancia
     */
    destroySession: function (inst, fn) {
        console.log("destroySession")
        if (Nodext.isFunction(fn) && !inst.isDestroyed) {
            inst.req.session.destroy(fn);
        }
    }
});