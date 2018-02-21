/**
 * @class Nodext.JSON
 * @singleton 
 */
Nodext.JSON = {
    /**
     * @method decode
     * Decodifica una cadena a un objeto. Si el JSON es invalido y safe en 'true' retorna null.
     * @param json
     * @param safe
     * @return {Object}
     */
    decode: function (json, safe) {
        try {
            return JSON.parse(json);
        } catch (e) {
            if (safe) {
                return null;
            }
        }
    },
    /**
     * @method encode
     * Encodifica un objeto,array u otro valor.
     * @param o
     * @return {String}
     */
    encode: function (o) {
        return JSON.stringify(o);
    }
};