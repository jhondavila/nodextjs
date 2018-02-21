/**
 * 
 */
Nodext.define("Nodext.http.vhost.Mixin", {
    extend: 'Ext.Mixin',
    $configPrefixed: false,
    mixinConfig: {
        id: 'vhostmixin'
    },
    config: {

    },
    vhosts: null,
    initVhosts: function () {
        var vhosts = this.vhosts || [];
        this.vhosts = Nodext.create("Ext.util.Collection", {
            decoder: this.decoderVhost.bind(this),
            keyFn: function (i) {
                return i.hostname;
            }
        });
        this.addVhost(vhosts);
    },
    decoderVhost: function (item) {
        item = Nodext.create("Nodext.http.vhost.Vhost", item || {});
        this.addMiddleware(item.get(), {
            name: "vhost",
            _type: "vhost",
            _id: item.hostname || Nodext.id(null, "Vhost-")
        });
        return item;
    },
    addVhost: function (items) {
        this.vhosts.add(items);
    }
});