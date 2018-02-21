/**
 * 
 */
Nodext.define("Nodext.app.FileLoader", {
    extend: "Ext.Base",
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: ["Nodext.module.FileSystem"],
    $configPrefixed: false,
    $configStrict: false,
    config: {
        /**
         * @cfg appNode {@link Nodext.app.Node}
         */
        appNode: null,
        /**
         * @cfg {String} basePath Directorio Base, por defecto se considera el de {@link Nodext.app.Node#path}
         */
        basePath: null,
        /**
         * @cfg {Array} ignoreFilesWith
         */
        ignoreFilesWith: ["ignore"],

        /**
         * @cfg {Boolean} autoLoad 
         */
        autoLoad: true,
        /**
         * @cfg {String} loaderPath
         * Directorio a Cargar
         */
        loaderPath: null,
    },
    /**
     * @property {RegExp} RegExPattern 
     */
    RegExPattern: null,
    /**
    * @property {Ext.util.Collection} items
    */
    items: null,
    constructor: function (config) {
        Nodext.apply(this, config);
        this.initConfig(config);
        this.mixins.observable.constructor.call(this, config);
        this.items = Nodext.create("Ext.util.Collection", {
            keyFn: this.getIdItem
        });
        if (this.autoLoad) {
            this.start();
        }
    },
    /**
     * @method
     * Devuelve una clase instanciada que coincida con el key pasado.
     */
    getClsByKey: function (key) {
        return this.items.get(key);
    },
    /**
     * @method getIdItem
     * Retorna el id de un elemento para poder añadirlo a la coleccion
     * @return {String|Number}
     */
    getIdItem: function (item) {
        return item._keyItem;
    },
    /**
     * @method add
     * Añade un elemento a la lista de items cargados.
     */
    add: function (item) {
        this.items.add(item);
    },
    /**
     * @method start
     * Inicia el proceso de carga de archivos.
     */
    start: function () {
        var me = this;
        if (!this.appNode && !this.basePath) {
            Nodext.logError("No se encontro el parametro appNode ni el basePath");
            return false;
        }
        this.fireEvent("beforeload", this, this.items);
        var appName;
        if (this.appNode) {
            if (!this.basePath) {
                this.basePath = this.appNode.getPath();
            }
            appName = this.appNode.appName;
        }
        var fullPath = this.basePath + "/" + this.loaderPath;
        this.RegExPattern = eval("/(" + (this.ignoreFilesWith ? this.ignoreFilesWith.join("|") : [].join("|")) + ")/gi");



        // console.log(files);

        if (appName) {
            var files = Nodext.loadFilesByPath(fullPath, null, { RegExPattern: this.RegExPattern });
            for (var x = 0; x < files.length; x++) {
                this.buildClass(files[x]);
            }
            // Nodext.Array.each(paths, function (path) {
            //     path = path.replace(this.basePath, appName);
            //     var classArray = path.split("/");
            //     var classString = classArray.join(".");
            //     var alias = classArray.slice(3, classArray.length).join(".");
            //     alias = alias.substring(0, alias.length - 3);
            //     classString = classString.substring(0, classString.length - 3);
            //     console.log(alias);
            //     me.buildClass(classString, alias);
            //     classArray = null;
            // }, this);
        } else {
            var paths = this.getFiles(fullPath), path;
            Nodext.Array.each(paths, function (path) {
                try {
                    require(path);
                    this.fireEvent("loaditem", this, path, path.replace(this.basePath, ""));
                } catch (e) {
                    Nodext.logError("No found file" + path);
                }
            }, this);
        }

        paths = fullPath = path = null;
        this.fireEvent("afterload", this, this.items);
    },
    /**
     * @method buildClass
     * @template
     * Inicia la creacion de clases
     */
    buildClass: function (className) {
        var item = Nodext.create(className, {});
        item._keyItem = className;
        this.add(item);
    },
    /**
     * @method getFiles
     * @private
     * Obtiene los path de los archivos en el directorio a buscar
     * @return {Array}
     */
    getFiles: function (dir, files_) {
        files_ = files_ || [];
        var me = this, files;
        try {
            files = Nodext.FS.readdirSync(dir);
        } catch (error) {
            Nodext.logError("No found path" + dir);
            files = [];
        }
        for (var i in files) {
            var name = dir + '/' + files[i];
            if (!files[i].match(me.RegExPattern)) {
                if (Nodext.FS.statSync(name).isDirectory()) {
                    me.getFiles(name, files_);
                } else {
                    if (files[i].match(/(js)$/ig)) {
                        files_.push(name);
                    }
                }
            }
        }
        return files_;
    }

});