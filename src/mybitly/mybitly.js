import DbService from '../services/db_service.js'
import RedisService from '../services/redis_service.js';
import { REDIS_CASH_TIME_IN_SEC } from '../constants/constants.js';

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
            await dbService.closeConnection();
            if (!redirectLinkResult?.redirect) {
                return null
            }
            const redirectLink = redirectLinkResult.redirect;
            await redisService.setCashData(subPart, redirectLink, REDIS_CASH_TIME_IN_SEC);
            return redirectLink;
        } catch (err) {
            console.error(`MybitlyService:  getRedirectLink: ${err} subPart${subPart}\n`);
            await dbService.closeConnection();
        }
        // return "https://nodejs.org/";
    }

    static async addLink(userSession, subPartLink, redirectLink) {
        try {
            const dbService = new DbService(); // TODO should investigate maybe better for performance to open connection (to create DbService) in server.js 
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
                    console.error(`MybitlyService:addLink insertLinkToUserSessionResult was unnsuccessfull ${{ userSession, subPartLink, redirectLink, insertLinkResult, insertLinkToUserSessionResult }}\n`);
                    throw new Error(`MybitlyService:addLink insertLinkToUserSessionResult was unnsuccessfull ${{ userSession, subPartLink, redirectLink, insertLinkResult, insertLinkToUserSessionResult }}\n`);
                }
            } else {
                // case when insertLinkResult ubsuccesfull but we have 1 case that not exception - when try to add dublicate SubLink and 
                // we have to inform the user about this
                await dbService.closeConnection();
                if (insertLinkResult?.denyReason) {
                    return { success: false, denyReason: insertLinkResult.denyReason }
                }
                else {
                    console.error(`Link was dined without denyReason ${{ userSession, subPartLink, redirectLink, insertLinkResult, insertLinkToUserSessionResult }}\n`);
                    throw new Error(`Link was dined without denyReason ${{ userSession, subPartLink, redirectLink, insertLinkResult, insertLinkToUserSessionResult }}\n`);
                }
            }
        } catch (err) {
            console.error(`MybitlyService:addLink: ${err} ${{ userSession, subPartLink, redirectLink }}\n`);
        }
    }

}