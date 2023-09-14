import { MongoClient, ServerApiVersion } from 'mongodb';
export default class DbService {
    constructor() {
        this.config = {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        };
        this.uri = process.env.ATLAS_URI;
        this.dbName = process.env.DB_NAME;
        this.nameCollectionLinks = process.env.NAME_COLLECTION_LINKS;
        this.nameCollectionUserSessions = process.env.NAME_COLLECTION_USER_SESSIONS;

        this.client;
        this.clientConnect;
        this.db;
        this.client;
        this.collectionLinks;
        this.collectionUserSessions;
    }

    async connect() {
        try {
            this.client = new MongoClient(this.uri, this.config);
            this.clientConnect = client.connect();
            this.db = clientConnect.db(this.dbName);
            this.collectionLinks = db.collection(this.nameCollectionLinks);
            this.collectionUserSessions = db.collection(this.nameCollectionUserSessions);
            console.log('connection opened');
            return true;
        } catch (err) {
            console.error(`Something went wrong with open db connection: ${err}\n`);
        }
    }

    async closeConnection() {
        try {
            await this.clientConnect.close();
            this.clientConnect = null;
            this.db = null;
            this.collectionLinks = null;
            this.collectionUserSessions = null;
            this.client = null;
            console.log('connection closed');
            return true;
        } catch (err) {
            console.error(`Something went wrong with closing connection: ${err}\n`);
        }
    }

    async insertLinkToLinksCollection(subPartLink, redirect) {
        try {
            const linkRecord = { _id: subPartLink, redirect: redirect };
            const insertResult = await this.collectionLinks.insertOne(linkRecord);
            console.log(`${insertResult.insertedCount} document successfully inserted in collection ${this.nameCollectionLinks}.\n`);
            return insertResult;
        } catch (err) {
            console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
        }
    }

    async insertLinkRefInUserSessionCollection(newUserSessionRecord, insertedLinkId) {
        try {
            const insertOneResult = await collection.insertOne(newUserSessionRecord, { $push: { "$ref": this.collectionLinks, "$id": insertedLinkId } });
            console.log(`${insertOneResult.insertedCount} document successfully inserted in collection ${this.nameCollectionUserSessions}.\n`);
            return true;
        } catch (err) {
            console.error(`Something went wrong getUserSessionRecord: ${err} \n`);
        }
    }

    async getUserSessionRecord(userSession) {
        try {
            const userSessionRecord = await collection.findOne({ _id: userSession })
            return userSessionRecord;
        } catch (err) {
            console.error(`Something went wrong getUserSessionRecord: ${err} \n`);
        }
    }

    async insertLinkToUserSessionCollection(userSession, insertedLinkId) {
        try {
            let userSessionRecord = this.getUserSessionRecord(userSession);
            if (!userSessionRecord) {
                userSessionRecord = { _id: userSession };
            }
            await this.insertLinkRefInUserSessionCollection(userSessionRecord, insertedLinkId);

            return true;
        } catch (err) {
            console.error(`Something went wrong trying to insert the new documents: ${err} \n`);
        }
    }

    async findSubPart(subPart) {
        try {
            const filter = { subpart: subPart };
            const document = await collection.findOne(filter);
            if (document) {
                console.log(`SubPart still exist: ${subPart} `);
                return true;
            }
        } catch (err) {
            console.error(`Something went wrong with findSubPart: ${err} \n`);
        }
        console.log("SubPart not found:\n");
        return false;
    }

}