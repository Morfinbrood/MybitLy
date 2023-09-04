import express from "express";

const app = express()
const port = 3000

// add validation subpart
app.get("/:subpart", (req, res) => {
    res.send("subpart: " + req.params["subpart"])
})

app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use