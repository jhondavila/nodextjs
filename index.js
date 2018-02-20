/**
 * Buenas estimado, si te toco continuar la labor de editar el codigo y se te ocurrio
 * mirar este archivo, ten en encuenta que este framework fue diseñado con una estructura
 * pensada en componentes.
 * Si tu no estas muy relacionado a este tema, te aconsejo investigar unos meses antes
 * de meterle mano a este codigo, salvo tu cambio sea sencillo.
 * 
 * Solamente Dios y yo sabia como fue realizado este codigo...ahora solo dios lo sabe XD.
 */

(function () {
    var app = require("./app.json");
    require("./nodext/index")(app.mode || "debug");
    Nodext.launch(app, __dirname);
})();