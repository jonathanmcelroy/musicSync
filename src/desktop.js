/*
 * First, create a unique identifier for this instance of the app.
 * Then, add that identifier to the set of identifiers in the redis store.
 * Then, for each other identifier, initiate a connection with it.
 * Then, create a tree of the current files in the system.
 * Then, share that tree with the connected peers.
 * Then, conbine that tree with the trees of the other peers.
 * If the user indicates that they want a song, start downloading it.
 */
const Swarm = require('./swarm');
const redis = require('./redis');
const getId = require('./id');

const id = getId(location.hash);
const swarm = new Swarm(id);

window.onload = function() {
    document.getElementById("clientId").innerHTML = id;

    setInterval(() => {
        swarm.getSwarm().then(s => {
            const peers = document.getElementById('peers');
            peers.innerHTML = "";
            s.forEach(peer => peers.innerHTML += '<li>' + peer + '</li>');
        });
        swarm.getAddress().then(address => {
            const addr = document.getElementById('address');
            addr.innerHTML = address;
        });
    }, 1000);

    document.getElementById('resetSwarm').onclick = function() {
        swarm.resetSwarm();
    }
}
window.onbeforeunload = function(e) {
    swarm.close();
    e.returnValue = true;
}

/*
   redis(id, swarm => {
   console.log(swarm);
   });

// redis.connect("12345");
// redis.del('foo');
*/
/*
   var Peer = require('simple-peer')
   var p = new Peer({ initiator: location.hash === '#1', trickle: false })

   p.on('error', function (err) { console.log('error', err) })

   p.on('signal', function (data) {
   console.log('SIGNAL', JSON.stringify(data))
   document.querySelector('#outgoing').textContent = JSON.stringify(data)
   })

   document.querySelector('form').addEventListener('submit', function (ev) {
   ev.preventDefault()
   p.signal(JSON.parse(document.querySelector('#incoming').value))
   })

   p.on('connect', function () {
   console.log('CONNECT')
   p.send('whatever' + Math.random())
   })

   p.on('data', function (data) {
   console.log('data: ' + data)
   })
   */
