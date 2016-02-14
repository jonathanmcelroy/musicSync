const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object
var mainWindow = null;

var INDEX = 'file://' + __dirname + '/../static/index.html';
if (process.argv.length >= 3) {
    INDEX += "#" + process.argv[2];
}

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL(INDEX);

  mainWindow.on('closed', function() {
    // Dereference the window object
    mainWindow = null;
  });

  mainWindow.toggleDevTools();
});
