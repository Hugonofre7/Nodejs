const fs = require('fs');

const readline = require('readline');

const { pipeline, Transform } = require('stream');

const levels = ['ERROR', 'INFO', 'DEBUG'];

const services = [
    'auth-service',
    'user-service',
    'payment-service'
];

const messages = [
    'Request timeout after 5000ms',
    'User authenticated successfully',
    'Processing payment request'
];

const logs = [];
    for (let i = 0; i < 200000; i++) {

        const timestamp = new Date().toISOString();

        const level = levels[i % levels.length];

        const service = services[i % services.length];

        const message = messages[i % messages.length];

        const logLine = `${timestamp} ${level} ${service} ${message}`;

        logs.push(logLine);
}

const content = logs.join('\n') + '\n';

fs.writeFileSync('server_logs.txt',content);

console.log('Archivo de logs generado');


function createLogPipeline(inputPath, outputPath) {
    const startTime = Date.now()
    let errorLines = 0;
/*
    let backpressureCount = 0;
*/
    let buffer = '';

    const readStream = fs.createReadStream(inputPath, {
        encoding: 'utf8'
    });
    
    const errorTransform = new Transform({

        transform(chunk, encoding, callback) {

            buffer += chunk.toString();

            const lines = buffer.split('\n');

            buffer = lines.pop();

            for (const line of lines) {

                if (line.includes('ERROR')) {

                    errorLines++;

                    this.push(line + '\n');

                }

            }

            callback();

        },
        flush(callback) {

            if (buffer.includes('ERROR')) {

                this.push(buffer + '\n');
            }

            callback();
        }

    });

    const writeStream = fs.createWriteStream(outputPath);

    readStream.on('error', err => {
        console.error('Read error:', err);
    });

    writeStream.on('error', err => {
        console.error('Write error:', err);
    });

    pipeline(
        readStream,
        errorTransform,
        writeStream,
        (err) => {

            if (err) {
                return console.error('Pipeline error:', err);
            }

            console.log(
                `Pipeline finalizado en ${Date.now() - startTime}ms`
            );

            console.log(
                `Líneas ERROR procesadas: ${errorLines}`
            );
        }
    );

}
/*
    writeStream.on('finish', () => {

        console.log(
            `Pipeline finalizado en ${Date.now() - startTime}ms`
        );

        console.log(`Líneas ERROR procesadas: ${errorLines}`);

    });

    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    rl.on('line', line => {

        if (line.includes('ERROR')) {

            errorLines++;

            const canContinue = writeStream.write(line + '\n');

            if (!canContinue) {

                backpressureCount++;

                rl.pause();
        }
}
    });

    writeStream.on('drain', () => {

        rl.resume();

    });

    rl.on('close', () => {

        writeStream.end();

        console.log('Pipeline finalizado');

    });

    rl.on('close', () => {

        writeStream.end();

        console.log(
            `Pipeline finalizado en ${Date.now() - startTime}ms`
        );

        console.log(`Líneas ERROR escritas: ${errorLines}`);

        console.log(`Backpressure activado: ${backpressureCount} veces`);

    });
*/

createLogPipeline(
    'server_logs.txt',
    'error_logs.txt'
);

