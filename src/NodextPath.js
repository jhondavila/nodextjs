/**
 * @class Nodext
 */

(function () {
    var dir = __dirname;
    Nodext.Loader.setConfig({
        enabled: true,
        paths: {
            'Nodext': dir,
        }
    });
    Nodext.apply(Nodext, {
        /**
        * Devuelve una lista de nombre de clases encontrados en una determinada ruta.
        */
        loadFilesByPath: function (pathFolder, expr, opts) {
            var Manager = Ext.ClassManager;
            var paths = Manager.paths;

            var pathFolder;

            if (expr) {
                var indexExp = expr.search(/\.(?=[A-z0-9]*[\*]+[A-z0-9\W]*)/g);
                var subExp = expr.substring(0, indexExp);
                pathFolder = this.getPathFolder(Manager, subExp);
            }

            var files = this.getFiles(pathFolder, null, opts);
            var regexp, p, f, x, file, list = [];

            for (p in paths) {
                regexp = new RegExp(this.escapeUrl(paths[p]));
                for (x = 0; x < files.length; x++) {
                    f = files[x];
                    if (regexp.test(f)) {
                        f = f.replace(regexp, p);
                        f = f.replace(/\.js/g, "");
                        f = f.replace(/(\\|\/)/g, ".");
                        if (!Manager.nameToAliases[f]) {
                            Manager.nameToAliases[f] = [];
                        }
                        list.push(f);
                    }
                }
            }
            files = regexp = p = f = x = file = null;
            return list;
        },
        /**
         * Escapa caracteres especiales dentro de una cadena
         */
        escapeUrl: function (string) {
            return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        },
        /**
         * Permite evitar la lectura de ciertos archivos en una carpeta,
         * esta regExp es utilizado por {@link #loadFilesByPath}.
         */
        RegExPattern: /(ignore)/gi,
        /**
         * Obtiene una lista de rutas con archivos en una determinada carpeta.
         */
        getFiles: function (dir, files_, opts) {
            this.fs = this.fs || require("fs");
            opts = opts || {};
            files_ = files_ || [];
            var me = this, files,
                RegExPattern = opts.RegExPattern || this.RegExPattern;
            try {
                files = this.fs.readdirSync(dir);
            } catch (error) {
                Nodext.logError("No found path : " + dir);
                files = [];
            }

            for (var i in files) {
                var name = dir + '/' + files[i];
                if (!files[i].match(RegExPattern)) {
                    if (this.fs.statSync(name).isDirectory()) {
                        me.getFiles(name, files_, opts);
                    } else {
                        if (files[i].match(/(js)$/ig)) {
                            files_.push(name);
                        }
                    }
                } else {
                    if (this.fs.statSync(name).isDirectory()) {
                        Nodext.logEvent("Ignore loading automatic in directory ==>" + name);
                    } else {
                        Nodext.logEvent("Ignore loading automatic this file ==>" + name);
                    }
                }
            }
            return files_;
        },
        /**
         * Obtiene la ruta de archivo de una Clase
         */
        getPathFolder: function (Manager, className) {
            var me = Manager,
                paths = me.paths,
                ret = '',
                prefix;

            if (className in paths) {
                ret = paths[className];
            } else {
                prefix = me.getPrefix(className);
                if (prefix) {
                    className = className.substring(prefix.length + 1);
                    ret = paths[prefix];
                    if (ret) {
                        ret += '/';
                    }
                }

                ret += className.replace(me.dotRe, '/');
            }

            return ret;
        },
        deleteFiles: function (path) {
            this.fs = this.fs || require("fs");
            this.path = this.path || require("path");
            if (this.fs.existsSync(path)) {
                if (this.fs.lstatSync(path).isDirectory()) {
                    this.fs.readdirSync(path).forEach(function (file, index) {
                        var curPath = this.path.join(path, file);
                        // console.log(curPath);
                        if (this.fs.lstatSync(curPath).isDirectory()) { // recurse

                            this.deleteFiles(curPath);
                        } else { // delete file
                            this.fs.unlinkSync(curPath);
                        }
                    }, this);
                    this.fs.rmdirSync(path);
                } else {
                    this.fs.unlinkSync(path);
                }
            }
        },
        cmd: function (cmd, callback) {
            this._exec = this._exec || require('child_process').exec;
            this._exec(cmd, callback);
        }
    });
}())
