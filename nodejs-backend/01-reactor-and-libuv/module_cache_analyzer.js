const counter1 = require('./counter')
const counter2 = require('./counter')

const path = require('path');

const counterPath = path.join(__dirname, 'counter.js');

const cachedModule = require.cache[counterPath];

console.log(cachedModule);

console.log(counter1 === counter2);
counter1.increment();
console.log(counter2.getCount());

console.log(Object.keys(require.cache));

console.log(counterPath);

console.log(cachedModule.filename);
console.log(Object.keys(cachedModule.exports));