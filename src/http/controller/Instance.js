/**
 * 
 */
Nodext.define("Nodext.http.controller.Instance", {
    extend: "Nodext.BaseInstance",
    activeAuth: null,
    auths: null,
    /**
     * identificador del dominio al cual se hizo la solicitud
     */
    orgDomain: null,
    /**
     * HTTP request argument to the middleware function, called "req" by convention
     */
    req: null,
    /**
     * HTTP response argument to the middleware function, called "res" by convention
     */
    res: null,
    /**
     * Callback argument to the middleware function, called "next" by conventionsssss
     */
    next: null,

    /**
     * @deprecated
     * Token de session
     */
    token: null,
    /**
     * @deprecated
     * Token decodificada
     */
    tokenDecoded: null,
    /**
     * Controller de la instancia
     */
    controller: null,
    // params: null,
    /**
     * Cache usado para filtros enviados en la peticion http
     */
    cacheFilter: null,
    /**
     * Cache usado para filtros adicionales enviados en la peticion http
     */
    cacheExtraFilter: null,
    /**
     * 
     */
    getPost: function () {
        return this.req.body;
    },
    /**
     * Devuelve los parametros enviados en la peticion http
     */
    getParams: function () {
        var obj = {};
        if (this.req.query) {
            Nodext.apply(obj, this.req.query);
        }
        if (this.req.body) {
            Nodext.apply(obj, this.req.body);
        }
        return obj;
    },
    /**
     * Devuelve un parametro enviado en la peticion http
     */
    getParam: function (item) {
        if (this.req.query && this.req.query[item]) {
            return this.req.query[item];
        }
        if (this.req.body && this.req.body[item]) {
            return this.req.body[item];
        }
        return;
    },
    /**
     * Envia una respuesta http al cliente
     */
    send: function (data) {
        var xml;
        if (this.isDestroyed) {
            Nodext.logError("Esta instacia ya ha respondido con un mensaje, no puede volver a responder -.-");
            delete this;
            return false;
        }
        if (this.req.accepts("application/json")) {
            //            this.res.setHeader('Content-Type', 'text/html');
            this.res.send(data);
        } else if (this.req.accepts("text/xml")) {
            this.res.header('Content-Type', 'text/xml');
            xml = Nodext.EasyXML.easyxml.render(data);
            this.res.send(xml);
        } else if (this.req.accepts("text/plain")) {
            this.res.send(data);
        } else if (this.req.accepts("text/html")) {
            this.res.send(data);
        } else {
            this.res.status(406).send('Not Acceptable');
        }
        data = xml = null;
        this.res.end();
        //        this.res.destroy();
        this.destroy();
    },
    /**
     * Envia una respuesta de session expirada al cliente
     */
    sendErrorTokenExpired: function () {
        return this.sendError({
            success: false,
            message: 'Session expirada'
        }, 498);
    },
    /**
     * Envia una respuesta de error en la session al cliente
     */
    sendErrorToken: function (err) {
        if (err && err.name === "TokenExpiredError") {
            return this.sendError({
                success: false,
                message: 'Session expirada'
            }, 498);
        } else {
            return this.sendError({
                success: false,
                message: 'No se encontro datos de la Session'
            }, 499);
        }

    },
    /**
     * Envia un mensaje de error al cliente
     */
    showError: function (message) {
        return this.sendError({
            success: false,
            message: message
        }, 502);
    },
    /**
     * Envia un mensaje de error de acuerdo al formato que pueda aceptar el cliente
     */
    sendError: function (message, code) {
        console.log(message)
        console.log(code)
        console.log("sendError");
        //        console.trace("SendError");
        if (this.isDestroyed) {
            Nodext.logError("Esta instacia ya ha respondido con un mensaje, no puede volver a responder -.-");
            delete this;
            return false;
        }
        //        this.sendRes = true;
        var xml;
        code = code || 500;
        if (this.req.accepts("application/json")) {
            this.res.status(code).send(message);
        } else if (this.req.accepts("text/xml")) {
            this.res.header('Content-Type', 'text/xml');
            xml = Nodext.EasyXML.easyxml.render(message);
            this.res.status(code).send(xml);
        } else if (this.req.accepts("text/plain")) {
            this.res.status(code).send(message);
        } else if (this.req.accepts("text/html")) {
            this.res.status(code).send(message);
        } else {
            this.this.res.status(406).send('Not Acceptable');
        }
        Nodext.destroy(message);
        this.res.end();
        this.destroy();
        //        console.log(this);
        message = xml = null;
    },
    destroy: function () {
        this.auths = this.activeAuth = null;
        this.callParent();
        delete this;
    },
    /**
     * Crea una session para el cliente
     */
    setSession: function () {
        var args = arguments,
            obj, auth;
        if (args.length === 1) {
            auth = this.activeAuth;
            obj = args[0];
        } else if (args.length > 1) {
            auth = this.auths.getByKey(args[0]);
            obj = args[1];
        }
        return auth ? auth.setSession(this, obj) : false;
    },
    /**
     * Destruye la session de cliente
     */
    destroySession: function () {
        var args = arguments,
            fn, auth;
        if (args.length === 1) {
            auth = this.activeAuth;
            fn = args[0];
        } else if (args.length > 1) {
            auth = this.auths.getByKey(args[0]);
            fn = args[1];
        }
        return auth ? auth.destroySession(this, fn) : false;
    },
    /**
     * Valida que exista una session en la peticion http
     */
    exitsSession: function (key) {
        var args = arguments,
            auth;
        if (args.length === 0) {
            auth = this.activeAuth;
        } else if (args.length === 1) {
            auth = this.auths.getByKey(args[0]);
        }
        return auth ? auth.exitsSession(this) : false;
    },
    /**
     * Obtiene los datos de la session actual
     */
    getValOfToken: function () {
        var args = arguments,
            prop, auth;
        if (args.length === 1) {
            auth = this.activeAuth;
            prop = args[0];
        } else if (args.length === 2) {
            auth = this.auths.getByKey(args[0]);
            prop = args[1];
        }
        // var auth = this.auths.getByKey(key);
        return auth ? auth.getDataSession(this, prop) : false;
    },
    getOrgDomain: function () {
        if (!this.orgDomain) {
            return false;
        }
        return this.orgDomain.name;
    },
    getIdOrgDomain: function () {
        if (!this.orgDomain) {
            return false;
        }
        return this.orgDomain.id;
    }
});