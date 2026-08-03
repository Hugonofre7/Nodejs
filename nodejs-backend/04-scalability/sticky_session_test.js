async function login(){

    const response = await fetch(
        'http://localhost:3000/login',
        {
            method:'POST'
        }
    );


    const data = await response.json();


    console.log(
        "Sesión creada:",
        data.sessionId
    );

    console.log(
        "Worker del login:",
        data.worker
    );


    return data.sessionId;

}


async function testStickySession(sessionId){

    for(let i = 1; i <= 8; i++){

        const response = await fetch(
            `http://localhost:3000/profile?sessionId=${sessionId}`
        );


        const data = await response.json();


        console.log(
            `Request ${i} atendida por Worker:`,
            data.worker
        );

    }

}



async function main(){

    const sessionId = await login();

    await testStickySession(sessionId);

}


main();