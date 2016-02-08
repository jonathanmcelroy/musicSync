const redis = require('redis');
const fs = require('fs');
const P = require('bluebird');

P.promisifyAll(redis.RedisClient.prototype);
P.promisifyAll(redis.Multi.prototype);
const readFile = P.promisify(fs.readFile);

module.exports = function(callback) {
    readFile('redis.json').then(contents => {
        j = JSON.parse(contents);
        port = j.port;
        address = j.address;
        const client = redis.createClient(port, address);
        client.then(c => {
            c.authAsync('musicsync')
        }).then(_ => {
            return callback(client)
        }).finally(() => {
            return client.quit()
        });
    });

}
