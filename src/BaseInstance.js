/**
 * 
 */
Nodext.define("Nodext.BaseInstance", {
    $configStrict: false,
    $configPrefix: false,
    /**
     * Nombre de la conexion DB a utilizar por defecto
     */
    DBcnxName: null,
    /**
     * Habilita el cache BD para esta instancia de manera automatica
     */
    autoInit: false,
    /**
     * En caso de algun error relacionado con la BD se autodestruira esta instancia
     */
    DBErrorDestroy: false,
    /**
     * Cierre automatico de la conexion con la BD al finalizar la pila de consultas
     */
    autoCloseDB: true,
    /**
    * @private
    * Conexion Activa
    */
    DBActiveCnx: null,
    /**
     * @private
     * Nombre de la conexion activa
     */
    DBActiveCnxName: null,
    /**
     * @private
     * Cache de compilaciones de BD
     */
    DBCompiles: null,
    /**
     * Lista de conexiones BD en uso por la instancia actual
     */
    DBCnx: null,
    /**
     * DB Scope para consultas continuas
     */
    DBScope: null,
    constructor: function (config) {
        this.id = Nodext.id();
        Nodext.apply(this, config);
        if (this.autoInit) {
            this.initBuild();
        }
    },
    /**
     * @method
     * @private
     * Inicializa el cache de BD
     */
    initBuild: function () {
        this.DBCompiles = [];
        this.DBCnx = {};
    },
    /**
     * @method
     * Configura la conexion activa
     */
    setActiveCnx: function (DBcnxName, newCnx) {
        DBcnxName = DBcnxName || this.DBcnxName;
        if (this.DBCnx[DBcnxName]) {
            this.DBActiveCnx = this.DBCnx[DBcnxName];
            this.DBActiveCnxName = DBcnxName;
            return this.DBActiveCnx;
        } else {
            var cnx = Nodext.db.Mgr.getCnx(DBcnxName);
            if (cnx) {
                cnx = cnx.newCnx();
                if (newCnx) {
                    DBcnxName = newCnx;
                }
                this.DBActiveCnx = cnx;
                this.DBActiveCnxName = DBcnxName;
                this.DBCnx[DBcnxName] = cnx;
                return this.DBActiveCnx;
            } else {
                Nodext.logError("El nombre de la conexion " + DBcnxName + " no existe");
                return false;
            }
        }
    },
    /**
     * @method
     * Cierra la conexion activa
     */
    destroyDBCnx: function () {
        var cnx, i;
        for (i in this.DBCnx) {
            cnx = this.DBCnx[i];
            if (cnx && !cnx.errorCnx) {
                cnx.destroy();
            } else if (cnx && cnx.errorCnx) {
                Nodext.logError("al parecer ocurrio un error al conectar a la base de datos " + this.DBcnxName);
                cnx.destroy();
            } else {
                if (cnx) {
                    cnx.destroy();
                }
            }
            this.DBCnx[i] = null;
        }
        this.DBCnx = this.DBActiveCnx = cnx = i = null;
    },
    /**
     * @method
     * @private
     * Limpia el cache de BD
     */
    clearDBCompiles: function () {
        if (Array.isArray(this.DBCompiles)) {
            for (var x = 0; x < this.DBCompiles.length; x++) {
                Nodext.destroy(this.DBCompiles[x]);
                this.DBCompiles[x] = null;
            }
            Nodext.destroyArray(this.DBCompiles[x]);
        }
    },
    destroy: function () {
        this.destroyDBCnx();
        this.clearDBCompiles();
        this.callParent();
        Nodext.destroyClass(this);
        delete this;
    },
    /**
     * @method
     * @localdoc
     * Envia la señal de error al cliente
     */
    sendError: function (err, code, log) {
        if (log) {
            Nodext.logError(err);
        }
        if (this.DBErrorDestroy) {
            this.destroy();
        }
    }
});