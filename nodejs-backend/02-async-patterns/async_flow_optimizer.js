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