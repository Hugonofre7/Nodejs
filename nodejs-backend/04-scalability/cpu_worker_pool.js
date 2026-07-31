function heavyComputation(n) {

    let sum = 0;

    for (let i = 1; i <= n; i++) {

        sum += i;

    }

    return sum;

}

setTimeout(() => {

    console.log('Event Loop libre');

}, 0);

heavyComputation(5_000_000_000);

console.log('después de heavyComputation');

const start = Date.now()
heavyComputation(5_000_000_000)
console.log(`después de heavyComputation — bloqueó ${Date.now() - start}ms`)
