import dbService from '../services/db_service.js'

const mybitlyService = {};

mybitlyService.getRedirectLink = (link) => {
    // dbService.insertLink(link);
    // return "https://nodejs.org/";
}

mybitlyService.addLink = (userSession, link) => {
    (async () => {
        try {
            const isLinkStillExist = await dbService.findLink(link);
            if (isLinkStillExist) {
                failedResult = {};
                failedResult.failedReason = isInserted.failedReason;
                return failedResult
            }


            const isInserted = await dbService.insertLink(userSession, link);
            if (isInserted) {
                return true;
            }
            else {
                return false;
            }

        } catch (err) {
            console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
        }
    })();
}


export default mybitlyService;