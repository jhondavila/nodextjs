/**
 * 
 */
Nodext.define("Nodext.database.postgre.Builder", {
    extend: "Nodext.database.query.Builder",
    alias: "qb.postgre",
    type: "postgre",
    alternateClassName: ["Nodext.querybuilder.Postgre", "Nodext.qb.Postgre"],
    // singleton: true,
    config: {
        reservedIdentifiers: ['*', 'CURRENT_DATE', '::text', '::date', '::integer']
    },
    constructor: function (config) {
        Nodext.apply(this, config || {});
        this.callParent(arguments);
    },
    _limit: function (QBI, sql) {
        return sql + ' LIMIT ' + QBI.qb_limit + (QBI.qb_offset ? ' OFFSET ' + QBI.qb_offset : '');
    },
    createRSTrans: function (inst, cfgQuery) {
        var cfg = {};
        Nodext.apply(cfg, cfgQuery);
        cfg.inst = inst;
        cfg.qb = this;
        return Ext.create("Nodext.database.action.Transaction", cfg);
    },
    createResult: function (inst, cfgQuery) {
        var cfg = {};
        Nodext.apply(cfg, cfgQuery);
        cfg.inst = inst;
        cfg.qb = this;
        return Ext.create("Nodext.database.action.Read", cfg);
    },
    createRsInsert: function (inst, cfgQuery) {
        var cfg = {};
        Nodext.apply(cfg, cfgQuery);
        cfg.inst = inst;
        cfg.qb = this;
        return Ext.create("Nodext.database.action.Insert", cfg);
    },
    createRsForge: function (inst, cfgQuery) {
        var cfg = {};
        Nodext.apply(cfg, cfgQuery);
        cfg.inst = inst;
        cfg.qb = this;
        return Ext.create("Nodext.database.action.Forge", cfg);
    },
    createRsUpdate: function (inst, cfgQuery) {
        var cfg = {};
        Nodext.apply(cfg, cfgQuery);
        cfg.inst = inst;
        cfg.qb = this;
        return Ext.create("Nodext.database.action.Update", cfg);
    },
    createRsDelete: function (inst, cfgQuery) {
        var cfg = {};
        Nodext.apply(cfg, cfgQuery);
        cfg.inst = inst;
        cfg.qb = this;
        return Ext.create("Nodext.database.action.Delete", cfg);
    },
    protect_identifiers: function (QBI, item, prefix_single, protect_identifiers, field_exists) {
        // console.log("protect_identifiers")
        //        console.log(item);
        prefix_single = (typeof prefix_single === "undefined") ? false : prefix_single;
        protect_identifiers = (typeof protect_identifiers === "undefined") ? null : protect_identifiers;
        field_exists = (typeof field_exists === "undefined") ? true : field_exists;
        var me = this,
            QB = QBI,
            x;

        if (!Nodext.isBoolean(protect_identifiers)) {
            protect_identifiers = me.protectIdentifiers;
        }

        if (Nodext.isArray(item)) {
            console.trace("'protect_identifiers' parte del servidor no implementada");
            //             $escaped_array = array();
            //            foreach ($item as $k => $v) {
            //                $escaped_array[$this->protect_identifiers($k)] = $this->protect_identifiers($v, $prefix_single, $protect_identifiers, $field_exists);
            //            }
        }
        // This is basically a bug fix for queries that use MAX, MIN, etc.
        // If a parenthesis is found we know that we do not need to
        // escape the data or add a prefix. There's probably a more graceful
        // way to deal with this, but I'm not thinking of it -- Rick
        //
        // Added exception for single quotes as well, we don't want to alter
        // literal strings. -- Narf
        var offset = item.toUpperCase().indexOf(" AS "), 
        idxParent = item.indexOf("(");
        if (idxParent !== -1) {
            if (/(MIN|MAX|SUM|AVG)\s*\([^\)]+\)/i.exec(item)) {
                return item;
            }
        }

        //   Original method
        //   if(item.indexOf("'") !== -1){
        //    return item;
        //   }
        //   Edited by method join in multiple conditions] example:
        //   r_b.id_rol_base = r_comp_b.id_rol_base and r_b.swt_status = '0' and r_b.id_org = 1
        //   detect  -> ' <- by 

        if (item.indexOf("'") !== -1 && !this.stringMatchAll(item, /\sAND\s|\sOR\s/ig)) {
            return item;
        }
        // Convert tabs or multiple spaces into single spaces
        item = item.replace(/\s+/, ' ', item);
        var alias, operator, subAlias;
        if ((offset) > -1) {
            alias = (protect_identifiers) ? me.substr(item, offset, 4) + me.escape_identifiers(me.substr(item, offset + 4), true) : me.substr(item, offset);
            item = me.substr(item, 0, offset);
        } else if ((offset = item.indexOf(' ')) > -1) {
            subAlias = me.substr(item, offset);
            operator = this._has_operator(subAlias);
            if (operator) {
                alias = subAlias;
            } else {
                alias = (protect_identifiers) ? ' ' + me.escape_identifiers(me.substr(item, offset + 1)) : me.substr(item, offset);
            }
            //            console.log(alias.green);
            item = me.substr(item, 0, offset);
        } else {
            alias = '';
        }

        // Break the string apart if it contains periods, then insert the table prefix
        // in the correct location, assuming the period doesn't indicate that we're dealing
        // with an alias. While we're at it, we will escape the components
        if (item.indexOf('.') !== -1) {
            //            console.log(item);
            var parts = item.split(".");
            // Does the first segment of the exploded item match
            // one of the aliases previously identified? If so,
            // we have nothing more to do other than escape the item
            if (QB) {
                if (Nodext.Array.contains(QB.qb_aliased_tables, parts[0])) {
                    if (protect_identifiers === true) {
                        for (x = 0; x < parts.length; x++) {
                            if (!Nodext.Array.contains(me.reservedIdentifiers, item[x])) {
                                parts[x] = me.escape_identifiers(parts[x]);
                            }
                        }
                        item = parts.join(".");
                    }

                    //                console.log(alias.red);
                    //                console.log(item + alias);
                    return item + alias;
                }
            }

            // Is there a table prefix defined in the config file? If not, no need to do anything
            if (me.dbprefix !== '') {
                console.trace("me.dbprefix");
            }
            if (protect_identifiers === true) {
                item = me.escape_identifiers(item);
            }
            //            console.log(item + alias);
            return item + alias;
        }

        if (me.dbprefix !== '') {
            console.trace("me.dbprefix");
        }
        if (protect_identifiers === true && !Nodext.Array.contains(me.reservedIdentifiers, item)) {
            item = me.escape_identifiers(item);
        }
        //        console.log(item + alias);
        return item + alias;
    },
});