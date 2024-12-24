/**
 * Created by anbaksa on 2016-06-21.
 */


exports.validate = function (request, decodedToken, callback) {

    let error = null;
    let credentials = {
        userIds: decodedToken.userId
    };

    if (!credentials) {
        return callback(error, false, credentials);
    }

    return callback(error, true, credentials)
};

exports.validateWeb = function (request, decodedToken, callback) {

    let error = null;
    let credentials = {
        userId: decodedToken.userId,
        companySeq: decodedToken.companySeq,
        hotelSeq: decodedToken.hotelSeq,
    };

    //if (!credentials || request.yar.get('ADMIN_ID') !== decodedToken.userId) {
    //    return callback(error, false, credentials);
    //}

    return callback(error, true, credentials)
};
