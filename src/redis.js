const redis = require('redis');
const fs = require('fs');
const P = require('bluebird');

P.promisifyAll(redis.RedisClient.prototype);
P.promisifyAll(redis.Multi.prototype);
const readFile = P.promisify(fs.readFile);

module.exports = function(callback) {
    readFile('redis.json')
    .catch(err => throw err);
    .then(contents => {
        j = JSON.parse(contents);
        port = j.port;
        address = j.address;

        client = redis.createClient(port, address);
        client.on("error", function (err) {
            console.log("Error " + err);
            throw err;
        });

        client.auth('musicsync');
        callback(client);
        client.quit();
    })
    .catch(err => throw err);
}


// client.set("foo", "bar", redis.print);

/* client.set("string key", "string val", redis.print);
   client.hset("hash key", "hashtest 1", "some value", redis.print);
   client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
   client.hkeys("hash key", function (err, replies) {
   console.log(replies.length + " replies:");
   replies.forEach(function (reply, i) {
   console.log("    " + i + ": " + reply);
   });
   client.quit();
   }); */
