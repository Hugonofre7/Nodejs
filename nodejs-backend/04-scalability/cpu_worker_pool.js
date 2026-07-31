const { Worker } = require('worker_threads');

function heavyComputation(n) {

    let sum = 0;

    for (let i = 1; i <= n; i++) {

        sum += i;

    }

    return sum;

}

function runIndividualWorker(n) {

    return new Promise((resolve, reject) => {

        const worker = new Worker('./worker.js');


        worker.once('message', (result) => {

            resolve(result);

            worker.terminate();

        });


        worker.once('error', (error) => {

            reject(error);

        });


        worker.postMessage({
            n: n
        });

    });

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

//runWorker(5_000_000_000);
/*
setTimeout(() => {

    console.log('Event Loop libre mientras Worker calcula');

}, 0);
*/
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
    terminate() {

        for (const item of this.workers) {

            item.worker.terminate();
        }
        
}
    getStats() {

        const busy = this.workers.filter(
            item => item.busy
        ).length;

        return {
            size: this.workers.length,
            busy: busy,
            queued: this.queue.length,
            available: this.workers.length - busy
        };

    }
}

const pool = new WorkerPool(4);

async function benchmark() {

    const tasks = [
        5000000000,
        5000000000,
        5000000000,
        5000000000
    ];


    console.log('--- Benchmark ---');


    let start = Date.now();


    for (const task of tasks) {

        heavyComputation(task);

    }


    console.log(
        `Síncrono: ${Date.now() - start}ms`
    );

    start = Date.now();

    await Promise.all(
        tasks.map(task => runIndividualWorker(task))
    );

    console.log(
    `Workers individuales: ${Date.now() - start}ms`
);


    start = Date.now();

    await Promise.all(
        tasks.map(task => pool.run(task))
    );

    console.log(
        `Worker Pool: ${Date.now() - start}ms`
    );

}
async function main() {

    await benchmark();

    console.log(pool.getStats());

    pool.terminate();

}

main();

// testPool();


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
