/**
 * 
 */
Nodext.define("Nodext.http.Domain", {
    extend: "Ext.Base",
    alternateClassName: ["Nodext.Domain"],
    $configPrefixed: false,
    mixins: {
        observable: 'Ext.util.Observable'
    },
    config: {
        /**
         * @cfg {Nodext.http.Server} server
         */
        server: null,
        /**
         * Lista de organizaciones permitidas para este dominio
         */
        organization: null,
        /**
         * Nombre de la con
         */
        dbOrganization: false,
        DBcnxName: null,
        systemSrv: null,
    },
    list: null,
    listId: null,
    regEx: /(\/\w+\/|\/)(?=.*)/i,
    constructor: function (cfg) {
        cfg = cfg || {};
        Nodext.apply(this, cfg);
        this.initConfig(cfg);
        this.mixins.observable.constructor.call(this, cfg);
        this.list = {
        };
        this.listId = {
        };
        this.addDomain(this.organization || []);
    },
    middleware: function () {
        var me = this;
        var fn = function (req, res, next) {
            // console.log(req)
            var m = me.regEx.exec(req.url);
            var domain = m ? m[0] : "";
            req.idDomain = me.getId(domain);

            if (req.idDomain !== false) {
                req.url = req.url.substring(domain.length - 1, req.url.length);
            } else {
                req.idDomain = me.getId("/");
            }


            if (req.idDomain !== false) {
                req.orgDomain = {
                    name: me.getDomainById(req.idDomain),
                    id: req.idDomain
                };
                // debugger
                next();
            } else {
                res.status(404).send({
                    success: false,
                    message: "Dominio no existe",
                    page: req.url
                });
            }
        };
        Nodext.addPropToFn(fn, {
            name: "server.domain",
            _id: Nodext.id("Domain-"),
            _type: "domain"
        });
        return fn;
    },
    addDomain: function (data) {
        var d;
        for (var x = 0; x < data.length; x++) {
            if (data[x]) {
                var obj = {};
                Nodext.apply(obj, data[x]);
                if (data[x].domain !== "/") {
                    d = '/' + data[x].domain.toUpperCase() + '/';
                } else {
                    d = data[x].domain;
                }
                this.list[d] = obj;
                this.listId[obj.id_org] = obj;

            }
        }
    },
    getId: function (name, slash) {
        name = name.toUpperCase();
        if (this.list[name]) {
            return this.list[name].id_org;
        } else {
            return false;
        }
    },
    //////////////////////7
    ///////////////////////
    //////////////////////
    onLoadClass: function (init) {
        this.path = init.path;
        var domainCfg = this.getDomainConfig();
        Nodext.apply(this, domainCfg);
        init.on({
            librariesload: {
                fn: "initLibrariesComplete",
                priority: 100
            },
            scope: this
        });
    },
    getDomainConfig: function () {
        try {
            return require(this.path + "/server/config/Domain.json");
        } catch (e) {
            return {};
        }
    },
    initLibrariesComplete: function () {
        if (Nodext.system && Nodext.system.Server) {
            var listen = {
                beforerunserver: "beforeRunServer",
                scope: this
            };
            Nodext.system.Server.on(listen);
            listen = null;
        } else {
            console.log("no existe Nodext.system.Server");
        }
    },
    beforeRunServer: function (SystemSrv, srv) {
        this.indexCheckRun = SystemSrv.addTaskLib("GlobalDomain");
        this.systemSrv = SystemSrv;
        this.on({
            onready: "runServer",
            scope: SystemSrv
        });
        this.initClass();
    },
    initClass: function () {
        this.db = Nodext.db.Mgr.getQB(this.DBcnxName);
        this.on({
            ongetdomains: 'onGetDomains',
            scope: this
        });
        this.createInst();
        this.getDomains();
    },
    getDomains: function () {
        var me = this;
        this.db.execute(this.inst, {
            querys: [{
                onErrorResMsg: false,
                from: "core.organization",
                where: {
                    swt_status: 0
                }
            }],
            listeners: {
                connectionexception: 'failureConnection',
                scope: this
            },
            onErrorResMsg: false
        }, function (rs, rsg) {
            me.fireEvent("ongetdomains", rs.getData());
            me = null;
        });
    },
    failureConnection: function () {
        this.inst = null;
    },
    createInst: function () {
        this.inst = Nodext.create("Nodext.system.core.instance.Base", {
            DBcnxName: this.DBcnxName,
            DBCnxAuto: true,
        });
        this.inst.initBuild();
    },
    onGetDomains: function (data) {
        this.systemSrv.completeTask(this.indexCheckRun);
        this.addDomain(data);
        this.inst.destroy();
        this.inst = null;
        this.fireEvent("onready");
    },


    getData: function (name) {
        name = name.toUpperCase();
        if (this.list[name]) {
            var obj = {};
            Nodext.apply(obj, this.list[name]);
            return obj;
        } else {
            return false;
        }
    },
    getDomain: function (name) {
        if (name !== "/") {
            name = '/' + name.toUpperCase() + '/';
        }
        name = name.toUpperCase();
        if (this.list[name]) {
            return this.list[name].domain;
        } else {
            return false;
        }
    },
    getDomainById: function (id) {
        if (this.listId[id]) {
            return this.listId[id].domain;
        } else {
            return false;
        }
    },
    activeDomainById: function (id) {
        if (this.listId[id] && this.listId[id].swt_status === '0') {
            return true;
        } else {
            return false;
        }
    },
    existDomainById: function (id) {
        if (this.listId[id]) {
            return true;
        } else {
            return false;
        }
    },
    getIdOrg: function (name) {
        if (name !== "/") {
            name = '/' + name.toUpperCase() + '/';
        }
        name = name.toUpperCase();
        if (this.list[name]) {
            return this.list[name].id_org;
        } else {
            return false;
        }
    },
    addOrg: function (data) {
        var response = [];
        for (var x = 0; x < data.length; x++) {
            response.push({
                id: data[x].id_org,
                clientId: data[x].id_ext
            });
        }
        this.addDomain(data);
        return response;
    },
    updateOrg: function (data) {
        var item;
        for (var x = 0; x < data.length; x++) {
            item = this.listId[data[x].id_org] || this.listId[data[x].id];
            if (data[x].domain) {
                delete this.list['/' + item.domain.toUpperCase() + '/'];
                this.list['/' + data[x].domain.toUpperCase() + '/'] = item;
            }
            if (item) {
                Nodext.copy(item, data[x], "name,swt_status,short_name,domain");
            }
        }
    },
    deleteOrg: function (data) {
        var item;
        for (var x = 0; x < data.length; x++) {
            item = this.listId[data[x].id];
            delete this.list['/' + item.domain.toUpperCase() + '/'];
            delete this.listId[data[x].id];
            Nodext.destroyObject(item);
        }
    }
});