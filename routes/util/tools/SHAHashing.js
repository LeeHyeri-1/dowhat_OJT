/**
 * Created by 유희찬 on 2019-01-11.
 */

const crypto = require('crypto');

var txt = '12345';

console.log(crypto.createHash('sha256').update(txt).digest('base64'));
