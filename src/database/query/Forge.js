/**
 * 
 */
Nodext.define("Nodext.database.query.Forge", {
    extend: 'Nodext.database.query.Base',
    $_createDataBase: 'CREATE DATABASE {0}',
    $_dropDataBase: 'DROP DATABASE {0}',
    $_createTable: 'CREATE TABLE {0} ({1})',
    $_createTableIfNotExists: 'CREATE TABLE IF NOT EXISTS  {0} ({1})',
    $_dropTableIfExists: 'DROP TABLE IF EXISTS {0}',
    $_createSchema: 'CREATE SCHEMA {0}',
    $_createSchemaIfNotExists: 'CREATE SCHEMA IF NOT EXISTS {0}',
    $_dropSchemaIfExists: 'DROP SCHEMA IF EXISTS {0}',
    $_renameTable: '',
    $_default: '',
    $_UseSequence: "nextval('{0}'::regclass)",
    $_CreateSequence: "CREATE SEQUENCE {0};",
    $_DropSequence: "DROP SEQUENCE {0};",
    $_DropSequenceIfExists: "DROP SEQUENCE IF EXISTS {0};",
    $_CreateSequenceIfNotExists: "CREATE SEQUENCE IF NOT EXISTS {0};",
    _castTypeField: {
        'INT2': {
            postgre: {
                type: "smallint",
                useSequence: true,
                typeCastAutoIncrement: 'smallserial',
                fnParser: {
                    default: "tbl_builder.defaultToSmallint"
                }
            },
            mysql: {
                type: "SMALLINT"
            }
        },
        'INT4': {
            postgre: {
                type: "integer",
                useSequence: true,
                typeCastAutoIncrement: 'serial',
                fnParser: {
                    default: "tbl_builder.defaultToInteger"
                }
            },
            mysql: {
                type: "INT"
            }
        },
        'INT8': {
            postgre: {
                type: "bigint",
                useSequence: true,
                typeCastAutoIncrement: 'bigserial',
                fnParser: {
                    default: "tbl_builder.defaultToBigint"
                }
            },
            mysql: {
                type: "BIGINT"
            }
        },
        //PRECISION INEXACTA
        'FLOAT4': {
            postgre: "real",
            mysql: "FLOAT"
        },
        //PRECISION INEXACTA
        'FLOAT8': {
            postgre: "double precision",
            mysql: "DOUBLE"
        },
        //PRECISION EXACTA
        'NUMERIC': {
            postgre: "numeric",
            mysql: "DECIMAL"
        },
        //PRECISION EXACTA
        'DECIMAL': {
            postgre: "numeric",
            mysql: "DECIMAL"
        },
        'TEXT': {
            postgre: "text",
            mysql: "TEXT"
        },
        'CHAR': {
            postgre: "char",
            mysql: "char"
        },
        'VARCHAR': {
            postgre: "varchar",
            mysql: "VARCHAR"
        },
        'JSON': {
            postgre: "json",
            mysql: "TEXT"
        },
        'ARRAY': {
            postgre: "array",
            mysql: "TEXT"
        },
        'XML': {
            postgre: "xml",
            mysql: "TEXT"
        },
        'DATE': {
            postgre: "date",
            mysql: "date"
        },
        'TIME': {
            postgre: "time",
            mysql: "time"
        },
        'TIMESTAMP': {
            postgre: "timestamp with time zone",
            mysql: "DATETIME"
        }
    },
    createDataBase: function (inst, dbName, fn, run) {
        var q = Nodext.String.format(this.$_createDataBase, dbName);
        var me = this, compile = me.queryCompile(inst, q);
        if (typeof run === "undefined" || run === true) {
            var config = {
                results: compile,
                callback: fn
            };
            this.initQuery(inst, config);
        } else {
            return compile;
        }
        me = q = compile = null;
    },
    dropDatabase: function (inst, dbName, fn, run) {
        var q = Nodext.String.format(this.$_dropDataBase, dbName);
        var me = this, compile = me.queryCompile(inst, q);
        if (typeof run === "undefined" || run === true) {
            var config = {
                results: compile,
                callback: fn
            };
            this.initQuery(inst, config);
        } else {
            return compile;
        }
        me = q = compile = null;
    },
    alterTableSchema: function (inst, obj) {
        var ifExists = obj.ifExists || 'normal';
        var q = "";
        if (ifExists === "ignore") {
            q = this.$_createSchemaIfNotExists;
        } else if (ifExists === "drop") {
            q = this.$_dropSchemaIfExists + ";\n" + this.$_createSchema;
        } else if (ifExists === "normal") {
            q = this.$_createSchema;
        }
        var newSchema = this.escape_identifiers(obj.newSchema);
        q = Nodext.String.format(q, newSchema) + ";";

        var root = (obj.schema ? obj.schema + "." : "") + obj.table;
        root = this.escape_identifiers(root);
        obj.query = Nodext.String.format(q + "ALTER TABLE {1} SET SCHEMA {0}", newSchema, root) + ";";
        q = null;
        var rsForge = this.createRsForge(inst, obj);
        return rsForge;
    },
//    alterTable: function () {
//
//    },
    alterTableAddColumn: function (inst, obj) {
        var mods = {
            before: [],
            after: []
        };
        var qColumns = "";
        var root = (obj.schema ? obj.schema + "." : "") + obj.table;
        root = this.escape_identifiers(root);
        if (Array.isArray(obj.columns)) {
            qColumns = this._createColumns(obj.columns, mods);
            for (var x = 0; x < qColumns.length; x++) {
                qColumns[x] = "ADD COLUMN " + qColumns[x];
            }
            qColumns = qColumns.join(",");
        }
        var qBefore = mods.before.join("\n");
        var qAfter = mods.after.join("\n");
        Ext.destroyObject(mods);
        obj.query = Nodext.String.format("{2};ALTER TABLE {0} {1};{3}", root, qColumns, qBefore, qAfter);
        return this.createRsForge(inst, obj);
    },
    alterTableAlterColumn: function (inst, obj) {
        var root = (obj.schema ? obj.schema + "." : "") + obj.table;
        root = this.escape_identifiers(root);
        var qColumns = "";
        var mods = {
            before: [],
            after: []
        };
        if (Array.isArray(obj.columns)) {
            qColumns = this._alterColumns(obj.columns, mods);
            qColumns = qColumns.length > 0 ? qColumns.join(",") : "";
        }
        var qBefore = mods.before.join("\n");
        var qAfter = mods.after.join("\n");
        Ext.destroyObject(mods);
        obj.query = Nodext.String.format("{2};ALTER TABLE {0} {1};{3}", root, qColumns, qBefore, qAfter);
        return this.createRsForge(inst, obj);
    },
    _alterColumns: function (columns, mods) {
        var x, col;
        var listColumns = [], d;
        for (x = 0; x < columns.length; x++) {
            col = columns[x];
            if (Ext.isObject(col)) {
                d = this._buildAlterColumn(col, mods);
                if (d) {
                    listColumns.push(d);
                }
            }
        }
        x = col = d = null;
        return listColumns;
    },
    _calculeAlterTypeColumn: function (name, type, typeLength, col) {
        if ((type.toLowerCase() === "char" || type.toLowerCase() === "varchar") && typeLength) {
            type = type + "(" + typeLength + ")";
        }
        var using = "";
        if (col.fnParser) {
            if (Nodext.isObject(col.fnParser)) {
                if (col.oldType && col.oldCfgType) {
                    if (col.oldCfgType.type && col.fnParser[col.oldCfgType.type]) {
                        using = Nodext.String.format('{0}({1})', col.fnParser[col.oldCfgType.type], this.escape_identifiers(name));
                    } else if (col.fnParser["default"]) {
                        using = Nodext.String.format('{0}({1})', col.fnParser["default"], this.escape_identifiers(name));
                    } else {
                        using = Nodext.String.format('{0}::{1}', this.escape_identifiers(name), type);
                    }
                }
            } else {
                using = Nodext.String.format('{0}({1})', col.fnParser, this.escape_identifiers(name));
            }
        } else {
            using = Nodext.String.format('{0}::{1}', this.escape_identifiers(name), type);
        }
        return Nodext.String.format("ALTER COLUMN {0} TYPE {1} USING {2}", this.escape_identifiers(name), type, using);
    },
    _buildAlterColumn: function (col, mods) {
        col.type = Nodext.isString(col.type) ? col.type.toUpperCase() : null;
        col.oldType = Nodext.isString(col.oldType) ? col.oldType.toUpperCase() : null;
        if (col.oldType && this._castTypeField[col.oldType]) {
            if (Ext.isObject(this._castTypeField[col.oldType].postgre)) {
                col.oldType = this._castTypeField[col.oldType].postgre.type;
            } else {
                col.oldType = this._castTypeField[col.oldType].postgre;
            }
        } else {
            col.oldType = "DEFAULT";
            col.oldCfgType = {};
        }
        var castType;
        if (this._castTypeField[col.type]) {
            castType = this._castTypeField[col.type].postgre;
            if (Ext.isObject(castType)) {
                Nodext.apply(col, Nodext.clone(castType));
            } else {
                col.type = castType;
            }
            castType = null;
        }
        if (this._castTypeField[col.oldType]) {
            castType = this._castTypeField[col.oldType].postgre;
            col.oldCfgType = col.oldCfgType || {};
            if (Ext.isObject(castType)) {
                Nodext.apply(col.oldCfgType, Nodext.clone(castType));
            } else {
                col.oldCfgType = castType;
            }
            castType = null;
        }

        var query = [];
        var name = col.name || "",
                type = col.type || "",
                typeLength = col.length,
                constraint = col.constraint;
//                not_null = "",
//                defaultValue = col.defaultValue;

        if (type) {
            query.push(this._calculeAlterTypeColumn(name, type, typeLength, col));
        }

        if (col.hasOwnProperty("notNull")) {
            query.push(Nodext.String.format("ALTER COLUMN {0} {1}", this.escape_identifiers(name), col.notNull ? " SET NOT NULL" : "DROP NOT NULL"));
        }



        if (col.hasOwnProperty("auto")) {
            if (col.auto === false) {
                mods.before.push(Nodext.String.format(this.$_DropSequenceIfExists, this.escape_identifiers(name)));
                query.push(Nodext.String.format("ALTER COLUMN {0} {1}", this.escape_identifiers(name), 'DROP DEFAULT'));
            } else {
                if (col.autoType === "RESET") {
                    mods.before.push(Nodext.String.format(this.$_DropSequenceIfExists, this.escape_identifiers(name)));
                    mods.before.push(Nodext.String.format(this.$_CreateSequenceIfNotExists, this.escape_identifiers(col.auto)));
                } else if (col.autoType === "CONTINUE") {
                    mods.before.push(Nodext.String.format(this.$_CreateSequenceIfNotExists, this.escape_identifiers(col.auto)));
                } else if (col.autoType === "NORMAL" || col.autoType === null) {
                    mods.before.push(Nodext.String.format(this.$_CreateSequenceIfNotExists, this.escape_identifiers(col.auto)));
                }
                var defaultValue = Nodext.String.format(this.$_UseSequence, this.escape_identifiers(col.auto));
                query.push(Nodext.String.format("ALTER COLUMN {0} {1}", this.escape_identifiers(name), 'SET DEFAULT ' + defaultValue));
            }
        }


        if (query.length > 0) {
            return query.join(",");
        } else {
            return null;
        }
//        if (col.auto && col.useSequence) {
//            Nodext.logEvent("Se esta usando el modo secuencia");
//            if (Nodext.isBoolean(col.auto)) {
//                col.type = col.typeCastAutoIncrement;
//            } else if (Nodext.isString(col.auto)) {
//                defaultValue = Nodext.String.format(this.$_tplUseSequence, this.escape_identifiers(col.auto));
//                var qMods = Nodext.String.format(this.$_tplCreateSequence, this.escape_identifiers(col.auto)) + ";";
//                if (qMods && qMods !== "") {
//                    mods.before.push(qMods);
//                }
//            } else {
//                Nodext.logError("El modo sequiencia fallo");
//            }
//        } else if (col.auto) {
//            Nodext.logError("No se implemento esta seccion del autoincrement o identity");
//        }
//
//        if (type.toLowerCase() === "char" || type.toLowerCase() === "varchar") {
//            type = type + "(" + typeLength + ")";
//        }
//
//        type = " TYPE " + type;
//
////        if (Nodext.isObject(constraint)) {
////            constraint = "CONSTRAINT " + this.escape_identifiers((constraint.name || "")) + " " + (constraint.condition || "");
////        } else if (!Nodext.isString(constraint)) {
////            constraint = "";
////        }
//        if (defaultValue) {
//            if (col.defaultIsValue) {
//                defaultValue = ' DEFAULT ' + this.escape(defaultValue);
//            } else {
//                defaultValue = ' DEFAULT ' + defaultValue;
//            }
//        } else {
//            defaultValue = "";
//        }
//        return Nodext.String.format('{0} {1} {2}{3}{4}', this.escape_identifiers(name), type, constraint, defaultValue, not_null);
    },
    alterTableName: function (inst, obj) {
        var root = this.escape_identifiers((obj.schema ? obj.schema + "." : "") + obj.table);
        var newName = this.escape_identifiers(obj.renameTo);
        obj.query = Nodext.String.format("ALTER TABLE {0} RENAME TO {1};",
                root,
                newName);

        var rsForge = this.createRsForge(inst, obj);
        return rsForge;
    },
    dropTable: function (inst, obj) {
        var root = this.escape_identifiers((obj.schema ? obj.schema + "." : "") + obj.table);
        obj.query = Nodext.String.format("DROP TABLE {0};", root);

        var rsForge = this.createRsForge(inst, obj);
        return rsForge;
    },
    createTable: function (inst, obj) {
        var q = "";
        var ifExists = obj.ifExists || 'normal';
        if (ifExists === "ignore") {
            q = this.$_createTableIfNotExists;
        } else if (ifExists === "drop") {
            q = this.$_dropTableIfExists + ";\n" + this.$_createTable;
        } else if (ifExists === "normal") {
            q = this.$_createTable;
        }
        var root = (obj.schema ? obj.schema + "." : "") + obj.table;
        root = this.escape_identifiers(root);
        var qColumns = "";
        var mods = {
            before: [],
            after: []
        };
        if (Array.isArray(obj.columns)) {
            qColumns = this._createColumns(obj.columns, mods);
            qColumns = qColumns.join(",");
        }
        var qBefore = mods.before.join("\n");
        var qAfter = mods.after.join("\n");
        Ext.destroyObject(mods);

        obj.query = qBefore + Nodext.String.format(q, root, qColumns) + qAfter;
        q = null;
        var rsForge = this.createRsForge(inst, obj);
        return rsForge;
    },
    _createColumns: function (columns, mods) {
        var x, col;
        var listColumns = [];
        for (x = 0; x < columns.length; x++) {
            col = columns[x];
            if (Ext.isObject(col)) {
                listColumns.push(this._buildColumn(col, mods));
            }
        }
        return listColumns;
    },
    _buildColumn: function (col, mods) {
        if (!col) {
            col = {
                type: "VARCHAR"
            };
            Nodext.logError("columna no definida asumiendo VARCHAR por defecto");
        } else if (!Nodext.isString(col.type)) {
            col.type = 'VARCHAR';
            Nodext.logError("Columnas TYPE no es un string, asumiendo VARCHAR");
        }
        col.type = col.type.toUpperCase();

        if (!this._castTypeField[col.type]) {
            Nodext.logError("La columna " + col.type + " no existe en la configuraciones, asumiendo VARCHAR por defecto");
        }
        var castType;
        if (this._castTypeField[col.type]) {
            castType = this._castTypeField[col.type].postgre;
            if (Ext.isObject(castType)) {
                Nodext.apply(col, Nodext.clone(castType));
            } else {
                col.type = castType;
            }
            castType = null;
        }
        var name = col.name || "",
                type = col.type || "",
                typeLength = col.length,
                constraint = col.constraint,
                not_null = "",
                defaultValue = col.defaultValue;
        if (col.auto && col.useSequence) {
            Nodext.logEvent("Se esta usando el modo secuencia");
            if (Nodext.isBoolean(col.auto)) {
                col.type = col.typeCastAutoIncrement;
            } else if (Nodext.isString(col.auto)) {
                defaultValue = Nodext.String.format(this.$_UseSequence, this.escape_identifiers(col.auto));
                var qMods = Nodext.String.format(this.$_CreateSequence, this.escape_identifiers(col.auto));
                if (qMods && qMods !== "") {
                    mods.before.push(qMods);
                }
            } else {
                Nodext.logError("El modo sequiencia fallo");
            }
        } else if (col.auto) {
            Nodext.logError("No se implemento esta seccion del autoincrement o identity");
        }

        if (typeLength && (type.toLowerCase() === "char" || type.toLowerCase() === "varchar")) {
//        if (type.toLowerCase() === "char" || type.toLowerCase() === "varchar"){
            type = type + "(" + typeLength + ")";
        }

        if (Nodext.isObject(constraint)) {

            if (constraint.type === "PK") {
                constraint.condition = "PRIMARY KEY";
                constraint = "CONSTRAINT " + this.escape_identifiers((constraint.name || "")) + " " + (constraint.condition || "");
            }



        } else if (!Nodext.isString(constraint)) {
            constraint = "";
        }
        if (defaultValue) {
            if (col.defaultIsValue) {
                defaultValue = ' DEFAULT ' + this.escape(defaultValue);
            } else {
                defaultValue = ' DEFAULT ' + defaultValue;
            }
        } else {
            defaultValue = "";
        }
        if (col.hasOwnProperty("notNull")) {
            not_null = col.notNull ? " NOT NULL " : " NULL";
        }
        return Nodext.String.format('{0} {1} {2}{3}{4}', this.escape_identifiers(name), type, constraint, defaultValue, not_null);
    }
});