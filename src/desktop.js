'use strict'

const remote = require('remote');
const dialog = remote.require('dialog');

const getId = require('./id');
const io = require('socket.io-client');
const _ = require('lodash');

const Library = require('./library');

const socket = io('http://127.0.0.1:8000');
// const socket = io('http://app-musicsync.rhcloud.com:8000');

const musicLibrary = new Library();
const id = getId(location.hash.substr(1));

socket.on('connect', () => {
    console.log('connect');
});
socket.on('message', text => {
    $('#messages').append('<li>' + text + '</li>');
});
socket.on('music', songs => addSongs(songs));

$('#client-id').html(id);
$('#message-box').submit(e => {
    e.preventDefault();
    const text = $('#message-text').val();
    console.log(text);
    socket.emit('message', text);
    $('#messages').append('<li>' + text + '</li>');
})

$('#open-music-directory').click(e => {
    e.preventDefault();
    dialog.showOpenDialog({'properties': ['openDirectory'], 'defaultPath': '/home/jonathan/Downloads'}, dirs => {
        // TODO: check if empty
        if (dirs.length > 0) {
            const dir = dirs[0];
            $('#music-directory').html(dir);
            musicLibrary.setMusicDir(dir).then(songs => {
                return musicLibrary.getMusicData();
            }).then(data => {
                addSongs(data);
                sendSongs(data);
            });
        }
    });
});

function addSongs(songs) {
    const music = $('#music');
    music.empty();
    songs.map(song => {
        const template = _.template(
            '<div class="song">' +
            '<div class="song-image"></div>' + //<img src="data:image/<%= format %>;base64,<%= image %>"/></div>' +
            '<div class="row"><%= title %></div>' +
            '<div class="row"><%= artist %></div>' +
            '<div class="row"><%= album %></div>' +
            '</div>'
        );
        music.append(template({
            // 'format': song.picture[0].format,
            //'image': song.picture[0].data,
            'title': song.title,
            'artist': song.artist,
            'album': song.album
        }));
    });
}

function sendSongs(songs) {
    console.log(songs);
    socket.emit('music', songs);
}
