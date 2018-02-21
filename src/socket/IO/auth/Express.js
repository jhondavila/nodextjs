/**
 * 
 */
Nodext.define("Nodext.socket.IO.auth.Express", {
    extend: "Nodext.auth.Express",
    alias: 'auth.sexpress',
    typeAuth: "session",

    /**
     * Valida que la session en la instancia sea autentica.
     */
    authenticate: function (inst) {
        if (this.exitsSession(inst)) {
            return true;
            //     inst.req.session.touch().save();
            //     inst.initBuild();
            //     fn ? fn.call(ctrl, inst) : inst.sendError({
            //         success: false,
            //         message: "Ruta no configurada/acceso denegado"
            //     });
        } else {
            inst.disconnect();
            return false;
        }
    },
    /**
     * Valida que existe una session con login en la instancia.
     */
    exitsSession: function (inst) {
        if (inst.destroyed) {
            return false;
        }
        var handshake = inst.socket.handshake;
        if (handshake.session && handshake.session.hasLogin) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * Obtiene los datos de la session en la instancia.
     */
    getDataSession: function (inst, key) {
        if (inst.destroyed) {
            return;

        }
        var handshake = inst.socket.handshake;
        // var session = handshake.session || {};
        // return session[key];
        if (this.exitsSession(inst)) {
            if (handshake.session.hasOwnProperty(key)) {
                return handshake.session[key];
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
        // if (Nodext.isObject(obj) && !inst.isDestroyed) {
        //     Nodext.apply(inst.req.session, obj);
        // }
    },
    /**
     * Elimina la session de la instancia
     */
    destroySession: function (inst, fn) {
        // console.log("destroySession")
        // if (Nodext.isFunction(fn) && !inst.isDestroyed) {
        //     inst.req.session.destroy(fn);
        // }
    },
    validateSession: function () {

    }
});