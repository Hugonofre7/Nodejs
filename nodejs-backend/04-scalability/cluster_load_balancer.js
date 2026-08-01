const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {

    console.log(`Master ${process.pid} iniciado`);
    const numCPUs = os.cpus().length;

    console.log(`CPUs detectadas: ${numCPUs}`);

    for (let i = 0; i < numCPUs; i++) {

        cluster.fork();

}
    cluster.on('exit', (worker, code, signal) => {

        console.log(
            `Worker ${worker.process.pid} murió`
       );

        console.log(
            `Código: ${code}, Señal: ${signal}`
        );


        console.log('Creando nuevo worker...');

        cluster.fork();

});

} else {

    const server = http.createServer((req, res) => {

    if (req.url === '/crash') {

        console.log(
            `Worker ${process.pid} simulando crash`
        );

        process.exit(1);

    }


    if (req.url === '/') {

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end(
            `Respuesta desde Worker ${process.pid}\n`
        );

    }

});

    server.listen(3000, () => {

        console.log(
            `Worker ${process.pid} escuchando en puerto 3000`
        );

    });

}