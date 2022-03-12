// global variable to hold db
let db;

// connection to IndexedDB 'budget' version 1
const request = indexedDB.open('budget', 1);

// emits db version changes
request.onupgradeneeded = function(event) {
    // save reference to database
    const db = event.target.result;
    // create object store called 'transfer'
    db.createObjectStore('new_transfer', {autoIncrement: true});
};

request.onsuccess = function(event) {
    // save reference to db in global variable
    db = event.target.result;
    // check if app is online
    if (navigator.onLine) {
        uploadTransfer();
    }
};

// on error
request.onerror = function(event) {
    // log error
    console.log(event.target.errorCode);
};

// executed when attempted to submit transfer but there is no connection
function saveRecord(record) {
    console.log(record);
    // new transaction w/ db w/ read and write permissions
    const transaction = db.transaction(['new_transfer'], 'readwrite');

    // access object stores for new transactions
    const transferObjectStore = transaction.objectStore('new_transfer');

    // add record to store
    transferObjectStore.add(record);
};

function uploadTransfer() {
    // open transaction on pending db
    const transaction = db.transaction(['new_transfer'], 'readwrite');

    // access object stores for new transactions
    const transferObjectStore = transaction.objectStore('new_transfer');

    // get all records from store and set to variable
    const getAll = transferObjectStore.getAll();

    getAll.onsuccess = function() {
        // if data in IndexedDB send to api
        if (getAll.result.length > 0) {
            fetch('api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error (serverResponse);
                }

                const transaction = db.transaction(['new_transfer'], 'readwrite');
                const transferObjectStore = transaction.objectStore('new_transfer');
                // clear IndexedDB
                transferObjectStore.clear();
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};

// listen for app coming back online
window.addEventListener('online', uploadTransfer);