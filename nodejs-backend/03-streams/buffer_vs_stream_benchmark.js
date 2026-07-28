const fs = require('fs');

const data = [];

for (let i = 1; i <= 100000; i++) {

    data.push({
        id: i,
        name: `User-${i}`,
        value: Math.random(),
        timestamp: new Date().toISOString()
    });

}

const jsonData = JSON.stringify(data, null, 2);

fs.writeFileSync(
    'large_data.json',
    jsonData
);

console.log('Archivo generado');

function readWithBuffer(filepath) {
    const startTime = Date.now();

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) return console.error(err)


        const startMemory = process.memoryUsage().heapUsed
        const parsed = JSON.parse(data)
        const endMemory = process.memoryUsage().heapUsed
        const endTime = Date.now();

        const memoryUsed = (endMemory - startMemory) / 1024 / 1024;
        const timeUsed = endTime - startTime;

        console.log('Buffer benchmark');
        console.log(`Tiempo: ${timeUsed} ms`);
        console.log(`Memoria usada: ${memoryUsed.toFixed(2)} MB`);

        console.log(`Archivo leído: ${data.length} caracteres`);

    });

}

readWithBuffer('large_data.json');