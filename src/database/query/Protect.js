/**
 * 
 */
Nodext.define("Nodext.database.query.Protect", {
    extend: 'Ext.Mixin',
    $configPrefixed: false,
    config: {
        /**
         * @cfg
         */
        escapeChar: '"',
        /**
         * @cfg
         */
        reservedIdentifiers: ['*'],
        /**
         * @cfg
         */
        protectIdentifiers: true,
        /**
         * @cfg
         */
        dbprefix: '',
        /**
         * @cfg
         */
        likeEscapeChr: '!',
        /**
         * @cfg
         */
        likeEscapeStr: " ESCAPE '{0}' "
    },
    /**
     *  @property {RegExp[]}
     *  Lista de Operadores a interceptar por la clausula where: 
     * 
     *  
     *  - `/\s*(?:<|>|!)?=\s*'/i, // =, <=, >=, !=`
     *  - `/\s*<>?\s*'/i, // <, <>`
     *  - `/\s*>\s*'/i, // >`
     *  - `/\s+IS NULL'/i, // IS NULL`
     *  - `/\s+IS NOT NULL'/i, // IS NOT NULL`
     *  - `/\s+EXISTS\s*\([^\)]+\)/i, // EXISTS(sql)`
     *  - `/\s+NOT EXISTS\s*\([^\)]+\)/i, // NOT EXISTS(sql)`
     *  - `/\s+BETWEEN\s+\S+\s+AND\s+\S+/i, // BETWEEN value AND value`
     *  - `/\s+IN\s*\([^\)]+\)/i, // IN(list)`
     *  - `/\s+NOT IN\s*\([^\)]+\)/i, // NOT IN (list)`
    */
    findOperators: [
        /\s*(?:<|>|!)?=\s*'/i, // =, <=, >=, !=
        /\s*<>?\s*'/i, // <, <>
        /\s*>\s*'/i, // >
        /\s+IS NULL'/i, // IS NULL
        /\s+IS NOT NULL'/i, // IS NOT NULL
        /\s+EXISTS\s*\([^\)]+\)/i, // EXISTS(sql)
        /\s+NOT EXISTS\s*\([^\)]+\)/i, // NOT EXISTS(sql)
        /\s+BETWEEN\s+\S+\s+AND\s+\S+/i, // BETWEEN value AND value
        /\s+IN\s*\([^\)]+\)/i, // IN(list)
        /\s+NOT IN\s*\([^\)]+\)/i, // NOT IN (list)
    ],
    /**
     * @method
     * @private
     * @deprecated
     */
    _escape_identifiers: function (item) {
        var me = this, str;
        if (this.escapeChar == '') {
            return item;
        }
        this.reservedIdentifiers.forEach(function (id) {
            if (item.indexOf('.') !== -1) {
                str = me.escapeChar + item.replace('.', me.escapeChar + '.');
                return me.preg_replace('/[' + me.escapeChar + ']+/', me.escapeChar, str);
            }
        });
        if (item.indexOf('.') !== -1) {
            str = me.escapeChar + item.replace(/\./g, me.escapeChar + '.' + me.escapeChar) + me.escapeChar;
        } else {
            str = me.escapeChar + item + me.escapeChar;
        }
        return me.preg_replace('/[' + me.escapeChar + ']+/', me.escapeChar, str);
    },
    /**
     * @method
     * @private
     */
    protect_identifiers: function (QBI, item, prefix_single, protect_identifiers, field_exists) {
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
        var offset = item.toUpperCase().indexOf(" AS "), idxParent = item.indexOf("(");
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
    /**
     * @method
     * @private
     */
    escape_identifiers: function (item, isAlias) {
        var me = this;
        if (me.escapeChar === '' || me.empty(item) || Nodext.Array.contains(me.reservedIdentifiers, item)) {
            return item;
        } else if (Nodext.isArray(item)) {
            for (var x = 0; x < item.length; x++) {
                item[x] = me.escape_identifiers(item[x]);
            }
            return item;
        } else if ((me.ctype_digit(item) && !isAlias) || item[0] === "'" || (me.escapeChar !== '"' && item[0] === '"') || (item.indexOf("(") !== -1 && !isAlias)) {
            return item;
        }
        var preg_ec = [];
        if (me.empty(preg_ec)) {
            if (Nodext.isArray(me.escapeChar)) {
                preg_ec = [
                    me.preg_quote(me.escapeChar[0], '/'),
                    me.preg_quote(me.escapeChar[1], '/'),
                    me.escapeChar[0],
                    me.escapeChar[1],
                ];
            } else {
                preg_ec[0] = preg_ec[1] = me.preg_quote(me.escapeChar, "/");
                preg_ec[2] = preg_ec[3] = me.escapeChar;
            }
        }
        me.reservedIdentifiers.forEach(function (id) {
            if (item.indexOf('.' + id) !== -1) {
                return me.preg_replace('/' + preg_ec[0] + '?([^' + preg_ec[1] + '\\.]+)' + preg_ec[1] + '?\\./i', preg_ec[2] + '$1' + preg_ec[3] + '.', item);
            }
        });

        return me.preg_replace('/' + preg_ec[0] + '?([^' + preg_ec[1] + '\\.]+)' + preg_ec[1] + '?(\\.)?/ig', preg_ec[2] + '$1' + preg_ec[3] + '$2', item);
    },
    /**
     * @method
     * @private
     */
    _has_operator: function (str) {
        if (typeof str === "string") {
            return !!/(<|>|!|=|\sIS NULL|\sIS NOT NULL|\sEXISTS|\sBETWEEN|\sLIKE|\sIN\s*\(|\s)/i.exec(str.trim());
        } else {
            return false;
        }
    },
    /**
     * @method
     * @private
     */
    escape: function (str) {
        if (typeof str === 'string') {
            return "'" + this.escape_str(str) + "'";
        } else if (Nodext.isNumber(str)) {
            return "'" + str + "'";
        } else if (typeof str === 'boolean') {
            return (str === false) ? "'0'" : "'1'";
        } else if (str === null || typeof str === "undefined") {
            return 'NULL'
        } else if (Nodext.isArray(str) || Nodext.isObject(str)) {
            try {
                return JSON.stringify(str);
            } catch (error) {
                console.log(error);
                console.trace("funcionalidad aun no construida escape");
            }
        }
    },
    /**
     * @method
     * @private
     */
    escape_like_str: function (str) {
        return this.escape_str(str, true);
    },
    /**
     * @method
     * @private
     */
    escape_str: function (str, like) {
        if (Nodext.isArray(str) || Nodext.isObject(str)) {
            //            console.log("==>" + str);
            console.trace("funcionalidad aun no construida escape_str");
        }
        //        if(Nodext.isNumber(str)){}
        str = this._escape_str(str);
        if (like) {
            return this.str_replace([this.likeEscapeChr, '%', '_'], [this.likeEscapeChr + this.likeEscapeChr, this.likeEscapeChr + '%', this.likeEscapeChr + '_'], str);
        }
        return str;
    },
    /**
     * @method
     * @private
     */
    _escape_str: function (str) {
        return this.remove_invisible_characters(str).replace("'", "''");
    },
    /**
     * @method
     * @private
     */
    remove_invisible_characters: function (str, url_encoded) {
        url_encoded = (typeof url_encoded === "undefined") ? true : url_encoded;
        var non_displayables = [];
        var me = this;
        if (url_encoded === true) {
            str = str.replace(/%0[0-8bcef]/, '');
            str = str.replace(/%1[0-9a-f]/, '');
        }
        str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/, '');
        return str;
    },
    /**
     * @method
     * @private
     */
    _get_operator: function (str) {
        var _les = (this.likeEscapeStr !== '') ?
            '\s+' + this.preg_quote(Nodext.String.format(this.likeEscapeStr, this.likeEscapeChr).trim())
            : '';
        var status = false;
        var array = [eval('/\s+LIKE\s+\S+' + _les + '/i'), eval('/\s+NOT LIKE\s+\S+' + _les + '/i')].concat(this.findOperators);
        var text = false;
        Nodext.Array.forEach(array, function (item, index) {
            status = item.exec(str);
            if (!!status) {
                text = status[0];
                return false;
            }
        });
        return text;
    }
});
