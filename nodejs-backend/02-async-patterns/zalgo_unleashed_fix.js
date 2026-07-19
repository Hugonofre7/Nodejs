const cache = {
    'user:1': {
        name: 'Hugo',
        role: 'admin'
    }
};

const EventEmitter = require('events');

class ServiceMonitor extends EventEmitter {
    constructor() {
        super();

        this.on('status', (serviceName) => {
            console.log(`Service ${serviceName} status: active`);
        });
        this.on('error', (serviceName) => {
            console.log(`Service ${serviceName} failed`)
        })
    }

    checkService(serviceName, status) {
        if (status === 'active') {
            this.emit('status', serviceName);
        }

        if (status === 'failed') {
            this.emit('error', serviceName);
        }
    }
}

const monitor = new ServiceMonitor();

monitor.checkService('auth-service', 'active');
monitor.checkService('payment-service', 'failed');

function readCache(key, callback) {
    if (cache[key]) {
    process.nextTick(() => {
        callback(null, cache[key]);
    });
    } else {
        setTimeout(() => {
            callback(new Error('Key not found in cache'), null);
        }, 1000);
    }
}

const emitter = new EventEmitter();

// En vez de esto:
function registerUser(userId) {
    emitter.once('dataReceived', handler)  // 20 listeners simultáneos
}

// Esto:
function registerUser(userId) {
    return (data) => console.log(`User ${userId} received:`, data)
}

const handlers = []
for (let i = 0; i < 20; i++) {
    handlers.push(registerUser(i))
}

emitter.once('dataReceived', (data) => {
    handlers.forEach(handler => handler(data))  // un solo listener
})

emitter.emit('dataReceived', { payload: 'test' })

class DataBroker extends EventEmitter {

    constructor() {
        super();

        this.subscribers = new Map();
        this.maxSubscribers = 5;
    }

    subscribe(userId) {
        if (this.subscribers.size >= this.maxSubscribers) {
            throw new Error('Maximum subscribers reached');
        }

        const handler = (data) => {
            console.log(`User ${userId} received:`, data);
        };

        this.subscribers.set(userId, handler);

        this.on('data', handler);
    }
    publish(data) {
        this.emit('data', data);
    }
    unsubscribe(userId) {
        const handler = this.subscribers.get(userId);

        if (handler) {
            this.off('data', handler);
            this.subscribers.delete(userId);
        }
    }
}

const broker = new DataBroker();

broker.subscribe('user:1');
broker.subscribe('user:2');
broker.subscribe('user:3');

broker.publish({ payload: 'health-report' });

broker.unsubscribe('user:2');

broker.publish({ payload: 'second-report' });

console.log('1 - antes de readCache')

readCache('user:1', (err, data) => {
    console.log('2 - callback ejecutado', data)
})

console.log('3 - después de readCache')

console.log('---')

console.log('4 - antes de readCache')

readCache('user:99', (err, data) => {
    console.log('5 - callback ejecutado', err.message)
})

console.log('6 - después de readCache')

