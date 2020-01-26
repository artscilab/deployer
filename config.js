
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