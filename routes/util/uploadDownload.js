var fs = require('fs');
var multiparty = require('multiparty');
var walk = require('walk');
var Config = require('../../ServerConfig').fileConfig;
var mPath = require('path');
var MAX_SIZE = Config.maxSize;
var PROFILE_FOLDER = Config.profileFolder;

/*
 * Display upload form
 */

exports.display_form = {
    handler: function(requestuest, reply) {
        reply(
            '<form action="/upload" method="post" enctype="multipart/form-data">' +
            '<input type="file" name="file">' +
            '<input type="submit" value="Upload">' +
            '</form>'
        );
    }
};

/*
 * upload file
 */

exports.uploadFile = function(req, next) {
    var payload = new Object({
        maxBytes: MAX_SIZE,
        output: 'stream',
        parse: false
    });
    var fileCount = 0;
    var returnCount = 0;
    var resultData = new Array();
    var form = new multiparty.Form();
    form.uploadDir = Config.publicFolder + Config.uploadTempFolder;
    checkFileExist();

    form.parse(req.body, function(err, fields, files) {
        if (err) {
            return next(err);
        } else {
            fileCount = Object.keys(files).length;
            for (var i=0; i<fileCount; i++) {
                var fdata = Object.keys(files)[i];
                var data = files[fdata];
                upload(data, fields, function(result) {
                    returnCount++;
                    resultData.push(result);
                    if (returnCount == fileCount) {
                        next(resultData);
                    }
                });
            }
        }
    });
};

/*
 * upload file function
 */
var upload = function(data, fields, next) {

    var mkdirp = require('mkdirp');
    var fileType = fields["fileType"][0];
    var reqFileName = fields["fileName"][0];

    var now = new Date();
    //var todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    var month = (new Date()).toISOString().slice(0, 10).replace(/[^0-9]/g, "");


    for(var i = 0; i <  data.length ; i++) {
        var path = data[i].path;
        var fieldName = data[i].fieldName;
        var originalFilename = data[i].originalFilename;

        fs.readFile(path, function(err, data) {

            var newName = mPath.basename(path);

            var npp = "";
            var dpp = "";
            if(fileType == "100") {
                npp = Config.profileFolder + "/";
                dpp = Config.downloadFolder + "/" + Config.profileFolder + "/";
            } else {
                npp = Config.uploadFolder + "/" + fileType + "/" + month + "/";
                dpp = Config.downloadFolder + "/" + fileType + "/" + month + "/";
            }
            fs.exists(Config.publicFolder + npp, function(exists) {
                if (exists === false) {
                    mkdirp.sync(Config.publicFolder + npp);
                }

                var nPath = Config.publicFolder + npp + newName;

                //회원 사진일 경우.
                if(fileType == "100") {
                    var fileExp = originalFilename.substr(originalFilename.lastIndexOf('.')+1, originalFilename.length);
                    newName = reqFileName+"."+fileExp;
                    nPath = Config.publicFolder + npp + newName;
                }

                fs.writeFile(nPath, data, function(err) {
                    fs.unlink(path);
                    if (err) {
                        next({
                            "result" : false,
                            "orgFileName" : originalFilename,
                            "fileType" : fileType
                        });
                    } else {
                        next({
                            "result" : true,
                            "path" : dpp + newName,
                            "newFileName" : newName,
                            "orgFileName" : originalFilename,
                            "fileType" : fileType
                        });
                    }
                });
            });
        });
    };
};

/*
 * Check File existence and create if not exist
 */
var checkFileExist = function() {
    fs.exists(Config.publicFolder, function(exists) {
        if (exists === false) fs.mkdirSync(Config.publicFolder);

        var path = Config.publicFolder + Config.uploadTempFolder;
        fs.exists(path, function(exists) {
            if (exists === false) fs.mkdirSync(path);
        });
    });
};

/**
 * get file
 */

exports.getFile = function(req, next) {
    var file = req.params.file;
    var fileType = req.params.fileType;
    var fileDate = req.params.fileDate;
    var path = Config.publicFolder + Config.uploadFolder + "/" + fileType + "/" + fileDate + "/" + file;
    var ext = file.substr(file.lastIndexOf('.') + 1);

    fs.readFile(path, function(error, content) {
        if (error) return reply("file not found");
        var contentType;
        switch (ext) {
            case "pdf":
                contentType = 'application/pdf';
                break;
            case "ppt":
                contentType = 'application/vnd.ms-powerpoint';
                break;
            case "pptx":
                contentType = 'application/vnd.openxmlformats-officedocument.preplyentationml.preplyentation';
                break;
            case "xls":
                contentType = 'application/vnd.ms-excel';
                break;
            case "xlsx":
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case "doc":
                contentType = 'application/msword';
                break;
            case "docx":
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            case "csv":
                contentType = 'application/octet-stream';
                break;
            default:
                return reply.file(path);
        }
        return next(content).header('Content-Type', contentType).header("Content-Disposition", "attachment; filename=" + file);
    });
};

/**
 *get fileList
 */
 
exports.fileList = function(request, next) {
    var files = [];
    // Walker options
    var walker = walk.walk(Config.publicFolder + Config.uploadFolder, {
        followLinks: false
    });

    walker.on('file', function(root, stat, next2) {
        // Add this file to the list of files
        files.push(stat.name);
        next2();
    });

    walker.on('end', function() {
        return next(files);
    });
};
