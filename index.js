require('dotenv').config();
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
  const { ref, repository: { name, clone_url} } = req.body;
  const configuration = require("./config")[name]

  // load configuration from config.js and check that 
  // a config exists for this repository. If the repository 
  // name is 'artscilab' then the 'artscilab' key must be present
  // at the top level of the configuration object. 
  if (!configuration) {
    res.status(404).json({
      "message": `configuration for "${name}" not found`
    })
    return
  }

  if (!ref) {
    res.status(200).json({
      "message": "ref not present"
    })
    return;
  }
  
  // Get the branch that this push came from and check that options
  // for that branchname exists in the configuration for this repo.
  // If the repo is 'artscilab' and we want to deploy on push to the 
  // 'master' branch, then the 'master' key must exist in 
  // the configuration object for 'artscilab' 
  const branchName = ref.split("/").pop();
  const branchConfig = configuration[branchName];
  if (!branchConfig) {
    res.status(200).json({
      "message": `configuration for branch "${branchName}" not found`
    })
    return
  }
  
  // The configuration for a branch must include the 'deployPath' 
  // key, which should specify the folder in which the code 
  // will be cloned into. 
  const { deployPath } = branchConfig;
  if (!deployPath) {
    res.status(200).json({
      "message": `invalid configuration for branch "${branchName}"`
    })
    return;
  }

  const ssh = new node_ssh();
  // connect to the server using the SSH client and private key 
  // from the environment variable. 
  try {
    await ssh.connect({
      host: "atec.io",
      username: "git",
      privateKey: process.env.SSH_KEY
    });
  } catch (e) {
    console.log(`Error on connect: ${e}`);
    res.status(500).json({
      "message": "couldn't connect to atec.io"
    })
    return
  }

  // run the "git pull" command to bring in the latest changes
  // meaning the deployPath must already be a github repo
  // note: in the future this will be a configurable
  // option with mode:git or mode:file, the latter of which 
  // will manually upload the files from the repo to the deploy path,
  // which allows the user to not depend on git locally on the server. 
  try {
    const cloneCommand = `git pull`;
    console.log(`running ${cloneCommand} in ${deployPath}`);
    await ssh.execCommand(cloneCommand, {
      cwd: deployPath
    })
  } catch(e) {
    console.log(`Error on deploy: ${e}`)
    res.status(500).json({
      "message": "error running git pull"
    })
    return 
  }

  res.json({
    "message": `successfully deployed ${name}:${branchName} to ${deployPath}`
  })
})

app.listen(process.env.PORT || 8080);