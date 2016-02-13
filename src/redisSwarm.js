module.exports = RedisSwarm;

const redisExecuter = require('./redis');
const P = require('bluebird');

/*
 * swarm: Set ID
 * ID:availableConnection: ListenerConnection
 * ID:attemptingConnections: [AttemptConnection]
 */
function RedisSwarm(redis, id) {
    // () => Promise ()
    this.addToSwarm = () => redisExecuter(redis, client => client.saddAsync("swarm", id));

    // () -> Promise (Set ID)
    this.getSwarm = () => redisExecuter(redis, client => client.smembersAsync("swarm"));

    // () -> Promise ()
    // TODO: when resetting, add myself back to the swarm
    this.resetSwarm = () => redisExecuter(redis, client => client.flushdbAsync());

    // ID -> ListenerConnection -> Promise ()
    this.addInitiation = (otherID, connection) => 
        redisExecuter(redis, client => 
            client.rpushAsync(otherID + ":initializingConnections", JSON.stringify({
                id: id,
                initCode: connection
            }))
        );
    // () -> Promise [ListenerConnection]
    this.getPeerInitiations = () => redisExecuter(redis, client =>
        client.lrangeAsync(id + ":initializingConnections", 0, -1)
            .then(others => others.map(JSON.parse))
    );
    // () -> Promise [ListenerConnection]
    this.getAndClearPeerInitiations = () => redisExecuter(redis, client =>
        client.lrangeAsync(id + ":initializingConnections", 0, -1)
            .then(others => others.map(JSON.parse))
            .finally(() => client.delAsync(id + ":initializingConnections"))
    );

    // ID -> AttemptConnection -> Promise ()
    this.addAttemptConnection = (otherId, connection) =>
        redisExecuter(redis, client => client.rpushAsync(otherId + ":attemptingConnections", JSON.stringify({
            id: id,
            attemptCode: connection
        })));
    // () -> Promise AttemptConnection
    this.getAttemptedConnections = () => redisExecuter(redis, client =>
        client.lrangeAsync(id + ":attemptingConnections", 0, -1)
            .then(others => others.map(JSON.parse))
    );
    // () -> Promise AttemptConnection
    this.getAndClearAttemptedConnections = () => redisExecuter(redis, client =>
        client.lrangeAsync(id + ":attemptingConnections", 0, -1)
            .then(others => others.map(JSON.parse))
            .finally(() => client.delAsync(id + ":attemptingConnections"))
    );

    // () -> Promise ()
    this.close = () => redisExecuter(redis, client => {
        P.all([
            client.sremAsync("swarm", id),
            client.delAsync(id + ":initializingConnections"),
            client.delAsync(id + ":attemptingConnections"),
        ]);
    });
}
