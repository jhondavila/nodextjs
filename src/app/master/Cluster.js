/**
 * 
 */
Nodext.define("Nodext.app.master.Cluster", {
    extend: "Nodext.app.master.Base",
    requires: [
        "Nodext.app.master.Thread"
    ],
    equip: null,
    user: null,
    pid: null,
    node_ver: null,
    config: {
        /**
         * @cfg {Boolean} autoThread
         * Genera los thread de manera automatica cuando el valor es 'true'
         */
        autoThread: true,
        /**
         * @cfg {String} text
         * Descripcion del Cluster
         */
        text: null,
        /**
         * @cfg {Boolean} expanded
         * Indica al formato JSON que este elemento mostrara sus subelementos
         * cuando su valor sea true.
         */
        expanded: true,
    },
    /**
     * @property {Boolean} leaf
     * Indica al formato JSON que este elemento contiene subelementos.
     * @private
     */
    leaf: false,
    /**
     * @property {String} type
     * @private
     * Indica al formato JSON que este elemento es de tipo 'cluster'
     */
    type: "cluster",
    constructor: function () {
        Nodext.apply(this, {
            equip: process.env.USERDOMAIN,
            user: process.env.USERNAME,
            pid: process.pid,
            node_ver: process.version
        });
        this.callParent(arguments);
        // console.log(this.id)
        if (this.autoThread) {
            this.generateThreads();
        }
    },
    /**
     * @method generateThreads
     * Genera la cantidad de Thread configurados como maximo.
     */
    generateThreads: function () {
        var thread;
        for (var i = 0; i < this.totalThread; i++) {
            var fork = false;
            if (i < this.totalServer) {
                fork = true;
            }
            thread = Nodext.create("Nodext.app.master.Thread", {
                id: Nodext.id(null, "Thread-"),
                internalId: i
            });
            this.add(thread);
            if (fork) {
                thread.buildWorker();
                thread.workerStart();
            }
        }
    },
    /**
     * @method add
     * Añade un Thread al cluster
     * @param {Nodext.app.master.Thread|Object} thread
     * @return {Nodext.app.master.Thread}
     */
    add: function (thread) {
        if (thread instanceof Nodext.app.master.Thread) {
            thread.setConfig({
                cluster: this
            });
        } else {
            Nodext.apply(thread, {
                cluster: this
            });
            thread = Nodext.create("Nodext.app.master.Thread", thread);
        }
        return this.workers.add(thread);
    },
    /**
     * @method get
     * Devuelve el Thread asociado con el id
     * @param {String|Number} id
     * @return {Nodext.app.master.Thread}
     */
    get: function (id) {
        return this.workers.get(id);
    }
});