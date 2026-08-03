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


    console.log("\n--- PROFILE ANTES DEL LOGOUT ---");


    let response = await fetch(
        `http://localhost:3000/profile?sessionId=${sessionId}`
    );


    let data = await response.json();


    console.log(data);



    console.log("\n--- LOGOUT ---");


    response = await fetch(
        `http://localhost:3000/logout?sessionId=${sessionId}`
    );


    data = await response.json();


    console.log(data);



    console.log("\n--- PROFILE DESPUÉS DEL LOGOUT ---");


    response = await fetch(
        `http://localhost:3000/profile?sessionId=${sessionId}`
    );


    data = await response.json();


    console.log(data);


}


async function main(){

    const sessionId = await login();

    await testStickySession(sessionId);

}


main();