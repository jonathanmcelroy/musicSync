const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const P = require('bluebird');

const redis = require('fakeredis');
P.promisifyAll(redis.RedisClient.prototype);
P.promisifyAll(redis.Multi.prototype);
console.log(redis.RedisClient.prototype);
