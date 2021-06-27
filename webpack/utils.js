const fs = require('fs');

const isDirEmpty = (path) => {
    return fs.readdirSync(path).length === 0;
}

module.exports = {
    isDirEmpty
};
