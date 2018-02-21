/**
 * 
 */
Nodext.define("Nodext.database.action.Update", {
    extend: "Nodext.database.action.Base",
    alias: 'dbaction.update',
    action: "update",
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
        //        if()
        //        console.log(this.query);
        //        console.log(this.query[this.position]);
        //        if (this.mode === "basic") {
        return this.query[this.position];

    },
    setResultBatch: function (result) {
        this.result.push(result);
    },
    getDataLastInsert: function () {
        if (this.result[this.result.length - 1]) {
            return this.result[this.result.length - 1].rows || [];
        } else {
            return [];
        }
    },
    getData: function () {
        if (this.resultBatchData) {
            return this.resultBatchData;
        } else {
            var me = this;
            me.resultBatchData = [];
            //            console.log(me.result);
            for (var x = 0; x < me.result.length; x++) {
                if (me.result[x].rows && me.result[x].rows.length > 0) {
                    me.resultBatchData = me.resultBatchData.concat(me.result[x].rows);
                }
            }
            return me.resultBatchData.length > 0 ? me.resultBatchData : null;
        }
    },
    getRow: function () {
        var row;
        for (var x = 0; x < this.result.length; x++) {
            if (this.result[x].rows && this.result[x].rows[0]) {
                row = this.result[x].rows[0];
                break;
            }
        }
        return row;
    },
    getRowsAffected: function () {
        return this.numRows();
    },
    numRows: function () {
        if (this.resultBatchRowCount) {
            return this.resultBatchRowCount;
        } else {
            var me = this;
            this.resultBatchRowCount = 0;
            for (var x = 0; x < me.result.length; x++) {
                if (me.result[x].rowCount) {
                    this.resultBatchRowCount += me.result[x].rowCount;
                }
            }
            return this.resultBatchRowCount;
        }
    },
    getFields: function () {
        return this.result.fields;
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