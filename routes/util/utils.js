/**
 * Created by Administrator on 2017-01-11.
 */

const sql = require('mysql');
const jwt = require('jsonwebtoken');

const ServerConfig = require('../../ServerConfig');
var globalConfig = ServerConfig.globalConfig;
var serverConfig = ServerConfig.serverConfig;

const CommonDao = require('../dao/CommonDao');
//const CONSTANT = require('../../Constant');

exports.random = {
    /**
     * 랜덤 값 생성기
     * @param type 비트맵 1:숫자, 2:소문자, 4:대문자
     * @param returnSize 랜덤 값의 길이
     * @returns {string}
     */
    create: function (type, returnSize) {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        if (type === 1) {    // 숫자만
            chars = "0123456789";
        } else if (type === 2) { // 소문자
            chars = "abcdefghiklmnopqrstuvwxyz";
        } else if (type === 3) { // 숫자 + 소문자
            chars = "0123456789abcdefghiklmnopqrstuvwxyz";
        } else if (type === 4) { // 대문자
            chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
        } else if (type === 5) { // 숫자 + 대문자
            chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";
        } else if (type === 6) { // 대소문자
            chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        } else if (type === 7) { // 숫자+대소문자
            chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        }
        var randomString = '';
        for (var i = 0; i < returnSize; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomString += chars.substring(rnum, rnum + 1);
        }
        return randomString;
    },

    encCreate: function (type, retSize, next) {
        let plainTxt = this.create(type, retSize);

        //8자로 짤린 랜덤 넘버를 sha256으로 인코딩 후 base64코딩함.
        var crypto = require('crypto');
        var encPw = crypto.createHash('sha256').update(plainTxt).digest("base64");

        if (typeof next != 'function') {
            return encPw;

        } else {
            next(plainTxt, encPw);

        }
    }
};

exports.convert = {
    getAge: function (birthYear) {
        var today = new Date();
        var toYear = today.getFullYear();
        var age = toYear - birthYear;
        if (toYear == birthYear || birthYear == undefined || birthYear == 0) {
            age = "";
        }
        return age;
    },
    getBirthYear: function (age) {
        var today = new Date();
        var toYear = today.getFullYear();
        var birthYear = toYear - age;
        return birthYear;
    },
    addZero: function (num, size) {
        var tmp = "00000000000000000000" + num;
        return tmp.substring(tmp.length - size, tmp.length);
    }
};

exports.utils = {
    makeArray: (strToArr, splitChar) => {
        let resultArr = [];
        for (let data of strToArr.split(splitChar)) {
            if (data != '') {
                resultArr.push(data);
            }
        }

        return resultArr;
    },

    isNull: function (val, def) {
        if (val == null || val == undefined) {
            return def;
        } else {
            return val;
        }
    },

    /**
     * 요청 받은 데이터를 확인하고 없는 값은 기본값을 채워주거나 에러를 던진다.
     * @param data - 요청 받은 데이터 그 자체(request)
     * @param needArr - 값이 반드시 있어야하며 없으면 에러를 던지는 변수 목록
     * @param strArr - 디폴트 값이 ''인 변수 목록
     * @param intArr - 디폴트 값이 0인 변수 목록
     * @param intArr2 - 디폴트 값이 1인 변수 목록
     * @param method - HTTP 요청 방법 ('GET', 'POST', 'PUT', 'DELETE')
     * @returns 데이터 처리 후의 값
     */
    check: function (data, needArr, strArr, intArr, intArr2) {
        var raw;

        // 메서드에 따라 얻어오는 데이터 분기
        if (data.method == 'GET' || data.method == 'get')
            raw = data.query;
        else if (data.method == 'POST' || data.method == 'PUT' || data.method == 'DELETE' || data.method == 'post' || data.method == 'put' || data.method == 'delete')
            raw = data.payload;

        // 리턴해 주는 데이터
        var retData = {};
        retData.check_result = true;
        retData.check_value = '';

        // 필수 데이터 체크
        for (var i = 0; i < needArr.length; i++) {
            try {
                // 값이 없거나 null이거나 비었을 경우 실패를 보내준다.
                if (raw[needArr[i]] == undefined || raw[needArr[i]] == null || raw[needArr[i]] == '') {
                    retData.check_result = false;
                    retData.check_value += needArr[i] + ' ';

                } else {
                    retData[needArr[i]] = raw[needArr[i]];
                }

                // 읽지 못한 값이 있는 경우
            } catch (err) {
                retData.check_result = false;
                retData.check_value += needArr[i] + ' ';
            }
        }

        if (!retData.check_result)
            return retData;

        // 이하는 값이 비었으면 기본 값을 보내준다.
        for (var i = 0; i < strArr.length; i++) {
            try {
                if (raw[strArr[i]] == undefined || raw[strArr[i]] == null) {
                    retData[strArr[i]] = '';

                } else {
                    retData[strArr[i]] = raw[strArr[i]];
                }

            } catch (err) {
                retData[strArr[i]] = '';
            }
        }

        for (var i = 0; i < intArr.length; i++) {
            try {
                if (raw[intArr[i]] == undefined || raw[intArr[i]] == null || raw[intArr[i]] == '') {
                    retData[intArr[i]] = 0;

                } else {
                    retData[intArr[i]] = parseInt(raw[intArr[i]]);
                }

            } catch (err) {
                retData[intArr[i]] = 0;
            }
        }

        for (var i = 0; i < intArr2.length; i++) {
            try {
                if (raw[intArr2[i]] == undefined || raw[intArr2[i]] == null || raw[intArr2[i]] == '') {
                    retData[intArr2[i]] = 1;

                } else {
                    retData[intArr2[i]] = parseInt(raw[intArr2[i]]);
                }

            } catch (err) {
                retData[intArr2[i]] = 1;
            }
        }

        try {
            retData.userId = data.auth.credentials.userId;
            retData.sessionId = data.auth.credentials.sessionId;
            retData.userCompanySeq = data.auth.credentials.companySeq;
            retData.userHotelSeq = data.auth.credentials.hotelSeq;

        } catch (err) {

        }

        return retData;
    },

    checkWeb: function (data, needArr, strArr, intArr, intArr2, reply, isrequire, path) {
        var raw;

        // 메서드에 따라 얻어오는 데이터 분기
        if (data.method == 'GET' || data.method == 'get')
            raw = data.query;
        else if (data.method == 'POST' || data.method == 'PUT' || data.method == 'DELETE' || data.method == 'post' || data.method == 'put' || data.method == 'delete')
            raw = data.payload;

        // 리턴해 주는 데이터
        var retData = {};
        retData.check_result = true;
        retData.check_value = '';

        // 필수 데이터 체크
        for (var i = 0; i < needArr.length; i++) {
            try {
                // 값이 없거나 null이거나 비었을 경우 실패를 보내준다.
                if (raw[needArr[i]] == undefined || raw[needArr[i]] == null || raw[needArr[i]] == '') {
                    retData.check_result = false;
                    retData.check_value += needArr[i] + ' ';

                } else {
                    retData[needArr[i]] = raw[needArr[i]];
                }

                // 읽지 못한 값이 있는 경우
            } catch (err) {
                retData.check_result = false;
                retData.check_value += needArr[i] + ' ';
            }
        }

        if (!retData.check_result)
            return retData;

        // 이하는 값이 비었으면 기본 값을 보내준다.
        for (var i = 0; i < strArr.length; i++) {
            try {
                if (raw[strArr[i]] == undefined || raw[strArr[i]] == null) {
                    retData[strArr[i]] = '';

                } else {
                    retData[strArr[i]] = raw[strArr[i]];
                }

            } catch (err) {
                retData[strArr[i]] = '';
            }
        }

        for (var i = 0; i < intArr.length; i++) {
            try {
                if (raw[intArr[i]] == undefined || raw[intArr[i]] == null || raw[intArr[i]] == '') {
                    retData[intArr[i]] = 0;

                } else {
                    retData[intArr[i]] = parseInt(raw[intArr[i]]);
                }

            } catch (err) {
                retData[intArr[i]] = 0;
            }
        }

        for (var i = 0; i < intArr2.length; i++) {
            try {
                if (raw[intArr2[i]] == undefined || raw[intArr2[i]] == null || raw[intArr2[i]] == '') {
                    retData[intArr2[i]] = 1;

                } else {
                    retData[intArr2[i]] = parseInt(raw[intArr2[i]]);
                }

            } catch (err) {
                retData[intArr2[i]] = 1;
            }
        }

        try {
            retData.userId = data.auth.credentials.userId;
            retData.userType = data.auth.credentials.userType;
            retData.sessionId = data.auth.credentials.sessionId;

        } catch (err) {

        }

        return retData;
    },

    languageFilter: function (data, filter, language) {
        for (var dataKey in data) {
            for (var filterKey in filter) {
                if (data[dataKey][filter[filterKey] + '_' + language]) {
                    data[dataKey][filter[filterKey]] = data[dataKey][filter[filterKey] + '_' + language];
                } else {
                    data[dataKey][filter[filterKey]] = '';
                }
            }
        }

        return data;
    },

    languageOneFilter: function (data, filter, language) {
        for (var filterKey in filter) {
            if (data[filter[filterKey] + '_' + language]) {
                data[filter[filterKey]] = data[filter[filterKey] + '_' + language];
            } else {
                data[filter[filterKey]] = '';
            }
        }

        return data;
    }
};

exports.generateCode = function (length, next) {
    var min = 1;
    var max = 9;

    for (var i = 0; i < length; i++) {
        min += '0';
        max += '9';
    }

    //랜덤 패스워드 생성.
    var random = Math.floor(Math.random() * (max - min + 1)) + min;
    var now = new Date();
    var timeStamp2 = "";
    timeStamp2 += (now.getMinutes() < 9 ? '0' : '') + now.getMinutes().toString(); // JS months are 0-based, so +1 and pad with 0's
    timeStamp2 += (now.getMilliseconds() < 10 ? '0' : '') + now.getMilliseconds().toString();
    timeStamp2 += random;
    var randomNumber = timeStamp2;

    //패스워드 길이가 8자가 아닐 경우 8자로 맞춰줌(부족하면 패딩 추가)
    var inquiredString = "";
    if (randomNumber.length < length) {
        inquiredString = randomNumber;
        var i;
        for (i = randomNumber.length; i < length; i++) {
            inquiredString += '0';
        }
    } else {
        inquiredString = randomNumber.substring(0, length);
    }

    //8자로 짤린 랜덤 넘버를 sha256으로 인코딩 후 base64코딩함.
    var crypto = require('crypto');
    var convertedPw = crypto.createHash('sha256').update(inquiredString).digest("base64");
    // var finalPw = new Buffer(convertedPw).toString('base64');

    if (typeof next != 'function') {
        return convertedPw;

    } else {
        next(inquiredString, convertedPw);

    }
};

exports.BitmapCast = {
    BitmapToArray: function (input, length) {
        var arr = [];
        for (var i = 0; i < length; i++)
            arr[i] = 0;

        var remain = input;

        for (var i = length - 1; i >= 0; i--) {
            var check = Math.pow(2, i);

            if (check == remain) {
                arr[length - (i + 1)] = 1;
                remain -= check;
            } else if (check < remain) {
                arr[length - (i + 1)] = 1;
                remain -= check;
            }
        }

        return arr;
    },

    ArrayToBitmap: function (input, length) {
        var result = 0;

        for (var i = input.length - 1; i >= 0; i--) {
            if (input[i] == 1)
                result += Math.pow(2, (length - 1) - i);
        }

        return result;
    },
};

exports.response = {

    simpleTrueReply: function (path, reply, obj, codeSuc) {
        obj.result = true;
        obj.code = path + '/' + 'suc' + codeSuc;

        reply(obj);
    },

    simpleFalseReply: function (path, reply, obj, codeErr) {
        obj.result = false;
        obj.code = path + '/' + 'err' + codeErr;

        reply(obj);
    },

    overZeroSimpleReply: function (path, reply, value, codeSuc, codeErr, addObj) {
        let retObj = {};

        if (addObj)
            retObj = addObj;

        if (value > 0) {
            retObj.result = true;
            retObj.code = path + '/' + 'suc' + codeSuc;

            reply(retObj);

        } else {
            retObj.result = false;
            retObj.code = path + '/' + 'err' + codeErr;

            reply(retObj);

        }
    },

    objTrueReply: function (path, reply, obj, retObjName, codeSuc, codeErr, addObj) {
        let retObj = {};

        if (addObj)
            retObj = addObj;

        if (obj) {
            retObj.result = true;
            retObj.code = path + '/' + 'suc' + codeSuc;
            retObj[retObjName] = obj;

            reply(retObj);

        } else {
            retObj.result = false;
            retObj.code = path + '/' + 'err' + codeErr;

            reply(retObj);

        }
    },

    objTrueListReply: function (path, reply, obj, retObjName, count, page, itemCountPerPage, pageCountPerPaging, codeSuc, codeErr, addObj) {
        let retObj = {};

        if (addObj)
            retObj = addObj;

        if (obj) {
            retObj.result = true;
            retObj.code = path + '/' + 'suc' + codeSuc;
            retObj.count = count;
            retObj.page = page;
            retObj.itemCountPerPage = itemCountPerPage;
            retObj.pageCountPerPaging = pageCountPerPaging;
            retObj[retObjName] = obj;

            reply(retObj);

        } else {
            retObj.result = false;
            retObj.code = path + '/' + 'err' + codeErr;

            reply(retObj);

        }
    }
};


exports.permissionCheck = {
    prePermissionValidCheck: function (request, reply) {
        const decoded = {
            userId: request.auth.credentials.userId
        };

        // console.log(request.path);
        // console.log(request.method);

        let [permissionSetNum, resultPermissionRW] = exports.permissionCheck.pathToPermission(request.path, request.method);

        // console.log('permissionSetNum', permissionSetNum);
        // console.log('resultPermissionRW', resultPermissionRW);

        exports.permissionCheck.permissionValidCheck([decoded, permissionSetNum, resultPermissionRW])
            .then(() => {
                return reply();
            })
            .catch((err) => {
                return reply(err);
            });
    },

    permissionValidCheck: function ([decoded, permissionSetNum, permissionRW]) {
        // console.log('permissionValidCheck')
        return new Promise((resolve, reject) => {
            resolve(decoded);
            return;
            // console.log('decoded', decoded)
            // console.log('permissionSetNum', permissionSetNum)
            // console.log('permissionRW', permissionRW)
            if (!permissionRW || permissionRW === '') {
                reject('401');
                return;
            }
            // console.log(`
            //     SELECT permission${permissionRW} & ${permissionSetNum} AS has_permission
            //     FROM t_nf_user_info
            //     WHERE user_id = ${sql.escape(decoded.userId)}
            // `)
            // permission_read, permission_read+0 AS permission_read_num, permission_write, permission_write+0 AS permission_write_num
            CommonDao.getOne(`
                SELECT permission${permissionRW} & ${permissionSetNum} AS has_permission
                FROM t_nf_user_info
                WHERE user_id = ${sql.escape(decoded.userId)}
            `, (permissionData) => {
                if (permissionData.has_permission === 0) {
                    reject('401');
                    return;
                }

                resolve(decoded);

            });

        });
    },

    typeToPermission: function (targetType) {
        let resultPermission = 0;

        switch (targetType) {
            /** PtmsBrokerAction **/
            case 'EMERGENCY_MESSAGE':
                resultPermission = 1;
                break;
            case 'MESSAGE':
                resultPermission = 2;
                break;
            case 'CHECK_IN':
                resultPermission = 4;
                break;
            case 'CHECK_OUT':
                resultPermission = 8;
                break;
            case 'ORDER_STATUS':
                resultPermission = 16;
                break;
            case 'CLEAN':
                resultPermission = 32;
                break;

            /** HotelInfoRoutes **/
            case 'MAIN_HOTEL':
                resultPermission = 64;
                break;

        }

        return resultPermission;
    },

    pathToPermission: function (path, method) {
        let resultPermission = 0;
        let resultPermissionRW;

        switch (path) {
            /** HotelInfoRoutes **/
            // MAIN_HOTEL 64
            case '/api/front/company/info':
                if (method === 'post') {
                    resultPermission = 64;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/company':
                if (method === 'post') {
                    resultPermission = 64;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            // HOTEL_MANAGE 128
            case '/api/front/hotel/list':
            case '/api/front/hotel/info':
                if (method === 'post') {
                    resultPermission = 128;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/hotel/delete':
            case '/api/front/hotel':
                if (method === 'put') {
                    resultPermission = 128;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'post') {
                    resultPermission = 128;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** NoticeRoutes **/
            // NOTICE_MANAGE 256
            case '/api/front/tablet/notice/list':
            case '/api/front/tablet/notice/info':
                if (method === 'post') {
                    resultPermission = 256;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/tablet/notice':
                if (method === 'post') {
                    resultPermission = 256;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                if (method === 'put') {
                    resultPermission = 256;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;
            // ====================================
            case '/api/front/app/notice/list':
            case '/api/front/app/notice/info':
                if (method === 'post') {
                    resultPermission = 256;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/app/notice':
                if (method === 'post') {
                    resultPermission = 256;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;
            case '/api/front/app/notice/update':
                if (method === 'put') {
                    resultPermission = 256;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;
            // ====================================
            case '/api/front/notice/order':
            case '/api/front/notice/show':
            case '/api/front/notice/delete':
                if (method === 'post') {
                    resultPermission = 256;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** EventRoutes **/
            // NOTICE_MANAGE 256
            case '/api/front/event/list':
            case '/api/front/event/info':
                if (method === 'post') {
                    resultPermission = 256;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/event':
            case '/api/front/event/update':
            case '/api/front/event/order':
            case '/api/front/event/show':
            case '/api/front/event/delete':
                if (method === 'post') {
                    resultPermission = 256;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** RoomManageRoutes **/
            // ROOM_MANAGE 512
            case '/api/front/room/building/list':
                if (method === 'post') {
                    resultPermission = 512;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/room/building':
            case '/api/front/room/building/order':
            case '/api/front/room/building/delete':
                if (method === 'post') {
                    resultPermission = 512;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;
            // ====================================
            case '/api/front/room/floor/list':
                if (method === 'post') {
                    resultPermission = 512;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/room/floor':
            case '/api/front/room/floor/order':
            case '/api/front/room/floor/delete':
                if (method === 'post') {
                    resultPermission = 512;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;
            // ====================================
            case '/api/front/room/list':
                if (method === 'post') {
                    resultPermission = 512;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/room/new':
            case '/api/front/room/order':
            case '/api/front/room/delete':
                if (method === 'post') {
                    resultPermission = 512;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;
            // ====================================
            case '/api/front/room/type/list':
            case '/api/front/room/count':
                if (method === 'post') {
                    resultPermission = 512;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/room/type':
            case '/api/front/room/type/delete':
                if (method === 'post') {
                    resultPermission = 512;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** RoomCheckListRoutes **/
            // ROOM_CHECKLIST 1024
            case '/api/front/room/type/check/list':
            case '/api/front/room/check/type/list':
                if (method === 'post') {
                    resultPermission = 1024;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/room/type/check':
            case '/api/front/room/type/check/delete':
                if (method === 'post') {
                    resultPermission = 1024;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** RoomCheckListRoutes **/
            // ORGANIZATION 2048
            case '/api/department/list/parent':
                if (method === 'post') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/department':
                if (method === 'post') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'delete') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;
            // ====================================
            case '/api/user/list/include':
            case '/api/user/list':
                if (method === 'post') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;
            // ====================================
            case '/api/user/position/list':
                if (method === 'post') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/user/position':
                if (method === 'post') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'delete') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            case '/api/user/position/order':
                if (method === 'put') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            // ====================================
            case '/api/user/duty/list':
                if (method === 'post') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/user/duty/order':
            case '/api/user/duty':
                if (method === 'post') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'delete') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            case '/api/user/department/category/list':
                if (method === 'post') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            /** EmployeeManageRoutes **/
            // ORGANIZATION 2048
            case '/api/select/department':
            case '/api/select/position':
            case '/api/front/employee/detail':
            case '/api/select/duty':
                if (method === 'post') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/employee':
            case '/api/front/employee/update':
            case '/api/front/employee/delete':
            case '/api/front/employee/update/pwd':
                if (method === 'post') {
                    resultPermission = 2048;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** WorkScheduleRoutes **/
            // WORK_SCHEDULE 4096
            case '/api/work/group/list':
            case '/api/work/detail':
            case '/api/work/list':
                if (method === 'post') {
                    resultPermission = 4096;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/work/list/excel':
            case '/api/work':
            case '/api/work/group':
            case '/api/work/group/order':
                if (method === 'post') {
                    resultPermission = 4096;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 4096;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'delete') {
                    resultPermission = 4096;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** ContentsManageRoutes **/
            // MAIN_CONTENTS 8192
            case '/api/select/roomSeq':
            case '/api/front/contents/info':
            case '/api/front/contents/list':
                if (method === 'post') {
                    resultPermission = 8192;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/contents':
            case '/api/front/contents/order':
            case '/api/front/contents/setUp':
            case '/api/front/contents/delete':
                if (method === 'post') {
                    resultPermission = 8192;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 8192;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** HotelManualRoutes **/
            // HOTEL_MANUAL 16384
            case '/api/front/manual/category/list':
            case '/api/front/manual/list':
            case '/api/front/manual/info':
                if (method === 'post') {
                    resultPermission = 16384;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/manual/category':
            case '/api/front/manual/category/order':
            case '/api/front/manual/category/delete':
            case '/api/front/manual':
            case '/api/front/manual/order':
            case '/api/front/manual/delete':
                if (method === 'post') {
                    resultPermission = 16384;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** ConciergeRoutes **/
            /** GreencardRoutes **/
            // CONCIERGE 32768
            case '/api/concierge/category/list':
            case '/api/concierge/item/list':
            case '/api/concierge/list':
            case '/api/concierge/detail':
            case '/api/concierge/check/duplicate':
            case '/api/greencard/list':
                if (method === 'post') {
                    resultPermission = 32768;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/concierge/category':
            case '/api/concierge/category/order':
            case '/api/concierge/item':
            case '/api/concierge/item/order':
            case '/api/concierge':
            case '/api/concierge/order':
            case '/api/greencard':
                if (method === 'post') {
                    resultPermission = 32768;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 32768;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'delete') {
                    resultPermission = 32768;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** RoomServiceRoutes **/
            // CONCIERGE 65536‬
            case '/api/roomservice/category/list':
            case '/api/roomservice/list':
            case '/api/roomservice/detail':
                if (method === 'post') {
                    resultPermission = 65536;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/roomservice/category':
            case '/api/roomservice/category/order':
            case '/api/roomservice':
            case '/api/roomservice/order':
                if (method === 'post') {
                    resultPermission = 65536;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 65536;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'delete') {
                    resultPermission = 65536;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** TourRoutes **/
            // TOUR_MANAGE 131072
            case '/api/tour/category/list':
            case '/api/tour/course/list':
            case '/api/tour/list':
            case '/api/tour/detail':
                if (method === 'post') {
                    resultPermission = 131072;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/tour/category':
            case '/api/tour/category/order':
            case '/api/tour/course':
            case '/api/tour/course/order':
            case '/api/tour':
            case '/api/tour/order':
                if (method === 'post') {
                    resultPermission = 131072;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 131072;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'delete') {
                    resultPermission = 131072;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** RestaurantRoutes **/
            // RESTAURANT_MANAGE 262144
            case '/api/restaurant/category/list':
            case '/api/restaurant/menu/list':
            case '/api/restaurant/list':
            case '/api/restaurant/detail':
                if (method === 'post') {
                    resultPermission = 262144;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/restaurant/category':
            case '/api/restaurant/category/order':
            case '/api/restaurant/menu':
            case '/api/restaurant/menu/order':
            case '/api/restaurant':
            case '/api/restaurant/order':
                if (method === 'post') {
                    resultPermission = 262144;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 262144;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'delete') {
                    resultPermission = 262144;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** TrafficRoutes **/
            // TRAFFIC_MANAGE 524288
            case '/api/traffic/item/list':
            case '/api/traffic/list':
                if (method === 'post') {
                    resultPermission = 524288;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/traffic/item':
            case '/api/traffic/item/order':
            case '/api/traffic':
            case '/api/traffic/order':
                if (method === 'post') {
                    resultPermission = 524288;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 524288;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'delete') {
                    resultPermission = 524288;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** EvaluateRoutes **/
            // HOTEL_EVALUATE 1048576
            case '/api/evaluate/submit/list':
            case '/api/evaluate/submit/detail':
            case '/api/evaluate/question/list':
                if (method === 'post') {
                    resultPermission = 1048576;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/evaluate/question':
                if (method === 'put') {
                    resultPermission = 1048576;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** MessageRoutes **/
            // MESSAGE_MANAGE 2097152
            case '/api/message/category/list':
            case '/api/message/list':
            case '/api/message/data':
                if (method === 'post') {
                    resultPermission = 2097152;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/message/category':
            case '/api/message/category/order':
            case '/api/message':
            case '/api/message/order':
                if (method === 'post') {
                    resultPermission = 2097152;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'put') {
                    resultPermission = 2097152;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                } else if (method === 'delete') {
                    resultPermission = 2097152;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

            /** RoomConditionRoutes **/
            // ROOM_CONDITION 4194304‬
            case '/api/front/room/condition/list':
            case '/api/front/room/condition/info':
                if (method === 'post') {
                    resultPermission = 4194304;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.READ;
                }
                break;

            case '/api/front/room/condition/confirm':
                if (method === 'post') {
                    resultPermission = 4194304;
                    resultPermissionRW = exports.permissionCheck.PERMISSION_RW.WRITE;
                }
                break;

        }

        return [resultPermission, resultPermissionRW];
    },

    PERMISSION_RW: {
        READ: '_read',
        WRITE: '_write'
    },

    noPermissionResponse: function (req, reply) {
        if (req.pre.permission !== null) {
            exports.response.simpleFalseReply(req.path, reply, {msg: `Have no Permission`}, '401');
            return true;
        }

        return false;

    }

}

exports.dowhatConvert = {

    // CONNECT
    getConnectByCompanySeqInCompanySeq: function (request, reply) {
        let dataObj;
        if(request.method === 'get'){
            dataObj = request.query;
        }else{
            dataObj = request.payload;
        }

        let companySeq = null;
        try{
            companySeq = dataObj.companySeq;
        }catch (err) {
            return reply(undefined);
        }

        const connectData = CONSTANT.CONNECT_BY_COMPANY_SEQ[companySeq];

        return reply(connectData);

    },

    getConnectByHotelSeq: function (request, reply) {

        let hotelSeq;

        if (request.payload) {
            hotelSeq = request.payload.hotelSeq;
        }else if(request.query){
            hotelSeq = request.query.hotelSeq;
        }

        const connectData = CONSTANT.CONNECT_BY_HOTEL_SEQ[hotelSeq];

        return reply(connectData);
    },

    getConnectByHotelSeqInTopic: function (request, reply) {
        let topic = null;
        let hotelSeq = null;
        try{
            topic = request.payload.topic;

            hotelSeq = parseInt(exports.utils.makeArray(topic, '/')[3]);
            if(isNaN(hotelSeq)){
                throw new Error('companySeq isNaN');
            }

        }catch (err) {
            return reply(undefined);
        }
        const connectData = CONSTANT.CONNECT_BY_HOTEL_SEQ[hotelSeq];

        return reply(connectData);
    },


    getConnectByCompanySeqInTopic: function (request, reply) {
        let topic = null;
        let companySeq = null;
        try{
            topic = request.payload.topic;

            companySeq = parseInt(exports.utils.makeArray(topic, '/')[1]);
            if(isNaN(companySeq)){
                throw new Error('companySeq isNaN');
            }

        }catch (err) {
            return reply(undefined);
        }
        const connectData = CONSTANT.CONNECT_BY_COMPANY_SEQ[companySeq];

        return reply(connectData);
    },

    validConnect: (req, reply)=>{
        if(!req.pre.connectData){
            exports.response.simpleFalseReply(req.path, reply, {msg: `Not exist connectData`}, '998');
            return true;
        }

        return false;
    },

}

exports.jwtDecode = {

    decodeJwt: (request, reply)=>{

        const token = getTokenFromHeader(request);
        let decodeData = undefined;

        jwt.verify(token, globalConfig.JWT_SECRET, (err, decoded)=>{
            decodeData = decoded;
        });

        // if()){
        //     decodeData = jwt.decode(token);
        // }

        return reply(decodeData);

    },



}

getTokenFromHeader = (req) => {
    if (
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
    ) {
        return req.headers.authorization.split(' ')[1];
    }
    return '';
}