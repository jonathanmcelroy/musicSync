module.exports = RedisSwarm;

const P = require('bluebird');

const redis = require('./redis');

// TODO: this should manage whether redis store it.
function RedisSwarm(id) {
    const self = this;
    redis(client => {
        client.saddAsync("swarm", id)
    });

    this.getSwarm = () => redis(client => client.smembersAsync("swarm"));

    // TODO: when resetting, add myself back to the swarm
    this.resetSwarm = () => redis(client => {
        P.all([
            client.delAsync("swarm"),
            client.delAsync("availableConnections")
        ]);
    });

    this.setPeerConnection = connection => redis(client => client.hmsetAsync("availableConnections", id, connection));
    this.getPeerConnection = otherId => redis(client => client.hmgetAsync("availableConnections", id));
    this.clearPeerConnection = () => redis(client => client.hdelAsync("availableConnections", id));

    this.getAPeerConnection = () => redis(client => {
        self.getSwarm().then(swarm => {
            const otherId = swarm.find(oId => oId == id);
            return self.getPeerConnection(otherId);
        });
    });

    this.close = () => redis(client => {
        P.all([
            client.sremAsync("swarm", id),
            client.hdelAsync("availableConnections", id)
        ]);
    });
}
