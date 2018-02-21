var utils = require("./utils");
(function (type) {
    var fileList;
    fileList = require("./load.json");
    utils.injectExtJS(fileList);
})();
exports = module.exports = Nodext;