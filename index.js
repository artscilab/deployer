const express = require("express")
const node_ssh = require("node-ssh")
const body_parser = require("body-parser")
const projects = require("./config")

const app = express();

app.use(body_parser.json())

app.get("/", (req, res) => {
  res.json(projects)
})

app.post("/webhooks", async (req, res) => {
  res.json({
    "message": "success"
  })
})

app.listen(process.env.PORT || 8080);