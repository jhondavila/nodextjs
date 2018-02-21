/**
 * 
 */
Nodext.define("Nodext.database.query.Util", {
    extend: 'Ext.Mixin',
    $configPrefixed: false,
    config: {
        /**
         * RegExp que permite validar posibles caracteres numericos en una cadena
         */
        ctypeDigitPatt: new RegExp("^([0-9])*$"),
    },
    /**
     * Reemplaza todas las apariciones del string buscado con el string de reemplazo
     * Esta función devuelve un string o un array con todas las apariciones de search en subject 
     * reemplazadas con el valor dado de replace.
     * Si no se necesitan reglas complicadas de reemplazo (como expresiones regulares), se puede
     *  utilizar siempre esta función en lugar de preg_replace().
     * 
     * Si search y replace son arrays, entonces str_replace() toma un valor de cada array y lo 
     * utiliza para buscar y reemplazar en subject. Si replace tiene menos valores que search,
     *  entonces un string vacío es usado para el resto de los valores de reemplazo. Si search 
     * es un array y replace es un string, entonces este string de reemplazo es usado para cada valor de search. 
     * Sin embargo, lo contrario no tendría sentido.
     * 
     * @param {String|String[]} search
     * El valor a ser buscado, también conocida como la aguja. Un array puede ser utilizado para designar varias agujas.
     * 
     * @param {String|String[]} replace
     * El valor de reemplazo que sustituye los valores encontrados de search. Un array puede ser utilizado para designar reemplazos múltiples.
     * 
     * @param {String|String[]} subject
     * El string o array sobre el que se busca y se sustituye, también conocido como el pajar.
     * 
     * @param {String} count
     * Si es pasado, con este se establece el número de reemplazos realizados 
     */
    str_replace: function (search, replace, subject, count) {
        var i = 0,
            j = 0,
            temp = '',
            repl = '',
            sl = 0,
            fl = 0,
            f = [].concat(search),
            r = [].concat(replace),
            s = subject,
            ra = Object.prototype.toString.call(r) === '[object Array]',
            sa = Object.prototype.toString.call(s) === '[object Array]';
        s = [].concat(s);
        if (count) {
            this.window[count] = 0;
        }

        for (i = 0, sl = s.length; i < sl; i++) {
            if (s[i] === '') {
                continue;
            }
            for (j = 0, fl = f.length; j < fl; j++) {
                temp = s[i] + '';
                repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
                s[i] = (temp)
                    .split(f[j])
                    .join(repl);
                if (count && s[i] !== temp) {
                    this.window[count] += (temp.length - s[i].length) / f[j].length;
                }
            }
        }
        return sa ? s : s[0];
    },
    /**
     * Devuelve una parte del string definida por los parámetros start y length.
     * @param {String} str
     * La cadena de entrada. Debe ser de almenos de un caracter.
     * 
     * @param {Number} start
     * Si start no es negativo, la cadena devuelta comenzará en el start de la posición del string empezando desde cero. 
     * Por ejemplo, en la cadena 'abcdef', el caracter en la posición 0 es 'a', el caracter en la posición 2 es 'c', y así sucesivamente.
     * 
     * Si start es negativo, la cadena devuelta empezará en start contando desde el final de string.
     * 
     * Si la longitud del string es menor que start, la función devolverá FALSE.
     * 
     * @param {Number} length
     * Si se especifica el length y es positivo, la cadena devuelta contendrá como máximo de caracteres de la cantidad dada por length que comienza en start (dependiedo de la longitud del string).
     * 
     * Si se especifica length es negativo, entonces ese número de caracteres se omiten al final del string (después de la posición inicial se ha calculado a start es negativo). Si start indica la posición de su truncamiento o más allá, se devolverá FALSE.
     * 
     * Si se omite el length, la subcadena empezará por start hasta el final de la cadena donde será devuelta.
     * 
     * Si se especifica length y es 0, FALSE o NULL devolverá una cadena vacía.
     * 
     */
    substr: function (str, start, len) {
        //http://locutus.io/php/strings/substr/
        str += ''
        var end = str.length
        // var iniVal = (typeof require !== 'undefined' ? require('../info/ini_get')('unicode.emantics') : undefined) || 'off'
        var iniVal = 'off'

        if (iniVal === 'off') {
            // assumes there are no non-BMP characters;
            // if there may be such characters, then it is best to turn it on (critical in true XHTML/XML)
            if (start < 0) {
                start += end
            }
            if (typeof len !== 'undefined') {
                if (len < 0) {
                    end = len + end
                } else {
                    end = len + start
                }
            }
            // PHP returns false if start does not fall within the string.
            // PHP returns false if the calculated end comes before the calculated start.
            // PHP returns an empty string if start and end are the same.
            // Otherwise, PHP returns the portion of the string from start to end.
            if (start >= str.length || start < 0 || start > end) {
                return false
            }
            return str.slice(start, end)
        }
        // Full-blown Unicode including non-Basic-Multilingual-Plane characters
        var i = 0
        var allBMP = true
        var es = 0
        var el = 0
        var se = 0
        var ret = ''
        for (i = 0; i < str.length; i++) {
            if (/[\uD800-\uDBFF]/.test(str.charAt(i)) && /[\uDC00-\uDFFF]/.test(str.charAt(i + 1))) {
                allBMP = false
                break
            }
        }
        if (!allBMP) {
            if (start < 0) {
                for (i = end - 1, es = (start += end); i >= es; i--) {
                    if (/[\uDC00-\uDFFF]/.test(str.charAt(i)) && /[\uD800-\uDBFF]/.test(str.charAt(i - 1))) {
                        start--
                        es--
                    }
                }
            } else {
                var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
                while ((surrogatePairs.exec(str)) !== null) {
                    var li = surrogatePairs.lastIndex
                    if (li - 2 < start) {
                        start++
                    } else {
                        break
                    }
                }
            }
            if (start >= end || start < 0) {
                return false
            }
            if (len < 0) {
                for (i = end - 1, el = (end += len); i >= el; i--) {
                    if (/[\uDC00-\uDFFF]/.test(str.charAt(i)) && /[\uD800-\uDBFF]/.test(str.charAt(i - 1))) {
                        end--
                        el--
                    }
                }
                if (start > end) {
                    return false
                }
                return str.slice(start, end)
            } else {
                se = start + len
                for (i = start; i < se; i++) {
                    ret += str.charAt(i)
                    if (/[\uD800-\uDBFF]/.test(str.charAt(i)) && /[\uDC00-\uDFFF]/.test(str.charAt(i + 1))) {
                        // Go one further, since one of the "characters" is part of a surrogate pair
                        se++
                    }
                }
                return ret
            }
        }
    },
    /**
     * Encuentra la primera aparición de un string
     * @param {String} haystack
     * El string en donde buscar.
     * 
     * @param {String|Number} needle
     * Si needle no es un string, será convertido como número entero y se aplicará el valor ordinal de caracter.
     * 
     * @param {Boolean} before_needle
     * Si se define como TRUE, strstr() devolverá la parte del haystack antes de la primera ocurrencia de needle (excluyendo el needle).
     * 
     */
    strstr: function (haystack, needle, bool) {
        //  discuss at: http://phpjs.org/functions/strstr/
        // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // bugfixed by: Onno Marsman
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        //   example 1: strstr('Kevin van Zonneveld', 'van');
        //   returns 1: 'van Zonneveld'
        //   example 2: strstr('Kevin van Zonneveld', 'van', true);
        //   returns 2: 'Kevin '
        //   example 3: strstr('name@example.com', '@');
        //   returns 3: '@example.com'
        //   example 4: strstr('name@example.com', '@', true);
        //   returns 4: 'name'
        var pos = 0;

        haystack += '';
        pos = haystack.indexOf(needle);
        if (pos == -1) {
            return false;
        } else {
            if (bool) {
                return haystack.substr(0, pos);
            } else {
                return haystack.slice(pos);
            }
        }
    },
    /**
     * Encuentra la última aparición de un caracter en un string
     * 
     * @param {String} haystack
     * El string en donde buscar.
     * 
     * @param {String|Number} needle
     * Si needle contiene más de un caracter, sólo se utiliza el primero. Este comportamiento es diferente que el de strstr().
     * 
     * Si needle no es un string, se convierte en un entero y se aplica como el valor ordinal de un caracter.
     */
    strrchr: function (haystack, needle) {
        //  discuss at: http://phpjs.org/functions/strrchr/
        // original by: Brett Zamir (http://brett-zamir.me)
        //    input by: Jason Wong (http://carrot.org/)
        // bugfixed by: Brett Zamir (http://brett-zamir.me)
        //   example 1: strrchr("Line 1\nLine 2\nLine 3", 10).substr(1)
        //   returns 1: 'Line 3'

        var pos = 0;

        if (typeof needle !== 'string') {
            needle = String.fromCharCode(parseInt(needle, 10));
        }
        needle = needle.charAt(0);
        pos = haystack.lastIndexOf(needle);
        if (pos === -1) {
            return false;
        }

        return haystack.substr(pos);
    },
    /**
     * Realiza una búsqueda y sustitución de una expresión regular
     * 
     * @param {String|String[]} pattern
     * El patrón de búsqueda. Puede ser tanto una cadena como un array de cadenas.
     * 
     * @param {String|String[]} replacement
     * La cadena o array de cadenas a reemplazar. Si este parámetro es una cadena y el parámetro pattern es un array, todos los patrones serán sustituidos por esa cadena. Si ambos parámetros, pattern y replacement, son arrays, cada pattern será reemplazado por el replacement equivalente. Si hay menos elementos en el array replacement que en el array pattern, cualquier pattern extra será reemplazado por una cadena vacía.
     * 
     * @param {String} subject
     * La cadena o array de cadenas a buscar y sustituir.
     * 
     * Si subject es un array, entonces la búsqueda y sustitución se llevan a cabo para cada entrada de subject, y el valor devuelto también es un array.
     * 
     * @param {Number} limit
     * 
     * Las sustituciones máximas posibles por cada patrón en cada cadena subject. Por defecto es -1 (sin límite).
     * 
     * 
     */
    preg_replace: function (pattern, pattern_replace, subject, limit) {
        // Perform a regular expression search and replace
        // 
        // discuss at: http://geekfg.net/
        // +   original by: Francois-Guillaume Ribreau (http://fgribreau)
        // *     example 1: preg_replace("/(\\@([^\\s,\\.]*))/ig",'<a href="http://twitter.com/\\0">\\1</a>','#followfriday @FGRibreau @GeekFG',1);
        // *     returns 1: "#followfriday <a href="http://twitter.com/@FGRibreau">@FGRibreau</a> @GeekFG"
        // *     example 2: preg_replace("/(\\@([^\\s,\\.]*))/ig",'<a href="http://twitter.com/\\0">\\1</a>','#followfriday @FGRibreau @GeekFG');
        // *     returns 2: "#followfriday <a href="http://twitter.com/@FGRibreau">@FGRibreau</a> @GeekFG"
        // *     example 3: preg_replace("/(\\#[^\\s,\\.]*)/ig",'<strong>$0</strong>','#followfriday @FGRibreau @GeekFG');
        // *     returns 3: "<strong>#followfriday</strong> @FGRibreau @GeekFG"

        if (limit === undefined) {
            limit = -1;
        }

        var _flag = pattern.substr(pattern.lastIndexOf(pattern[0]) + 1),
            _pattern = pattern.substr(1, pattern.lastIndexOf(pattern[0]) - 1),
            reg = new RegExp(_pattern, _flag),
            rs = null,
            res = [],
            x = 0,
            y = 0,
            ret = subject;

        if (limit === -1) {
            var tmp = [];

            do {
                tmp = reg.exec(subject);
                if (tmp !== null) {
                    res.push(tmp);
                }
            } while (tmp !== null && _flag.indexOf('g') !== -1)
        } else {
            res.push(reg.exec(subject));
        }
        //        console.log(res);
        for (x = res.length - 1; x > -1; x--) {//explore match
            tmp = pattern_replace;

            for (y = res[x].length - 1; y > -1; y--) {
                //                console.log(res[x][y]);
                //                console.log("......");
                if (res[x][y] === undefined) {
                    //                      console.log(res[x][y]);
                    //                    console.log(y);
                    //                    console.log(x);
                    //                    console.log(res[x]);
                    //                    console.log(y);
                    tmp = tmp.replace('${' + y + '}', res[x][y])
                        .replace('$' + y, "")
                        .replace('\\' + y, res[x][y]);
                } else {
                    tmp = tmp.replace('${' + y + '}', res[x][y])
                        .replace('$' + y, res[x][y])
                        .replace('\\' + y, res[x][y]);
                }
            }
            ret = ret.replace(res[x][0], tmp);
        }
        return ret;
    },
    /**
     * Escapar caracteres en una expresión regular
     * 
     * preg_quote() toma string y pone una barra invertida delante de cada carácter que es parte de la sintaxis de la expresión regular.
     *  Esto es útil si tiene una cadena en tiempo de ejecución que necesite comparar con algún texto, y la cadena pueda contener caracteres
     *  de expresiones regulares especiales.
     * 
     * @param {String} str
     * La cadena de entrada.
     * 
     * @param delimiter
     * Si se especifica el parámetro opcional delimiter, éste también será escapado. Esto es útil para escapar el delimitador que es necesario para las funciones PCRE.
     * El delimitador /es el que se usa comúnmente.
     */
    preg_quote: function (str, delimiter) {
        //  discuss at: http://phpjs.org/functions/preg_quote/
        // original by: booeyOH
        // improved by: Ates Goral (http://magnetiq.com)
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // improved by: Brett Zamir (http://brett-zamir.me)
        // bugfixed by: Onno Marsman
        //   example 1: preg_quote("$40");
        //   returns 1: '\\$40'
        //   example 2: preg_quote("*RRRING* Hello?");
        //   returns 2: '\\*RRRING\\* Hello\\?'
        //   example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
        //   returns 3: '\\\\\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:'
        return String(str)
            .replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
    },
    /**
     * Chequear posibles caracteres numéricos
     * @param {String} text
     * La cadena probada.
     */
    ctype_digit: function (text) {
        if (typeof text !== 'string') {
            return false;
        }
        if (this.ctypeDigitPatt.test(text)) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * Determina si una variable está vacía
     * Determina si una variable es considerada vacía. 
     * Una variable se considera vacía si no existe o si su valor es igual a FALSE. 
     * empty() no genera una advertencia si la variable no existe.
     */
    empty: function (mixed_var) {
        //  discuss at: http://phpjs.org/functions/empty/
        // original by: Philippe Baumann
        //    input by: Onno Marsman
        //    input by: LH
        //    input by: Stoyan Kyosev (http://www.svest.org/)
        // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // improved by: Onno Marsman
        // improved by: Francesco
        // improved by: Marc Jansen
        // improved by: Rafal Kukawski
        //   example 1: empty(null);
        //   returns 1: true
        //   example 2: empty(undefined);
        //   returns 2: true
        //   example 3: empty([]);
        //   returns 3: true
        //   example 4: empty({});
        //   returns 4: true
        //   example 5: empty({'aFunc' : function () { alert('humpty'); } });
        //   returns 5: false

        var undef, key, i, len;
        var emptyValues = [undef, null, false, 0, '', '0'];

        for (i = 0, len = emptyValues.length; i < len; i++) {
            if (mixed_var === emptyValues[i]) {
                return true;
            }
        }

        if (typeof mixed_var === 'object') {
            for (key in mixed_var) {
                // TODO: should we check for own properties only?
                //if (mixed_var.hasOwnProperty(key)) {
                return false;
                //}
            }
            return true;
        }

        return false;
    }
});