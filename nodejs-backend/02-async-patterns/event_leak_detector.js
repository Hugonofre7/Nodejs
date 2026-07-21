function monitorListeners(emitter, eventName) {
    const currentListeners = emitter.listenerCount(eventName);
    
    const maxListeners = emitter.getMaxListeners();
    if (currentListeners >= maxListeners * 0.8) {
    console.log(`Warning: ${eventName} has ${currentListeners} listeners`);
    
    }

     return currentListeners;

}

const EventEmitter = require('events')
const emitter = new EventEmitter()

console.log(monitorListeners(emitter, 'data'))  // 0 listeners — sin warning

// Agrega 8 listeners
for (let i = 0; i < 8; i++) {
    emitter.on('data', () => {})
}

console.log(monitorListeners(emitter, 'data'))  // 8 listeners — debe mostrar warning

class LeakSafeEmitter extends EventEmitter {

    constructor() {
        super();

        this.handlers = new Map();
    }

    safeOn(userId, eventName, handler) {
    
        if (!this.handlers.has(userId)) {
            this.handlers.set(userId, []);
        }

        const userHandlers = this.handlers.get(userId);

        this.on(eventName, handler);

        userHandlers.push({
            eventName,
            handler
        });
    }

    cleanup(userId) {

    const userHandlers = this.handlers.get(userId);

    if (!userHandlers) {
        return;
    }

    for (const { eventName, handler } of userHandlers) {
        this.off(eventName, handler);
    }

    this.handlers.delete(userId);
}

}

const safe = new LeakSafeEmitter()

safe.safeOn('user:1', 'data', (d) => console.log('user:1 recibió:', d))
safe.safeOn('user:2', 'data', (d) => console.log('user:2 recibió:', d))

console.log('Listeners antes:', safe.listenerCount('data'))

safe.emit('data', { payload: 'test' })

safe.cleanup('user:1')

console.log('Listeners después de cleanup:', safe.listenerCount('data'))

safe.emit('data', { payload: 'second' })