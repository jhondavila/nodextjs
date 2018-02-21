/**
 * 
 * Las consultas de tipo seleccion generan un QueryObject el cual mantiene todas
 * las configuraciones pasadas al querybuilder para despues ser compiladas.
 * 
 */
Nodext.define("Nodext.database.query.Object", {
    extend: "Ext.Base",
    $configPrefixed: false,
    /**
     * @property {Array[]/String[]/Object[]} select
     *  
     * ## Ejemplo #1
     * 
     * Consulta basica con select: 
     * 
     *     var qObj = new Nodext.database.query.Object({
     *       select: [
     *           "id_app,name"
     *       ],
     *       from: "core.app"
     *     });
     *     // SELECT "id_app", "name" FROM "core"."app"
     * 
     * ## Ejemplo #2
     * 
     * Ejemplo de select con columnas separadas por un delimitador ",".
     * 
     * Tambien se puede apreciar un arreglo el cual contiene las columnas 4 y 5.
     * 
     *     var qObj = new Nodext.database.query.Object({
     *       select: [
     *           "id_app",
     *           "name,icon_cls",
     *           ["cfg,swt_status"]
     *           //["*"] todas las columnas
     *       ],
     *       from: "core.app"
     *     });
     *     // SELECT "id_app", "name", "icon_cls", "cfg", "swt_status" 
     *     // FROM "core"."app"
     * 
     * ## Ejemplo #3
     * 
     * Cuando se especifica un {@link Array} este puede contener:
     * 
     *  - `Columnas {String}`
     *  - `Proteger identificadores {Boolean}`
     *  - `Separator {String}` 
     * 
     * Se puede apreciar un claro ejemplo a continuacion:
     * 
     *     var qObj = new Nodext.database.query.Object({
     *             select : [
     *                  ["id_app,name",true],
     *                  ["alias,icon_cls",false],
     *                  //cuando el segundo parametro el el arreglo es false, no se escapa los valore.
     *                  ["cfg;swt_delete",true,";"] 
     *             ],
     *             from : "core.app"
     *     });
     *     //SELECT "id_app", "name", alias, icon_cls, "cfg", "swt_delete" 
     *     //FROM "core"."app"
     * 
     *  **Note:** Cuando el protector de identificadores es false, la columna pasada no sera evaluada,
     *  por lo tanto su valor no sera protegido.En este ejemplo se puede apreciar que las columnas 3 y 4 no se encuentran encomilladas.
     * 
     * ## Ejemplo #4
     * 
     * ### Funciones Sum,Max,Min,Avg 
     * 
     *     var qObj = new Nodext.database.query.Object({
     *       select: [
     *           {
     *               type: "max",
     *               col: "id_app",
     *               alias: "max_id_app",
     *               escape: false
     *           },
     *           {
     *               type: "min",
     *               col: "id_app",
     *               alias: "min_id_app",
     *               escape: true
     *           },
     *           {
     *               type: "avg",
     *               col: "id_app"
     *           },
     *           {
     *               type: "sum",
     *               col: "id_app",
     *               alias : "sum_id_app"
     *           }
     *       ],
     *       from: "core.app"
     *     });
     *     //SELECT MAX(id_app) AS max_id_app, MIN("id_app") AS "min_id_app",
     *     //AVG("id_app") AS "id_app", SUM("id_app") AS "id_app"
     *     //FROM "core"."app"
     * 
     * 
     * 
     * 
     * ## Ejemplo #5
     * 
     * Cuando se añade un {@link Object} podemos especificar el tipo de select a utilizar con la propiedad "type":
     * 
     *  - `select o subselect`
     *  - `case`
     *  - `template` 
     * 
     * ### Subselect
     * Ejemplo de type select/subselect:
     * 
     *     var qObj = new Nodext.database.query.Object({
     *       select: [
     *           ["id_app,name"],
     *           {
     *               type: "select", // select|subselect
     *               alias: "id_node_parent",
     *               select: ["parent_node_k"],
     *               from: "core.node_tree",
     *               where: [
     *                   {
     *                       field: "child_node_k",
     *                       value: "core.app.id_app",
     *                       escape: false
     *                   },
     *                   {
     *                       field : "child_node_k",
     *                       value : 0
     *                   }
     *               ]
     *           }
     *       ],
     *       from: "core.app",
     *       where: {
     *           swt_status: 0
     *       }
     *     });
     *     // select "id_app","name",
     *     // (select "parent_node_k" from "node_tree" where "child_node" = "app"."id_node" and "path_length" = '0') as id_node_parent
     *     // from "app" where "swt_status" = '0'
     * 
     * ### Select Case 
     * Ejemplo de type case:
     * 
     *     var qObj = new Nodext.database.query.Object({
     *       select: [
     *           ["id_app,name"],
     *           {
     *               type: "case",
     *               alias: "estado",
     *               conditions: [
     *                   {
     *                       when: "swt_status ::integer > 0",
     *                       then: "'Activo'"
     *                   },
     *                   {
     *                       when: "id_app > 0 and id_app < 100 and swt_status ::integer > 0",
     *                       then: "'Sys.Activo'"
     *                   }
     *               ],
     *               default: {
     *                   then: "'Deshabilitado'"
     *               },
     *           }
     *       ],
     *       from: "core.app",
     *       where: {
     *           swt_status: 0
     *       }
     *     });
     *     //SELECT 
     *     //"id_app", "name", 
     *     //CASE 
     *     //  WHEN "swt_status" ::integer > 0 THEN 'Activo' 
     *     //  WHEN "id_app" > 0 and "id_app" < '100' and "swt_status" ::integer > 0 THEN 'Sys.Activo' 
     *     //  ELSE 'Deshabilitado' 
     *     //END estado 
     *     //FROM "core"."app" 
     *     //WHERE "swt_status" = '0'
     *
     * ### Select Template 
     * Las configuraciones que se le pueden pasar a tipo template son las siguientes:
     *
     *  - `tpl - Nos permite definir una cadena tokenizada. Cada token debe ser único y debe incrementarse en el formato {0}, {1}, etc.`
     *  - `replace - Definimos los valores a reemplzar en la cadena tokenizada´ con un objeto con propiedades numericas incrementandose (0,1,2,3,...)`
     * 
     * Ejemplo de type template
     * 
     *     var qObj = new Nodext.database.query.Object({
     *       select: [
     *           "id_app,name",
     *           {
     *               type: "template",
     *               tpl: "{0},{1}",
     *               replace: {
     *                   0: {
     *                       columns: [
     *                           "icon_cls"
     *                       ]
     *                   },
     *                   1: {
     *                       columns: [
     *                           "cfg,swt_status"
     *                       ]
     *                   }
     *               }
     *           },
     *           {
     *               type: "template",
     *               tpl: "({0}) as parent_node_k",
     *               replace: {
     *                   0: {
     *                       type: "select",
     *                       select: ["parent_node_k"],
     *                       from: "core.node_tree",
     *                       where: [
     *                           {
     *                               field: "child_node_k",
     *                               value: "core.app.id_app",
     *                               escape: false
     *                           },
     *                           {
     *                               field: "child_node_k",
     *                               value: 0
     *                           }
     *                       ]
     *                   }
     *               }
     *           }
     *       ],
     *       from: "core.app"
     *     });
     *     //SELECT "id_app", "name", "icon_cls","cfg", "swt_status", 
     *     //(SELECT "parent_node_k" FROM "core"."node_tree" WHERE child_node_k = core.app.id_app AND "child_node_k" = '0') as parent_node_k 
     *     //FROM "core"."app"
     * 
     */
    select: undefined,
    /**
     * @property {String/Object/String[]}
     * 
     * ## Ejemplo #1
     * 
     * Consulta basica con from: 
     * 
     *     var qObj = new Nodext.database.query.Object({
     *       select: [
     *           "*"
     *       ],
     *       from: "core.app"
     *     });
     *     // SELECT * FROM "core"."app"
     * 
     * ## Ejemplo #2
     * 
     * Consulta multiple from: 
     * 
     *     var qObj = new Nodext.database.query.Object( {
     *           select: ["*"],
     *           from: ["core.app","core.node_tree"],
     *           where: [
     *               {
     *                   field : "id_app ",
     *                   value : "child_node_k",
     *                   escape : false
     *               },
     *               {
     *                   field : "path_length",
     *                   value : 1
     *               }
     *           ]
     *       });
     *     // SELECT * FROM "core"."app", "core"."node_tree" WHERE id_app = child_node_k AND "path_length" = '1'
     * 
     * 
     * ## Ejemplo #3
     * Consulta multiple fromselect: 
     * 
     *     var qObj = new Nodext.database.query.Object( {
     *       select: ["*"],
     *       from: {
     *           type : "select",
     *           alias : "my_table",
     *           select : ["id_app,name,icon_cls"],
     *           from : "core.app"
     *       }
     *     });
     *     // SELECT * FROM (SELECT "id_app", "name", "icon_cls" FROM "core"."app") as "my_table"
     *  
     *
     * ## Ejemplo #3
     * Consulta multiple frompivot basic: 
     * 
     *     var qObj = new Nodext.database.query.Object({
     *               type: "pivot",
     *               data: {
     *                   select: ["rowid, attribute, value"],
     *                   from: "ct",
     *                   where: [
     *                       {
     *                           field: "attribute",
     *                           value: "att2"
     *                       },
     *                       {
     *                           type: "or_where",
     *                           field: "attribute",
     *                           value: "att3"
     *                       }
     *                   ]
     *               },
     *               output: {
     *                   row_name: "text",
     *                   category_1: "text",
     *                   category_2: "text",
     *                   category_3: "text"
     *               }
     *     });
     *     //SELECT * FROM 
     *     //crosstab (
     *     //$$ SELECT "rowid", "attribute", "value" FROM "ct" WHERE "attribute" = 'att2' OR "attribute" = 'att3' $$)
     *     //as ct ("row_name" text,"category_1" text,"category_2" text,"category_3" text)
     *
     * Consulta multiple frompivot with cols: 
     * 
     *     var qObj = new Nodext.database.query.Object({
     *           select: ["*"],
     *           from: {
     *               type: "pivot",
     *               alias: "ct",
     *               data: {
     *                   select: ["year,month,qty"],
     *                   from: "public.sales"
     *               },
     *               cols: {
     *                   select: ["m"],
     *                   from: [
     *                       ["generate_series(1,12) m", true, ';']
     *                   ]
     *               },
     *               output: {
     *                   year: "integer",
     *                   "Jan": "integer",
     *                   "Feb": "integer",
     *                   "Mar": "integer",
     *                   "Apr": "integer",
     *                   "May": "integer",
     *                   "Jun": "integer",
     *                   "Jul": "integer",
     *                   "Aug": "integer",
     *                   "Sep": "integer",
     *                   "Oct": "integer",
     *                   "Nov": "integer",
     *                   "Dec": "integer"
     *               }
     *           }
     *      });
     *     //SELECT * FROM crosstab 
     *     //($$ SELECT "year", "month", "qty" FROM "public"."sales" $$, $$SELECT "m" FROM generate_series(1,12) "m"$$) as ct 
     *     //("year" integer,"Jan" integer,"Feb" integer,"Mar" integer,"Apr" integer,"May" integer,"Jun" integer,"Jul" integer,
     *     //"Aug" integer,"Sep" integer,"Oct" integer,"Nov" integer,"Dec" integer)
     *
     * 
     */
    from: undefined,
    /**
     * @property {Object/Array[]/Object[]}
     */
    where: undefined,
    /**
     * @property {Array[]}
     */
    join: undefined,
    /**
     * @property {Boolean}
     */
    distinct: undefined,
    /**
     * @property {Number}
     */
    start: undefined,
    /**
     * @property {Number}
     */
    limit: undefined,
    /**
     * @property {Array/Array[]}
     */
    group_by: undefined,
    /**
     * @property {Array/Array[]}
     */
    order_by: undefined,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        this.QB = {
            'qb_select': [],
            'qb_from': [],
            'qb_join': [],
            'qb_where': [],
            'qb_groupby': [],
            'qb_having': [],
            'qb_orderby': [],
            'qb_aliased_tables': [],
            'qb_no_escape': [],
            'qb_distinct': false,
            'qb_limit': false,
            'qb_offset': false,
            'qb_where_group_started': false,
            'qb_where_group_count': false,
            'qb_caching': false,
            'qb_cache_having': [],
            'qb_cache_where': [],
            'qb_set': [],
            'qb_keys': []
        };
    },
    destroy: function () {
        this.callParent();
        Nodext.destroyArray(this.QB.qb_select, this.QB.qb_from, this.QB.qb_join, this.QB.qb_where, this.QB.qb_groupby, this.QB.qb_having, this.QB.qb_orderby);
        Nodext.destroyArray(this.QB.qb_aliased_tables, this.QB.qb_no_escape, this.QB.qb_cache_having, this.QB.qb_cache_where, this.QB.qb_set, this.QB.qb_keys, this.QB.qb_keys_string);
        Nodext.destroyClass(this);
        delete this;
    }
});