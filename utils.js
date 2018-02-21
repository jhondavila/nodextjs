var fs = require("fs");
var extBasePath = __dirname;
var prepareFileList = function (fileList) {
    var listLoad = [];
    for (var x = 0; x < fileList.length; x++) {
        if(fileList[x].load === true){
            listLoad = listLoad.concat(fileList[x].items);
        }
    }
    return listLoad.map(function (file) {
        return extBasePath + file;
    });
};
var utils = module.exports = {
    injectExtJS: function (fileList) {
        fileList = prepareFileList(fileList);

        fileList.forEach(function (file) {
            require(file);
        });
    }
};
