class StreamMultiplexer {

    constructor(destinations) {
        this.destinations = destinations;

    }

    write(chunk) {

    for (const destination of this.destinations) {

        try {

            destination.write(chunk);

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

            destination.end();


        }
    }

}

const fs = require('fs')

const errorLog = fs.createWriteStream('mux_errors.txt')
const generalLog = fs.createWriteStream('mux_general.txt')
const consoleStream = process.stdout

const mux = new StreamMultiplexer([errorLog, generalLog, consoleStream])

mux.write('2024-01-15T10:30:00Z ERROR auth-service Request timeout\n')
mux.write('2024-01-15T10:30:01Z INFO user-service User authenticated\n')

mux.end()