// config.js

// This file holds the configuration for our projects, and aims to be useful in two regards: 
//  1. Allowing us to manage deploy locations with git-based histories and collaboration
//  2. Serve as documentation for where everything is on our server and how they are running

const projects = {
  "creativedisturbance": {
    dev: {
      deployPath: "/var/www/dev.creativedisturbance.org/html/wp-content/themes/creativedisturbance"
    },
    master: {
      deployPath: "/var/www/creativedisturbance.org/html/wp-content/themes/creativedisturbance"
    }
  },
  "cdash": {
    master: {
      deployPath: "/var/www/cdash.atec.io/html/wp-content/themes/cdash"
    }
  },
  "artscilab": {
    master: {
      deployPath: "/home/al/artscilab",
      commands: ["pm2 restart"]
    }
  }
}

module.exports = projects;