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




/*
const emitter = new EventEmitter()
console.log(monitorListeners(emitter, 'data'))
*/