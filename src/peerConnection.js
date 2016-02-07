module.exports = PeerConnection;

const Peer = require('simple-peer');

// TODO: this should manage a connection
function PeerConnection(peerAddress) {
    // TODO: make the check that peerAddress is valid better
    const peer = Peer({initiator: !peerAddress});

    // TODO: indicate that an error has occured
    peer.on('error', function(err) {
        console.log(err);
    });

    p.on('signal', function (data) {
        // TODO: this data must be sent to the other client for it to connect
        console.log('SIGNAL', JSON.stringify(data));
    });

    p.on('connect', function () {
        // TODO: fired when I can send data
        console.log('CONNECT');
        p.send('whatever' + Math.random());
    });

    p.on('data', function (data) {
        // TODO: fired when I receive data
        console.log('data: ' + data);
    });

    // If this is a valid address, connect to the remote peer
    if (peerAddress) {
        peer.signal(JSON.parse(peerAddress));
    }
}
