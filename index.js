const express = require("express")
const node_ssh = require("node-ssh")
const body_parser = require("body-parser")
const morgan = require("morgan")

const app = express();
const logger = morgan('dev');

app.use(body_parser.json())
app.use(logger);

app.get("/", (req, res) => {
  const projects = require("./config")
  res.status(200).json(projects)
  return
})

app.post("/webhook", async (req, res) => {
  const { ref, repository: { name } } = req.body;
  const configuration = require("./config")[name]

  if (!configuration) {
    res.status(404).json({
      "message": `configuration for "${name}" not found`
    })
    return
  }

  const branchName = ref.split("/").pop();
  const branchConfig = configuration[branchName];
  if (!branchConfig) {
    res.status(200).json({
      "message": `configuration for branch "${branchName}" not found`
    })
    return
  }
  
  const { deployPath } = branchConfig;
  if (!deployPath) {
    res.status(200).json({
      "message": `invalid configuration for branch "${branchName}"`
    })
    return;
  }

  const ssh = new node_ssh();
  // TODO: connect to server and clone the repo. 

  res.json({
    "message": "success"
  })
})

app.listen(process.env.PORT || 8080);