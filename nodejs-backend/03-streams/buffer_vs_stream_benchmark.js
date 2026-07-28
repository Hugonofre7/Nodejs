const fs = require('fs');

const { pipeline, Transform } = require('stream');

// Generación de archivo de prueba
/*
const data = [];

for (let i = 1; i <= 500000; i++) {

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
*/

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

function readWithStream(filepath) {

    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    let maxDelta = 0;
    let chunks = 0;

    const stream = fs.createReadStream(filepath, 'utf8');

    stream.on('data', chunk => {

        chunks++;

        const delta = process.memoryUsage().heapUsed - startMemory;

        if (delta > maxDelta) {
            maxDelta = delta;
        }

    });

    stream.on('end', () => {

        const endTime = Date.now();

        const timeUsed = endTime - startTime;

        const memoryUsed = maxDelta / 1024 / 1024;

        console.log('Stream benchmark');
        console.log(`Tiempo: ${timeUsed} ms`);
        console.log(`Memoria máxima: ${memoryUsed.toFixed(2)} MB`);
        console.log(`Chunks recibidos: ${chunks}`);

    });

    stream.on('error', err => {
        console.error(err);
    });

}

readWithStream('large_data.json');

function benchmarkPipeline(inputPath, outputPath) {

    const startTime = Date.now();
    let totalBytes = 0;

    const transform = new Transform({

        transform(chunk, encoding, callback) {

            totalBytes += chunk.length;

            callback(null, chunk);

        }

    });

    const readStream = fs.createReadStream(inputPath);

    const writeStream = fs.createWriteStream(outputPath);


    pipeline(
        readStream,
        transform,
        writeStream,
        (error) => {

            if (error) {
                console.error('Pipeline error:', error);
                return;
            }

            const timeUsed = Date.now() - startTime;

            console.log('Pipeline benchmark');
            console.log(`Tiempo: ${timeUsed} ms`);
            console.log(`Bytes procesados: ${totalBytes}`);
            console.log(`MB procesados: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`
            );

        }
    );

}

benchmarkPipeline(
    'large_data.json',
    'output_large_data.json'
);