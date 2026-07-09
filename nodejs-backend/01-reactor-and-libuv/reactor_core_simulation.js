const fs = require('fs');

function readFileBlocking(filepath) {
    console.log(Date.now(), 'Starting blocking file read...');
    const data = fs.readFileSync(filepath, 'utf8');
    console.log(Date.now(), 'Finished blocking file read.');
    return data;
}


function readFileNonBlocking(filepath, callback) {
    fs.readFile(filepath, 'utf8', (err, data) => {
        callback(err, data);
    });
}

const filepath = './test-file.txt';

console.log(Date.now(), 'Program started');

const blockingData = readFileBlocking(filepath);

console.log(Date.now(), 'Blocking result received');

readFileNonBlocking(filepath, (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log(Date.now(), 'Callback finished');
});

console.log(Date.now(), 'Non blocking call finished');