/**
 * 
 */
// const ffmpeg = require('@ffmpeg-installer/ffmpeg');
Nodext.define("Nodext.media.Thumbails", {
    extend: "Nodext.Base",
    alternateClassName: ["Nodext.MThumb"],
    
    requires: [
        "Nodext.module.FileSystem"
    ],
    $configPrefixed: false,
    $configStrict: false,
    singleton: true,
    constructor: function (cfg) {
        Nodext.apply(this, cfg || {});
        this.initConfig();
        this.ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        this.ffmpeg = require("fluent-ffmpeg");
        this.ffprobe = require('@ffprobe-installer/ffprobe').path;
        this.ffmpeg.setFfmpegPath(this.ffmpegPath);
        this.ffmpeg.setFfprobePath(this.ffprobe);
    },
    extensionType: {
        mp4: "video",
        jpg: "image",
        png: "image",
        jpeg: "image",
        avi: "video"
    },
    getThumb: function (filepath, options, fnSucess, fnFail) {
        var ext = filepath.match(/\.[^/.]+$/);
        var list = [];
        var proc = new this.ffmpeg(filepath)
            .takeScreenshots({
                count: options.count || 1,
                filename: options.filename || '%b_%i_%wx%h.png',
                folder: options.folder,
                size: options.size || '320x240'
            }).on('filenames', function (filenames) {
                list.push.apply(list, filenames);
            }).on('end', function () {
                fnSucess ? fnSucess(list) : null;
            }).on('error', function () {
                fnFail ? fnFail() : null;
            });
    },
    getThumbVideo: function (filepath) {

    }
});