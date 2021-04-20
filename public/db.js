const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window. msIndexedDB ||
    window.shimIndexedDB;
let db;
// Create a new db request for a "budget" database.

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore('pending', { autoIncrement: true });
};

request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

request.onsuccess = ({ target }) => {
  console.log('success');
  db = target.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  // Create a transaction on the db with readwrite access
  const transaction = db.transaction(["pending"], 'readwrite');

  // Access your BudgetStore object store
  const store = transaction.objectStore("pending");

  // Add record to your store with add method.
  store.add(record);
};

function checkDatabase() {
  console.log('check db invoked');

  // Open a transaction on your BudgetStore db
  const transaction = db.transaction(["pending"], 'readwrite');

  // access your BudgetStore object
  const store = transaction.objectStore("pending");

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
            return response.json()
        })
        .then(() => {
            // Open another transaction with the ability to read and write
            const transaction = db.transaction(["pending"], 'readwrite');

            // Assign the current store to a variable
            const store = transaction.objectStore("pending");

            // Clear existing entries because our bulk add was successful
            store.clear();
            console.log('Clearing store 🧹');
          
        });
    }
  };
} // Listen for app coming back online
window.addEventListener('online', checkDatabase);
