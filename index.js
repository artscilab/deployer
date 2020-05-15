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

app.post("/webhook", async (req, res, next) => {
  const { ref, repository } = req.body;
  const { name } = repository;
  const ownerName = repository.owner.name;

  const configuration = require("./config")[name]

  if (!ownerName) {
    res.status(200).json({
      "message": "respository not present"
    })
    return;
  }

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
  if (!name) {
    res.status(200).json({
      "message": "repository name not present"
    })
    return;
  }
  if (!ownerName) {
    res.status(200).json({
      "message": "owner name not present"
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
  // If deployMode == "git", it will use "git pull" command 
  // to bring in the latest changes
  // if deployMode is "manual" or unset, it will use 
  // github api to copy files. 
  const { deployMode = "manual" } = branchConfig;

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

  if (deployMode === "manual") {
    // remove all existing files in the directory and 
    // download it fresh from github. Use to remove reliance 
    // on git on the server in the deployPath. 
    try {
      const downloadUrl = `https://github.com/${ownerName}/${name}/archive/${branchName}.tar.gz`
      const downloadCommand = `rm -r *; curl -SL ${downloadUrl} -o repo.tar.gz && tar xvzf repo.tar.gz --strip-components=1 && rm repo.tar.gz`;

      console.log(`running download command: ${downloadCommand}`)
      await ssh.execCommand(downloadCommand, {
        cwd: deployPath
      })
    } catch(e) {
      console.log(`Error on deploy: ${e}`)
      res.status(500).json({
        "message": "error running git pull"
      })
      return 
    }
  }
  else if (deployMode === "git") {
    // run the "git pull" command to bring in the latest changes
    // meaning the deployPath must already be a github repo
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
  }
  else {
    res.status(500).json({
      "message": "Invalid deployMode"
    })
    return 
  }

  const successMessage = `successfully deployed ${name}:${branchName} to ${deployPath}`

  // Run all post-deploy commands from config
  const { commands } = branchConfig;
  if (commands === undefined) {
    return res.json({
      "message": successMessage
    })
  }
  
  const { post: command } = commands;
  if (command === undefined) {
    return res.json({
      "message": successMessage
    })
  }

  console.log(`Running post deploy command ${command}`)
  
  ssh.execCommand(command, {
    cwd: deployPath
  }).then((e) => {
    console.log(`Successfully ran post deploy command '${command}'`)
  }).catch((e) => {
    console.error(`Failed running command: ${command}`, e)
  })

  res.json({
    "message": successMessage
  })
})

app.listen(process.env.PORT || 8080);