/**
 * 
 */
Nodext.define("Nodext.database.query.Builder", {
    extend: 'Nodext.database.query.Forge',
    alias: "qb.base",
    mixins: [
        'Ext.mixin.Factoryable'
    ],
    factoryConfig: {
        defaultType: 'base',
        defaultProperty: "type"
    },
    /**
     * @private
     */
    whereTypeMethod: {
        ///
        where: 0,
        or_where: 0,
        where_in: 0,
        or_where_in: 0,
        where_not_in: 0,
        or_where_not_in: 0,
        ///
        like: 0,
        not_like: 0,
        or_like: 0,
        or_not_like: 0,
        ///
        or_group_start: 2,
        not_group_start: 2,
        or_not_group_start: 2,
        group_start: 2
    },
    /**
     * @private
     */
    propQueryObj: [
        "select", "from", "where", "join", "distinct", "start", "limit", "group_by", "order_by"
    ],
    // query: function (inst, query, fn, run) {
    //     if (inst) {
    //         return false;
    //     }
    //     var me = this, compile = me.queryCompile(inst, query);
    //     if (typeof run === "undefined" || run === true) {
    //         var config = {
    //             results: compile,
    //             callback: fn
    //         };
    //         this.initQuery(inst, config);
    //     } else {
    //         return compile;
    //     }
    //     me = query = compile = null;
    // },
    // compile: function (inst, params2) {
    //     // var inst = params1 instanceof Nodext.system.core.instance.Base ? params1 : false;
    //     if (inst) {
    //         return false;
    //     }
    //     var buildQuery = false, q, qCfg;
    //     if (Nodext.isObject(params2)) {
    //         buildQuery = true;
    //         qCfg = params2;
    //         q = this.compileQueryObject(inst, params2);
    //     } else if (Nodext.isArray(params2) && params2.length > 0) {
    //         buildQuery = true;
    //         qCfg = params2[0];
    //         q = this.compileQueryObject(inst, params2[0]);
    //     }
    //     if (buildQuery) {
    //         if (qCfg && qCfg.debug) {
    //             console.log('-----------Debug Compile-------------');
    //             console.log(q);
    //             console.log('>>>>>>>>>>>End Debug Compile<<<<<<<<<<<<');
    //         }
    //         inst = buildQuery = qCfg = null;
    //         return q;
    //     } else {
    //         inst = buildQuery = qCfg = null;
    //         return null;
    //     }
    // },
    // compileQuerys: function (inst, params2, params3) {
    //     // var inst = params1 instanceof Nodext.system.core.instance.Base ? params1 : false;
    //     if ((!Nodext.isArray(params2) && !Nodext.isObject(params2)) || !inst) {
    //         return false;
    //     }
    //     var compile = [], q;
    //     if (!Nodext.isArray(params2)) {
    //         params2 = [params2];
    //     }
    //     for (var x = 0; x < params2.length; x++) {
    //         q = this.compileQueryObject(inst, params2[x]);
    //         if (q) {
    //             compile.push(q);
    //         }
    //     }
    //     Nodext.destroyArray(params2);
    //     params2 = null;
    //     if (!params3) {
    //         return compile;
    //     } else if (params3.tpl) {
    //         q = Ext.String.format.apply(null, [(Array.isArray(params3.tpl) ? params3.tpl.join("\n") : params3.tpl)].concat(compile));
    //         Nodext.destroyClass(params3);
    //         params3 = null;
    //         return q;
    //     }
    // },
    // get: function (inst, params2, params3) {
    //     // var inst = params1 instanceof Nodext.system.core.instance.Base ? params1 : false;
    //     if (!inst) {
    //         console.trace("el primer parametro en una consulta siempre es la instancia");
    //         return false;
    //     }
    //     if (!Nodext.isFunction(params3)) {
    //         console.trace("No existe callback / revise los objetos enviados");
    //         return false;
    //     }

    //     var me = this, results = [], fn, buildQuery = false;
    //     fn = params3;
    //     if (Nodext.isObject(params2) || Nodext.isArray(params2)) {
    //         me.prepareQueryObject(inst, params2, results);
    //     }

    //     me.initQuery(inst, {
    //         results: results,
    //         callback: params3
    //     });
    //     me = results = buildQuery = null;
    // },
    // getResults: function (inst, querys) {
    //     var results = [];
    //     if (Array.isArray(querys)) {
    //         var x, item;
    //         for (x = 0; x < querys.length; x++) {
    //             item = null;
    //             if (typeof querys[x] === "string") {
    //                 if (Nodext.Array.contains(this.executeTypeTrans, querys[x])) {
    //                     item = this.createRSTrans(inst, this[querys[x]]());
    //                 } else {
    //                     item = this.createResult(inst, { query: querys[x], requireCompile: false });
    //                 }
    //             } else if (Nodext.isObject(querys[x])) {
    //                 if (querys[x].type && this[querys[x].type]) {
    //                     item = this[querys[x].type](inst, querys[x], null, false);
    //                 } else {
    //                     item = this.prepareQueryObject(inst, querys[x], results);
    //                 }
    //             }
    //             if (item) {
    //                 results.push(item);
    //             }
    //         }
    //         x = item = null;
    //     }
    //     return results;
    // },
    getResults: function (inst, querys) {
        var results = [], x, item;
        if (Array.isArray(querys)) {
            for (x = 0; x < querys.length; x++) {
                item = null;
                if (typeof querys[x] === "string") {
                    if (Nodext.Array.contains(this.executeTypeTrans, querys[x])) {
                        item = this.createRSTrans(inst, this[querys[x]]());
                    } else {
                        item = this.createResult(inst, { query: querys[x], requireCompile: false });
                    }
                } else if (Nodext.isObject(querys[x])) {
                    if (querys[x].type && this[querys[x].type]) {
                        item = this[querys[x].type](inst, querys[x], null, false);
                    } else {
                        item = this.prepareQueryObject(inst, querys[x], results);
                    }
                }
                if (item) {
                    results.push(item);
                }
            }
        }
        x = item = null;
        return results;
    },
    // execute: function (inst, params, fn) {
    //     if (!inst) {
    //         console.trace("el primer parametro en una consulta siempre es la instancia");
    //         return false;
    //     }
    //     var config = Nodext.isObject(params) && params.querys ? params : {};
    //     if (Array.isArray(params)) {
    //         config.querys = params;
    //     } else if (Nodext.isObject(params) && !params.querys) {
    //         config.querys = [params];
    //     }
    //     config.callback = config.callback || fn;
    //     if (!config.callback) {
    //         Ext.destroyObject(params);
    //         inst.sendError({
    //             success: false,
    //             message: this.msgError || 'No se proporciono el metodo de rellamado'
    //         });
    //         return false;
    //     }
    //     var results = this.getResults(inst, config.querys);
    //     config.results = results;
    //     this.initQuery(inst, config);
    //     results = params = null;
    // },


    ///////////
    ///////////
    ///////////
    ///////////
    ///////////
    createResult: function () {
        console.trace("debes implementar createResult en la clase hijo");
    },
    applyBasicCompile: function (queryObject) {

        if (queryObject.start || queryObject.limit) {
            this.limit(queryObject, queryObject["limit"], queryObject["start"]);
        }
        this.__SetSelect(queryObject, queryObject.select);
        this.__SetWhere(queryObject, queryObject.where);

        this.__SetFrom(queryObject, queryObject.from);
        this.__SetJoin(queryObject, queryObject.join);
        if (queryObject.distinct) {
            this.distinct(queryObject, queryObject.distinct);
        }
        this.__setGroup_by(queryObject, queryObject.group_by);
        this.__setOrder_by(queryObject, queryObject.order_by);
    },
    __SetFrom: function (qObj, value) {

        if (typeof value === "string") {
            this.from(qObj, value);
        } else if (value) {
            if (Nodext.isObject(value)) {
                value = [value];
            }
            var me = this;
            value.forEach(function (v) {
                if (typeof v === "string") {
                    me.from(qObj, v);
                } else if (Array.isArray(v)) {
                    me.from.apply(me, [qObj].concat(v));
                } else if (Nodext.isObject(v)) {
                    if (v.type === "pivot") {
                        me["frompivot"].apply(me, [qObj].concat(v));
                    } else {
                        me["fromselect"].apply(me, [qObj].concat(v));


                    }
                }
            });
            me = null;
        }
    },
    queryCompile: function (inst, query) {
        var me = this, compile = [];
        if (Array.isArray(query)) {
            query.forEach(function (q) {
                compile.push(me.createResult(inst, { query: q, requireCompile: false }));
            });
        } else if (Nodext.isObject(query)) {
            compile.push(me.createResult(inst, query));
        } else if (typeof query === "string") {
            compile.push(me.createResult(inst, { query: query, requireCompile: false }));
        }
        return compile;
    },
    __setOrder_by: function (qObj, value) {
        //        if(value)
        if (!Array.isArray(value)) {
            return false;
        }
        var x;
        for (x = 0; x < value.length; x++) {
            if (typeof value[x] === "string") {
                this.order_by(qObj, value[x]);
            } else if (Array.isArray(value[x])) {
                this.order_by.apply(this, [qObj].concat(value[x]));
            }
        }
        x = null;
    },
    __setGroup_by: function (qObj, value) {

        if (!Array.isArray(value)) {
            return false;
        }
        var x;
        for (x = 0; x < value.length; x++) {
            if (typeof value[x] === "string") {
                this.group_by(qObj, value[x]);
            } else if (Array.isArray(value[x])) {
                this.group_by.apply(this, [qObj].concat(value[x]));
            }
        }


        // if (!Array.isArray(value)) {
        //     value = [value];
        // }

        // for (var x = 0; x < value.length; x++) {
        //     this.group_by.apply(this, [qObj].concat(value[x]));
        // }
    },
    __SetWhere: function (qObj, value) {
        var me = this,
            type, method;
        if (typeof value === "object") {
            if (!Array.isArray(value)) {
                value = [value];
            }
            value.forEach(function (v) {
                type = v.type || 'where';
                method = me.whereTypeMethod[type];
                if (method === 0) {
                    me[type](qObj, v);
                } else if (method === 2) {
                    me[type](qObj);
                    if (Array.isArray(v.where)) {
                        me.__SetWhere(qObj, v.where);
                    }
                    me.group_end(qObj);
                }
            });
        } else if (typeof value === "string") {
            me.where(qObj, value);
        }
    },
    mapSelectFn: {
        subselect : 'subSelect',
        select: "subSelect",
        case: "selectCase",
        template: "selectTemplate",
        min : "selectMin",
        max : "selectMax",
        avg : "selectAvg",
        sum : "selectSum"
    },
    __SetSelect: function (qObj, value) {
        var me = this, type;
        if (!Array.isArray(value)) {
            return false;
        }
        // debugger
        value.forEach(function (v) {
            if (typeof v === "string") {
                me.select(qObj, v);
            } else if (Array.isArray(v)) {

                me.select.apply(me, [qObj].concat(v));


            } else if (Nodext.isObject(v)) {
                type = me.mapSelectFn[v.type || "select"];
                me[type].apply(me, [qObj].concat(v));
            } else if (Number.isInteger(v)) {
                me.select(qObj, "cast(" + this.escape(v) + " as integer)", false);
            } else if (!isNaN(v)) {
                me.select(qObj, "cast(" + v + " as numeric)", false);
            }
        });
    },
    __SetJoin: function (inst, value) {
        //        var me = this;
        if (!Array.isArray(value)) {
            return false;
        }
        for (var x = 0; x < value.length; x++) {
            this.join.apply(this, [inst].concat(value[x]));
        }
    },
    _insert: function (table, keys, values) {
        return 'INSERT INTO ' + table + ' (' + keys.join(', ') + ') VALUES (' + values.join(', ') + ')';
    },
    compileQueryObject: function (inst, itemQ) {
        var queryObj = Nodext.create("Nodext.database.query.Object", itemQ);
        this.applyBasicCompile(queryObj);
        var query = this._compile_select(queryObj.QB);
        queryObj.destroy();
        queryObj = null;
        return query;
    },
    prepareQueryObject: function (inst, config, results) {
        if (Nodext.isObject(config) || Nodext.isArray(config)) {
            var querys = Nodext.isObject(config) ? [config] : config, itemQ, itemProp, queryObj;
            for (var x = 0; x < querys.length; x++) {
                itemQ = querys[x];
                if (!itemQ.queryObject) {
                    itemQ["queryObject"] = this.createQueryObject(itemQ);
                } else {
                    itemQ["queryObject"] = this.createQueryObject(itemQ.queryObject);
                }
                results.push(this.createResult(inst, querys[x]));
            }
            itemQ = itemProp = queryObj = null;
        }
    },
    createQueryObject: function (item) {
        if (!(item instanceof Nodext.database.query.Object)) {
            var queryObj = {}, itemProp;
            for (var p = 0; p < this.propQueryObj.length; p++) {
                itemProp = this.propQueryObj[p];
                if (item.hasOwnProperty(itemProp)) {
                    queryObj[itemProp] = item[itemProp];
                    item[itemProp] = null;
                    delete item[itemProp];
                }
            }
            queryObj = Nodext.create("Nodext.database.query.Object", queryObj);
            itemProp = null;
            return queryObj;
        } else {
            return item;
        }
    }
});