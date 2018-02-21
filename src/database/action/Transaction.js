/**
 * 
 */
Nodext.define("Nodext.database.action.Transaction", {
    extend: "Nodext.database.action.Base",
    alias: 'dbaction.transaction',
    action: "transaction",
    config: {
        queryObject: null,
        //        requireCompile: fals,
        //        compileReady: false,
    },
    init: function () {
        //        if (this.requireCompile) {
        //            this.compileQuery();
        //        } else {
        //            this.compileReady = true;
        //        }
    },
    //    compileQuery: function () {
    //        var me = this;
    //        this.qb.applyBasicCompile(this.queryObject);
    //        this.query = this.qb._compile_select(this.queryObject.QB);
    //        this.setQuery(this.query);
    //        me.compileReady = true;
    //    },
    getData: function () {
        return this.result && this.result.rows ? this.result.rows : null;
    },
    getRow: function () {
        return (this.result.rows && this.result.rows[0]) ? this.result.rows[0] : null;
    },
    getTotal: function (key) {
        var total = 0;
        key = key || "count";
        if (this.result && this.result.rows && this.result.rows[0] && this.result.rows[0][key]) {
            total = parseInt(this.result.rows[0][key]);
        }
        key = null;
        return total;
    },
    numRows: function () {
        return this.result.rowCount;
    },
    getFields: function () {
        return this.result.fields;
    },
    destroy: function () {
        //        Nodext.destroy(this.queryObject);
        if (this.result) {
            Nodext.destroyArray(this.result.rows, this.result.fields);
        }
        Nodext.destroyClass(this.result);
        this.callParent();
        Nodext.destroyClass(this);
        delete this;
    }

});