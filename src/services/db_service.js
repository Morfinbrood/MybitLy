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
        this.collectionLinks;
        this.collectionUserSessions;
    }

    async connect() {
        try {
            this.client = new MongoClient(this.uri, this.config);
            this.clientConnect = await this.client.connect();
            this.db = this.clientConnect.db(this.dbName);
            this.collectionLinks = this.db.collection(this.nameCollectionLinks);
            this.collectionUserSessions = this.db.collection(this.nameCollectionUserSessions);
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
            const linkRecord = { "_id": subPartLink, "redirect": redirect };
            const insertResult = await this.collectionLinks.insertOne(linkRecord);
            console.log(`document successfully inserted in collection ${this.nameCollectionLinks}.\n`);
            return insertResult;
        } catch (err) {
            // If redis cash not working this way will be more faster then before try to check is this subpart exist
            if (err.code === 11000) { // this error is predicatable when user try to add exister subpart
                console.log(`This subpart still exist  subPart: ${subPartLink}\n`);
                return { denyReason: "subpart still exist" };
            }
            console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
            return err;
        }
    }

    async insertNewUserSessionCollectionWithLink(userSession, insertedLinkId) {
        try {
            const userSessionRecord = { "_id": userSession, "links": [{ "$ref": this.nameCollectionLinks, "$id": insertedLinkId }] };
            const insertOneResult = await this.collectionUserSessions.insertOne(userSessionRecord);
            console.log(`${insertOneResult.insertedCount} document successfully inserted in collection ${this.nameCollectionUserSessions}.\n`);
            return true;
        } catch (err) {
            console.error(`Something went wrong getUserSessionRecord: ${err} \n`);
        }
    }

    async insertLinkRefInExistUserSessionCollection(userSession, insertedLinkId) {
        try {
            const modifiedObject = await this.collectionUserSessions.findOneAndUpdate({ "_id": userSession }, { "$push": { links: { "$ref": this.nameCollectionLinks, "$id": insertedLinkId } } });
            console.log(` document successfully inserted in collection ${this.nameCollectionUserSessions}.\n`);
            return !!modifiedObject
        } catch (err) {
            console.error(`Something went wrong getUserSessionRecord: ${err} \n`);
        }
    }

    async getUserSessionRecord(userSession) {
        try {
            const userSessionRecord = await this.collectionUserSessions.findOne({ _id: userSession })
            return userSessionRecord;
        } catch (err) {
            console.error(`Something went wrong getUserSessionRecord: ${err} \n`);
        }
    }

    async insertLinkToUserSessionCollection(userSession, insertedLinkId) {
        try {
            const findAndUpdateResult = await this.insertLinkRefInExistUserSessionCollection(userSession, insertedLinkId);
            if (findAndUpdateResult) {
                return true;
            } else {
                const insertNewUserSession = await this.insertNewUserSessionCollectionWithLink(userSession, insertedLinkId);
                return insertNewUserSession
            }

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