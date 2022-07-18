// config.js

// This file holds the configuration for our projects, and aims to be useful in two regards: 
//  1. Allowing us to manage deploy locations with git-based histories and collaboration
//  2. Serve as documentation for where everything is on our server and how they are running

// the projects object contains the configuration for the server.
// Top level must be project name (same as name on github)
// Inside, the keys are branch names.
// Any branch can be configured by defining an object containing 
// the configuration for that branch. 
// Each configration must contain a deployPath, which corresponds to 
// the path on the server where the code needs to go.
// Optionally, a deployMode can be defined to be "git", which will
// use the "git pull" command on the server. This option only works
// when the deployPath on the server is a git repo.
// This is handy when you've used "git clone" on the server to set up a project.

// Coming soon: you can optionally define an object "commands" of 
// pre- and post-deploy commands to be run in sequence in the deployPath.
// It's currently defined for the artscilab project but doesn't get run.
//Just a try.
const projects = {
  "creativedisturbance": {
    dev: {
      deployPath: "/var/www/dev.creativedisturbance.org/html/wp-content/themes/creativedisturbance",
    },
    master: {
      deployPath: "/var/www/creativedisturbance.org/html/wp-content/themes/creativedisturbance",
      deployMode: "git"
    }
  },
  "cdash": {
    master: {
      deployPath: "/var/www/atec.io/html/wp-content/themes/cdash"
    }
  },
  "lab-docs": {
    master: {
      deployPath: "/var/www/manage.atec.io/html/",
      deployMode: "git"
    }
  },
  "artscilab": {
    master: {
      deployPath: "/home/al/artscilab",
      deployMode: "git",
    }
  },
  "ablb-backend": {
    master: {
      deployPath: "/home/al/ablb-backend",
      deployMode: "git",
    }
  },
  "ablb-app": {
    master: {
      deployPath: "/home/al/ablb-backend/client",
      deployMode: "git",
      commands: {
        post: "yarn; yarn build"
      }
    }
  }
}

module.exports = projects;