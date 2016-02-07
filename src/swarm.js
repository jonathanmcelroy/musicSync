module.exports = Swarm

var EventEmiter = require('events');
var inherits = require('util').inherits;

var redis = require('./redis');

inherits(Swarm, EventEmiter);

// TODO: this should manage whether redis store it.
// TODO: this should manage the peer connections
// TODO: this should build the peer connections from the peer's connections
function Swarm(id) {
    redis(client => {
        client.sadd("swarm", id, err => {
            if (err) throw err;
            console.log("Added id", id)
        });
    });

    this.getSwarm = function(callback) {
        redis(client => {
            client.smembers("swarm", (err, reply) => {
                if (err) throw err;
                callback(reply);
            });
        });
    }

    // TODO: when resetting, add myself back to the swarm
    this.resetSwarm = function() {
        redis(client => {
            client.del("swarm", err => {
                if (err) throw err;
            });
        });
    }

    this.on('close', () => {
        redis(client => {
            client.srem("swarm", id, err => {
                if (err) throw err;
            });
        });
    });
}
