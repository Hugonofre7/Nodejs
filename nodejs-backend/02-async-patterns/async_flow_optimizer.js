async function fetchData() {
    throw new Error('Fetch failed');
}

async function withoutAwait() {
    try {
        return fetchData();
    } catch (err) {
        console.log('withoutAwait:', err.message);
    }
}

async function withAwait() {
    try {
        return await fetchData();
    } catch (err) {
        console.log('withAwait:', err.message);
    }
}

withoutAwait();

withAwait();