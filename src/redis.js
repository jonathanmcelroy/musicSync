const fs = require('fs');
const P = require('bluebird');

const readFile = P.promisify(fs.readFile);

// (Client -> a) -> Redis a
module.exports = (redis, callback) => readFile('redis.json').then(contents => {
    j = JSON.parse(contents);
    port = j.port;
    address = j.address;
    const client = redis.createClient(port, address);
    return client.authAsync('musicsync').then(_ => {
        return callback(client);
    }).finally(() => {
        client.quit();
    });
});
