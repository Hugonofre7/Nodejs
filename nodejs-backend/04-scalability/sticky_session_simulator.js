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

                workerIndex = getWorkerIndex(
                    sessionId,
                    workers.length
                );


                console.log(
                    `Session ${sessionId} enviada a Worker ${workerIndex}`
                );

            }


            const worker = workers[workerIndex];


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


        }

    });



    const server = http.createServer((req, res) => {


        if (req.method === 'POST' && req.url === '/login') {

            const sessionId = crypto.randomUUID();

            sessions.set(sessionId, {
                user:"Hugo",
                role:"admin"
            });


            res.writeHead(200,{
                'Content-Type':'application/json'
            });


            res.end(JSON.stringify({
                message:"Login exitoso",
                sessionId,
                worker:process.pid
            }));

        }


        if (req.method === 'GET' && req.url.startsWith('/profile')) {


            const url = new URL(
                req.url,
                `http://${req.headers.host}`
            );


            const sessionId =
                url.searchParams.get('sessionId');


            const session =
                sessions.get(sessionId);


            res.writeHead(200,{
                'Content-Type':'application/json'
            });


            if(session){

                res.end(JSON.stringify({
                    message:"Sesión encontrada",
                    user:session,
                    worker:process.pid
                }));

            } else {

                res.end(JSON.stringify({
                    message:"Sesión no encontrada",
                    worker:process.pid
                }));

            }

        }


    });

    server.listen(0, () => {

        console.log(
            `Worker ${process.pid} escuchando`
        );

    });
}