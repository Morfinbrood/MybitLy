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
        this.recordRoutes.use(function (error, req, res, next) {
            console.error(`Something broke on server! error = ${error}, req = ${req}`);
            res.status(500).send('Something broke on server!').end();
        })
    }

    addIngonreFavicon() {
        this.recordRoutes.use(ignoreFavicon);
    }

    addHomePageRoute() {
        this.recordRoutes.get('/', (req, res) => {
            try {
                if (req?.session?.id) {
                    res.write(`<h1>Welcome  you session with uid:</h1><br>`);
                    res.write(`<h1> ${req.session.id} </h1><br>`);
                    res.end(`<h3>This is the Home page</h3>`);
                } else {
                    res.end(`<h1>something wrong with gerenate session </h1><br>`);
                }
            } catch (error) {
                console.error(`Exception: ROUTES /api/addlink ERROR ${error}`);
                res.status(500).send(`Server error`).end();
            }
        })
    }

    addSubPartHandlerRoute() {
        this.recordRoutes.get('/:subpart', async (req, res) => {
            try {
                console.log(`\n  ROUTES get url ${req?.url} `);
                const subpart = req.params["subpart"];
                const redirectLink = await MybitlyService.getRedirectLink(subpart);
                if (redirectLink) {
                    console.log(`redirect user to https://${redirectLink}`);
                    res.status(301).redirect(`https://${redirectLink}`);
                } else {
                    console.log(`redirect link for subpart ${subpart} not found`);
                    res.status(404).send('link not found')
                }
            } catch (error) {
                console.error(`Exception: ROUTES /api/addlink ERROR ${error}`);
                res.status(500).send(`Server error`).end();
            }
        });
    }

    addAddLinkHandlerRoute() {
        this.recordRoutes.put('/addlink', async (req, res) => {
            try {
                if (!req?.query || !req?.session?.id || !req?.query?.redirect || !req?.query?.subPart) {
                    console.error(`ROUTES try to addlink Not correct request: ${req} `);
                    return res.sendStatus(400);
                }

                const userSessionId = req.session.id
                const redirect = req.query.redirect;
                const subPart = req.query.subPart;

                console.log(`\n  ROUTES /api/addlink userSessionId ${userSessionId} subPart ${subPart}  redirect ${redirect} `);

                const addLinkResult = await MybitlyService.addLink(userSessionId, subPart, redirect);

                if (addLinkResult?.success) {
                    res.status(200).send('the link successfully added').end();
                }
                else {
                    if (addLinkResult?.denyReason) {
                        console.log(`Dublicate subPart`);
                        res.status(200).send(addLinkResult.denyReason).end();
                    }
                    else {
                        console.error(`ERROR: ROUTES: addAddLinkHandlerRoute ${req} `);
                        throw new Error(`ERROR: ROUTES: addAddLinkHandlerRoute ${req} `);
                    }
                }

            } catch (error) {
                console.error(`Exception: ROUTES /api/addlink ERROR ${error}`);
                res.status(500).send(`Server error`).end();
            }
        });
    }
};