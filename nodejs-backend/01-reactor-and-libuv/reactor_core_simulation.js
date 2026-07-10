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

function readFileWithTimestamp(filepath, id) {
    console.log(Date.now(), `Starting file read for ID: ${id}`);

    fs.readFile(filepath, 'utf8', (err, data) => {
        console.log(Date.now(), `Finished file read for ID: ${id}`);
});
}

for (let i = 1; i <= 8; i++) {
    readFileWithTimestamp('./large-file.txt', i);
}

/*
UV_THREADPOOL_SIZE=1 node reactor_core_simulation.js

UV_THREADPOOL_SIZE=8 node reactor_core_simulation.js
*/

console.log('1 - sincrónico')
process.nextTick(() => console.log('2 - nextTick'))
setImmediate(() => console.log('3 - setImmediate'))
setTimeout(() => console.log('4 - setTimeout 0'), 0)
Promise.resolve().then(() => console.log('5 - Promise'))
console.log('6 - sincrónico')

// Nota:
// En este experimento, setImmediate() se ejecutó antes que setTimeout(0).
// El orden entre ambos no está garantizado cuando se programan desde el
// código principal y puede variar según el contexto y la versión de Node.js.


function simulateReactor(tasks) {

    for (let i = 0; i < tasks.length; i++) {

        const task = tasks[i];

        if (task.type === 'io') {

            console.log(Date.now(), `Task ${task.id} started (IO)`);

            fs.readFile(task.filepath, 'utf8', (err, data) => {

                if (err) {
                    console.error(err);
                    return;
                }

                console.log(Date.now(), `Task ${task.id} finished (IO)`);
            });

        } else if (task.type === 'cpu') {

            console.log(Date.now(), `Task ${task.id} started (CPU)`);

            let result = 0;

            for (let j = 0; j < task.iterations; j++) {
                result += j;
            }

            console.log(Date.now(), `Task ${task.id} finished (CPU)`);
        }
    }
}

const tasks = [
    { id: 1, type: 'io', filepath: './large-file.txt' },
    { id: 2, type: 'cpu', iterations: 100000000 },
    { id: 3, type: 'io', filepath: './large-file.txt' },
    { id: 4, type: 'cpu', iterations: 50000000 },
    { id: 5, type: 'io', filepath: './large-file.txt' }
]

simulateReactor(tasks)