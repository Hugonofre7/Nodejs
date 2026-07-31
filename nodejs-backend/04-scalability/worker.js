const { parentPort } = require('worker_threads');


function heavyComputation(n) {

    let sum = 0;

    for (let i = 1; i <= n; i++) {

        sum += i;

    }

    return sum;

}


parentPort.on('message', (data) => {

    const result = heavyComputation(data.n);

    parentPort.postMessage(result);

});