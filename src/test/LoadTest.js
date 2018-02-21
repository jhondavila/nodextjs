/**
 * 
 */
Nodext.define("Nodext.test.LoadTest", {
    extend: "Ext.Base",
    $configPrefixed: false,
    $configStrict: false,
    config: {
        headers: null
    },
    /**
     * 
     */
    index: -1,
    defaults: null,
    items: null,
    constructor: function (config) {
        config = config || {};
        Nodext.apply(this, config);
        this.initConfig(config);
        this.init();
        this.headers = this.headers || {};
        Nodext.apply(this.headers, {
            'Content-Type': 'application/x-www-form-urlencoded',
            accept: "text/plain;text/html",
        });
        this.items = this.items || [];
        var item, tests = [], maxRequests, y, x, test;
        for (x = 0; x < this.items.length; x++) {
            item = this.items[x] || {};
            Nodext.apply(item, this.defaults || {});
            item.headers = item.headers || {};
            Nodext.apply(item.headers, this.headers);
            maxRequests = item.maxRequests;
            if (!Array.isArray(maxRequests)) {
                maxRequests = [maxRequests];
            }
            for (y = 0; y < maxRequests.length; y++) {
                test = {
                    maxRequests: maxRequests[y] || 10
                };
                Nodext.applyIf(test, item);
                tests.push(test);
            }
        }
        this.tests = tests;
        item = tests = test = maxRequests = x = y = null;
    },
    init: Nodext.emptyFn,
    next: function () {
        this.index++;
        var item = this.tests[this.index];
        if (item) {
            return item;
        } else {
            return false;
        }
    }
});