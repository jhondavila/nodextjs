Ext.Boot.Entry.prototype.loadSync = function () {
    var me = this,
        complete = function () {
            me.loaded = me.evaluated = me.done = true;
            me.notifyRequests();
        };
    var success;
    try {
        require(this.getLoadUrl());
        success = true;
    } catch (e) {
        success = false;
        console.log("error al buscar el archivo " + this.getLoadUrl());
    }
    if (success) {
        complete();
    } else {
        me.error = true;
        complete();
    }
};

Ext.create = function () {
    var Manager = Ext.ClassManager;
    var name = arguments[0],
        nameType = typeof name, error = false,
        args = Array.prototype.slice.call(arguments, 1),
        cls;

    if (nameType === 'function') {
        cls = name;
    } else {
        if (nameType !== 'string' && args.length === 0) {
            args = [name];
            if (!(name = name.xclass)) {
                name = args[0].xtype;
                if (name) {
                    name = 'widget.' + name;
                }
            }
        }

        //<debug>
        if (typeof name !== 'string' || name.length < 1) {
            throw new Error("[Ext.create] Invalid class name or alias '" + name +
                "' specified, must be a non-empty string");
        }
        //</debug>

        name = Manager.resolveName(name);
        cls = Manager.get(name);
    }

    // Still not existing at this point, try to load it via synchronous mode as the last resort
    if (!cls) {
        //<debug>
        //<if nonBrowser>

        //</if>
        //                Ext.log.warn("[Ext.Loader] Synchronously loading '" + name + "'; consider adding " +
        //                     "Ext.require('" + name + "') above Ext.onReady");
        //</debug>
        Ext.syncRequire(name);

        cls = Manager.get(name);
    }

    //<debug>

    if (!cls) {
        error = true;
        console.log("[Ext.create] Unrecognized class name / alias: " + name);
        //                throw new Error("[Ext.create] Unrecognized class name / alias: " + name);
    }

    if (typeof cls !== 'function') {
        error = true;
        console.log("[Ext.create] Singleton '" + name + "' cannot be instantiated.");
        //                throw new Error("[Ext.create] Singleton '" + name + "' cannot be instantiated.");
    }
    //</debug>

    if (error) {
        return false;
    } else {
        return Manager.getInstantiator(args.length)(cls, args);
    }
};

Nodext.apply(Ext.ClassManager, {
    getNamesByExpression: function (expression, exclude, accumulate) {
        var me = this,
            aliasToName = me.aliasToName,
            alternateToName = me.alternateToName,
            nameToAliases = me.nameToAliases,
            nameToAlternates = me.nameToAlternates,
            map = accumulate ? exclude : {},
            names = [],
            expressions = Ext.isString(expression) ? [expression] : expression,
            length = expressions.length,
            wildcardRe = me.wildcardRe,
            expr, i, list, match, n, name, regex;

        for (i = 0; i < length; ++i) {
            if ((expr = expressions[i]).indexOf('*') < 0) {
                // No wildcard
                if (!(name = aliasToName[expr])) {
                    if (!(name = alternateToName[expr])) {
                        name = expr;
                    }
                }

                if (!(name in map) && !(exclude && (name in exclude))) {
                    map[name] = 1;
                    names.push(name);
                }
            } else {
                Ext.loadFilesByPath(null, expr);
                regex = new RegExp('^' + expr.replace(wildcardRe, '(.*?)') + '$');
                for (name in nameToAliases) {
                    if (!(name in map) && !(exclude && (name in exclude))) {
                        if (!(match = regex.test(name))) {
                            n = (list = nameToAliases[name]).length;
                            while (!match && n-- > 0) {
                                match = regex.test(list[n]);
                            }

                            list = nameToAlternates[name];
                            if (list && !match) {
                                n = list.length;
                                while (!match && n-- > 0) {
                                    match = regex.test(list[n]);
                                }
                            }
                        }

                        if (match) {
                            map[name] = 1;
                            names.push(name);
                        }
                    }
                }
            }
        }
        return names;
    },

});