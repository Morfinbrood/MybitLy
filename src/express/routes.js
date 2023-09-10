export function addHomepageRoute(expressApp, path) {
    expressApp.get(path, (req, res) => {
        if (req?.session?.id) {
            res.write(`<h1>Welcome  you session with uid:</h1><br>`);
            res.write(`<h1> ${req.session.id} </h1><br>`);
            res.end(`<h3>This is the Home page</h3>`);
        } else {
            res.end(`<h1>something wrong with gerenate session </h1><br>`);
        }
    });
}

export function addSubpartsRoute(expressApp, path) {
    expressApp.get(path, (req, res) => {
        console.log("subpart: " + req.params["subpart"]);
        res.send("subpart: " + req.params["subpart"]);
    });
}