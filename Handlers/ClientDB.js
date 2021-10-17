const { MongoClient } = require(`mongodb`);

module.exports = async client => {
    try {
        const URI = process.env.MONGOO_URI || null;
        if(URI === null) {
            client.db = undefined;
            console.log(`No DataBase URI found.Client will be intialized without DB connection.WARNING: Commands which require DB wont run until u specify a DB URI`);
            return;
        }
        const ClientDB = new MongoClient(process.env.MONGOO_URI);
        await ClientDB.connect();
        ClientDB.db(`BotData`);
        client.db = ClientDB;
        console.log("Successfully connected to the DatabBase.");
    } catch (error) {
        client.db = undefined;
        console.log(error)
    }


}