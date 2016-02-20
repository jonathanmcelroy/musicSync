const P = require('bluebird');
const find = require('findit');
const path = require('path');

const Library = function() {
    const self = this;

    const musicFiles = [];

    self.setMusicDir = dir => new P((resolve, reject) => {
        const finder = find(dir);
        finder.on('file', (file, stat) => {
            const ext = path.extname(file);
            if (ext == '.mp3') {
                musicFiles.push(file);
            }
        });
        finder.on('end', () => {
            console.log(musicFiles);
            resolve(musicFiles);
        });
    });
};

module.exports = Library;
