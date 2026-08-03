const cluster = require('cluster');
const http = require('http');
const os = require('os');
const crypto = require('crypto');

function getWorkerIndex(sessionId, numWorkers) {

    let hash = 0;

    for (const char of sessionId) {

        hash = (
            hash + char.charCodeAt(0)
        ) % numWorkers;

    }

    return hash;

}

if (cluster.isPrimary) {

    console.log(`Master ${process.pid}`);

    const numCPUs = os.cpus().length;

    const workers = [];

    const workerMap = new Map();

    const stickyTable = new Map();


    for (let i = 0; i < numCPUs; i++) {

        const worker = cluster.fork();

        workers.push(worker);

        workerMap.set(
            i,
            worker
        );


        worker.on('online', () => {

            console.log(
                `Worker disponible ${worker.process.pid}`
            );
        });

        worker.on('message', (message) => {

            if (message.type === "registerSession") {

                stickyTable.set(
                    message.sessionId,
                    worker
                );

                console.log(
                    "Sticky table:",
                    stickyTable
                );

                console.log(
                    `Sesión ${message.sessionId} registrada en Worker ${worker.process.pid}`
                );

            }

            if (message.type === "removeSession") {

                stickyTable.delete(
                    message.sessionId
                );

                console.log(
                    `Sesión ${message.sessionId} eliminada de Sticky Table`
                );

                console.log(
                    "Sticky table:",
                    stickyTable
                );

            }

        });
    }


    const server = http.createServer((req, res) => {

        console.log(
            `${req.method} ${req.url}`
        );

    });


    server.on('connection', (socket) => {

        console.log(
            "Nueva conexión TCP recibida"
        );


        socket.once('data',(data)=>{

            const request = data.toString();

            console.log(request);


            const match = request.match(
                /sessionId=([^&\s]+)/
            );


            let workerIndex = 0;


            if (match) {

                const sessionId = match[1];

                const worker = stickyTable.get(sessionId);
                console.log(
                    "Sticky lookup:",
                    sessionId,
                    worker ? worker.process.pid : "NO ENCONTRADO"
                );


                if (worker) {

                    console.log(
                        `Sesión ${sessionId} enviada a Worker ${worker.process.pid}`
                    );


                    worker.send(
                        {
                            type:"sticky",
                            request
                        },
                        socket
                    );

                    return;

                }

            }


            const worker = workers[workerIndex];
            console.log(
                `Índice calculado: ${workerIndex}`
            );

            console.log(
                `PID destino: ${worker.process.pid}`
            );


            worker.send(
                {
                    type: "sticky",
                    request
                },
                socket
            );


        });


    });

    server.listen(3000, () => {

        console.log(
            "Master escuchando puerto 3000"
        );

    });


} else {

    const sessions = new Map();


    process.on('message', (message, socket) => {

        if (message.type === "sticky") {


            const request = message.request;


            if(request.startsWith("POST /login")) {

                const sessionId = crypto.randomUUID();


                sessions.set(sessionId,{
                    user:"Hugo",
                    role:"admin"
                });

                process.send({
                    type: "registerSession",
                    sessionId,
                    pid: process.pid
                });


                const response = {
                    message:"Login exitoso",
                    sessionId,
                    worker:process.pid
                };


                socket.write(
                    "HTTP/1.1 200 OK\r\n" +
                    "Content-Type: application/json\r\n" +
                    "\r\n" +
                    JSON.stringify(response)
                );


                socket.end();

            }


            if (request.startsWith("GET /profile")) {

                const match = request.match(
                    /sessionId=([^\s&]+)/
                );


                const sessionId = match
                    ? match[1]
                    : null;


                const session = sessions.get(sessionId);


                const response = session
                    ? {
                        message:"Sesión encontrada",
                        user:session,
                        worker:process.pid
                    }
                    : {
                        message:"Sesión no encontrada",
                        worker:process.pid
                    };


                socket.write(
                    "HTTP/1.1 200 OK\r\n" +
                    "Content-Type: application/json\r\n" +
                    "\r\n" +
                    JSON.stringify(response)
                );


                socket.end();

            }

            if (request.startsWith("GET /logout")) {

                const match = request.match(
                    /sessionId=([^\s&]+)/
                );


                const sessionId = match
                    ? match[1]
                    : null;


                const deleted = sessions.delete(
                    sessionId
                );


                if (deleted) {

                    process.send({
                        type:"removeSession",
                        sessionId
                    });

                }


                const response = deleted
                    ? {
                        message:"Logout exitoso",
                        worker:process.pid
                    }
                    : {
                        message:"Sesión no encontrada",
                        worker:process.pid
                    };


                socket.write(
                    "HTTP/1.1 200 OK\r\n" +
                    "Content-Type: application/json\r\n" +
                    "\r\n" +
                    JSON.stringify(response)
                );


                socket.end();

            }


        }

    });

}
