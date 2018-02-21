/**
 * 
 */
Nodext.define("Nodext.database.ResultGroup", {
    extend: "Ext.Base",
    $configPrefixed: false,
    mixins: {
        observable: 'Ext.util.Observable'
    },
    config: {
        id: null,
        callback: null,
        inst: null,
        results: null,
        resultCur: null,
        resultIndex: null,
        openTrans: null,
        escapeCommit: 0,
        qb: null,
        params: null,
        flagError: false,
        msgError: null,
        onErrorResMsg: true
    },
    constructor: function (config) {
        Nodext.apply(this, config || {});
        this.id = Nodext.id(null, "rsGroup-");
        this.initConfig(config);
        this.mixins.observable.constructor.call(this, config);
        this.result = this.result || [];
    },
    init: function () {
        this.initConnection();
    },
    getParams: function (item) {
        return this.params && this.params[item] ? this.params[item] : null;
    },
    initConnection: function () {
        var me = this;
        if (!me.inst.DBActiveCnx) {
            me.inst.setActiveCnx();
        } else if (me.inst.DBActiveCnx && !me.inst.DBActiveCnx.open && !me.inst.DBActiveCnx.init) {
            //            console.log("existe una conexion pero no esta abierta ni inicializando")
        } else if (me.inst.DBActiveCnx && !me.inst.DBActiveCnx.open && me.inst.DBActiveCnx.init) {
            //            console.log("existe una conexion pero no esta abierta pero si inicializando")
        } else if (me.inst.DBActiveCnx && me.inst.DBActiveCnx.open && me.inst.DBActiveCnx.init) {
            console.log("la conexion se encuentra abierta debemos destruirla y volverla a crear");
            me.inst.destroyDBCnx();
            me.inst.setActiveCnx();
        }
        me.inst.DBActiveCnx.init = true;
        me.inst.DBActiveCnx.connect(function (err, client) {
            if (me.isDestroyed) {
                me = null;
                return false;
            }
            me.inst.DBActiveCnx.init = false;
            if (err) {
                me.inst.DBActiveCnx.setErrorCnx(true);
                me.connectionFailure(err);
            } else {
                me.inst.DBActiveCnx.open = true;
                me.fireEvent("connectionsuccess");
                me.execStart();
            }
            me = null;
        });
    },
    destroyForce: function (client) {
        if (client.done) {
            client.done();
            client.done = null;
        } else {
            client.end();
        }
    },
    execStart: function () {
        this.resultIndex = 0;
        this.openTrans = 0;
        this.escapeCommit = 0;
        this.resultCur = this.results[this.resultIndex];
        this.fireEvent("executionstart", this, this.resultCur, this.resultIndex, this.results);
        if (this.resultCur) {
            this.beforeRunResult();
        } else {
            this.resultFailure({ message: "Result no generated / result no found" }, null);
        }
    },
    beforeRunResult: function () {
        //        console.log("beforeRunResult");
        if (this.resultCur.action === "read") {
            if (!this.resultCur.compileReady) {
                this.resultCur.compileQuery();
            }
            if (!this.resultCur.query) {
                Nodext.trace("la consulta no se ha generado", "red");
                this.resultFailure({ message: "Query no generated / query no found" }, null);
            } else {
                this.fireEvent("beforequeryrun", this, this.resultCur, this.resultIndex, this.results);
                this.resultCur.fireEvent("beforequery", this, this.resultCur, this.resultIndex, this.results);
                this.runResult();
            }
        } else if (this.resultCur.action === "transaction") {
            if (this.resultCur.type === "trans_start") {
                if (this.openTrans !== 0) {
                    this.resultCur.query = "SAVEPOINT LEVEL" + this.openTrans + ";";
                }
                this.openTrans++;
            } else if (this.resultCur.type === "trans_complete") {
                this.openTrans--;
                if (this.openTrans > 0) {
                    this.resultCur.query = "RELEASE SAVEPOINT LEVEL" + this.openTrans + ";";
                }

            } else if (this.resultCur.type === "trans_rollback") {
                this.openTrans--;
                if (this.openTrans > 0) {
                    this.resultCur.query = "ROLLBACK TO SAVEPOINT LEVEL" + this.openTrans + ";";
                }
            } else if (this.resultCur.type === "trans_commit") {
                this.openTrans--;
                if (this.openTrans > 0) {
                    this.resultCur.query = "RELEASE SAVEPOINT LEVEL" + this.openTrans + ";";
                }
            }
            this.runResult();
        } else if (this.resultCur.action) {
            this.fireEvent("beforequeryrun", this, this.resultCur, this.resultIndex, this.results);
            this.resultCur.fireEvent("beforequery", this, this.resultCur, this.resultIndex, this.results);
            this.runResultBatch();
        } else {
            this.resultFailure({ message: "Result no action" }, null)
        }
    },
    runResultBatch: function () {
        var me = this;
        if (me.resultCur.continue()) {
            var q = me.resultCur.getNext(me);
            //            console.log(q);
            me.inst.DBActiveCnx.query(q, function (err, result) {
                if (me.isDestroyed) {
                    me = null;
                    return false;
                }
                if (err) {
                    me.resultFailure(err, result);
                } else {
                    me.resultCur.setResultBatch(result);
                    if (me.resultCur.continue()) {
                        me.runResultBatch();
                    } else {
                        if (!me.resultSuccess()) {
                            return;
                        }
                        me.afterRunResult();
                    }
                    me = null;
                }
            });
        } else {
            me.afterRunResult();
        }
    },
    runResult: function () {
        var me = this;
        //        console.log(me.resultCur.query.green);
        me.inst.DBActiveCnx.query(me.resultCur.query, function (err, result) {
            if (me.isDestroyed) {
                me = null;
                return false;
            }
            if (err) {
                me.resultFailure(err, result);
            } else {
                me.resultOk(result);
            }
            me = null;
        });
    },
    resultOk: function (result) {
        //        console.log("resultOk");
        this.resultCur.result = result;
        if (!this.resultSuccess()) {
            return;
        }
        this.afterRunResult();
    },
    connectionFailure: function (err) {
        var s = this.fireEvent("connectionexception");
        if (s === false) {
            console.log("el desarrollador impidio el envio de error de conexion del servidor usted debe programar una salida al cliente manualmente");
            console.log("Si se detiene el proceso, revisar el usuario y contraseña , por que si se establecio conexion con el servidor");
            return true;
        } else {
            if (this.destroyed) {
                return false;
            }
            var cnx = Nodext.db.Mgr.getCnx(this.inst.DBcnxName);
            if (cnx && this.onErrorResMsg) {
                cnx.sendConnectionError(this.inst, err);
            }
            cnx = null;
            return;
        }
    },
    resultFailure: function (err, result) {
        if (this.isDestroyed) {
            //            DBActiveCnx.end();
            //            DBActiveCnx = me = null;
            return false;
        }


        this.fireEvent("queryrunexception", this, this.resultCur, err, this.resultIndex, this.results);
        if (this.resultCur) {
            //            console.log("onfailure");
            this.resultCur.fireEvent("onfailure", this, this.resultCur, err, this.resultIndex, this.results);
            var oContinue = this.resultCur.getOnErrorContinue(), tContinue = this.resultCur.getOnTransFailContinue();
            if (oContinue && this.openTrans === 0) {
                this.resultOk(result);
            } else if (tContinue && this.openTrans > 0) {
                this.onTransFailureContinue(err, result);
            } else {
                if (this.openTrans > 0) {
                    this.onTransFailure(err, result, this.resultCur.getOnErrorResMsg());
                } else {
                    if (this.resultCur.getOnErrorResMsg()) {
                        var cnx = Nodext.db.Mgr.getCnx(this.inst.DBcnxName);
                        if (cnx) {
                            cnx.sendQueryError(this.inst, this.resultCur.getQuery(), err);
                        }
                        cnx = null;
                    }
                }
            }
        } else {
            var cnx = Nodext.db.Mgr.getCnx(this.inst.DBcnxName);
            if (cnx) {
                cnx.sendQueryError(this.inst, null, err);
            }
        }
    },
    onTransFailureContinue: function (errBase, result) {
        var query = "";
        this.openTrans--;
        if (this.openTrans > 0) {
            query += "ROLLBACK TO SAVEPOINT LEVEL" + this.openTrans + ";";
            var i = this.resultIndex + 1, rCommit;
            for (; i < this.results.length; i++) {
                if (this.results[i].type === "trans_commit" || this.results[i].type === "trans_complete") {
                    rCommit = i;
                    break;
                }
            }
            if (rCommit != -1) {
                this.results.splice(rCommit, 1);
            }

        } else {
            query += "ROLLBACK;";
        }
        var me = this;
        this.inst.DBActiveCnx.query(query, function () {
            //            console.log(query.green);
            me.resultCur.fireEvent("afterrollback", me, me.resultCur, me.resultIndex, me.results);
            me.resultOk(result);
        });
    },
    getQueryRollBack: function () {
        var query = "";
        this.openTrans--;
        while (this.openTrans > 0) {
            query += "ROLLBACK TO SAVEPOINT LEVEL" + this.openTrans + ";";
            this.openTrans--;
        }
        query += "ROLLBACK;END TRANSACTION";
        return query;
    },
    onTransFailure: function (errBase, result, sendError) {
        var me = this, query = "";
        me.resultCur.fireEvent("beforerollback", me, me.resultCur, errBase, me.resultIndex, me.results);
        query = this.getQueryRollBack();
        //        this.openTrans--;
        //        while (this.openTrans > 0) {
        //            query += "ROLLBACK TO SAVEPOINT LEVEL" + this.openTrans + ";";
        //            this.openTrans--;
        //        }
        //        query += "ROLLBACK;END TRANSACTION";
        this.inst.DBActiveCnx.query(query, function () {
            me.resultCur.fireEvent("afterrollback", me, me.resultCur, me.resultIndex, me.results);
            var cnx = Nodext.db.Mgr.getCnx(me.inst.DBcnxName);
            if (cnx) {
                cnx.sendQueryError(me.inst, me.resultCur.query, errBase);
            }
            cnx = null;
            if (me.inst && me.inst.autoCloseDB) {
                me.inst.DBActiveCnx.close();
            }
            delete (me, errBase, result);
        });
    },
    resultSuccess: function (err, result) {
        var a = this.fireEvent("queryrunsuccess", this, this.resultCur, this.resultIndex, this.results);
        var b = this.resultCur.fireEvent("onsuccess", this, this.resultCur, this.resultIndex, this.results);
        if (a === false || b === false) {
            if (this.flagError) {
                this.inst.sendError({
                    success: false,
                    message: this.msgError
                });
            }
            return false;
        } else {
            return true;
        }
    },
    afterRunResult: function () {
        var a = this.fireEvent("afterqueryrun", this, this.resultCur, this.resultIndex, this.results);
        var b = this.resultCur.fireEvent("afterquery", this, this.resultCur, this.resultIndex, this.results);
        if (a === false || b === false) {
            if (this.flagError) {
                this.inst.sendError({
                    success: false,
                    message: this.msgError
                });
            }
            return false;
        }

        if (this.resultIndex + 1 < this.results.length) {
            this.resultIndex++;
            this.resultCur = this.results[this.resultIndex];
            this.beforeRunResult();
        } else {
            if (this.openTrans > 0) {
                Nodext.logError("Transaccion no cerrada");
                var query = this.getQueryRollBack();
                var compiles = this.resultCur.qb.query(this.inst, query, null, false);
                this.results.push(compiles[0]);
                this.resultIndex++;
                this.resultCur = this.results[this.resultIndex];
                this.beforeRunResult();
            } else {
                this.resultGroupComplete();
            }
        }
    },
    resultGroupComplete: function () {
        if (this.inst.autoCloseDB) {
            // console.log("cerrando conexion")
            this.inst.DBActiveCnx.close();
        }
        var inst = this.inst || {},
            scope = inst.DBScope || this;
        try {
            this.callback.call(scope, this, this.results, this.inst);
        } catch (e) {
            var cnx = Nodext.db.Mgr.getCnx(this.inst.DBcnxName);
            cnx.sendCallbackError(this.inst, e);
        }
    },
    execFinish: function () {
        this.fireEvent("executionend", this, this.resultCur, this.resultIndex, this.results);
    },
    next: function () {
        return this.results[this.resultIndex + 1] ? this.results[this.resultIndex + 1] : null;
    },
    destroy: function () {
        Nodext.destroy(this.results);
        this.clearListeners();
        this.callParent();
        this.inst = this.resultCur = null;
        Nodext.destroyClass(this);
        delete this;
    },
    insertResult: function (results, index) {
        if (this.inst.isDestroyed) {
            return false;
        }
        index = index || this.resultIndex + 1;
        if (index && !(index > this.resultIndex)) {
            Nodext.logError("Error add result to tesultGroup, verify param index");
        }
        Nodext.Array.insert(this.results, index, (Array.isArray(results) ? results : [results]));
    },
    insertQuery: function (querys, index) {
        if (!Array.isArray(querys)) {
            querys = [querys];
        }
        index = index || this.resultIndex + 1;
        if (index && !(index > this.resultIndex)) {
            Nodext.logError("Error add result to tesultGroup, verify param index");
        }
        var results = this.qb.getResults(this.inst, querys);
        Nodext.Array.insert(this.results, index, (Array.isArray(results) ? results : [results]));
    },
    getResultByIdGroup: function (idGroup) {
        var x, dataRs;
        for (x = 0; x < this.results.length; x++) {
            if (this.results[x].idGroup === idGroup) {
                dataRs = this.results[x];
                break;
            }
        }
        return dataRs;
    },
    getAt: function (index) {
        return this.results[index];
    },
    get: function (id) {
        if (typeof id === "number") {
            return this.results[id];
        } else {
            return this.getResultByIdGroup(idGroup);
        }
    },
    getDataGroup: function (groupName) {
        var data = [], x, dataRs;
        for (x = 0; x < this.results.length; x++) {
            if (this.results[x].idGroup === groupName) {
                dataRs = this.results[x].getData();
                if (dataRs) {
                    data = data.concat(dataRs);
                }
            }
        }
        return data;
    }
});
