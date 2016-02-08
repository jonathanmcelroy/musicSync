module.exports = PeerConnection;

const eToP = require('event-to-promise');
const Peer = require('simple-peer');

// TODO: this should manage a connection
// TODO: this should manage the peer connections
// TODO: this should build the peer connections from the peer's connections
function PeerConnection(peerAddress) {
    // TODO: make the check that peerAddress is valid better
    const peer = Peer({initiator: !peerAddress});

    const error = eToP(peer, 'error');
    this.getError = () => address;

    const address = eToP(peer, 'signal');
    this.getAddress = () => address;

    const data = eToP(peer, 'data');
    this.getData = data;

    this.close = () => peer.destroy();

    // If this is a valid address, connect to the remote peer
    if (peerAddress) {
        console.log(peerAddress);
        peer.signal(JSON.parse(peerAddress));
    }
}
