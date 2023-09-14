import DbService from '../services/db_service.js'

const mybitlyService = {};

mybitlyService.getRedirectLink = (subPartLink) => {
    // dbService.insertLink(link);
    // return "https://nodejs.org/";
}

mybitlyService.addLink = (userSession, subPartLink, redirectLink) => {
    (async () => {
        let dbService;
        try {
            dbService = new DbService();
            await dbService.connect();

            const insertResult = await dbService.insertLinkToLinksCollection(subPartLink, redirectLink);
            await dbService.insertLinkToUserSessionCollection(userSession, subPartLink, insertResult.insertedId);


        } catch (err) {
            console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
        } finally {
            await dbService.closeConnection();
        }
    })();
}


export default mybitlyService;