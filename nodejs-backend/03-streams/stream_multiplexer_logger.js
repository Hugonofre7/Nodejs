class StreamMultiplexer {

    constructor(destinations) {
        this.destinations = destinations;

    }

write(chunk) {

    for (const destination of this.destinations) {

        try {

            if (!destination.filter || destination.filter(chunk)) {

                destination.stream.write(chunk);

            }

        } catch (error) {

            console.error(
                'Error escribiendo en destino:',
                error.message
            );

        }

    }

}

    end() {
        for (const destination of this.destinations) {

            destination.stream.end();


        }
    }

}

const fs = require('fs')

const errorLog = fs.createWriteStream('mux_errors.txt')
const generalLog = fs.createWriteStream('mux_general.txt')
const consoleStream = process.stdout

const mux = new StreamMultiplexer([
    {
        stream: errorLog,
        filter: (chunk) => chunk.includes('ERROR')
    },
    {
        stream: generalLog,
        filter: null
    },
    {
        stream: consoleStream,
        filter: (chunk) => chunk.includes('ERROR')
    }
])

mux.write('2024-01-15T10:30:00Z ERROR auth-service Request timeout\n')
mux.write('2024-01-15T10:30:01Z INFO user-service User authenticated\n')

mux.end()

