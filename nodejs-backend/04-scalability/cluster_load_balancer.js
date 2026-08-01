const cluster = require('cluster');
const http = require('http');
const os = require('os');


if (cluster.isPrimary) {

    console.log(`Master ${process.pid} iniciado`);

    const numCPUs = os.cpus().length;

    console.log(`CPUs detectadas: ${numCPUs}`);


    const heartbeats = new Map();


    for (let i = 0; i < numCPUs; i++) {

        const worker = cluster.fork();


        worker.on('message', (message) => {

            if (message.type === 'heartbeat') {

                heartbeats.set(
                    message.pid,
                    message.timestamp
                );

                console.log(
                    `Heartbeat recibido de Worker ${message.pid}`
                );

            }

        });

    }

    setInterval(() => {

        const now = Date.now();


        for (const [pid, timestamp] of heartbeats) {


            if (now - timestamp > 5000) {


                console.log(
                    `Worker ${pid} sin heartbeat`
                );


                const worker = Object.values(cluster.workers)
                    .find(
                        w => w.process.pid === pid
                    );


                if (worker) {

                    worker.kill();

                }

            }

        }


    }, 5000);



    cluster.on('exit', (worker, code, signal) => {


        console.log(
            `Worker ${worker.process.pid} murió`
        );


        console.log(
            `Código: ${code}, Señal: ${signal}`
        );


        console.log(
            'Creando nuevo worker...'
        );


        cluster.fork();


    });



} else {


    const server = http.createServer((req, res) => {


        if (req.url === '/freeze') {


            console.log(
                `Worker ${process.pid} congelado`
            );

            while (true) {}


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

    if (process.env.STOP_HEARTBEAT !== "true") {

        setInterval(() => {

            process.send({
                type:'heartbeat',
                pid:process.pid,
                timestamp:Date.now()
            });

        },2000);

}
}