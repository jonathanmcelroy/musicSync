module.exports = Swarm

const P = require('bluebird');
const Peer = require('simple-peer');

const RedisSwarm = require('./redisSwarm');
const Redis = require('./redis');
const PeerConnection = require('./peerConnection');

// TODO: this should manage whether redis store it.
// TODO: this should manage the peer connections
// TODO: this should build the peer connections from the peer's connections
function Swarm(id) {
    const self = this;
    const redisSwarm = new RedisSwarm(Redis, id);
    const redisSwarm2 = new RedisSwarm("1");

    var peer;
    var otherPeer;

    // var myAddress = peerConnection.getAddress();
    // myAddress.then(address => redisSwarm.setPeerConnection(address));

    var peers = new Set();
    // var peerConnections = {};

    setInterval(() => {
        self.initiateWithNewPeers();
        self.respondToInitiatingPeers();
        self.connectToRespondingPeers();
    }, 1000);

    // () -> Promise ()
    this.initiateWithNewPeers = () => {
        self.getNewPeers().then(otherIDs => {
            P.all(otherIDs.map(otherID => {
                peer = new Peer({'initiator': true});
                console.log("Adding peer", otherID);
                peer.on('signal', data => {
                    redisSwarm.addInitiation(otherID, data);
                });
                peers.add(otherID);
                // peerConnections[otherID] = peer;
            }));
        });
    };
    // () -> Promise ()
    this.respondToInitiatingPeers = () => {
        redisSwarm2.getPeerInitiations().then(others => {
            P.all(others.forEach(other => {
                const otherID = other.id;
                console.log("responding to peer", otherID);
                const initCode = other.initCode;
                otherPeer = new Peer();
                otherPeer.signal(initCode);
                otherPeer.on('signal', data => {
                    redisSwarm.addAttemptConnection(otherID, data);
                });
                otherPeer.on('data', data => {
                    console.log(id, data);
                });
                // peerConnections[otherID] = peer;
            }));
        });
    }
    this.connectToRespondingPeers = () => {
        redisSwarm.getAttemptedConnections().then(others => {
            P.all(others.map(other => {
                const otherID = other.id;
                console.log("connecting to peer", otherID);
                const attempCode = other.attempCode;
                // const peer = peerConnections[otherID];
                console.log(attempCode);
                peer.signal(attempCode);
                peer.send("Testing");
            }));
        });
    };

    // () -> [ID]
    this.getNewPeers = () => redisSwarm.getSwarm().then(s => {
        const others = new Set(s);
        others.delete(id);
        return Array.from(others).filter(other => !peers.has(other));
    });

    this.getSwarm = () => redisSwarm.getSwarm();
    this.close = () => {
        // TODO: close the PeerConnection
        redisSwarm.close();
    }

    // TODO: add myself and recover from a reset
    this.resetSwarm = () => {
        redisSwarm.resetSwarm();
        // peerConnection.close();
    }
}
