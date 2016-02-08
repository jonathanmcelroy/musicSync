module.exports = Swarm

var RedisSwarm = require('./redisSwarm');
var PeerConnection = require('./peerConnection');

// TODO: this should manage whether redis store it.
// TODO: this should manage the peer connections
// TODO: this should build the peer connections from the peer's connections
function Swarm(id) {
    const redisSwarm = new RedisSwarm(id);
    const peerConnection = new PeerConnection();

    var myAddress = peerConnection.getAddress();
    myAddress.then(address => redisSwarm.setPeerConnection(address));

    var peers = new Set();

    setInterval(() => {
        redisSwarm.getSwarm().then(s => {
            const others = new Set(s)
            others.delete(id);

            // TODO: initiate a connection with the newOthers
            const newOthers = s.filter(other => !peers.has(other));

            peers = new Set(Array.from(peers).concat(Array.from(others)));
            console.log(peers);
        });
    }, 1000);

    this.getSwarm = () => redisSwarm.getSwarm();
    this.getAddress = () => myAddress;
    this.close = () => {
        // TODO: close the PeerConnection
        redisSwarm.close();
    }

    // TODO: add myself and recover from a reset
    this.resetSwarm = () => {
        redisSwarm.resetSwarm();
        peerConnection.close();
    }
}
