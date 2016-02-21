const P = require('bluebird');
const fs = require('fs');
const find = require('findit');
const path = require('path');
const mm = require('musicmetadata');

const Library = function() {
    const self = this;

    const musicFiles = [];
    const musicData = [];

    self.setMusicDir = dir => new P((resolve, reject) => {
        var count = 1;
        function tryToFinish() {
            if(count == 0) {
                resolve(musicFiles);
            }
        }
        const finder = find(dir);
        finder.on('file', (file, stat) => {
            const ext = path.extname(file);
            if (ext == '.mp3') {
                count += 1;
                musicFiles.push(file);
                mm(fs.createReadStream(file), (err, metadata) => {
                    if (err) throw err;
                    musicData.push(metadata);
                    count -= 1;
                    tryToFinish();
                });
            }
        });
        finder.on('end', () => {
            count -= 1;
            tryToFinish();
        });
    });

    self.getMusicData = () => musicData;
};

module.exports = Library;
