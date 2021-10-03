const { MongoClient } = require('mongodb');

module.exports = (client) => {
    client.db = new MongoClient(process.env.MONGOO_URI);
    client.db.connect().then( () => {
        console.log("Connected to the client.");
    }).catch( err => {
        console.log(err)
    })
}