module.exports = Swarm

const P = require('bluebird');
const redis = require('fakeredis');
const Peer = require('simple-peer');
const eToP = require('event-to-promise');
P.promisifyAll(redis.RedisClient.prototype);
P.promisifyAll(redis.Multi.prototype);

const RedisCoordinator = require('./redisCoordinator');

function Swarm(id) {
    const self = this;
    const redisCoordinator = new RedisCoordinator(redis, id);
    redisCoordinator.setAsCoordinator();
    const redisCoordinatorOther = new RedisCoordinator(redis, "otherId");

    var peerConnections = new Map();
    var otherPeerConnections = new Map();

    var count = 5;
    const intId = setInterval(() => {
        console.log("PEERS:", peerConnections);
        console.log("OTHER PEERS:", otherPeerConnections);
        redisCoordinator.getCoordinator().then(coordId => {
            return P.all([
                self.coordinate(),
                self.connect(coordId)
            ]).catch(e => {
                console.log(e);
            });
        });
        count -= 1;
        if(count == 0) {
            window.clearInterval(intId);
        }
    }, 1000);

    self.coordinate = () => {
        // console.log("Coordinator:", "coordinateCalled");
        return redisCoordinator.getInitiatedConnections().then(conns => {
            console.log("Coordinator:", "connections", conns);
            return P.all(conns.map(conn => {
                const otherId = conn.id;
                const otherCode = conn.code;
                console.log("Coordinator:", "other code", otherCode);
                const peer = new Peer();

                const signal = new P(resolve => peer.on('signal', resolve));
                signal.then(respondCode => {
                    return redisCoordinator.respondToConnection(otherId, respondCode);
                });
                peer.on('data', data => {
                    console.log('Coordinator:', "data", data);
                });
                peer.on('connect', () => {
                    console.log('Coordinator:', 'connected');
                    peer.send(id + ": DATA");
                });
                peer.signal(otherCode);
                peerConnections.set(otherId, peer);
                return signal;
            }));
        });
    };
    self.connect = coordId => {
        // console.log("Connector:", "coordinator id", coordId);
        redisCoordinatorOther.hasSentConnection(coordId).then(hasSent => {
            // console.log("Connector:", "has sent -", hasSent);
            if (hasSent) {
                return redisCoordinatorOther.getResponse(coordId).then(response => {
                    console.log("Connector:", "response from coordinator", response);
                    if (response === undefined) {
                        return
                    } else {
                        const otherPeer = otherPeerConnections.get(coordId);
                        otherPeer.on('data', data => {
                            console.log("Connector:", "data", data);
                        });
                        otherPeer.on('connect', () => {
                            console.log("Connector:", "connected");
                        });
                        otherPeer.signal(response);
                        console.log("Connected:", response);
                        return eToP(otherPeer, 'connect');
                    }
                });
            } else {
                const peer = new Peer({initiator: true});
                const signal = new P(resolve => {
                    return peer.on('signal', resolve);
                });
                otherPeerConnections.set(coordId, peer);
                return signal.then(initCode => {
                    console.log("Connector:", "initiating with", initCode);
                    return redisCoordinatorOther.initiateConnection(coordId, initCode);
                });
            }
        });
    };

    // TODO: add myself and recover from a reset
    this.resetSwarm = () => {
        redisCoordinator.resetSwarm();
        // peerConnection.close();
    }
}
