/**
 * 
 */
Nodext.define("Nodext.test.LoadManager", {
    extend: "Nodext.app.FileLoader",
    loaderPath: "tests",
    autoLoad: false,
    constructor: function () {
        this.callParent(arguments);
        this.start();
        this.libLoad = require("loadtest");
    },
    getIdItem: function (item) {
        return item._keyItem;
    },
    indexTest: -1,
    currentTest: null,
    initTest: function (fn) {
        this.indexTest = -1;
        this.currentTest = null;
        this.callBack = fn;
        this.onTestFnBind = this.onTestFn.bind(this);
        this.testLoop();
    },
    testLoop: function () {
        this.indexTest++;
        this.currentTest = this.items.getAt(this.indexTest);
        if (this.currentTest && this.currentTest.disabled) {
            this.testLoop();
            return;
        }
        if (this.currentTest) {
            var test = this.currentTest.next();
            if (test) {
                this.libLoad.loadTest(test, this.onTestFnBind);
            } else {
                this.testLoop();
            }
        } else {
            this.callBack();
        }
    },
    onTestFn: function (error, result) {      
        console.log(result);
        var test = this.currentTest.next();
        if (test) {
            this.libLoad.loadTest(test, this.onTestFnBind);
        } else {
            this.testLoop();
        }
    }

});