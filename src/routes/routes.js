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

recordRoutes.get('/:subpart', (req, res) => {
    const subpart = req.params["subpart"];
    const redirectLink = mybitlyService.getRedirectLink(subpart);
    if (redirectLink) {
        res.redirect(redirectLink);
    } else {
        res.status(404).send('link not found')
    }
});

recordRoutes.put('/api/addlink', (req, res) => {
    if (!req.query || !req.query.sessionId || !req.query.link) {
        return res.sendStatus(400);
    }

    const userSessionId = req.query.sessionId;
    const newLink = req.query.link;


    const isLinkAdded = mybitlyService.addLink(userSessionId, newLink);
    if (isLinkAdded) {
        res.status(200).send('the link successfully added').end();
    }
    else {
        if (isLinkAdded?.failedReason) {
            if (isLinkAdded?.failedReason === 'exist') {
                res.status(200).send('the link cannot be added because it already exists record with the same name').end();
            }
            res.status(200).send(isLinkAdded.failedReason).end();
        }
        res.status(500).send('Something broke! on server').end();
    }

});


export default recordRoutes;