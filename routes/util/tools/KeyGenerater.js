/**
 * Created by 유희찬 on 2019-07-30.
 */

const secureRandom = require('secure-random');

const SIZE = 128;
const RET_TYPE = 'base64';

var signingKey = secureRandom(SIZE, {type: 'Buffer'});

console.log(signingKey.toString(RET_TYPE));