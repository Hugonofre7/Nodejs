const counter1 = require('./counter')
const counter2 = require('./counter')

const path = require('path');

const counterPath = path.join(__dirname, 'counter.js');

function analyzeCache() {

    Object.keys(require.cache).forEach((modulePath) => {

    const module = require.cache[modulePath];

    if (!module.filename.includes('node_modules')) {

        console.log('Filename:', module.filename);
        console.log('Loaded:', module.loaded);
        console.log('Exports:', Object.keys(module.exports).length);

    }

});

}

const cachedModule = require.cache[counterPath];

const a = require('./moduleA');

console.log(a);

console.log('=== Module Cache Analysis ===')
analyzeCache()

// En moduleB.js agrega esto antes del module.exports
console.log('moduleB cargando, a.name es:', a.name)

console.log(cachedModule);

console.log(counter1 === counter2);
counter1.increment();
console.log(counter2.getCount());

console.log(Object.keys(require.cache));

console.log(counterPath);

console.log(cachedModule.filename);
console.log(Object.keys(cachedModule.exports));

