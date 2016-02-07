const fs = require('fs')
const uuid = require('uuid')

module.exports = function(filename) {
    if (!filename) {
        filename = 'id.json';
    }

    try {
        const j = fs.readFileSync(filename);
        return JSON.parse(j).id;
    }
    catch (e) {
        console.log(e);

        const id = uuid.v4();
        fs.writeFileSync(filename, JSON.stringify({'id': id}));
        return id;
    }
}
