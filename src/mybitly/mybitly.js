import DbService from '../services/db_service.js'
import RedisService from '../services/redis_service.js';

export default class MybitlyService {
    static async getRedirectLink(subPart) {
        const dbService = new DbService();
        const redisService = new RedisService();
        try {
            const cachedRedirectLink = await redisService.getCashedData(subPart);
            if (cachedRedirectLink) {
                return cachedRedirectLink;
            }

            await dbService.connect();
            const redirectLinkResult = await dbService.getRedirectLink(subPart);
            const redirectLink = redirectLinkResult.redirect;

            const cashTime = process.env.REDIS_CASH_TIME_IN_SEC;
            await redisService.setCashData(subPart, redirectLink, cashTime);
            await dbService.closeConnection();

            return redirectLink;
        } catch (error) {
            console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
            await dbService.closeConnection();
        }
        // return "https://nodejs.org/";
    }

    static async addLink(userSession, subPartLink, redirectLink) {
        const dbService = new DbService(); // TODO should investigate maybe better for performance to open connection (to create DbService) in server.js 
        try {
            // !!! that part of code I don't like the problem that db.insertOne return insertedId if inserted and throw error when dublicate
            //  but try to insert dublicate subPart is typical sitation, it's not Expection
            await dbService.connect();   // TODO and do not close, just reuse it between requests
            const insertLinkResult = await dbService.insertLinkToLinksCollection(subPartLink, redirectLink);
            if (insertLinkResult?.insertedId) {
                // case when insertLinkResult is succefull inserted
                const insertLinkToUserSessionResult = await dbService.insertLinkToUserSessionCollection(userSession, subPartLink, insertLinkResult.insertedId);
                await dbService.closeConnection();
                if (insertLinkToUserSessionResult) { // chck success or not insertLinkToUserSessionResult ()
                    return { success: true };  // all records successfully added
                }
                else {
                    // case when insertLinkResult is succefull inserted but insertLinkToUserSessionCollection not and this is exception!
                    // mb need to add logic for revert insert insertLinkResult
                    throw new Error(` insertLinkToUserSessionCollection not succefull  but insertLinkResult is succesfull`);
                }
            } else {
                // case when insertLinkResult ubsuccesfull but we have 1 case that not exception - when try to add dublicate SubLink and 
                // we have to inform the user about this
                if (insertLinkResult?.denyReason) {
                    return { success: false, denyReason: insertLinkResult.denyReason }
                }
                else {
                    throw new Error(`Somethring broke in mybitlyService.addLink when try to Insert  userSession: ${userSession}, subPartLink:${subPartLink}, redirectLink: ${redirectLink} `);
                }
            }
        } catch (err) {
            console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
            await dbService.closeConnection();
        }
    }

}