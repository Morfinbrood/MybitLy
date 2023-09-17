import express from "express";
import { ignoreFavicon } from '../utils/utils.js';
import mybitlyService from '../mybitly/mybitly.js'

const recordRoutes = express.Router();

recordRoutes.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!').end();
})

recordRoutes.use(ignoreFavicon);

recordRoutes.get('/', (req, res) => {
    if (req?.session?.id) {
        res.write(`<h1>Welcome  you session with uid:</h1><br>`);
        res.write(`<h1> ${req.session.id} </h1><br>`);
        res.end(`<h3>This is the Home page</h3>`);
    } else {
        res.end(`<h1>something wrong with gerenate session </h1><br>`);
    }
});

recordRoutes.get('/:subpart', async (req, res) => {
    const subpart = req.params["subpart"];
    const redirectLink = await mybitlyService.getRedirectLink(subpart);
    if (redirectLink) {
        res.status(301).redirect(`https://${redirectLink}`);
    } else {
        res.status(404).send('link not found')
    }
});

recordRoutes.put('/api/addlink', async (req, res) => {
    try {
        if (!req.query || !req.query.sessionId || !req.query.link || !req.query.subPart) {
            return res.sendStatus(400);
        }

        const userSessionId = req.query.sessionId;
        const newLink = req.query.link;
        const subPart = req.query.subPart;
        const addLinkResult = await mybitlyService.addLink(userSessionId, subPart, newLink);

        if (addLinkResult?.success) {
            res.status(200).send('the link successfully added').end();
        }
        else {
            if (addLinkResult?.denyReason) {
                res.status(200).send(addLinkResult.denyReason).end();
            }
            else {
                throw new Error(`mybitlyService.addLink when try to Insert  req: ${req} `);
            }
        }

    } catch (error) {
        res.status(500).send(`Something broke in route /api/addlink with request ${req}`).end();
    }

});


export default recordRoutes;