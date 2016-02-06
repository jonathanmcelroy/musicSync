var WebTorrent = require('webtorrent')
var fs = require('fs');

var client = new WebTorrent()
console.log('Created client');
var magnetURI = 'magnet:?xt=urn:btih:d4d06d4b7d9f51c8b419346a21ca57f04c44431e&dn=musicSyncInfo&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969'

client.add(magnetURI, function (torrent) {
  // Got torrent metadata!
  console.log('Client is downloading:', torrent.infoHash)

  /*torrent.files.forEach(function (file) {
    // Display the file by appending it to the DOM. Supports video, audio, images, and
    // more. Specify a container element (CSS selector or reference to DOM node).
    file.getBuffer((err, contents) => {
        if (err) throw err;
        fs.writeFile("test.txt", contents, err => {
            if (err) throw err;
            console.log("Wrote file");
        });
    });
  })*/

  var n = 1;
  setInterval(() => {
      console.log('----------------');
      console.log(n + ':');
      torrent.swarm.wires.forEach(wire => console.log(wire.peerId));
      console.log('----------------');
      n++;
  }, 1000);
})
