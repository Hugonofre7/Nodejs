const cache = {
    'user:1': {
        name: 'Hugo',
        role: 'admin'
    }
};

function readCache(key, callback) {
    if (cache[key]) {
        callback(null, cache[key]);
    } else {
        setTimeout(() => {
            callback(new Error('Key not found in cache'), null);
        }, 1000);
    }
}

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
