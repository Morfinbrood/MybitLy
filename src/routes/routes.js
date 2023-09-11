import express from "express";
import { ignoreFavicon } from '../utils/utils.js';
import mybitlyService from '../mybitly/mybitly.js'

const recordRoutes = express.Router();

recordRoutes.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
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

export default recordRoutes;