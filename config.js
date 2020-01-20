
const projects = {
  "creativedisturbance": {
    dev: {
      deploy_path: "/var/www/dev.creativedisturbance.org/html/wp_content/themes/creativedisturbance"
    },
    master: {
      deploy_path: "/var/www/creativedisturbance.org/html/wp_content/themes/creativedisturbance"
    }
  },
  "cdash": {
    master: {
      deploy_path: "/var/www/cdash.atec.io/html/wp_content/themes/cdash"
    }
  },
  "artscilab": {
    master: {
      deploy_path: "/home/al/artscilab",
      commands: ["pm2 restart"]
    }
  }
}

module.exports = projects;