module.exports = RedisCoordinator;

const redisExecuter = require('./redis');
const P = require('bluebird');

/*
 * "coordinator" :: ID
 * coordinator is the id of the node that is coordinating the connections
 *
 * "$ID:coordinateConnection" :: Map ID (State, Code)
 * The $ID is the id of the coordinator. "$ID:coordinateConnection" is a
 * mapping from the id of the node attempting to join the swarm to the
 * state of the connection andd the code for the next step
 */
function RedisCoordinator(redis, id) {
    this.setAsCoordinator = () => redisExecuter(redis, client => client.setAsync("coordinator", id));
    this.getCoordinator = () => redisExecuter(redis, client => client.getAsync("coordinator"));
    this.resetSwarm = () => redisExecuter(redis, client => client.flushdbAsync());

    const initConnName = "initConn";

    // Requester Commands
    this.initiateConnection = (coordinatingID, code) => {
        const re = redisExecuter(redis, client => {
            return client.hmsetAsync(coordinatingID + ":" + initConnName, id, JSON.stringify({
                state: "INIT",
                code: code
            }));
        });
        return re;
    };
    this.hasSentConnection = coordinatingID => {
        return redisExecuter(redis, client => {
            return client.hmgetAsync(coordinatingID + ":" + initConnName, id).then(result => {
                if (result.length == 1 && result[0] == null) {
                    return false;
                } else {
                    return true;
                }
            });
        });
    };
    this.getResponse = coordinatingID => {
        return redisExecuter(redis, client => {
            return client.hmgetAsync(coordinatingID + ":" + initConnName, id).then(result => {
                const json = JSON.parse(result);
                if (json.state === "RESPONSE") {
                    return json.code;
                }
            });
        });
    };

    // Coordinator Commands
    this.getInitiatedConnections = () => {
        return redisExecuter(redis, client => {
            return client.hgetallAsync(id + ":" + initConnName).then(result => {
                if (result === null) {
                    return []
                } else {
                    return Object.keys(result).filter(key => JSON.parse(result[key]).state === "INIT").map(key => ({
                        id: key,
                        code: JSON.parse(result[key]).code
                    }));
                }
            });
        });
    };
    this.respondToConnection = (otherId, code) => {
        return redisExecuter(redis, client => {
            return client.hmsetAsync(id + ":" + initConnName, otherId, JSON.stringify({
                state: "RESPONSE",
                code: code
            }));
        });
    };
}
