const fs = require('fs');
const path = require('path');
const loadChalk = require('../functions/loadChalk.js');

class EventHandler {
  constructor(client, eventsPath) {
    this.client = client;
    this.eventsPath = eventsPath;
    this.loadEvents();
  }

  async loadEvents() {
    const eventFiles = fs.readdirSync(this.eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
      const filePath = path.join(this.eventsPath, file);
      const event = require(filePath);
      const chalk = await loadChalk();

      if (event.once) {
        this.client.once(event.name, (...args) => event.execute(...args));
        console.log(chalk.green(`[V] Registered event: ${event.name}`));
      } else {
        this.client.on(event.name, (...args) => event.execute(...args));
        console.log(chalk.green(`[V] Registered recurring event: ${event.name}`));
      }
    }
  }
}

module.exports = EventHandler;
