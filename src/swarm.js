var redis = require('./redis');

module.exports.addToSwarm = function(id) {
    redis(client => {
        client.sadd("swarm", id, err => {
            if (err) throw err;
        });
    })
}

module.exports.removeFromSwarm = function(id) {
    redis(client => {
        client.srem("swarm", id, err => {
            if (err) throw err;
        });
    });
}

module.exports.getSwarm = function(callback) {
    redis(client => {
        client.smembers("swarm", (err, reply) => {
            if (err) throw err;
            callback(reply);
        });
    });
}

module.exports.resetSwarm = function() {
    redis(client => {
        client.del("swarm", err => {
            if (err) throw err;
        });
    });
}
