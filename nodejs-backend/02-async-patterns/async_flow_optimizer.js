async function fetchData() {
    throw new Error('Fetch failed');
}

async function withoutAwait() {
    try {
        return fetchData();
    } catch (err) {
        console.log('withoutAwait:', err.message);
    }
}

async function withAwait() {
    try {
        return await fetchData();
    } catch (err) {
        console.log('withAwait:', err.message);
    }
}

withoutAwait().catch(err => console.log('Error no capturado:', err.message))

withAwait();

function checkService(service) {
    return new Promise((resolve, reject) => {

        if (service.shouldFail) {
            reject(new Error(`${service.name} failed`));
        } else {
            resolve(`${service.name} is healthy`);
        }

    });
}

async function checkAllServices(services) {
    const results = services.map(service => checkService(service));
    
    return await Promise.all(results);
}

async function checkAllServicesSettled(services) {
    const results = services.map(service => checkService(service));
    
    return await Promise.allSettled(results);
}

const services = [
    { name: 'auth', shouldFail: false },
    { name: 'payment', shouldFail: true },
    { name: 'user', shouldFail: false }
];

checkAllServices(services)
    .then(results => {
        console.log('All results:', results);
    })
    .catch(err => {
        console.log('All failed:', err.message);
    });

checkAllServicesSettled(services)
    .then(results => {
        results.forEach(r => {
            if (r.status === 'fulfilled') {
                console.log('✓', r.value)
            } else {
                console.log('✗', r.reason.message)
            }
        })
    })

async function processWithLimit(tasks, limit) {

    let currentIndex = 0;
    let running = 0;
    const results = [];

    return new Promise((resolve, reject) => {

        const worker = async () => {

            if (currentIndex >= tasks.length) {
                return;
            }

            const index = currentIndex;
            currentIndex++;

            running++;

            try {
                const result = await tasks[index]();
                results[index] = result;

            } catch(error) {
                reject(error);
                return;

            } finally {
                running--;

                if (running === 0 && currentIndex >= tasks.length) {
                    resolve(results);
                } else {
                    worker();
                }
            }
        };

        // Aquí arrancamos los workers
        for (let i = 0; i < limit; i++) {
            worker();
        }

    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const tasks = [1, 2, 3, 4, 5].map(id =>
    async () => {
        console.log(`Inicio task-${id}`);

        await delay(Math.random() * 1000);

        console.log(`Fin task-${id}`);

        return `task-${id} completada`;
    }
);

processWithLimit(tasks, 2)
    .then(results => {
        console.log(results);
    });
