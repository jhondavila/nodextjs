/**
 * 
 */
Nodext.define("Nodext.database.Connection", {
    extend: "Ext.Base",
    alias: 'dbconnection.base',
    $configPrefixed: false,
    $configStrict: false,
    mixins: [
        'Ext.mixin.Factoryable'
    ],
    factoryConfig: {
        defaultType: 'base',
        defaultProperty: "dbdriver"
    },
    config: {

        /**
         * Nombre del host de base de datos
         */
        hostname: null,
        /**
         * Usuario de la base de datos
         */
        username: null,
        /**
         * Contraseña del usuario
         */
        password: null,
        /**
         * Nombre de la base de datos
         */
        database: null,
        /**
         * @cfg {Number} port
         * Puerto de la conexion de base de datos
         */
        port: null,
        /**
         * Habilitar el modo debug query
         */
        debug: null,
        /**
         * Tipo de conexion, cliente o pool
         */
        type: null,
        /**
         * Driver de Base de datos a utilizar
         */
        dbdriver: "Base"
    },
    /**
     * @property
     * Libreria a cargar de Node js para soporte de base de datos.
     */
    driver: null,
    constructor: function (config) {
        Nodext.apply(this, config || {});
        this.initConfig(config);
    },
    /**
     * @template
     */
    generateStringConnection: function () {
    },
    /**
     * @template
     */
    newConnection: function () {
    },
    /**
     * @template
     */
    cnx: function () {
    },
    /**
     * @template
     */
    destroyCnx: function (cnx) {
    }
});