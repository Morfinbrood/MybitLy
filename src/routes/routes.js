import express from "express";
import { ignoreFavicon } from '../utils.js';

const recordRoutes = express.Router();

recordRoutes.use(ignoreFavicon);

recordRoutes.route('/', (req, res) => {
    if (req?.session?.id) {
        res.write(`<h1>Welcome  you session with uid:</h1><br>`);
        res.write(`<h1> ${req.session.id} </h1><br>`);
        res.end(`<h3>This is the Home page</h3>`);
    } else {
        res.end(`<h1>something wrong with gerenate session </h1><br>`);
    }
});

recordRoutes.route('/:subpart', (req, res) => {
    console.log("subpart: " + req.params["subpart"]);
    res.send("subpart: " + req.params["subpart"]);
});


export default recordRoutes;