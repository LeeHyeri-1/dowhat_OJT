/**
 * Created by Administrator on 2017-01-11.
 */

var fs = require('fs');
var mkdirp = require('mkdirp');
var Thumbnail = require('./thumbnail');
var gm = require('gm');

const ServerConfig = require('../../ServerConfig');
var globalConfig = ServerConfig.globalConfig;
var serverConfig = ServerConfig.serverConfig;

exports.file = {
    rename : function(oldName, newName, next) {
        fs.exists(oldName, function(oldExist) {
            if(oldExist) {
                fs.exists(newName, function(newExist) {
                    if(newExist) {
                        // 옮기려는 위치에 파일이 있음. 삭제후 이전
                        this.delete(newName, function(result) {
                            if(result > 0) {
                                fs.rename(oldName, newName, function(result) {
                                    if(typeof next == 'function') {
                                        next(result);

                                    } else {
                                        return 0;
                                    }
                                });

                            } else {
                                // 삭제 실패
                                if(typeof next == 'function') {
                                    next(0);

                                } else {
                                    return 0;
                                }
                            }
                        });

                    } else {
                        // 이상 없음
                        fs.rename(oldName, newName, function(result) {
                            if(typeof next == 'function') {
                                next(result);

                            } else {
                                return 1;
                            }
                        });
                    }
                });

            } else {
                // 파일이 존재하지 않음
                if(typeof next == 'function') {
                    next(0);

                } else {
                    return 0;
                }
            }
        });
    },

    delete : function(path, next) {
        fs.exists(path, function(exists) {
            if (exists) {
                fs.unlink(path, function (err) {
                    if(typeof next == 'function') {
                        next(1);
                    }
                });
            } else {
                if(typeof next == 'function') {
                    next(0);
                }
            }
        });
    }
};

exports.fileUpload = function (fileData, filePath, fileName, next) {

    fs.exists(filePath, function (exists) {
        if (exists === false) {
            mkdirp.sync(filePath);
        }

        var fileStream = fs.createWriteStream(filePath + fileName);
        fileStream.on('error', function (err) {
            LogErrorDao.error('FILE_UPLOAD_STREAM', err);
        });

        fileData.pipe(fileStream);

        fileData.on('end', function (err) {
            if (err) {
                LogErrorDao.error('FILE_UPLOAD_WRITE', err);
                next(err);
            } else {
                next(null);
            }
        });
    });
};

exports.fileDelete = function (filePath, fileName, next) {
    var path = filePath + fileName;

    fs.exists(path, function (exists) {
        if (exists) {
            fs.unlink(path, function (err) {
                if (err) {
                    next(0);

                } else {
                    next(1);
                }
            });

        } else {
            next(1);
        }
    });
};

exports.rescaleCalc = function (width, height, maxWidth, maxHeight, option, next) {
    // 가로, 세로 최대 사이즈 설정
    var resizeWidth = width;
    var resizeHeight = height;

    // 이미지 비율 구하기
    var basisRatio = maxHeight / maxWidth;
    var imgRatio = height / width;

    if (option == 4) {

    } else if ((imgRatio == basisRatio) || (option == 3)) {
        // 기준 비율과 동일한 경우
        // 강제로 크기를 세팅하는 경우

        resizeWidth = maxWidth;
        resizeHeight = maxHeight;

    } else if ((imgRatio > basisRatio) && (height > maxHeight)) {
        // height가 기준 비율보다 길다.

        if (option == 1) {
            resizeHeight = maxHeight;
            resizeWidth = Math.round((width * resizeHeight) / height);

        } else if (option == 2) {
            resizeWidth = maxWidth;
            resizeHeight = Math.round((height * resizeWidth) / width);

        }

    } else if ((imgRatio < basisRatio) && (width > maxWidth)) {
        // width가 기준 비율보다 길다.

        if (option == 1) {
            resizeWidth = maxWidth;
            resizeHeight = Math.round((height * resizeWidth) / width);

        } else if (option == 2) {
            resizeHeight = maxHeight;
            resizeWidth = Math.round((width * resizeHeight) / height);

        }

    }

    next(resizeWidth, resizeHeight);
};

exports.uploadImage = function (publicFolder, fileName, fileData, parentPath, next) {
    if(fileData) {

        var path = "/" + parentPath + "/";
        var orgFileName = fileData.hapi.filename;
        var ext = orgFileName.substring(orgFileName.lastIndexOf('.') + 1, orgFileName.length).toLowerCase();

        fileName = fileName + '.' + ext;

        //data.profileImg.hapi.filename;

        if (ext == 'jpg') {
            var uploadPath = publicFolder + path; // 전체 경로

            this.fileUpload(fileData, uploadPath, fileName, function (res) {
                gm(uploadPath + fileName).size(function (err, dimensions) {
                    if (err) {
                        //LogErrorDao.error('WAS_PROFILE_GM', err);
                        //next(1);
                        return;
                    }

                    this.rescaleCalc(dimensions.width, dimensions.height, 200, 200, function (resizeWidth, resizeHeight) {
                        var thumbnail = new Thumbnail(uploadPath, uploadPath);
                        thumbnail.ensureThumbnail(fileName, '', resizeWidth, resizeHeight, function (err, filename) {
                        });
                    });
                });
            });
        }

        next(1);
    } else {
        next(1);
    }
};

exports.generateUnique = function () {
    var min = 100000;
    var max = 999999;
    var now = new Date();
    var timeStamp2 = "";

    timeStamp2 += now.getFullYear().toString(); // 2018
    timeStamp2 += (now.getMonth() + 1 < 9 ? '0' : '') + now.getMonth().toString(); // JS months are 0-based, so +1 and pad with 0's
    timeStamp2 += (now.getDate() < 10 ? '0' : '') + now.getDate().toString();
    timeStamp2 += Math.floor(Math.random() * (max - min + 1)) + min;
    newFilePre = timeStamp2;

    return timeStamp2;
};

