/**
 * 
 */
Nodext.define("Nodext.http.controller.Script", {
    extend: "Ext.Base",
    singleton: true,
    constructor: function () {
        this.initConfig();
        this.callParent();
    },
    whType: {
        ///
        where: 0,
        or_where: 0,
        where_in: 1,
        or_where_in: 1,
        where_not_in: 1,
        or_where_not_in: 1,
        ///
        like: 2,
        not_like: 2,
        or_like: 2,
        or_not_like: 2,
        ///
        or_group_start: 3,
        not_group_start: 3,
        or_not_group_start: 3,
        group_start: 3
    },
    buildTreeApp: function (applications, parentId, nodeKey, parentKey, fn) {
        var app_tree = [];
        var ctrl = this;
        Ext.Array.each(applications, function (app) {
            if (app[parentKey] === parentId) {
                var children = ctrl.buildTreeApp(applications, app[nodeKey], nodeKey, parentKey);
                if (children.length > 0) {
                    app["children"] = children;
                }
                if (children.length === 0) {
                    if (app["leaf"] === 0) {
                        app["children"] = [];
                        app["leaf"] = false;
                    } else {
                        app["leaf"] = true;
                    }
                }
                if (fn) {
                    fn(app, children, parentId);
                }
                Ext.Array.push(app_tree, app);
            }
        });
        return app_tree;
    },
    findFilter: function (inst, filterName) {
        var findFilter, filters, extraFilters;
        if (!inst.cacheFilter && !inst.cacheExtraFilter) {
            findFilter = filters = extraFilters = null;
            return false;
        } else {
            var findFilter = false;
            Nodext.Array.each(inst.cacheFilter, function (filter) {
                if (filter.property == filterName) {
                    findFilter = filter;
                    return false;
                }
            });
            if (!findFilter) {
                Nodext.Array.each(inst.cacheExtraFilter, function (filter) {
                    if (filter.property == filterName) {
                        findFilter = filter;
                        return false;
                    }
                });
            }
            filters = extraFilters = null;
            return findFilter;
        }
    },
    queryUtil: function (inst, options) {
        var params = inst.getParams();
        var obj = {
        };
        var me = this;
        //        obj.id = params.id;
        if (params.filter) {
            obj.where = me.queryWhereFilters(inst, params.filter, options && options.filters ? options.filters : {}, false);
        } else {
            obj.where = [];
        }

        if (params.extraFilter) {
            obj.where = obj.where || [];
            obj.where = Nodext.Array.merge(obj.where, me.queryWhereFilters(inst, params.extraFilter, options && options.filters ? options.filters : {}, true));
        }

        if (params.id) {
            this.loopWh(inst, [{
                property: "id",
                value: params.id
            }], options ? options.filters : {}, obj.where);
        }

        if (params.node) {
            this.loopWh(inst, [{
                property: "node",
                value: params.node
            }], options ? options.filters : {}, obj.where);
        }

        if (params.data) {
            try {
                obj.data = JSON.parse(params.data);
            } catch (e) {
                obj.data = [];
            }
            if (!Array.isArray(obj.data)) {
                obj.data = [obj.data];
            }
        }
        if (params.columns) {
            try {
                obj.columns = JSON.parse(params.columns);
            } catch (e) {
                obj.columns = [];
            }
            if (!Array.isArray(obj.columns)) {
                obj.columns = [obj.columns];
            }
        }
        if (params.sort) {
            obj.sort = me.querySort(inst, params.sort, options ? options.sort : undefined, false);
        } else {
            obj.sort = [];
        }
        obj.modelId = params.modelId;
        obj.clientId = params.clientId;
        obj.modelParentId = params.modelParentId;

        obj.start = params.start;
        obj.limit = params.limit;
        if (params.hasOwnProperty("node")) {
            obj.node = params.node;
        }
        return obj;
    },
    querySort: function (inst, sorts, options) {
        if (!(Nodext.isObject(sorts) || Array.isArray(sorts))) {
            try {
                sorts = JSON.parse(sorts);
                inst.cacheSort = sorts;
            } catch (e) {
                inst.sendError({
                    message: "Error al decodificar la entrada de datos"
                });
            }
        }
        if (!Array.isArray(sorts)) {
            sorts = [sorts];
        }
        var sortItems = [], x;
        for (x = 0; x < sorts.length; x++) {
            if (sorts[x].property) {
                sortItems.push([sorts[x].property, sorts[x].direction]);
            }
        }
        x = null;
        return sortItems;
    },
    queryWhereFilters: function (inst, filters, options, extraFilter) {
        if (typeof filters === "string") {
            try {
                filters = JSON.parse(filters);
                if (extraFilter === false) {
                    inst.cacheFilter = filters;
                } else if (extraFilter === true) {
                    inst.cacheExtraFilter = filters;
                }
            } catch (e) {
                inst.sendError({
                    message: "Error al decodificar la entrada de datos"
                });
                return false;
            }
        }
        if (!Array.isArray(filters)) {
            filters = [filters];
        }
        var where = [];
        this.loopWh(inst, filters, options, where);
        return where;
    },
    loopWh: function (inst, filters, options, where) {
        var replaceFields = options.replaceFields || {},
            extraReplace = options.extraReplace || {},
            ignoreFilter, field, value, type, operator, fn, filter, nf, x;
        for (x = 0; x < filters.length; x++) {
            filter = filters[x];
            if (Nodext.isObject(filter)) {
                ignoreFilter = false;
                if (options.validate) {
                    // debugger
                    fn = options.validate[filter.property];
                    if (Nodext.isFunction(fn)) {
                        if (fn(filter, filters) === false) {
                            ignoreFilter = true;
                        }
                    }
                } else if (options.extraValidate) {
                    fn = options.extraValidate[filter.property];
                    if (Nodext.isFunction(fn)) {
                        if (fn(filter, filters) === false) {
                            ignoreFilter = true;
                        }
                    }
                }
                field = filter.property;
                value = filter.hasOwnProperty("value") ? filter.value : null;
                // debugger
                if (filter.exactMatch === true && value !== null) {
                    filter.exactMatch = "=";
                } else {
                    filter.exactMatch = null;
                }

                operator = filter.operator || filter.exactMatch || null;
                type = filter.type || 'where';


                if (replaceFields || extraReplace) {
                    if (replaceFields[field] || extraReplace[field]) {
                        field = replaceFields[field] || extraReplace[field];
                    }
                }
                if (!ignoreFilter) {
                    if (this.whType[type] === 0) {
                        //                        if (operator === "=") {
                        //                            where.push({
                        //                                type: type,
                        //                                field: field + " =",
                        //                                value: value
                        //                            });
                        //                        } else if (operator === " <>") {
                        //                            where.push({
                        //                                type: type,
                        //                                field: field + " <>",
                        //                                value: value
                        //                            });
                        //                        } else {
                        where.push({
                            type: type,
                            field: field + (operator ? " " + operator : ""),
                            value: value
                        });
                        //                        }
                    } else if (this.whType[type] === 1) {
                        if (Array.isArray(value)) {
                            value = value.slice(0, value.length);
                        } else {
                            value = [value];
                        }
                        where.push({
                            type: type,
                            field: field,
                            value: value
                        });
                    } else if (this.whType[type] === 2) {
                        nf = {
                            type: type,
                            field: field,
                            value: value,
                            cast: filter.cast
                        };
                        if (filter.hasOwnProperty("ignoreCase")) {
                            nf.ilike = filter.ignoreCase;
                        }
                        where.push(nf);
                    } else if (this.whType[type] === 3) {
                        where.push({
                            type: type,
                            where: this.queryWhereFilters(inst, filter.where || [], options)
                        });
                    } else {
                        where.push({
                            field: field,
                            value: value
                        });
                    }
                }
            }
        }
        ignoreFilter = field = value = type = operator = fn = filter = x = nf = null;
    }
});