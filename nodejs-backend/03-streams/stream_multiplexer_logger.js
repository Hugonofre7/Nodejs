const { pipeline, Transform, Writable } = require('stream');
const fs = require('fs');
class StreamMultiplexer extends Writable {

    constructor(destinations) {
    super();

    this.destinations = destinations.map(destination => ({
        ...destination,
        written: 0,
        filtered: 0
    }));

}

_write(chunk, encoding, callback) {

    for (const destination of this.destinations) {

        try {

            const accepted =
                !destination.filter || destination.filter(chunk.toString());

            if (accepted) {

                destination.stream.write(chunk);

                destination.written++;

            } else {

                destination.filtered++;

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
getStats() {

    return {
        destinations: this.destinations.map(destination => ({
            name: destination.name,
            written: destination.written,
            filtered: destination.filtered
        }))
    };

    }
}

const errorLog = fs.createWriteStream('mux_errors.txt')
const generalLog = fs.createWriteStream('mux_general.txt')

const consoleStream = process.stdout

const mux = new StreamMultiplexer([
    {
        name: 'errorLog',
        stream: errorLog,
        filter: null
    },
    {
        name: 'generalLog',
        stream: generalLog,
        filter: null
    },
    /*
    {
        stream: consoleStream,
        filter: null
    }
    */
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
        console.log(mux.getStats());

    }
);


/*
mux.write('2024-01-15T10:30:00Z ERROR auth-service Request timeout\n')
mux.write('2024-01-15T10:30:01Z INFO user-service User authenticated\n')

mux.end()
*/
