var WebTorrent = require('webtorrent')

var client = new WebTorrent()

client.seed("musicSyncInfo", function (torrent) {
  console.log('Client is seeding:', torrent.magnetURI);
})
