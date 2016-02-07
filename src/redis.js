var redis = require('redis')
var fs = require('fs')

module.exports = function(id, callback) {
    fs.readFile('redis.json', (err, contents) => {
        if (err) throw err;

        j = JSON.parse(contents);
        port = j.port;
        address = j.address;

        client = redis.createClient(port, address);

        client.auth('musicsync', function (err) {
            if (err) throw err;
        });

        client.on("error", function (err) {
            console.log("Error " + err);
        });

        client.sadd("swarm", id, err => {
            if (err) throw err;
        });
        client.smembers("swarm", (err, reply) => {
            if (err) throw err;
            callback(reply);
        });
        client.srem("swarm", id, err => {
            if (err) throw err;
        });

        client.quit();
    });
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
