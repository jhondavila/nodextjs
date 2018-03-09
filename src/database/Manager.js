/**
 * 
 */
Nodext.define("Nodext.database.Manager", {
    extend: 'Ext.Base',
    requires: [
        // "Nodext.database.action.*",
        // "Nodext.database.postgre.*",
        // "Nodext.database.mysql.*",
        // "Nodext.database.query.*"
    ],
    uses : [
        "Nodext.database.*"
    //     // "Nodext.database.*"
    //     "Nodext.database.QBManager"
    ],
    alternateClassName: ["Nodext.db.Manager", "Nodext.db.Mgr"],
    $configPrefixed: false,
    $configStrict: false,
    singleton: true,
    config: {
        fileCfg: "database.json",
        listCnx: null,
        drivers: null
    },
    constructor: function (config) {
        config = config || {};
        Nodext.apply(this, config);
        this.initConfig();
        this.callParent(arguments);
        this.listCnx = {};
    },
    loadCnx: function (appNode) {
        var json = appNode.Global.getFileCfg(this.fileCfg);
        if (!json) {
            return false;
        }
        if (!Nodext.isMaster() && json.workers) {
            var defaults = json.defaults || [];
            var cfg = json.workers[Nodext.idWorker] || json.workers[Nodext.internalId] || [];
            if (!Array.isArray(cfg)) {
                cfg = [cfg];
            }
            cfg = cfg.concat(defaults);
            json = cfg;
        }
        var GlobalDBActive = appNode.Global.cfgDBActive;
        this.buildConnection(json, GlobalDBActive);
    },
    addConnection: function (cfg, GlobalDBActive) {
        this.buildConnection(cfg, GlobalDBActive);
    },
    getQBInst: function (inst) {
        inst = inst || { error: true };
        var cnx = this.listCnx[inst.DBcnxName];
        if (cnx) {
            return cnx.qb;
        } else {
            inst.error ? Nodext.logError("No found parameter inst(instance)") : inst.sendError({
                message: "No found connection Database"
            });
            return;
        }
    },
    getQB: function (cnxName) {
        var cnx = this.listCnx[cnxName];
        if (cnx) {
            return cnx.qb;
        } else {
            return null;
        }
    },
    getCnx: function (cnxName) {
        if (this.listCnx[cnxName]) {
            return this.listCnx[cnxName];
        } else {
            return null;
        }
    },
    buildConnection: function (config, GlobalDBActive) {
        var me = this;
        if (!Nodext.isArray(config)) {
            config = [config];
        }
        var newConfig, driverName, connection, nameConnection;
        Nodext.Array.each(config, function (item) {
            // console.log(item);
            newConfig = null;
            if (item.db && item.active_group && item.db[item.active_group]) {
                newConfig = item.db[item.active_group];
            } else if (item.db && !item.active_group && item.db["default"]) {
                newConfig = item.db["default"];
            } else if (item.db && !item.active_group && item.db[GlobalDBActive]) {
                newConfig = item.db[GlobalDBActive];
            } else if (!item.db) {
                newConfig = item;
            } else {
                Nodext.logError("No se puedo encontrar su configuracion de la base de datos");
            }
            if (!!newConfig) {
                driverName = newConfig.dbdriver;
                nameConnection = item.nameConnection || newConfig.database;
                Ext.apply(newConfig, {
                    nameConnection: nameConnection
                });
                if(newConfig.dbdriver){
                    Nodext.database.Connection.create(newConfig);
                }
            }
        });
    },
    addListCnx: function (name, connection) {
        this.listCnx[name] = connection;
    }
});