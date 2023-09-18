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
            console.log(`MongoDB connection opened`);
            return true;
        } catch (error) {
            console.error(`Something went wrong with open db connection: ${error}`);
            throw new Error(`DbService:connect  ${error}`);
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
            console.log('mongodb connection closed ');
            return true;
        } catch (error) {
            console.error(`Something went wrong with closing connection: ${error}`);
            throw new Error(`DbService:closeConnection  ${error}`);
        }
    }

    async insertLinkToLinksCollection(subPartLink, redirect) {
        try {
            const linkRecord = { "_id": subPartLink, "redirect": redirect, "createdAt": new Date() };
            const insertResult = await this.collectionLinks.insertOne(linkRecord);
            console.log(`     /${subPartLink}  redirect:${redirect} successfully inserted in collection ${this.nameCollectionLinks}.`);
            return insertResult;
        } catch (error) {
            // I don't want to use additional findOne I think this way more performance
            // BUT this is not looks beaty
            if (error.code === 11000) {
                console.log(`This subpart still exist  subPart: /${subPartLink}`);
                return { denyReason: "subpart still exist" };
            }
            console.error(`Exception ${this.nameCollectionLinks} : arr:${error}  subPartLink ${subPartLink}, redirect ${redirect} `);
            throw new Error(`DbService:insertLinkToLinksCollection  ${error}`);
        }
    }

    //TODO learn and add add concerns(write/read) to all operations 
    async insertNewUserSessionCollectionWithLink(userSession, insertedLinkId) {
        try {
            const userSessionRecord = { "_id": userSession, "createdAt": new Date(), "links": [{ "$ref": this.nameCollectionLinks, "$id": insertedLinkId }] };
            await this.collectionUserSessions.insertOne(userSessionRecord);
            console.log(`     The new user session ${userSession} will be inserted in collection ${this.nameCollectionUserSessions}.`);
            return true;
        } catch (error) {
            console.error(`Exception ${this.nameCollectionLinks} : arr:${error}  userSession ${userSession}, insertedLinkId ${insertedLinkId} `);
            throw new Error(`DbService:insertNewUserSessionCollectionWithLink  ${error}`);
        }
    }

    async insertLinkRefInExistUserSessionCollection(userSession, insertedLinkId) {
        try {
            const modifiedObject = await this.collectionUserSessions.findOneAndUpdate({ "_id": userSession }, { "$push": { links: { "$ref": this.nameCollectionLinks, "$id": insertedLinkId } } });
            if (!!modifiedObject) {
                console.log(`User session ${userSession} still exist and document successfully updated in collection ${this.nameCollectionUserSessions} with added linkId ${insertedLinkId}.`);
            }
            else {
                console.log(`User session  ${userSession} not existed.`);
            }
            return !!modifiedObject
        } catch (error) {
            console.error(`Exception  error:${error}  userSession ${userSession}, insertedLinkId ${insertedLinkId} `);
            throw new Error(`DbService:insertLinkRefInExistUserSessionCollection  ${error}`);
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
        } catch (error) {
            console.error(`Exception  error:${error}  userSession ${userSession}, insertedLinkId ${insertedLinkId}`);
            throw new Error(`DbService:insertLinkToUserSessionCollection  ${error}`);
        }
    }

    async getRedirectLink(subPart) {
        try {
            const getRedirectLinkResult = await this.collectionLinks.findOne({ _id: subPart });
            console.log(`GetRedirectLink with result ${getRedirectLinkResult}`);
            return getRedirectLinkResult;
        } catch (error) {
            console.error(`Exception  erroror:${error}  subPart ${subPart}`);
            throw new Error(`DbService:getRedirectLink  ${error}`);
        }
    }

    async getUserSessionRecord(userSession) {
        try {
            const userSessionRecord = await this.collectionUserSessions.findOne({ _id: userSession });
            console.log(`Success find userSession Record with session ${userSession}`);
            return userSessionRecord;
        } catch (error) {
            console.error(`Exception  error:${error}  userSession ${userSession}`);
            throw new Error(`DbService:getUserSessionRecord  ${error}`);
        }
    }

    async getUserLinksResultBySession(userSession) {
        try {
            const userSessionRecord = await this.getUserSessionRecord(userSession);
            if (userSessionRecord && userSessionRecord?.links) {
                return this.convertArrayOfRefsToValuesArr(userSessionRecord.links);
            } else {
                return [];
            }
        } catch (error) {
            console.error(`Exception  error:${error}  userSession ${userSession}`);
            throw new Error(`DbService:getUserLinksResultBySession  ${error}`);
        }
    }

    async addIndexes() {
        await this.collectionLinks.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 300 });
        await this.collectionUserSessions.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 300 });
        console.log(`MongoDB INDEXES ADDED `);
    }

    convertArrayOfRefsToValuesArr(arrayRefs) {
        const resArr = [];
        arrayRefs.forEach(elObj => {
            resArr.push(elObj?.oid)
        });
        return resArr;
    }

}