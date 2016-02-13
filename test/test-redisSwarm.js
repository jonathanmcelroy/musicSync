const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const P = require('bluebird');

const redis = require('fakeredis');
P.promisifyAll(redis.RedisClient.prototype);
P.promisifyAll(redis.Multi.prototype);
console.log(redis.RedisClient.prototype)

const RedisSwarm = require('../src/redisSwarm');

const id1 = '1234', id2 = '4321', id3 = '9999';

describe('Redis Swarm', function() {
    it('should add to swarm', function() {
        const swarm = new RedisSwarm(redis, id1);
        const p = swarm.addToSwarm();
        const swarmMembers = p.then(() => swarm.getSwarm());
        return chai.expect(swarmMembers).to.eventually.have.members([id1]);
    });
    it('should get the swarm', function() {
        const swarmInstance1 = new RedisSwarm(redis, id1);
        const p1 = swarmInstance1.addToSwarm();
        const swarmInstance2 = new RedisSwarm(redis, id2);
        const p2 = swarmInstance2.addToSwarm();
        const swarmMembers = P.all([p1, p2]).then(() => swarmInstance1.getSwarm());
        return chai.expect(swarmMembers).to.eventually.have.members([id1, id2]);
    })
    it('should reset the swarm', function() {
        const swarm = new RedisSwarm(redis, id1);
        const p = swarm.addToSwarm().then(() => swarm.resetSwarm());
        const swarmMembers = p.then(() => swarm.getSwarm());
        return chai.expect(swarmMembers).to.eventually.be.empty;
    });
    it('should add an initiation', function() {
        const swarmInstance1 = new RedisSwarm(redis, id1);
        const swarmInstance2 = new RedisSwarm(redis, id2);
        const p1 = swarmInstance1.addToSwarm().then(() => swarmInstance1.addInitiation(id2, 'code'));
        const p2 = swarmInstance2.addToSwarm()
        const swarmInitiations = P.all([p1, p2]).then(() => swarmInstance2.getPeerInitiations())
        return chai.expect(swarmInitiations).to.eventually.eql([{id: id1, initCode: 'code'}]);
    });
    it('should add an attempt', function() {
        const swarmInstance1 = new RedisSwarm(redis, id1);
        const swarmInstance2 = new RedisSwarm(redis, id2);
        const p1 = swarmInstance1.addToSwarm().then(() => swarmInstance1.addAttemptConnection(id2, 'code'));
        const p2 = swarmInstance2.addToSwarm()
        const swarmAttempts = P.all([p1, p2]).then(() => swarmInstance2.getAttemptedConnections())
        return chai.expect(swarmAttempts).to.eventually.eql([{id: id1, attemptCode: 'code'}]);
    });
    it('should get and clear initiations', function() {
        const swarmInstance1 = new RedisSwarm(redis, id1);
        const p1 = swarmInstance1.addToSwarm();
        const swarmInstance2 = new RedisSwarm(redis, id2);
        const p2 = swarmInstance2.addToSwarm();
        const swarmInstance3 = new RedisSwarm(redis, id3);
        const p3 = swarmInstance2.addToSwarm();

        const startInitializations = P.all([p1, p2, p3]).then(() => {
            return P.all([
                swarmInstance2.addInitiation(id1, 'code2'),
                swarmInstance3.addInitiation(id1, 'code3')
            ]);
        })
        const initiations = startInitializations.then(() => swarmInstance1.getAndClearPeerInitiations());
        const remainingInitiations = initiations.then(() => swarmInstance1.getPeerInitiations());
        return P.all([
            chai.expect(initiations).to.eventually.eql([
                {id: id2, initCode: 'code2'},
                {id: id3, initCode: 'code3'}
            ]),
            chai.expect(remainingInitiations).to.eventually.be.empty
        ]);
    });
    it('should get and clear attempts', function() {
        const swarmInstance1 = new RedisSwarm(redis, id1);
        const p1 = swarmInstance1.addToSwarm();
        const swarmInstance2 = new RedisSwarm(redis, id2);
        const p2 = swarmInstance2.addToSwarm();
        const swarmInstance3 = new RedisSwarm(redis, id3);
        const p3 = swarmInstance2.addToSwarm();

        const startAttempts = P.all([p1, p2, p3]).then(() => {
            return P.all([
                swarmInstance2.addAttemptConnection(id1, 'code2'),
                swarmInstance3.addAttemptConnection(id1, 'code3')
            ]);
        })
        const attempts = startAttempts.then(() => swarmInstance1.getAndClearAttemptedConnections());
        const remainingAttempts = attempts.then(() => swarmInstance1.getAttemptedConnections());
        return P.all([
            chai.expect(attempts).to.eventually.deep.have.members([
                {id: id2, attemptCode: 'code2'},
                {id: id3, attemptCode: 'code3'}
            ]),
            chai.expect(remainingAttempts).to.eventually.be.empty
        ]);
    });
    it('should go from initialization to finish attempts', function() {
        const swarmInstance1 = new RedisSwarm(redis, id1);
        const p1 = swarmInstance1.addToSwarm();
        const swarmInstance2 = new RedisSwarm(redis, id2);
        const p2 = swarmInstance2.addToSwarm();

        const startInitializations = P.all([p1, p2]).then(() => {
            return P.all([
                swarmInstance1.addInitiation(id2, 'initCode1'),
                swarmInstance2.addInitiation(id1, 'initCode2')
            ]);
        });
        const initializations1 = startInitializations.then(() => swarmInstance1.getAndClearPeerInitiations());
        const initializations2 = startInitializations.then(() => swarmInstance2.getAndClearPeerInitiations());

        const startAttempts1 = initializations1.then(values =>
            P.all(values.map(value =>
                swarmInstance1.addAttemptConnection(value.id, value.initCode + '-attemptCode1')
            ))
        );
        const startAttempts2 = initializations2.then(values =>
            P.all(values.map(value =>
                swarmInstance2.addAttemptConnection(value.id, value.initCode + '-attemptCode2')
            ))
        );
        const startAttempts = P.all([startAttempts1, startAttempts2]);

        const attempts1 = startAttempts.then(() => swarmInstance1.getAndClearAttemptedConnections());
        const attempts2 = startAttempts.then(() => swarmInstance2.getAndClearAttemptedConnections());

        P.all([
            chai.expect(attempts1).to.eventually.deep.have.members({
                id: id2,
                attemptCode: 'initCode1-attemptCode2'
            }),
            chai.expect(attempts2).to.eventually.deep.have.members({
                id: id1,
                attemptCode: 'initCode2-attemptCode1'
            }),
        ]);
    });
});
