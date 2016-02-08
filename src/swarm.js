module.exports = Swarm

var RedisSwarm = require('./redisSwarm');

// TODO: this should manage whether redis store it.
// TODO: this should manage the peer connections
// TODO: this should build the peer connections from the peer's connections
function Swarm(id) {
    const redisSwarm = new RedisSwarm(id);

    this.getSwarm = () => redisSwarm.getSwarm();
}
