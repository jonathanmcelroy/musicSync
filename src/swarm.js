module.exports = Swarm

var EventEmiter = require('events');
var inherits = require('util').inherits;

var RedisSwarm = require('./redisSwarm');

inherits(Swarm, EventEmiter);

// TODO: this should manage whether redis store it.
// TODO: this should manage the peer connections
// TODO: this should build the peer connections from the peer's connections
function Swarm(id) {
    const reditSwarm = new RedisSwarm(id);
}
