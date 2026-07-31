const { Worker } = require('worker_threads');

function heavyComputation(n) {

    let sum = 0;

    for (let i = 1; i <= n; i++) {

        sum += i;

    }

    return sum;

}

function runWorker(n) {

    const worker = new Worker('./worker.js', {
        workerData: {
            n: n
        }
    });

    worker.on('message', (result) => {

        console.log('Resultado recibido del Worker:', result);

    });

    worker.on('error', (error) => {

        console.error('Error en Worker:', error.message);

    });

}

runWorker(5_000_000_000);

setTimeout(() => {

    console.log('Event Loop libre mientras Worker calcula');

}, 0);

class WorkerPool {
    constructor(size) {

        this.size = size;
        this.workers = [];
        this.queue = [];

        for (let i = 0; i < size; i++) {

            const worker = new Worker('./worker.js');

            this.workers.push({
                worker: worker,
                busy: false
            });

        }

    }

    run(n) {

        return new Promise((resolve, reject) => {

            const availableWorker = this.workers.find(
                item => item.busy === false
            );

            if (!availableWorker) {

                this.queue.push({
                    n: n,
                    resolve: resolve,
                    reject: reject
                });

                return;
            }

        availableWorker.busy = true;

        availableWorker.worker.once('message', (result) => {

            availableWorker.busy = false;

            resolve(result);


            if (this.queue.length > 0) {

                const nextTask = this.queue.shift();

                this.run(nextTask.n)
                    .then(nextTask.resolve)
                    .catch(nextTask.reject);

            }

});

availableWorker.worker.postMessage({
    n: n
});

});
}

}

const pool = new WorkerPool(4);

async function testPool() {

    const results = await Promise.all([
        pool.run(5000000000),
        pool.run(5000000000),
        pool.run(5000000000),
        pool.run(5000000000),
        pool.run(5000000000)
    ]);

    console.log(results);

}

testPool();


/*
setTimeout(() => {

    console.log('Event Loop libre');

}, 0);

heavyComputation(5_000_000_000);

console.log('después de heavyComputation');

const start = Date.now()
heavyComputation(5_000_000_000)
console.log(`después de heavyComputation — bloqueó ${Date.now() - start}ms`)
*/
