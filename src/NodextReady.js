/**
 * @class Nodext
 * @singleton
 */
(function () {
    /**
     * Indica si Nodext esta listo para iniciar la aplicacion
     */
    Nodext.isReady = function () {
        if (Nodext.isMaster()) {
            return true;
        } else if (Nodext.idWorker && Nodext.idCluster) {
            return true;
        } else {
            return false;
        }
    };
    /**
     * @property {Array} launchList
     * @private
     * Lista de funciones a la espera de ejecutar cuando Nodext este listo.{@link Nodext#isReady} 
     */
    Nodext.launchList = [];
    /**
     * @method onReady
     * Agrega una Funcion a ejecutar cuando Nodext este listo.
     * @param {Function} fn
     */
    Nodext.onReady = function (fn) {
        if (Nodext.isReady()) {
            fn();
        } else {
            Nodext.launchList.push(fn);
        }
    };
    /**
     * @method workerStartFn
     * Agrega un listener al proceso Worker a la escucha del evento "workerstart" el cual indica que Nodext esta listo.
     * Este solo se aplica para los Worker.En caso que el proceso sea Maestro Nodext se encuentra listo al finalizar 
     * su carga de librerias.
     * @private
     * @param {Object} msg
     */
    Nodext.workerStartFn = function (msg) {
        if (msg.to === "Nodext" && msg.event === "workerstart") {
            var params = msg.params;
            Nodext.executeLaunch(params[0], params[1], params[2]);
            process.removeListener("message", Nodext.workerStartFn);
        }
    };
    process.on("message", Nodext.workerStartFn);
    /**
     * @method executeLaunch
     * Ejecuta las funciones de {@link Nodext#launch} y {@link Nodext#application} que se pusieron en cola
     *  a la espera de que Nodext se encuentre listo.
     * @private
     * @param {String} idWorker
     * @param {String} idCluster
     */
    Nodext.executeLaunch = function (idWorker, internalId, idCluster) {
        Nodext.apply(Nodext, {
            idWorker: idWorker,
            internalId: internalId,
            idCluster: idCluster
        });

        var list = Nodext.launchList;
        for (var x = 0; x < list.length; x++) {
            if (Nodext.isFunction(list[x])) {
                list[x]();
            }
        }
    };
    Nodext.appActive = Ext.create("Ext.util.Collection", {

    });


})();