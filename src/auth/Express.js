/**
 * 
 */
Nodext.define("Nodext.auth.Express", {
    extend: "Nodext.auth.Base",
    alias: 'auth.baseexpress',
    requires: [
        "Nodext.auth.store.*"
    ],
    config: {
        /**
         * @cfg {Nodext.auth.store.Base} store
         * Almacen de sessiones
         */
        store: null,
        /**
         * @cfg {String|Array}
         * Este es el secreto utilizado para firmar la cookie de ID de sesión. Esto puede ser una cadena para un solo secreto, o una matriz de múltiples secretos. Si se proporciona una matriz de secretos, sólo se utilizará el primer elemento para firmar la cookie de ID de sesión, mientras que todos los elementos se considerarán al verificar la firma en las solicitudes.
         */
        secret: "",
        /**
         * Fuerza la session a guardarse en el store, incluso si esta no fue modificada durante la peticion
         */
        resave: true,
        /**
         * Obliga a una sesión "no inicializada" a ser guardada en la tienda. Una sesión no se inicializa cuando es nueva pero no se modifica. La elección falsees útil para implementar sesiones de inicio de sesión, reducir el uso del almacenamiento del servidor o cumplir con las leyes que requieren permiso antes de configurar una cookie. La elección falsetambién ayudará con las condiciones de carrera en las que un cliente realiza varias solicitudes paralelas sin una sesión.
         * El valor predeterminado es true.
         */
        saveUninitialized: true,
        /**
         * Fuerza a la cookie a resetear su periodo de expiracion en cada respuesta 
         */
        rolling: false,
        /**
         * Habilita la session para sockets
         */
        enabledSocket: false,
        /**
         * @cfg {Object} cookie
         * Objeto de configuración para la cookie de ID de sesión. El valor predeterminado es { path: '/', httpOnly: true, secure: false, maxAge: null }.
         * 
         * 
         * @cfg [cookie.domain] Especifica el valor del atributo set-cookie domain. De forma predeterminada, no se establece ningún dominio y la mayoría de los clientes considerarán que la cookie se aplicará únicamente al dominio actual.
         * 
         * 
         * @cfg {Date} [cookie.expires] Especifica el valor del atributo set-cookie expires.De forma predeterminada, no se establece ninguna caducidad, y la mayoría de los clientes consideran esto una "cookie no persistente" y la eliminarán en una condición como salir de una aplicación de navegador web.
         * 
         * Nota Si ambos expiresy maxAgese establecen en las opciones, entonces el último definido en el objeto es lo que se utiliza.
         * 
         * Nota La expiresopción no se debe establecer directamente; En su lugar, sólo utilice la maxAge opción.
         * 
         * 
         * @cfg {Boolean} [cookie.httpOnly] Especifica el valor del atributo set-cookie HttpOnly.Cuando es true, el HttpOnly se estable, de lo contrario no.
         * 
         * Tenga cuidado al configurar esto true, ya que los clientes compatibles no permitirán que JavaScript del cliente vea la cookie en document.cookie.
         * 
         * 
         * @cfg {Object}[cookie.maxAge] Especifica el valor number(en milisegundos) que se utilizará al calcular el atributo set-cookie Expires. Esto se realiza tomando el tiempo actual del servidor y añadiendo maxAge milisegundos al valor para calcular una fecha y hora de expiracion. De forma predeterminada, no se establece un tiempo de expiracion máxima.
         * @cfg {Number} [cookie.maxAge.month] mes
         * @cfg {Number} [cookie.maxAge.day] dia
         * @cfg {Number} [cookie.maxAge.hour] hora
         * @cfg {Number} [cookie.maxAge.min] minuto
         * @cfg {Number} [cookie.maxAge.sec] segundo
         * 
         *  
         * @cfg [cookie.path] Especifica el valor para el atributo Set-Cookie Path. De forma predeterminada, se establece en '/', que es la ruta raíz del dominio.
         * 
         * 
         * @cfg {Boolean|String} [cookie.sameSite] Especifica el valor para el valor del atributo Set-Cookie SameSite.
         *  
         *  - `true Establecerá el SameSiteatributo Strictpara la aplicación estricta del mismo sitio.`
         *  - `false No establecerá el SameSiteatributo.`
         *  - `'lax'Establecerá el SameSite atributo Laxpara aplicar la misma aplicación de sitio.`
         *  - `'strict'Establecerá el SameSiteatributo Strictpara la aplicación estricta del mismo sitio.`
         * 
         * 
         * @cfg {Boolean} [cookie.secure] Especifica el valor del atributo Set-Cookie Secure. Cuando es true, el atributo secure se establece, de lo contrario no. De forma predeterminada, el atributo Secure no está establecido.
         * 
         * Tenga cuidado al configurar esto true, ya que los clientes compatibles no enviarán la cookie de vuelta al servidor en el futuro si el navegador no tiene una conexión HTTPS.
         * 
         * Tenga en cuenta que secure: true es una opción recomendada. Sin embargo, requiere un sitio web habilitado para https, es decir, HTTPS es necesario para las cookies seguras. Si secure está establecido y accede a su sitio a través de HTTP, la cookie no se establecerá. Si tiene su node.js detrás de un proxy y lo está usando secure: true, debe configurar "proxy de confianza" en express:
         */
        cookie: null,
        /**
         * @cfg {String} [name='connect.sid']
         * El nombre de la ID cookie de sesión para establecer en la respuesta(y leer en la peticion).
         */
        name: "connect.sid",
        /**
         * @cfg {String}
         */
        fileCfg: "session.json"
    },
    /**
     * @property {NodeInstance} session
     * @private
     * Instancia de session creada
     */
    session: null,
    /**
     * @property {NodeModule} libSession
     * @private
     * Carga la libreria express-session, esta nos permite el uso de sesiones para http y https
     */
    libSession: null,
    /**
     * @property {NodeModule} libSessionSocket
     * @private
     * Carga la libreria express-socket.io-session, esta nos permite el uso de sesiones para socket.io
     */
    libSessionSocket: null,
    constructor: function (config) {
        this.callParent(arguments);
        this.libSession = require('express-session');
        this.libSessionSocket = require("express-socket.io-session");
        this.init();
    },
    /**
     * @method
     * Inicializa la session para la instancia actual
     */
    init: function () {

        this.store = Nodext.auth.store.Base.create(this.store || {});
        var cookieCfg = Nodext.apply({}, this.cookie);
        this.normalizeCookieCfg(cookieCfg);
        // console.log()
        var obj = {
            store: this.store.getConnection(),
            secret: this.secret,
            resave: this.resave,
            domain: false,
            rolling: this.rolling,
            saveUninitialized: this.saveUninitialized,
            cookie: cookieCfg,
            name: this.name || null
        };
        this.session = this.libSession(obj);
    },
    /**
     * Configura una nuevo almacen de sessiones
     */
    setStore: function (store) {
        if (this.store.destroy()) {
            this.store.destroy();
        }
        this.store = store;
        this.init();
    },
    /**
     * añade un middleware al servidor, la cual añade la funcionalidad de sessiones
     */
    applyServer: function (SystemSrv, app) {
        SystemSrv.addMiddleware(this.session, {
            name: "session.express",
            _type: "session",
            _id: Nodext.id(null, "Session-")
        });
    },
    /**
     * Formatea el tiempo de vida asignado a la cookie a milisegundos
     */
    normalizeCookieCfg: function (cookieCfg) {
        if (cookieCfg.maxAge && Nodext.isObject(cookieCfg.maxAge)) {
            var maxAge = cookieCfg.maxAge;
            var month = (maxAge.month || 0) * 30 * 24 * 60 * 60;
            var day = (maxAge.day || 0) * 24 * 60 * 60;
            var hour = (maxAge.hour || 0) * 60 * 60;
            var min = (maxAge.min || 0) * 60;
            var sec = (maxAge.sec || 0);
            cookieCfg.maxAge = (month + day + hour + min + sec) * 1000;
        }
    },
  
});
