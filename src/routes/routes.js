import express from "express";
import { ignoreFavicon } from '../utils/utils.js';
import MybitlyService from '../mybitly/mybitly.js'


export default class RecordRoutes {
    constructor() {
        this.recordRoutes = express.Router();
        this.addErrorHandler();
        this.addIngonreFavicon();
        this.addHomePageRoute();
        this.addSubPartHandlerRoute();
        this.addAddLinkHandlerRoute();

        return this.recordRoutes;
    }

    addErrorHandler() {
        this.recordRoutes.use(function (err, req, res, next) {
            console.error(`Something broke on server! err = ${err}, req = ${req}`);
            res.status(500).send('Something broke on server!').end();
        })
    }

    addIngonreFavicon() {
        this.recordRoutes.use(ignoreFavicon);
    }

    addHomePageRoute() {
        this.recordRoutes.get('/', (req, res) => {
            if (req?.session?.id) {
                res.write(`<h1>Welcome  you session with uid:</h1><br>`);
                res.write(`<h1> ${req.session.id} </h1><br>`);
                res.end(`<h3>This is the Home page</h3>`);
            } else {
                res.end(`<h1>something wrong with gerenate session </h1><br>`);
            }
        })
    }

    addSubPartHandlerRoute() {
        this.recordRoutes.get('/:subpart', async (req, res) => {
            console.log(`ROUTES get url ${req?.url} `);
            const subpart = req.params["subpart"];
            const redirectLink = await MybitlyService.getRedirectLink(subpart);
            if (redirectLink) {
                console.log(`redirect user to https://${redirectLink}`);
                res.status(301).redirect(`https://${redirectLink}`);
            } else {
                console.log(`redirect link for subpart ${subpart} not found`);
                res.status(404).send('link not found')
            }
        });
    }

    addAddLinkHandlerRoute() {
        this.recordRoutes.put('/api/addlink', async (req, res) => {
            try {
                if (!req.query || !req.query.sessionId || !req.query.link || !req.query.subPart) {
                    console.error(`ROUTES try to addlink Not correct request: ${req} `);
                    return res.sendStatus(400);
                }

                const userSessionId = req.query.sessionId;
                const newLink = req.query.link;
                const subPart = req.query.subPart;
                const addLinkResult = await MybitlyService.addLink(userSessionId, subPart, newLink);

                if (addLinkResult?.success) {
                    res.status(200).send('the link successfully added').end();
                }
                else {
                    if (addLinkResult?.denyReason) {
                        res.status(200).send(addLinkResult.denyReason).end();
                    }
                    else {
                        console.error(`ERROR: ROUTES: addAddLinkHandlerRoute ${req} `);
                        throw new Error(`ERROR: ROUTES: addAddLinkHandlerRoute ${req} `);
                    }
                }

            } catch (error) {
                res.status(500).send(`Something broke in route /api/addlink with request ${req}`).end();
            }
        });
    }
};