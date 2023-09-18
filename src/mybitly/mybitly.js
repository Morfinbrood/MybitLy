import DbService from '../services/db_service.js'
import RedisService from '../services/redis_service.js';
import { REDIS_CASH_TIME_IN_SEC } from '../constants/constants.js';

export default class MybitlyService {

    static async getRedirectLink(subPart) {
        const dbService = new DbService();
        const redisService = new RedisService();
        try {

            // try to get abd return cashed data from redis
            const cachedRedirectLink = await redisService.getCashedData(subPart);
            if (cachedRedirectLink) {
                return cachedRedirectLink;
            }

            // if this data no casged try to get from db
            await dbService.connect();
            const redirectLinkResult = await dbService.getRedirectLink(subPart);
            await dbService.closeConnection();

            // if this subpart is exist then return redirect for it and set to redis cash
            if (redirectLinkResult?.redirect) {
                const redirectLink = redirectLinkResult.redirect;
                await redisService.setCashData(subPart, redirectLink, REDIS_CASH_TIME_IN_SEC);
                return redirectLink;
            }

            return null
        } catch (error) {
            console.error(`MybitlyService:  getRedirectLink: ${error} subPart${subPart}`);
            await dbService.closeConnection();
            throw new Error(`MybitlyService:getRedirectLink  ${error}`);
        }
    }

    static async addLink(userSession, subPartLink, redirectLink) {
        try {
            // TODO should investigate maybe better for performance to open connection (to create DbService) in server.js and do not close, just reuse it between requests
            const dbService = new DbService();
            await dbService.connect();
            const insertLinkResult = await dbService.insertLinkToLinksCollection(subPartLink, redirectLink);
            if (insertLinkResult?.insertedId) {
                // case when insertLinkResult is succefull inserted in collection 'links'
                const insertLinkToUserSessionResult = await dbService.insertLinkToUserSessionCollection(userSession, subPartLink, insertLinkResult.insertedId);
                await dbService.closeConnection();
                if (insertLinkToUserSessionResult) {
                    // case when in both collection 'links' and 'user_session_links' recors succesfully inserted
                    return { success: true };
                }
                else {
                    // case when insertLinkResult is succefull inserted in 'links' BUT no succesfully insert in 'user_session_links'
                    // TODO add revert logic for 'link' insert
                    console.error(`MybitlyService:addLink insert in 'user_session_links'  was unnsuccessfull ${{ userSession, subPartLink, redirectLink, insertLinkResult, insertLinkToUserSessionResult }}`);
                    throw new Error(`MybitlyService:addLink insert in 'user_session_links'  was unnsuccessfull ${{ userSession, subPartLink, redirectLink, insertLinkResult, insertLinkToUserSessionResult }}`);
                }
            } else {
                // case when insertLinkResult unsuccesfull but we have 1 case that not exception - when try to add dublicate SubLink and 
                // we have to inform the user about this
                await dbService.closeConnection();
                if (insertLinkResult?.denyReason) {
                    return { success: false, denyReason: insertLinkResult.denyReason }
                }
                else {
                    // this is real EXCEPTION
                    console.error(`Link was dined without denyReason ${{ userSession, subPartLink, redirectLink, insertLinkResult, insertLinkToUserSessionResult }}`);
                    throw new Error(`Link was dined without denyReason ${{ userSession, subPartLink, redirectLink, insertLinkResult, insertLinkToUserSessionResult }}`);
                }
            }
        } catch (error) {
            console.error(`MybitlyService:addLink: ${error} ${{ userSession, subPartLink, redirectLink }}`);
            throw new Error(`MybitlyService:    static async addLink(userSession, subPartLink, redirectLink) {
                ${error}`);
        }
    }

}