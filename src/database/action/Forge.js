/**
 * 
 */
Nodext.define("Nodext.database.action.Forge", {
    extend: "Nodext.database.action.Base",
    alias: 'dbaction.forge',
    action: "forge",
    config: {
        queryObject: null,
        requireCompile: true,
        compileReady: true,
        result: null
    },
    init: function () {
        //        this.result = ;
    },
    continue: function () {
        if (this.hasExecute) {
            return false;
        } else {
            return true;
        }
    },
    getNext: function (rsg) {
        this.hasExecute = true;
        return this.query;
    },
    setResultBatch: function (result) {
        this.result = result;
    },
    destroy: function () {
        Nodext.destroy(this.queryObject);
        if (this.result) {
            Nodext.destroyArray(this.result.rows, this.result.fields);
        }
        Nodext.destroyClass(this.result);
        this.callParent();
        Nodext.destroyClass(this);
        delete this;
    }

});