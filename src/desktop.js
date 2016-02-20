'use strict'

const remote = require('remote');
const dialog = remote.require('dialog');

const getId = require('./id');
const io = require('socket.io-client');

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
socket.on('music', songs => {
    var music = $('#music');
    songs.forEach(song => {
    })
});

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
    dialog.showOpenDialog({'properties': ['openDirectory']}, dirs => {
        // TODO: check if empty
        const dir = dirs[0];
        $('#music-directory').html(dir);
        musicLibrary.setMusicDir(dir).then(songs => {
            $('#music-list').html(songs.map(song => '<li>' + song + '</li>').join(''));
        });

    });
});


// const swarm = new Swarm(id);
