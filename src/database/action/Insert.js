/**
 * 
 */
Nodext.define("Nodext.database.action.Insert", {
    extend: "Nodext.database.action.Base",
    alias: 'dbaction.insert',
    action: "insert",
    config: {
        resultBatchData: null,
        resultBatchRowCount: null,
        mode: null,
        table: null,
        records: null,
        index: -1
    },
    validateKeys: null,
    qb_keys: null,
    qb_keys_string: null,
    qb_set: null,
    insertSize: null,
    returnFields: null,
    deleteFields: null,
    addFields: null,
    escape: null,
    init: function () {
        this.result = [];
        this.addFields = this.addFields || {};
    },
    continue: function () {
        if (this.mode === "basic") {
            if (this.query[this.index + 1]) {
                return true;
            } else {
                return false;
            }
        } else if (this.mode === "build") {
            if (this.records[this.index + 1]) {
                return true;
            } else {
                return false;
            }
        } else if (this.mode === "select") {
            if (this.index < 0) {
                return true;
            } else {
                return false;
            }
        }
    },
    next: function () {
        this.index++;
    },
    getNext: function (rsg) {
        this.index++;
        if (this.mode === "basic") {
            return this.query[this.index];
        } else if (this.mode === "build") {
            // console.log(this.records);
            this.fireEvent("beforebuildrecord", rsg, this, this.records[this.index], this.index);
            var q = this.qb.buildRecInsert(this.records[this.index], this);
            this.query.push(q);
            return q;
        } else if (this.mode === "select") {
            //            console.log(this.query);
            return this.query;
        }
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
        //        console.log("destroy insert");
        for (var x = 0; x < this.result.length; x++) {
            Nodext.destroyArray(this.result[x].rows, this.result[x].fields);
            Nodext.destroyClass(this.result[x]);
        }
        this.result = null;
        Nodext.destroyArray(this.query, this.records, this.qb_set, this.arrayKeys, this.qb_keys, this.resultBatchData);
        this.callParent();
        delete this;
    }
});