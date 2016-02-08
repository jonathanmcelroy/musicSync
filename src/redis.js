const redis = require('redis');
const fs = require('fs');
const P = require('bluebird');

P.promisifyAll(redis.RedisClient.prototype);
P.promisifyAll(redis.Multi.prototype);
const readFile = P.promisify(fs.readFile);

module.exports = function(callback) {
    return readFile('redis.json').then(contents => {
        j = JSON.parse(contents);
        port = j.port;
        address = j.address;
        const client = redis.createClient(port, address);
        return client.authAsync('musicsync').then(_ => {
            return callback(client);
        }).finally(() => {
            client.quit();
            return 1;
        });
    });
}
