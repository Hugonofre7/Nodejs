const cluster = require('cluster');
const http = require('http');
const os = require('os');
const crypto = require('crypto');

if (cluster.isPrimary) {

    console.log(`Master ${process.pid}`);

    const numCPUs = os.cpus().length;

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

} else {

    const sessions = new Map();

    const server = http.createServer((req, res) => {

        if (req.method === 'POST' && req.url === '/login') {

            const sessionId = crypto.randomUUID();


            sessions.set(sessionId, {
                user: "Hugo",
                role: "admin"
            });


            res.writeHead(200, {
                'Content-Type': 'application/json'
            });


            res.end(JSON.stringify({
                message: "Login exitoso",
                sessionId,
                worker: process.pid
            }));

        }


        if (req.method === 'GET' && req.url.startsWith('/profile')) {


            const url = new URL(
                req.url,
                `http://${req.headers.host}`
            );


            const sessionId = url.searchParams.get('sessionId');


            const session = sessions.get(sessionId);


            res.writeHead(200, {
                'Content-Type': 'application/json'
            });


            if (session) {

                res.end(JSON.stringify({
                    message: "Sesión encontrada",
                    user: session,
                    worker: process.pid
                }));

            } else {

                res.end(JSON.stringify({
                    message: "Sesión no encontrada",
                    worker: process.pid
                }));

            }

        }


    });


    server.listen(3000, () => {

        console.log(
            `Worker ${process.pid} escuchando`
        );

    });

}