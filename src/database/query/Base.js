/**
 * 
 */
Nodext.define("Nodext.database.query.Base", {
    // extend: 'Nodext.database.query.Protect',
    extend: "Ext.Base",
    mixins: [
        "Nodext.database.query.Util",
        "Nodext.database.query.Protect"
    ],
    $configPrefixed: false,
    constructor: function (config) {
        config = config || {};
        Nodext.apply(this, config);
        this.initConfig(config);
        this.callParent(arguments);
    },
    regexp: {
        join: /([\(\)\[\]\w\.'-]+)(\s*[^\"\[`'\w]+\s*)(.+)/i,
        // case: /([\[\]\w\.'-(::| )]+)(\s*[^\"\[`'\w]+\s*)(.+)/i,
        case: /([\(\)\[\]\w\.'-]+)(\s*[^\"\[`'\w]+\s*)(.+)/i
    },
    aggregateType: ['MAX', 'MIN', 'AVG', 'SUM'],
    orderByDirection: ['ASC', 'DESC'],
    joinArray: ['LEFT', 'RIGHT', 'FULL OUTER', 'OUTER', 'INNER', 'LEFT OUTER', 'RIGHT OUTER', 'CROSS'],
    ilikeDefaultActive: true,
    executeTypeTrans: ["trans_start", "trans_complete", "trans_commit", "trans_rollback"],
    executeTypeCrud: ["insert", "update", "delete", "upsert"],
    keyUNION: "UNION",
    keyUNIONALL: "UNION ALL",
    keyBreakLine: "\n",

    frompivot: function (qObj, select) {
        var data = select.data;
        var cols = select.cols;
        var output = select.output;
        var alias = select.alias || "ct";

        var ssData = this.createQueryObject(data), ssCols, qData, qCols, keys, query;
        this.applyBasicCompile(ssData);
        qData = this._compile_select(ssData.QB);

        if (cols) {
            ssCols = this.createQueryObject(cols);
            this.applyBasicCompile(ssCols);
            qCols = this._compile_select(ssCols.QB);
        }

        keys = [];
        for (var o in output) {
            keys.push(this.protect_identifiers(ssData.QB, o, true, null, false) + " " + output[o]);
        }
        if (cols) {
            query = Nodext.String.format("crosstab \n($$ {0} $$,\n $${1}$$) as {2} \n({3})", qData, qCols, alias, keys.join(","));
        } else {
            query = Nodext.String.format("crosstab \n($$ {0} $$) as {1} \n({2})", qData, alias, keys.join(","));
        }
        qObj.QB.qb_from.push(query || "error");
    },

    selectTemplate: function (qObj, select) {
        var tpl = select.tpl,
            alias = select.alias,
            replace = select.replace, result;
        var compiles = [tpl];
        for (var p in replace) {
            compiles.push(this.tplProccessItem(replace[p]));
        }
        result = Nodext.String.format.apply(null, compiles) || "";
        result += alias ? " as " + this.protect_identifiers(qObj.QB, alias, false, this.protectIdentifiers) : "";
        qObj.QB.qb_select.push(result);
        qObj.QB.qb_no_escape.push(false);
    },
    tplProccessItem: function (item) {
        var qObj, partQuery, value, cols, col;
        qObj = this.createQueryObject(item);
        if (item.type === "case") {
            partQuery = this.selectCase(qObj, item);
        } else if (item.type === "select") {
            this.applyBasicCompile(qObj);
            partQuery = this._compile_select(qObj.QB);
        } else if (item.columns) {
            var value = item.columns;
            if (!Array.isArray(value)) {
                return false;
            }
            cols = [];
            value.forEach(function (v) {
                if (typeof v === "string") {
                    col = this.selectTplCols(qObj, v);
                } else if (Array.isArray(v)) {
                    col = this.selectTplCols.apply(this, [qObj].concat(v));
                } else if (Nodext.isObject(v)) {
                    type = this.mapSelectFn[v.type || "selectTplCols"];
                    col = this[type].apply(this, [qObj].concat(v));
                } else if (Number.isInteger(v)) {
                    col = this.selectTplCols(qObj, "cast(" + this.escape(v) + " as integer)", false);
                } else if (!isNaN(v)) {
                    col = this.selectTplCols(qObj, "cast(" + v + " as numeric)", false);
                }
                cols.push(col);
            }, this);
            partQuery = cols.join(", ");
        }
        qObj.destroy();
        qObj = value = cols = col = null;


        return partQuery;
    },
    selectTplCols: function (QBI, select, escape, separator) {
        select = (typeof select === "undefined") ? '*' : select;
        escape = (typeof escape === "undefined") ? true : escape;
        separator = (typeof separator === "undefined") ? null : separator;
        if (typeof select === 'string') {
            if (separator === null) {
                select = select.split(",");
            } else {
                select = select.split(separator);
            }
        } else if (select === null) {
            select = ["null"];
        }
        if (typeof escape !== 'boolean') {
            escape = this.protectIdentifiers;
        }
        list = [];
        var me = this;
        select.forEach(function (val) {
            val = val.trim();
            if (val !== '') {
                val = me.protect_identifiers(QBI, val, false, escape);
                list.push(val);
            }
        });
        return list.join(", ");
    },
    resolveTemplate: function (tpl, querys, compiles) {
        var x, subselect, queryStr;
        compiles = compiles || [];
        compiles.splice(0, 0, tpl);
        for (x = 0; x < querys.length; x++) {
            subselect = this.createQueryObject(querys[x]);
            this.applyBasicCompile(subselect);
            queryStr = this._compile_select(subselect.QB);
            compiles.push(queryStr);
        }
        return Nodext.String.format.apply(null, compiles) || "";
    },




    commonSubSelect: function (select) {
        var query, subselect;
        // debugger
        if (select.query) {

            query = select.query;

        } else if (Nodext.isArray(select.union) || Nodext.isArray(select.unionAll)) {
            var list = select.union || select.unionAll;
            var selects = [], x, v;

            for (x = 0; x < list.length; x++) {
                subselect = this.createQueryObject(list[x]);
                this.applyBasicCompile(subselect);
                v = this._compile_select(subselect.QB);
                subselect.destroy();
                selects.push(v);
            }
            query = selects.join(this.keyBreakLine + (select.union ? this.keyUNION : this.keyUNIONALL) + this.keyBreakLine);
        } else {
            subselect = this.createQueryObject(select);
            this.applyBasicCompile(subselect);
            query = this._compile_select(subselect.QB);
            subselect.destroy();
        }

        if (select.alias || select.as) {
            query = "(" + query + ")" + (select.alias || select.as ? " as " + this.escape_identifiers(select.alias || select.as) : "");

        } else {
            query = "(" + query + ")";
        }
        // console.log(query)
        return query;
    },

    subSelect: function (qObj, select) {

        // var subselect = this.createQueryObject(select);
        // this.applyBasicCompile(subselect);
        // var query = this._compile_select(subselect.QB);
        // if (query) {
        //     qObj.QB.qb_select.push("(" + query + ")" + (select.alias || select.as ? " as " + this.escape_identifiers(select.alias || select.as) : ""));
        //     qObj.QB.qb_no_escape.push(false);
        // }
        // subselect.destroy();
        // query = subselect = null;
        var query = this.commonSubSelect(select);
        qObj.QB.qb_select.push(query);
        qObj.QB.qb_no_escape.push(false);
    },
    whereinselect: function (qObj, select) {

        return this.commonSubSelect(select);
        // var x, subselect, v;
        // if (Nodext.isArray(select.union)) {
        //     var selects = [];
        //     for (x = 0; x < select.union.length; x++) {
        //         subselect = this.createQueryObject(select.union[x]);
        //         this.applyBasicCompile(subselect);
        //         v = this._compile_select(subselect.QB);
        //         subselect.destroy();
        //         selects.push(v);
        //     }
        //     v = selects.join(this.keyBreakLine + this.keyUNION + this.keyBreakLine);
        //     Nodext.destroyArray();
        // } else {
        //     subselect = this.createQueryObject(select);
        //     this.applyBasicCompile(subselect);
        //     v = this._compile_select(subselect.QB);
        //     subselect.destroy();
        // }
        // return v;
    },
    fromselect: function (qObj, select) {
        // var query, subselect;
        // if (select.query) {
        //     query = select.query;
        //     qObj.QB.qb_from.push("(" + query + ")" + (select.alias || select.as ? " as " + this.escape_identifiers(select.alias || select.as) : ""));
        // } else {
        //     subselect = this.createQueryObject(select), query;
        //     this.applyBasicCompile(subselect);
        //     query = this._compile_select(subselect.QB);
        //     if (query) {
        //         qObj.QB.qb_from.push("(" + query + ")" + (select.alias || select.as ? " as " + this.escape_identifiers(select.alias || select.as) : ""));
        //     }
        //     subselect.destroy();
        // }
        // query = subselect = null;
        var query = this.commonSubSelect(select);
        qObj.QB.qb_from.push(query);
    },




    getCacheSelect: function (select) {
        var qObj = this.createQueryObject({
            select: select
        });
        this.applyBasicCompile(qObj);
        var v = this._compile_select_cache(qObj.QB);
        qObj.destroy();
        return v;
    },
    select: function (qObj, select, escape, separator) {
        select = (typeof select === "undefined") ? '*' : select;
        escape = (typeof escape === "undefined") ? true : escape;
        separator = (typeof separator === "undefined") ? null : separator;
        if (typeof select === 'string') {
            if (separator === null) {
                select = select.split(",");
            } else {
                select = select.split(separator);
            }
        } else if (select === null) {
            select = ["null"];
        }
        if (typeof escape !== 'boolean') {
            escape = this.protectIdentifiers;
        }
        select.forEach(function (val) {
            val = val.trim();
            if (val !== '') {
                qObj.QB.qb_select.push(val);
                qObj.QB.qb_no_escape.push(escape);
            }
        });
        // return this;
    },
    selectCase: function (qObj, sCase) {
        // debugger
        var me = this, QBI = qObj.QB;
        var escape = (typeof sCase.escape === "undefined") ? true : sCase.escape;
        if (typeof escape !== 'boolean') {
            escape = this.protectIdentifiers;
        }
        var cond = "\nCASE ", v;
        if (sCase.conditions && Array.isArray(sCase.conditions)) {
            sCase.conditions.forEach(function (item) {
                if (item.escapeValue) {
                    v = this.escape(item.then);
                } else {
                    v = item.then;
                }
                cond += Nodext.String.format("\nWHEN {0} THEN {1}", me.escapeCase(QBI, escape, item.when), v);
            }, this);
        }
        if (sCase.default && Nodext.isObject(sCase.default)) {
            cond += Nodext.String.format("\nELSE {0}", sCase.default.then);
        }
        cond += "\nEND";
        if (sCase.tpl && sCase.querys) {
            var compiles = [];
            compiles.push(cond);
            cond = this.resolveTemplate(sCase.tpl, sCase.querys, compiles);
        }
        sCase.alias ? cond += " " + sCase.alias : undefined;
        QBI.qb_select.push(cond);
        QBI.qb_no_escape.push(false);
        QBI = null;
        return cond;
    },
    escapeCase: function (QBI, escape, cond) {

        var me = this;
        if (escape) {
            var match;
            if ((match = /([\(\w\.]+)([\W\s\)]+)(.+)/.exec(cond))) {
                match[1] = me.protect_identifiers(QBI, match[1]);
                // debugger

                if (escape) {
                    match[3] = !me._has_operator(match[3]) ? me.escape(match[3]) : match[3];
                }
                cond = match[1] + match[2] + match[3];
            }
        }
        var m = me.stringMatchAll(cond, /\sAND\s|\sOR\s/ig), i, c, s, temp, newcond, x;
        if (m) {
            for (x = 0; x < m.length; x++) {
                m[x].push(m[x].index);
            }
            m = [m];
        }
        var newcond = '';
        if (escape === true && !!m) {

            m[0].push(['', cond.length]);
            for (i = 0, c = (m[0].length), s = 0; i < c; s = m[0][i][1] + (m[0][i][0].length), i++) {
                temp = me.substr(cond, s, (m[0][i][1] - s));
                if ((match = this.regexp.case.exec(temp))) {
                    // debugger

                    newcond += me.protect_identifiers(QBI, match[1], false, escape);
                    newcond += match[2];
                    if (escape) {
                        newcond += !me._has_operator(match[3]) ? me.escape(match[3]) : match[3];
                    } else {
                        newcond += match[3];
                    }
                } else {
                    newcond += temp;
                }
                newcond += m[0][i][0];
            }
        } else {
            newcond = cond;
            //            return 
        }

        return newcond;
    },
    selectMax: function (qObj, select) {
        return this._max_min_avg_sum(qObj, select, 'MAX');
    },
    selectMin: function (qObj, select, alias) {
        return this._max_min_avg_sum(qObj, select, 'MIN');
    },
    selectAvg: function (qObj, select, alias) {
        return this._max_min_avg_sum(qObj, select, 'AVG');
    },
    selectSum: function (qObj, select, alias) {
        return this._max_min_avg_sum(qObj, select, 'SUM');
    },
    _max_min_avg_sum: function (qObj, select, type, ret) {
        var QBI = qObj.QB,
            escape = Nodext.isBoolean(select.escape) ? select.escape : this.protectIdentifiers,
            col = select.col || '',
            alias = select.alias || '';
        // debugger
        type = (typeof type === "undefined") ? 'MAX' : type;
        if (typeof col !== "string" || col === '') {
            console.trace("select no es una cadena/select vacio");
        }
        if (!Nodext.Array.contains(this.aggregateType, type)) {
            console.trace("el tipo de funcion agrupador " + type + " no es valido");
        }
        if (alias === '') {
            alias = this._create_alias_from_table(col.trim());
        }
        var sql;
        if (escape) {
            sql = type + '(' + this.protect_identifiers(QBI, col.trim()) + ')' + (alias ? " AS " + this.escape_identifiers(alias.trim()) : "");
        } else {
            sql = type + '(' + col.trim() + ') ' + (alias ? " AS " + alias.trim() : "");
        }
        // if (ret) {
        //     return sql;
        // } else {
        QBI.qb_select.push(sql);
        QBI.qb_no_escape.push(false);
        QBI = null;
        return sql;
        //     return this;
        // }
    },
    _create_alias_from_table: function (item) {
        if (item.indexOf('.') !== -1) {
            item = item.split('.');
            return (item.length > 0) ? item[item.length - 1] : false;
        }
        return item;
    },
    distinct: function (qObj, val) {
        val = (typeof val === "undefined") ? true : val;
        qObj.QB.qb_distinct = (typeof val === 'boolean') ? val : true;
    },
    from: function (qObj, from_q, quote, separator) {
        var me = this;
        separator = separator || ",";
        quote = (typeof quote === "undefined") ? this.protectIdentifiers : quote;
        var QBI = qObj.QB;
        from_q = from_q instanceof Array ? from_q : [from_q];
        from_q.forEach(function (val) {
            if (val.indexOf(separator) !== -1) {
                val.split(separator).forEach(function (v) {
                    v = v.trim();
                    me._track_aliases(QBI, v, separator);
                    if (quote === true) {
                        v = me.protect_identifiers(QBI, v, true, null, false);
                        QBI.qb_from.push(v);
                    } else {
                        QBI.qb_from.push(v);
                    }
                });
            } else {
                val = val.trim();
                me._track_aliases(QBI, val, separator);
                if (quote === true) {
                    val = me.protect_identifiers(QBI, val, true, null, false);
                    QBI.qb_from.push(val);
                } else {
                    QBI.qb_from.push(val);
                }
            }
        });
        me = QBI = null;
        return me;
    },
    _track_aliases: function (QBI, table, separator) {
        var me = this;
        separator = separator || ",";
        if (Nodext.isArray(table)) {
            table.forEach(function (t) {
                me._track_aliases(t);
            });
            return;
        }

        // Does the string contain a comma?  If so, we need to separate
        // the string into discreet statements
        if (!table) {
            return;
        }


        if (table.indexOf(separator) !== -1) {
            return me._track_aliases(table.split(separator));
        }

        // if a table alias is used we can recognize it by a space
        if (table.indexOf(' ') !== -1) {
            // if the alias is written with the AS keyword, remove it
            table = me.preg_replace('/\s+AS\s+/i', ' ', table);
            // Grab the alias
            table = me.strrchr(table, ' ').trim();
            // Store the alias, if it doesn't already exist
            if (!Nodext.Array.contains(QBI.qb_aliased_tables, table)) {
                QBI.qb_aliased_tables.push(table);
            }
        }
    },
    stringMatchAll: function (string, regexp) {
        var matches = [];
        if (typeof string === "string") {
            string.replace(regexp, function () {
                var arr = ([]).slice.call(arguments, 0);
                var extras = arr.splice(-2);
                arr.index = extras[0];
                arr.input = extras[1];
                matches.push(arr);
            });
        }
        return matches.length ? matches : null;
    },
    join: function (qObj, table, cond, type, escape) {

        //        console.log(type);
        type = (typeof type === "undefined") ? '' : type;
        escape = (typeof escape === "undefined") ? false : escape;
        //        quote = (typeof quote === "undefined") ? false : quote;
        if (typeof escape !== 'boolean') {
            escape = this.protectIdentifiers;
        }
        var me = this;
        var QBI = qObj.QB;
        if (type !== '') {
            type = type.trim().toUpperCase();
            if (!Nodext.Array.contains(this.joinArray, type)) {
                type = '';
            } else {
                type += ' ';
            }
        }
        //        console.log(table);
        // Extract any aliases that might exist. We use this information
        // in the protect_identifiers to know whether to add a table prefix
        me._track_aliases(QBI, table);
        if (escape) {
            var match;
            // Strip apart the condition and protect the identifiers
            if ((match = /([\w\.]+)([\W\s]+)(.+)/.exec(cond))) {
                match[1] = me.protect_identifiers(QBI, match[1]);
                match[3] = me.protect_identifiers(QBI, match[3]);
                cond = match[1] + match[2] + match[3];
            }
        }
        //        console.log(cond);
        var m = me.stringMatchAll(cond, /\sAND\s|\sOR\s/ig), i, c, s, temp, newcond, x;
        if (m) {
            for (x = 0; x < m.length; x++) {
                m[x].push(m[x].index);
            }
            m = [m];
        }
        //        console.log(m);
        if (escape === true && !!m) {
            var newcond = '';
            m[0].push(['', cond.length]);
            for (i = 0, c = (m[0].length), s = 0; i < c; s = m[0][i][1] + (m[0][i][0].length), i++) {
                temp = me.substr(cond, s, (m[0][i][1] - s));

                newcond += (match = this.regexp.join.exec(temp)) ? me.protect_identifiers(QBI, match[1]) + match[2] + me.protect_identifiers(QBI, match[3]) : temp;

                newcond += m[0][i][0];
            }
            cond = ' ON ' + newcond;
        }
        else if (escape === true && (match = this.regexp.join.exec(cond))) {
            cond = ' ON '.me.protect_identifiers(QBI, match[1]) + match[2] + me.protect_identifiers(QBI, match[3]);
        } else if (!me._has_operator(cond)) {
            if (type === "CROSS" + ' ') {
                cond = '';
            } else {
                cond = ' USING (' + (escape ? me.escape_identifiers(cond) : cond) + ')';
            }
        } else {
            cond = ' ON ' + cond;
        }
        if (escape === true) {
            table = me.protect_identifiers(QBI, table, true, null, false);
        }
        QBI.qb_join.push(type + ' JOIN ' + table + cond);
        QBI = null;
        return me;
    },
    where: function (qObj, item) {
        return this._wh(qObj, 'qb_where', 'AND ', item);
    },
    or_where: function (qObj, item) {
        return this._wh(qObj, 'qb_where', 'OR ', item);
    },
    _wh: function (qObj, qb_key, type, item) {
        // debugger
        // if (new Date(item.value)) {
        //     debugger    
        // }
        var escape;
        var me = this;
        var QBI = qObj.QB,
            qb_cache_key = (qb_key === 'qb_having') ? 'qb_cache_having' : 'qb_cache_where';
        type = type || 'AND ';
        if (item.field) {
            escape = item.escape;
            var obj = {};
            obj[item.field] = item.value;
            item = obj;
        }
        if (typeof escape !== 'boolean') {
            escape = this.protectIdentifiers;
        }
        var prefix, fake_escape = false;
        Nodext.Object.each(item, function (k, v) {
            prefix = (QBI[qb_key].length === 0 && QBI[qb_cache_key].length === 0) ? me._group_get_type(QBI, '') : me._group_get_type(QBI, type);
            // debugger
            if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {

                if (escape === true) {
                    k = me.protect_identifiers(QBI, k, false, escape);
                    v = ' ' + me.escape(v);
                }
                if (!me._has_operator(k)) {
                    k += ' = ';
                }

            } else if (Nodext.isObject(v)) {
                v = me.whereinselect(null, v);
                if (escape === true) {
                    k = me.protect_identifiers(QBI, k, false, escape);
                }
                if (!me._has_operator(k)) {
                    k += ' = ';
                }
            } else if (typeof v === "undefined") {
                k = me.protect_identifiers(QBI, k, false, escape);
                v = '';
            } else if (v === null) {
                if (escape === true) {
                    k = me.protect_identifiers(QBI, k, false, escape);
                    v = ' ' + me.escape(v);
                }
                if (!me._has_operator(k)) {
                    k += ' is ';
                }
            }
            QBI[qb_key].push({
                'condition': prefix + k + v,
                'escape': fake_escape
            });
        });
        QBI = null;
    },
    _group_get_type: function (QBI, type) {
        if (QBI.qb_where_group_started) {
            type = '';
            QBI.qb_where_group_started = false;
        }
        return type;
    },
    where_in: function (qObj, item) {
        return this._where_in(qObj, false, 'AND ', item);
    },
    or_where_in: function (qObj, item) {
        return this._where_in(qObj, false, 'OR ', item);
    },
    where_not_in: function (qObj, item) {
        return this._where_in(qObj, true, 'AND ', item);
    },
    or_where_not_in: function (qObj, item) {
        return this._where_in(qObj, true, 'OR ', item);
    },
    _where_in: function (qObj, not, type, item) {
        if (!item.field || !item.value) {
            return this;
        }
        var values = item.value;
        not = (typeof not === "undefined") ? false : not;
        type = (typeof type === "undefined") ? 'AND ' : type;
        var escape = item.escape;
        if (typeof escape !== 'boolean') {
            escape = this.protectIdentifiers;
        }
        var me = this, key, condition;
        var QBI = qObj.QB, where_in, where_in_q, prefix;
        not = (not) ? ' NOT' : '';
        prefix = (QBI.qb_where.length === 0) ? this._group_get_type(QBI, '') : this._group_get_type(QBI, type);

        if (Nodext.isObject(values)) {
            escape = false;
            where_in_q = this.whereinselect(null, values);
            key = prefix + item.field + not;
            condition = key + ' IN' + where_in_q + '';
        } else {
            if (!Array.isArray(values)) {
                values = [values];
            }
            where_in = [];
            values.forEach(function (item) {
                where_in.push(me.escape(item));
            });
            where_in_q = where_in.join(', ');
            Nodext.destroyArray(where_in);
            escape = false;
            key = me.protect_identifiers(QBI, prefix + item.field + not, false, escape);
            condition = key + ' IN(' + where_in_q + ')';
        }

        QBI.qb_where.push({
            condition: condition,
            escape: escape
        });
        Nodext.destroyArray(where_in);
        QBI = where_in = where_in_q = null;
        return me;
    },
    like: function (qObj, item) {
        return this._like(qObj, 'AND ', '', item);
    },
    not_like: function (qObj, item) {
        return this._like(qObj, 'AND ', 'NOT', item);
    },
    or_like: function (qObj, item) {
        return this._like(qObj, 'OR ', '', item);
    },
    or_not_like: function (qObj, item) {
        return this._like(qObj, 'OR ', 'NOT', item);
    },
    _like: function (qObj, type, not, item) {
        //        console.log(item);
        var match = item.hasOwnProperty("value") ? item.value : '';
        var side = item.hasOwnProperty("side") ? item.side : 'both';
        var escape = item.escape;
        var field = item.field;
        var ilike = item.hasOwnProperty("ilike") ? item.ilike : this.ilikeDefaultActive;
        type = (typeof type === "undefined") ? 'AND ' : type;
        not = (typeof not === "undefined") ? '' : not;

        var me = this;
        var QBI = qObj.QB, prefix, like_statement;
        if (!Nodext.isObject(field)) {
            var obj = {};
            obj[field] = match;
            field = obj;
        }

        if (typeof escape !== 'boolean') {
            escape = this.protectIdentifiers;
        }

        side = side.toLowerCase();
        var like_type = "LIKE";
        if (ilike) {
            like_type = "ILIKE";
        }

        Nodext.Object.each(field, function (k, v) {
            prefix = (QBI.qb_where.length === 0 && QBI.qb_cache_where.length === 0) ? me._group_get_type(QBI, '') : me._group_get_type(QBI, type);
            if (v.toString) {
                v = v.toString();
            }
            v = me.escape_like_str(v);
            if (item.cast) {
                k = k + " ::varchar";
            }
            if (side === 'none') {
                like_statement = Nodext.String.format("{0} {1} {2} {3} '{4}'", prefix, k, not, like_type, v);
            } else if (side === 'before') {
                like_statement = Nodext.String.format("{0} {1} {2} {3} '%{4}'", prefix, k, not, like_type, v);
            } else if (side === 'after') {
                like_statement = Nodext.String.format("{0} {1} {2} {3} '{4}%'", prefix, k, not, like_type, v);
            } else {
                like_statement = Nodext.String.format("{0} {1} {2} {3} '%{4}%'", prefix, k, not, like_type, v);
            }
            if (me.likeEscapeStr !== '') {
                like_statement += Nodext.String.format(me.likeEscapeStr, me.likeEscapeChr);
            }
            QBI.qb_where.push({
                condition: like_statement,
                escape: escape
            });
        });
        QBI = null;
        return me;
    },
    or_group_start: function (qObj) {
        return this.group_start(qObj, '', 'OR ');
    },
    not_group_start: function (qObj) {
        return this.group_start(qObj, 'NOT ', 'AND ');
    },
    or_not_group_start: function (qObj) {
        return this.group_start(qObj, 'NOT ', 'OR ');
    },
    group_start: function (qObj, not, type) {
        not = (typeof not === "undefined") ? '' : not;
        type = (typeof type === "undefined") ? 'AND ' : type;
        var QBI = qObj.QB;
        type = this._group_get_type(QBI, type);
        QBI.qb_where_group_started = true;
        var prefix = (QBI.qb_where.length === 0 && QBI.qb_cache_where.length === 0) ? '' : type;
        QBI.qb_where.push({
            condition: prefix + not + (Nodext.String.repeat(' ', ++QBI.qb_where_group_count)) + ' (',
            escape: false
        });
        QBI = null;
        return this;
    },
    group_end: function (qObj) {
        //        var QBI = inst._DB.QB;
        qObj.QB.qb_where_group_started = false;
        //        console.log(QBI.qb_where_group_count--);
        qObj.QB.qb_where.push({
            condition: (Nodext.String.repeat(' ', qObj.QB.qb_where_group_count--)) + ')',
            escape: false
        });
        return this;
    },
    group_by: function (qObj, by, escape, delimiter) {
        by = by || [];
        escape = (typeof escape === "undefined") ? true : escape;
        if (typeof escape !== 'boolean') {
            escape = this.protectIdentifiers;
        }

        if (typeof by === 'string') {
            if (delimiter) {
                by = by.split(delimiter);
            } else {
                delimiter = ',';
                by = (escape === true) ? by.split(delimiter) : [by];
            }
        }
        var me = this, fake_escape = false, QBI = qObj.QB;
        by.forEach(function (val) {
            val = val.trim();
            if (val !== '') {
                if (escape) {
                    val = me.protect_identifiers(QBI, val);
                }
                QBI.qb_groupby.push({
                    field: val,
                    escape: fake_escape
                });
            }
        });
        QBI = null;
        return this;
    },
    having: function (qObj, key, value, escape) {
        return this._wh(qObj, 'qb_having', key, value, 'AND ', escape);
    },
    or_having: function (qObj, key, value, escape) {
        return this._wh(qObj, 'qb_having', key, value, 'OR ', escape);
    },
    order_by: function (qObj, orderby, direction, escape, separator) {
        // debugger
        direction = (typeof direction === "undefined") ? '' : direction;
        escape = (typeof escape === "undefined") ? null : escape;
        separator = (typeof separator === "undefined") ? null : separator;
        var me = this, QBI = qObj.QB, match;
        direction = direction.trim().toUpperCase();
        //        console.log(direction);
        if (direction === 'RANDOM') {
            direction = ''
        } else if (me.empty(orderby)) {
            return this;
        } else if (direction !== '') {
            direction = Nodext.Array.contains(this.orderByDirection, direction) ? ' ' + direction : '';
        }

        if (typeof escape !== 'boolean') {
            escape = this.protectIdentifiers;
        }

        if (separator) {
            orderby.split(separator).forEach(function (field) {
                QBI.qb_orderby.push({
                    field: field,
                    direction: direction,
                    escape: false
                });
            });
        } else {
            separator = ",";
            if (!escape) {
                QBI.qb_orderby.push({
                    field: orderby,
                    direction: direction,
                    escape: false
                });
            } else {
                orderby.split(separator).forEach(function (field) {
                    if (direction === '' && (match = /\s+(ASC|DESC)$/i.exec(field.trim()))) {
                        QBI.qb_orderby.push({
                            field: me.substr(field, 0, match.index).trim(),
                            direction: ' ' + match[0].trim(),
                            escape: true
                        });
                    } else {
                        QBI.qb_orderby.push({
                            field: field.trim(),
                            direction: direction,
                            escape: true
                        });
                    }
                });
            }
        }
        QBI = null;
        return this;
    },
    limit: function (qObj, value, offset) {
        offset = (typeof offset === "undefined") ? 0 : offset;
        if (!isNaN(value) || !isNaN(offset)) {
            qObj.QB.qb_limit = parseInt(value);
            qObj.QB.qb_offset = parseInt(offset);
        }
        return this;
    },
    offset: function (qObj, offset) {
        offset = (typeof offset === "undefined") ? 0 : offset;
        if (!isNaN(offset)) {
            qObj.QB.qb_offset = parseInt(offset);
        }
        return this;
    },
    _limit: function (QBI, sql) {
        //override postgre
        return sql + ' LIMIT ' + (QBI.qb_offset ? QBI.qb_offset + ', ' : '') + QBI.qb_limit;
    },
    _compile_select_cache: function (QBI) {
        var me = this, sql, x, no_escape;
        sql = '';
        if (QBI.qb_select.length === 0) {
            sql += '*';
        } else {
            for (x = 0; x < QBI.qb_select.length; x++) {
                no_escape = typeof QBI.qb_no_escape[x] === "boolean" ? QBI.qb_no_escape[x] : null;
                QBI.qb_select[x] = me.protect_identifiers(QBI, QBI.qb_select[x], false, no_escape);
            }
            sql += QBI.qb_select.join(', ');
        }
        return sql;
    },
    _compile_select: function (QBI, select_override) {
        // debugger
        select_override = (typeof select_override === "undefined") ? false : select_override;
        var me = this, sql, x, no_escape;
        if (select_override !== false) {
            sql = select_override;
        } else {
            sql = !QBI.qb_distinct ? 'SELECT ' : 'SELECT DISTINCT ';
            if (QBI.qb_select.length === 0) {
                sql += '*';
            } else {
                for (x = 0; x < QBI.qb_select.length; x++) {
                    no_escape = typeof QBI.qb_no_escape[x] === "boolean" ? QBI.qb_no_escape[x] : null;
                    //                    console.log(no_escape);
                    QBI.qb_select[x] = me.protect_identifiers(QBI, QBI.qb_select[x], false, no_escape);
                }
                sql += QBI.qb_select.join(', ');
            }
        }

        if (QBI.qb_from.length > 0) {
            sql += "\nFROM " + me._from_tables(QBI);
        }
        if (QBI.qb_join.length > 0) {
            sql += "\n" + QBI.qb_join.join("\n");
        }

        sql += me._compile_wh(QBI, 'qb_where')
            + me._compile_group_by(QBI)
            + me._compile_wh(QBI, 'qb_having')
            + me._compile_order_by(QBI);
        // LIMIT
        if (QBI.qb_limit) {
            return me._limit(QBI, sql + "\n");
        } else {
            return sql;
        }
    },
    _is_literal: function (str) {
        str = str.trim();
        if (this.empty(str) || this.ctype_digit(str)) {
            return true;
        }
        if (Nodext.isNumeric(str)) {
            return true;
        }
        if (Nodext.isBoolean(str) || str.toLowerCase() === "true" || str.toLowerCase() == "false") {
            return true;
        }
        var _str;
        if (this.empty(_str)) {
            _str = this.escapeChar !== '"' ? ['"', "'"] : ["'"];
        }
        return Nodext.Array.contains(_str, str[0]);
    },
    _compile_group_by: function (QBI) {
        var me = this;
        if (QBI.qb_groupby.length > 0) {
            var i, c;
            for (i = 0, c = QBI.qb_groupby.length; i < c; i++) {
                if (typeof QBI.qb_groupby[i] === "string") {
                    continue;
                }
                QBI.qb_groupby[i] = (QBI.qb_groupby[i]["escape"] === false || me._is_literal(QBI.qb_groupby[i]["field"])) ?
                    QBI.qb_groupby[i]["field"] : me.protect_identifiers(QBI.qb_groupby[i]["field"]);
            }
            return "\nGROUP BY " + QBI.qb_groupby.join(', ');
        }
        return '';
    },
    _compile_order_by: function (QBI) {
        if (Array.isArray(QBI.qb_orderby) && QBI.qb_orderby.length > 0) {
            var me = this;
            for (var i = 0, c = QBI.qb_orderby.length; i < c; i++) {
                if (QBI.qb_orderby[i]['escape'] !== false && !me._is_literal(QBI.qb_orderby[i]['field'])) {
                    QBI.qb_orderby[i]['field'] = me.protect_identifiers(QBI, QBI.qb_orderby[i]['field']);
                }
                QBI.qb_orderby[i] = QBI.qb_orderby[i]['field'] + QBI.qb_orderby[i]['direction'];
            }
            return QBI.qb_orderby = "\nORDER BY " + QBI.qb_orderby.join(', ');
        } else if (typeof QBI.qb_orderby === "string") {
            return QBI.qb_orderby;
        }
        return '';
    },
    _compile_wh: function (QBI, qb_key) {
        var conditions, ci, cc, me = this, matches;
        if (QBI[qb_key].length > 0) {
            var i, c, op;
            for (i = 0, c = QBI[qb_key].length; i < c; i++) {
                if (typeof QBI[qb_key][i] === "string") {
                    continue;
                } else if (QBI[qb_key][i]['escape'] === false) {
                    QBI[qb_key][i] = QBI[qb_key][i]["condition"];
                    continue;
                }
                conditions = QBI[qb_key][i]["condition"].split(/(\s*AND\s+|\s*OR\s+)/ig);
                conditions.forEach(function (item) {
                    if (me.empty(item)) {
                        Nodext.Array.remove(conditions, item);
                    }
                });
                for (ci = 0, cc = conditions.length; ci < cc; ci++) {
                    op = me._get_operator(conditions[ci]);
                    if (op === false) {
                        continue;
                    }
                    matches = conditions[ci].match(eval('/^(\\(?)(.*)(' + me.preg_quote(op, '/') + ')\\s*(.*(\\?<!\\)))?(\\)?)$/i'));
                    if (!me.empty(matches[4])) {
                        console.trace("error _compile_wh");
                    }
                    conditions[ci] = matches[1] + me.protect_identifiers(QBI, matches[2].trim()) + ' ' +
                        matches[3].trim() + (!!matches[4] ? matches[4] : "") + (!!matches[5] ? matches[5] : "");
                }

                QBI[qb_key][i] = conditions.join('');
            }
            return (qb_key === 'qb_having' ? "\nHAVING " : "\nWHERE ") + QBI[qb_key].join("\n");
        }
        return '';
    },
    _from_tables: function (QBI) {
        return QBI.qb_from.join(", ");
    },
    _reset_select: function (qObj) {
        console.trace("reimplementar el reset select");
        //        inst.db_reset_select();
    },
    _get: function (qObj, table, limit, offset) {
        if (table && table !== '') {
            this._track_aliases(qObj.QB, table);
            this.from(qObj, table);
        }
        if (limit) {
            this.limit(qObj, limit, offset);
        }
        return this._compile_select(qObj.QB);
    },
    _update: function (QBI, table, values, rFields) {
        var valstr = [], val;

        for (val in values) {
            valstr.push(val + ' = ' + values[val]);
        }
        return 'UPDATE ' + table + ' SET ' + valstr.join(', ')
            + this._compile_wh(QBI, 'qb_where')
            + this._compile_order_by(QBI)
            + (QBI.qb_limit ? ' LIMIT ' + QBI.qb_limit : '')
            + rFields;
    },
    _delete: function (QBI, table) {
        return 'DELETE FROM ' + table + ' '
            + this._compile_wh(QBI, 'qb_where');
    },
    ////
    _validate_insert: function (QBI, table) {
        if (Nodext.Object.getSize(QBI.qb_set) === 0) {
            return false;
        }
        //        console.log(QBI);
        if (table && table !== '') {
            QBI.qb_from[0] = table;
        } else if (!QBI.qb_from[0]) {
            return false;
        }
        return true;
    },
    prepareUpdateData: function (records, options) {
        var x, i, xx, d;
        //        console.log(records);
        if (options.deleteFields && options.deleteFields.length > 0) {
            d = options.deleteFields;
            for (i = 0; i < records.length; i++) {
                for (xx = 0; xx < d.length; xx++) {
                    records[i][d[xx]] = null;
                    delete records[i][d[xx]];
                }
            }
            d = null;
        }
        if (options.replaceFields && Nodext.Object.getSize(options.replaceFields) > 0) {
            for (i = 0; i < records.length; i++) {
                for (x in options.replaceFields) {
                    if (records[i].hasOwnProperty(x)) {
                        records[i][options.replaceFields[x]] = records[i][x];
                        records[i][x] = null;
                        delete records[i][x];
                    }
                }
            }
        }

        if (options.replaceValues && Nodext.Object.getSize(options.replaceValues) > 0) {
            for (i = 0; i < records.length; i++) {
                for (x in options.replaceValues) {
                    if (records[i].hasOwnProperty(x)) {
                        records[i][x] = options.replaceValues[x];
                    }
                }
            }
        }


        if (options.addFields && options.addFields.length > 0) {
            var obj = {};
            for (x = 0; x < options.addFields.length; x++) {
                obj[options.addFields[x].field] = options.addFields[x].value;
            }
            for (x = 0; x < records.length; x++) {
                Nodext.apply(records[x], obj);
            }
        }
        //        console.log(records);
        return records;
    },
    prepareKeysInsertData: function (keysBasic, options) {
        var keys = [], x, k;
        options.deleteFields = options.deleteFields || [];
        var FieldReplace = Nodext.Object.getKeys(Nodext.Object.getSize(options.replaceFields) > 0 ? options.replaceFields : {});
        for (x = 0; x < keysBasic.length; x++) {
            if (!Nodext.Array.contains(options.deleteFields, keysBasic[x]) && !Nodext.Array.contains(FieldReplace, keysBasic[x])) {
                keys.push({
                    field: keysBasic[x],
                    key: keysBasic[x],
                    type: "send"
                });
            }
        }
        if (FieldReplace.length > 0) {
            for (x in options.replaceFields) {
                keys.push({
                    field: options.replaceFields[x],
                    key: options.replaceFields[x],
                    type: "replace",
                    before: x
                });
            }
        }
        if (options.addFields && options.addFields.length > 0) {
            for (x = 0; x < options.addFields.length; x++) {
                if (options.addFields[x] && options.addFields[x].field) {
                    keys.push({
                        field: options.addFields[x].field,
                        key: options.addFields[x].field,
                        type: "add",
                        indexAdd: x
                    });
                }
            }
        }

        if (options.validateKeys) {
            options.validateKeys(keys);
        }
        return keys;
    },
    insertSelect: function (inst, options) {
        var me = this,
            escape = options.hasOwnProperty("escape") ? options.escape : true,
            table = options.table,
            x, q;

        options.qb_keys = options.fields.length > 0 ? '(' + options.fields.join(',') + ')' : '';
        options.table = me.protect_identifiers(null, table, true, escape, false);

        if (options.query) {
            q = options.query;
        } else {
            var queryObj = this.createQueryObject(options);
            this.applyBasicCompile(queryObj);
            q = this._compile_select(queryObj.QB);
            queryObj.destroy();
            queryObj = null;
        }
        options.query = "INSERT INTO " + options.table + options.qb_keys + q;
        options.mode = 'select';
        options.index = -1;
        var result = me.createRsInsert(inst, options);
        x = q = escape = table = options = null;
        // if (autoRun) {
        //     console.trace("auto run insert no configurado");
        // } else {
        return result;
        // }
    },
    insert: function (inst, options) {
        // console.log("insert");
        //        console.log(options)
        var me = this,
            escape = options.hasOwnProperty("escape") ? options.escape : true,
            table = options.table,
            x;
        // autoRun = (typeof autoRun === "undefined") ? true : autoRun;
        options.mode = options.mode || 'basic';
        options.escape = escape;
        options.qb_keys = [];
        options.qb_set = [];

        if (!me.set_insert_batch_pgsql(options, escape)) {
            Nodext.destroyArray(options.qb_keys, options.qb_set, options.records);
            return false;
        }
        if (options.mode === "basic" && options.qb_set.length === 0) {
            return inst.sendError({
                message: "Ocurrio un error al preparar los datos a insertar"
            });
        }
        if (table === '' || !table) {
            return inst.sendError({
                message: "Error in Data Insert/No Found table name"
            });
        }
        var i, total, query;
        if (Array.isArray(options.returnFields) && options.returnFields.length > 0) {
            var fieldsReturn = [];
            for (x = 0; x < options.returnFields.length; x++) {
                fieldsReturn.push(me.protect_identifiers(null, options.returnFields[x]));
            }
            options.returnFields = " returning " + fieldsReturn.join(", ");
            Nodext.destroyArray(fieldsReturn);
        } else {
            options.returnFields = "";
        }
        options.deleteFields = null;
        options.qb_keys_string = options.qb_keys.join(', ');
        options.query = [];
        options.index = -1;
        options.table = me.protect_identifiers(null, table, true, escape, false);
        if (options.mode === "basic") {
            options.insertSize = options.insertSize || 100;
            for (i = 0, total = options.qb_set.length; i < total; i += options.insertSize) {
                query = me._insert_batch(
                    options.table,
                    options.qb_keys_string,
                    options.qb_set.slice(i, i + options.insertSize),
                    options.returnFields);
                options.query.push(query);
            }
        } else if (options.mode === "build") {
            options.insertSize = 1;
        }
        var result = me.createRsInsert(inst, options);
        x = escape = table = total = options = null;
        // if (autoRun) {
        //     console.trace("auto run insert no configurado");
        // } else {
        return result;
        // }
    },
    _insert_batch: function (table, keys, values, returnFields) {
        return 'INSERT INTO ' + table + ' (' + keys + ') VALUES ' + values.join(', ') + returnFields;
    },
    set_insert_batch_pgsql: function (options, escape) {
        var x, escape, property, values, k, records = options.records;
        var me = this;
        //        console.log(options);
        if (!records || (records && records.length === 0)) {
            return false;
        }
        var keysBasic = Nodext.Object.getKeys(records[0]);
        var keys = this.prepareKeysInsertData(keysBasic, options);
        for (x = 0; x < keys.length; x++) {
            options.qb_keys.push(me.protect_identifiers(null, keys[x].key));
        }
        x = escape = property = values = null;
        if (options.mode === "basic") {
            options.qb_set = [];
            this.preparedRecordsInsert(keys, records, escape, options.qb_set, options);
        } else if (options.mode === "build") {
            options.arrayKeys = keys;
        }
        return this;
    },
    pRecInsertNoEscape: function (row, keys, addFields) {
        var values = [], k;
        for (k = 0; k < keys.length; k++) {
            if (keys[k].type === "send") {
                values.push(row[keys[k].field]);
            } else if (keys[k].type === "replace") {
                values.push(row[keys[k].before]);
            } else if (keys[k].type === "add") {
                values.push(addFields[keys[k].indexAdd].value);
            }
        }
        return values;
    },
    buildRecInsert: function (row, rs) {
        var values;
        if (escape) {
            values = this.pRecInsertEscape(row, rs.arrayKeys, rs.addFields);
        } else {
            values = this.pRecInsertNoEscape(row, rs.arrayKeys, rs.addFields);
        }
        var query = this._insert_batch(
            rs.table,
            rs.qb_keys_string,
            ['(' + values.join(",") + ')'],
            rs.returnFields);
        return query;
    },
    pRecInsertEscape: function (row, keys, addFields) {
        var values = [], k;
        for (k = 0; k < keys.length; k++) {
            if (keys[k].type === "send") {
                values.push(this.escape(row[keys[k].field]));
            } else if (keys[k].type === "replace") {
                values.push(this.escape(row[keys[k].before]));
            } else if (keys[k].type === "add") {
                values.push(this.escape(addFields[keys[k].indexAdd].value));
            }
        }
        return values;
    },
    preparedRecordsInsert: function (keys, records, escape, target, options) {
        var x, row, k, values;
        if (escape === false) {
            for (x = 0; x < records.length; x++) {
                row = records[x];
                values = this.pRecInsertNoEscape(row, keys, options.addFields);
                target.push('(' + values.join(",") + ')');
            }
        } else {
            for (x = 0; x < records.length; x++) {
                row = records[x];
                values = this.pRecInsertEscape(row, keys, options.addFields);
                target.push('(' + values.join(",") + ')');
            }
        }
        x = row = k = values = null;
    },
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    ///////////////////////////
    update: function (inst, options) {
        var me = this,
            queryObj = Nodext.create("Nodext.database.query.Object"),
            QBI = queryObj.QB;
        var
            escape = options.escape,
            table = options.table,
            set = options.set,
            where = options.where,
            limit = options.limit;
        escape = (typeof escape === "undefined") ? null : escape;
        // autoRun = (typeof autoRun === "undefined") ? true : autoRun;
        if (set) {
            me.set(QBI, set);
        }
        if (me._validate_update(inst, QBI, table) !== true) {
            return false;
        }
        if (where) {
            me.__SetWhere(queryObj, where);
        }
        if (limit) {
            me.limit(inst, limit);
        }
        options.requireCompile = options.requireCompile || false;
        options.position = -1;

        // var i, total, query;
        var rFields = this._compileRfields(options.returnFields, escape);

        options.query = [me._update(QBI, me.protect_identifiers(QBI, QBI.qb_from[0], true, null, false), QBI.qb_set, rFields)];
        queryObj.destroy();
        var result = me.createRsUpdate(inst, options);
        escape = QBI = options = table = set = limit = queryObj = null;
        // if (autoRun) {
        //     console.trace("auto run update no configurado");
        //     //            var compile = [];
        //     //            compile.push(result);
        //     //            me.initQuery(inst, compile, fn);
        // } else {
        return result;
        // }

    },
    _compileRfields: function (rFields, escape) {
        rFields = rFields || [];

        var str = "";
        if (Array.isArray(rFields) && rFields.length > 0) {
            var fieldsReturn = [], x, field, escape;
            for (x = 0; x < rFields.length; x++) {
                field = rFields[x];
                if (Ext.isString(field)) {
                    fieldsReturn.push(this.protect_identifiers(null, field, escape, null, false));
                } else if (Ext.isArray(field)) {
                    if (field[1]) {
                        fieldsReturn.push(this.protect_identifiers(null, field[0], true, field[1], false));
                    } else {
                        fieldsReturn.push(field[0]);
                    }
                }
            }
            str += "returning " + fieldsReturn.join(", ");
            Nodext.destroyArray(fieldsReturn);
        }
        return str;
    },
    _validate_delete: function (inst, QBI, table) {
        if (table !== '') {
            QBI.qb_from[0] = table;
        } else if (!QBI.qb_from[0]) {
            inst.sendError("no ha pasado la validacion de update cod 2")
        }
        //        console.log("devolvera true");
        return true;
    },
    delete: function (inst, options, fn) {
        var me = this,
            queryObj = Nodext.create("Nodext.database.query.Object"),
            QBI = queryObj.QB,
            escape = options.escape,
            table = options.table,
            where = options.where,
            escape = (typeof escape === "undefined") ? null : escape;
        // autoRun = (typeof autoRun === "undefined") ? true : autoRun;
        if (me._validate_delete(inst, QBI, table) !== true) {
            return false;
        }
        if (where) {
            me.__SetWhere(queryObj, where);
        }
        options.requireCompile = options.requireCompile || false;
        options.query = [me._delete(QBI, me.protect_identifiers(QBI, QBI.qb_from[0], true, null, false))];
        queryObj.destroy();
        //        me._reset_write(QBI);
        var result = me.createRsDelete(inst, options);
        QBI = options = table = escape = where = queryObj = null;
        // if (autoRun) {
        //     console.trace("auto run update no configurado");
        // } else {
        return result;
        // }
    },
    _reset_write: function (QBI) {
        Nodext.destroyMembers(QBI, 'qb_set', 'qb_from', 'qb_join', 'qb_where', 'qb_orderby', 'qb_keys', 'qb_limit');
        Nodext.apply(QBI, {
            'qb_set': [],
            'qb_from': [],
            'qb_join': [],
            'qb_where': [],
            'qb_orderby': [],
            'qb_keys': [],
            'qb_limit': false
        });
    },
    escapeByKey: {
        left: true,
        true: true,
        both: true
    },
    escapeByVal: {
        right: true,
        true: true,
        both: true
    },
    set: function (QBI, key, value, escape) {
        var me = this;
        if (typeof escape !== 'boolean') {
            gescape = this.protectIdentifiers;
        }
        QBI.qb_set = {}, escape, key, value;
        Nodext.Object.each(key, function (k, v) {
            escape = v ? v.escape || gescape : gescape;
            v = v ? v.value || v : v;
            k = k ? k.field || k : k;
            key = me.protect_identifiers(QBI, k, false, this.escapeByKey[escape] ? true : false);
            value = (this.escapeByVal[escape] ? me.escape(v) : v);
            QBI.qb_set[key] = value;
        }, this);
        return me;
    },
    trans_start: function () {
        return {
            query: "BEGIN",
            type: "trans_start",
            requireCompile: false
        };
    },
    trans_complete: function () {
        return {
            query: "END TRANSACTION",
            type: "trans_complete",
            requireCompile: false
        };
    },
    trans_commit: function () {
        return {
            query: "COMMIT",
            type: "trans_commit",
            requireCompile: false
        };
    },
    trans_rollback: function () {
        return {
            query: "ROLLBACK",
            type: "trans_rollback",
            requireCompile: false
        };
    },
    _validate_update: function (inst, QBI, table) {
        if (QBI.qb_set.length === 0) {
            inst.sendError({ success: false, message: "no ha pasado la validacion de update cod 1" })
        }
        if (table !== '') {
            QBI.qb_from[0] = table;
        } else if (!QBI.qb_from[0]) {
            inst.sendError({ success: false, message: "no ha pasado la validacion de update cod 2" })
        }
        return true;
    },
    /**
     * @deprecated
     */
    _merge_cache: function (QBI) {
        //        if (QBI.qb_cache_exists.length === 0) {
        //            return;
        //        } else if (Nodext.Array.contains(QBI.qb_cache_exists, 'select')) {
        //            var qb_no_escape = QBI.qb_cache_no_escape;
        //        }
        //
        //        var x, val, qb_variable, qb_cache_var, qb_new, qb_cache_exists = Nodext.Array.unique(QBI.qb_cache_exists);
        //        for (x = 0; x < qb_cache_exists; x++) {
        //            val = qb_cache_exists [ x];
        //            qb_variable = 'qb_' + val;
        //            qb_cache_var = 'qb_cache' + val;
        //            qb_new = QBI.qb_cache_var;
        //        }
        //         foreach (array_unique($this->qb_cache_exists) as $val) { // select, from, etc.
        //            $qb_variable = 'qb_' . $val;
        //            $qb_cache_var = 'qb_cache_' . $val;
        //            $qb_new = $this->$qb_cache_var;
        //
        //            for ($i = 0, $c = count($this->$qb_variable); $i < $c; $i++) {
        //                if (!in_array($this->{$qb_variable}[$i], $qb_new, TRUE)) {
        //                    $qb_new[] = $this->{$qb_variable}[$i];
        //                    if ($val === 'select') {
        //                        $qb_no_escape[] = $this->qb_no_escape[$i];
        //                    }
        //                }
        //            }
        //
        //            $this->$qb_variable = $qb_new;
        //            if ($val === 'select') {
        //                $this->qb_no_escape = $qb_no_escape;
        //            }
        //        }
    },
    set_update_batch_pgsql: function (QBI, options, index, escape) {
        var x, escape, values;
        var me = this, records;
        records = me.prepareUpdateData(options.records, options);
        //        console.log(records);
        if (!records || (records && records.length === 0)) {
            return false;
        }
        var row, p, index_set, newProperty;
        QBI.qb_set = [];
        //        console.log(records);
        for (x = 0; x < records.length; x++) {
            row = records[x];
            newProperty = {};
            index_set = false;
            for (p in row) {
                if (p === index) {
                    index_set = true;
                }

                newProperty[me.protect_identifiers(QBI, p, false, escape)] = (escape ? row[p] : me.escape(row[p]));

            }
            if (!index_set) {
                break;
            }

            QBI.qb_set.push(newProperty);
        }
        //        console.log(QBI.qb_set);

        //        console.log(QBI.qb_set);
        if (!index_set) {
            return false;
        }
        //        console.log(QBI);
        QBI = x = index = escape = records = row = index_set = newProperty = p = null;
        delete QBI, index_set, row, x, index, escape, records, newProperty, p;
        return this;
    },
    updateBatch: function (inst, options) {
        var me = this,
            x,
            queryObj = Nodext.create("Nodext.database.query.Object"),
            QBI = queryObj.QB;
        var escape = options.escape,
            table = options.table;
        escape = (typeof escape === "undefined") ? null : escape;
        // autoRun = (typeof autoRun === "undefined") ? true : autoRun;
        //        console.log(options);
        if (!options.index || !options.records) {
            inst.sendError({
                message: "Tanto el index como los records deben configurarse para el barrido de actualización",
                success: false
            });
            return false;
        }

        if (!me.set_update_batch_pgsql(QBI, options, options.index, escape)) {
            inst.sendError({
                message: "Uno de los registros no tiene la propiedad index configurada",
                success: false
            });
            return false;
        }

        if (QBI.qb_set.length === 0) {
            inst.sendError({
                message: "No se detecto registros ah actualizar"
            });
            return false;
        }
        if (!table || table === '') {
            if (!QBI.qb_from[0]) {
                inst.sendError({
                    message: "No se configurado la tabla a actualizar"
                });
                return false;
            }
            table = QBI.qb_from[0];
        }
        var chunkSize = options.chunkSize || 100, total, i, query;
        options.query = [];
        options.queryBatch = true;
        options.requireCompile = options.requireCompile || false;
        options.position = -1;
        if (options.where) {
            me.__SetWhere(queryObj, options.where);
        }
        //options.table = me.protect_identifiers(null, table, true, escape, false);
        table = me.protect_identifiers(null, table, true, escape, false);
        var index = this.protect_identifiers(QBI, options.index);
        var updateIndex = options.updateIndex ? this.protect_identifiers(QBI, options.updateIndex) : null;
        for (i = 0, total = QBI.qb_set.length; i < total; i += chunkSize) {

            query = this._update_batch(queryObj, table, QBI.qb_set.slice(i, i + chunkSize), index, updateIndex);
            //            console.log(query);
            options.query.push(query);
        }
        queryObj.destroy();

        var result = me.createRsUpdate(inst, options);
        x = escape = table = QBI = options = queryObj = null;
        //        delete ;
        // if (autoRun) {
        //     console.trace("auto run insert no configurado");
        // } else {
        return result;
        // }

    },
    _update_batch: function (queryObj, table, values, index, updateIndex) {
        var ids = [], final = {};
        this.updBatchIndex(values, index, ids, final, updateIndex);
        var cases = this.updateBatchCase(final);
        if (cases === '') {
            this.updBatchNoIndex(values, index, ids, final);
            cases = this.updateBatchCase(final);
        }
        this.where(queryObj, { field: index + ' IN(' + ids.join(',') + ')', value: undefined, escape: false });
        return 'UPDATE ' + table + ' SET ' + this.substr(cases, 0, -2) + this._compile_wh(queryObj.QB, 'qb_where');
    },
    updateBatchCase: function (final) {
        var cases = '';
        var k, v;
        for (k in final) {
            v = final[k];
            cases += k + " = CASE \n"
                + v.join("\n") + "\n"
                + 'ELSE ' + k + ' END, ';
        }
        return cases;
    },
    updBatchIndex: function (values, index, ids, final, updateIndex) {
        var x, val, field, whField;
        for (x = 0; x < values.length; x++) {
            val = values[x];
            ids.push(val[index]);
            for (field in val) {
                whField = field;
                if (field !== index) {
                    if (updateIndex === field) {
                        whField = index;
                    }
                    if (!final[whField]) {
                        final[whField] = ['WHEN ' + index + ' = ' + val[index] + ' THEN ' + val[field]];
                    } else {
                        final[whField].push('WHEN ' + index + ' = ' + val[index] + ' THEN ' + val[field]);
                    }

                }
            }
        }
    },
    updBatchNoIndex: function (values, index, ids, final) {
        var x, val, field;
        for (x = 0; x < values.length; x++) {
            val = values[x];
            ids.push(val[index]);
            for (field in val) {
                if (!final[field]) {
                    final[field] = ['WHEN ' + index + ' = ' + val[index] + ' THEN ' + val[field]];
                } else {
                    final[field].push('WHEN ' + index + ' = ' + val[index] + ' THEN ' + val[field]);
                }
            }
        }
    },
    initQuery: function (inst, config) {
        if (inst.destroyed) {
            // rsg.destroy();
            return false;
        } else {
            config.inst = inst;
            config.qb = this;
            var rsg = Nodext.create("Nodext.database.ResultGroup", config);
            inst.DBCompiles.push(rsg);
            rsg.init();
        }
    }
});