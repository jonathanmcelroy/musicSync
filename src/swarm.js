'use strict'
module.exports = Swarm

const P = require('bluebird');
const Peer = require('simple-peer');
const eToP = require('event-to-promise');
P.promisifyAll(redis.RedisClient.prototype);
P.promisifyAll(redis.Multi.prototype);

const RedisCoordinator = require('./redisCoordinator');

function Swarm(id) {
    const self = this;
    const redisCoordinator = new RedisCoordinator(redis, id);

    const peerConnections = new Map();
    var connected = false;

    /*
    var count = 20;
    const intId = setInterval(() => {
        redisCoordinator.getCoordinator().then(coordId => {
            if (coordId === null) {
                console.log("Trying to set myself as the coordinator");
                return redisCoordinator.setAsCoordinator();
            } else if (coordId === id) {
                console.log("I am the coordinator");
                return self.coordinate();
            } else {
                console.log("coordinator id:", coordId);
                return self.connect(coordId);
            }
        });
        count -= 1;
        if(count == 0) {
            window.clearInterval(intId);
        }
    }, 1000);
    */

    self.coordinate = () => {
        return redisCoordinator.getInitiatedConnections().then(conns => {
            return P.all(conns.map(conn => {
                const otherId = conn.id;
                const otherCode = conn.code;
                console.log("other connection", otherId);

                const peer = new Peer();
                peer.on('error', function(e) {
                    console.log("ERROR:", e);
                    redisCoordinator.resetOtherConnection(otherId);
                });
                peer.on('signal', function(respondCode) {
                    redisCoordinator.respondToConnection(otherId, respondCode);
                });
                peer.on('data', function(data) {
                    console.log('Coordinator:', "data", data);
                });
                peer.on('connect', function() {
                    console.log('Coordinator:', 'connected');
                    peer.send(id + ": DATA");
                });
                peer.signal(otherCode);
                peerConnections.set(otherId, peer);
                return peer;
            }));
        });
    };
    self.connect = () => redisCoordinator.getCoordinator().then(coordId => {
        // console.log("Connector:", "coordinator id", coordId);
        return redisCoordinator.hasSentConnection(coordId).then(hasSent => {
            // console.log("Connector:", "has sent -", hasSent);
            if (hasSent) {
                if (!connected) {
                    return redisCoordinator.getResponse(coordId).then(response => {
                        console.log("Connector:", "response from coordinator", response);
                        if (response === undefined) {
                            return
                        } else {
                            const peer = peerConnections.get(coordId);
                            if(peer === undefined) {
                                redisCoordinator.resetMyConnection(coordId);
                                connected = false;
                                return;
                            }
                            peer.on('data', function(data) {
                                console.log("Connector:", "data", data);
                            });
                            peer.on('connect', function() {
                                console.log("#######################");
                                console.log("Connector:", "connected");
                            });
                            peer.signal(response);
                            connected = true;
                            console.log("Connected:", response);
                            peerConnections.set(coordId, peer);
                            console.log(peer);
                            return peer;
                        }
                    });
                }
            } else {
                const peer = new Peer({initiator: true});
                peer.on('error', function(e) {
                    console.log("ERROR:", e);
                    redisCoordinator.resetMyConnection(coordId);
                });
                peer.on('signal', function(initCode) {
                    if (initCode.type === "offer") {
                        console.log("Connector:", "initiating with", coordId);
                        return redisCoordinator.initiateConnection(coordId, initCode);
                    }
                });
                peerConnections.set(coordId, peer);
                return peer;
            }
        });
    });

    // TODO: add myself and recover from a reset
    self.resetSwarm = () => {
        redisCoordinator.resetSwarm();
        // peerConnection.close();
    }
}
