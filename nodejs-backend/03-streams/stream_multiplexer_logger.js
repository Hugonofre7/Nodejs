const { pipeline, Transform, Writable } = require('stream');
const fs = require('fs');
class StreamMultiplexer extends Writable {

    constructor(destinations) {
        super();

        this.destinations = destinations;

    }

_write(chunk, encoding, callback) {

    for (const destination of this.destinations) {

        try {

            if (!destination.filter || destination.filter(chunk.toString())) {

                destination.stream.write(chunk);

            }

        } catch (error) {

            console.error(
                'Error escribiendo destino:',
                error.message
            );

        }

    }

    callback();

}

_final(callback) {

    for (const destination of this.destinations) {

        if (destination.stream !== process.stdout) {

            destination.stream.end();

        }

    }

    callback();

}

}

const errorLog = fs.createWriteStream('mux_errors.txt')
const generalLog = fs.createWriteStream('mux_general.txt')
const consoleStream = process.stdout

const mux = new StreamMultiplexer([
    {
        stream: errorLog,
        filter: null
    },
    {
        stream: generalLog,
        filter: null
    },
    {
        stream: consoleStream,
        filter: null
    }
]);

const readStream = fs.createReadStream('server_logs.txt', {
    encoding: 'utf8'
});

let buffer = '';

let transformCount = 0;

const errorTransform = new Transform({

    transform(chunk, encoding, callback) {

        buffer += chunk.toString();

        const lines = buffer.split('\n');

        buffer = lines.pop();

        for (const line of lines) {

            if (line.includes('ERROR')) {

                transformCount++;

                this.push(line + '\n');

            }

        }

        callback();

    },

    flush(callback) {

        if (buffer.length > 0) {

            if (buffer.includes('ERROR')) {

                transformCount++;

            this.push(buffer + '\n');

        }

    }

    callback();

}

});

pipeline(
    readStream,
    errorTransform,
    mux,
    (err) => {

        if (err) {
            console.error('Pipeline error:', err);
            return;
        }

        console.log('Multiplexer pipeline finalizado');
        console.log(`ERROR detectados por Transform: ${transformCount}`);

    }
);


/*
mux.write('2024-01-15T10:30:00Z ERROR auth-service Request timeout\n')
mux.write('2024-01-15T10:30:01Z INFO user-service User authenticated\n')

mux.end()
*/
