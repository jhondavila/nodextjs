/**
 * 
 */
Nodext.define("Nodext.database.QBManager", {
    extend: "Ext.Base",
    requires: ["Nodext.database.Manager"],
    $configPrefixed: false,
    singleton: true,
    constructor: function (config) {
        Nodext.apply(this, config);
        this.initConfig(config);
    },
    // getQB: Nodext.emptyFn,
    query: function (inst, query, fn, run) {
        var qb = this.getQB(inst);
        if (!qb) {
            return;
        }
        var compile = qb.queryCompile(inst, query);
        if (typeof run === "undefined" || run === true) {
            var config = {
                results: compile,
                callback: fn
            };
            qb.initQuery(inst, config);
        } else {
            return compile;
        }
        qb = query = compile = null;
    },
    compile: function (inst, params2) {
        var qb = this.getQB(inst);
        if (!qb) {
            return;
        }
        var q, qCfg;
        if (Nodext.isObject(params2)) {
            qCfg = params2;
            q = qb.compileQueryObject(inst, params2);
        } else if (Nodext.isArray(params2) && params2.length > 0) {
            qCfg = params2[0];
            q = qb.compileQueryObject(inst, params2[0]);
        }
        if (q) {
            if (qCfg && qCfg.debug) {
                console.log('-----------Debug Compile-------------');
                console.log(q);
                console.log('>>>>>>>>>>>End Debug Compile<<<<<<<<<<<<');
            }
            qb = qCfg = null;
            return q;
        } else {
            qb = qCfg = null;
            return;
        }
    },
    compileQuerys: function (inst, params2, params3) {
        var qb = this.getQB(inst);
        if (!qb) {
            return;
        }
        if ((!Nodext.isArray(params2) && !Nodext.isObject(params2))) {
            return;
        }
        var compile = [], q;
        if (!Nodext.isArray(params2)) {
            params2 = [params2];
        }
        for (var x = 0; x < params2.length; x++) {
            q = qb.compileQueryObject(inst, params2[x]);
            if (q) {
                compile.push(q);
            }
        }
        Nodext.destroyArray(params2);
        params2 = qb = null;
        if (!params3) {
            return compile;
        } else if (params3.tpl) {
            q = Ext.String.format.apply(null, [(Array.isArray(params3.tpl) ? params3.tpl.join("\n") : params3.tpl)].concat(compile));
            Nodext.destroyClass(params3);
            return q;
        }
    },
    get: function (inst, params2, params3) {
        var qb = this.getQB(inst);
        if (!qb) {
            return;
        }
        if (!Nodext.isFunction(params3)) {
            console.trace("No existe callback / revise los objetos enviados");
            return;
        }

        var results = [], fn, buildQuery = false;
        fn = params3;
        if (Nodext.isObject(params2) || Nodext.isArray(params2)) {
            qb.prepareQueryObject(inst, params2, results);
        }
        qb.initQuery(inst, {
            results: results,
            callback: params3
        });
        qb = results = buildQuery = null;
    },
    getResults: function (inst, querys, qb) {
        qb = qb || this.getQB(inst);
        if (!qb) {
            return;
        }
        return qb.getResults(inst, querys);
    },

    execute: function (inst, params, fn) {
        var qb = this.getQB(inst);
        if (!qb) {
            return;
        }
        var config = Nodext.isObject(params) && params.querys ? params : {};
        if (Array.isArray(params)) {
            config.querys = params;
        } else if (Nodext.isObject(params) && !params.querys) {
            config.querys = [params];
        }
        config.callback = config.callback || fn;
        if (!config.callback) {
            Ext.destroyObject(params);
            inst.sendError({
                success: false,
                message: qb.msgError || 'No se proporciono el metodo de rellamado'
            });
            return false;
        }
        var results = qb.getResults(inst, config.querys, qb);
        config.results = results;
        qb.initQuery(inst, config);
        results = params = null;
    },
}, function () {
    this.getQB = Nodext.db.Mgr.getQBInst.bind(Nodext.db.Mgr);
});