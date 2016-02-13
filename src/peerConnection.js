/*
 * Use Cases:
 *  If creating a PeerConnection with no inputs, listen for a connection and expose a promise to the address in getAddress().
 *  If creating a PeerConnection with an address as a JSON string, connect to the peer.
 *  If creating a PeerConnection with an invalid JSON string, fail.
 */

module.exports = PeerConnection;

const eToP = require('event-to-promise');
const Peer = require('simple-peer');

// TODO: this should manage a connection
// TODO: this should manage the peer connections
// TODO: this should build the peer connections from the peer's connections
function PeerConnection(peerAddress) {
    // TODO: make the check that peerAddress is valid better
    const peer = new Peer({initiator: !peerAddress});

    // If this is a valid address, connect to the remote peer
    if (peerAddress) {
        try {
            peer.signal(JSON.parse(peerAddress));
        } catch (e) {
            throw "Could not parse peerAddress " + peerAddress
        }
    }

    this.onError = fn => peer.on('error', fn);
    this.onSignal = fn => peer.on('signal', fn);
    this.onConnect = fn => peer.on('connect', fn);
    this.onData = fn => peer.on('data', fn);
    this.onClose = fn => peer.on('close', fn);

    // const error = eToP(peer, 'error');
    // this.getError = () => address;

    // const paddress = eToP(peer, 'signal');
    // this.getAddress = () => paddress.then(address => JSON.stringify(address));

    // this.send = data => {
        // return peer.send(data);  
    // }

    // const data = eToP(peer, 'data');
    // this.getData = () => data;

    // this.close = () => peer.destroy();
}
