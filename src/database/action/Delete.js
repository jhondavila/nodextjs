/**
 * 
 */
Nodext.define("Nodext.database.action.Delete", {
    extend: "Nodext.database.action.Base",
    alias: 'dbaction.delete',
    action: "delete",
    config: {
        position: -1
    },
    init: function () {
        this.result = [];
    },
    continue: function () {
        if (this.query[this.position + 1]) {
            return true;
        } else {
            return false;
        }
    },
    next: function () {
        this.position++;
    },
    getNext: function (rsg) {
        this.position++;
        return this.query[this.position];
    },
    setResultBatch: function (result) {
        this.result.push(result);
    },
    destroy: function () {
        for (var x = 0; x < this.result.length; x++) {
            Nodext.destroyArray(this.result[x].rows, this.result[x].fields);
            Nodext.destroyObject(this.result[x]);
        }
        this.result = null;
        Nodext.destroyArray(this.query, this.records);
        Nodext.destroyObject(this.replaceFields);
        this.qb = this.inst = null;
        this.callParent();
        Nodext.destroyClass(this);
        delete this;
    }
});