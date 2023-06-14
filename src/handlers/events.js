const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  console.log(`[E] Loading a total of ${fs.readdirSync('./src/events').length} events.`);
  fs.readdirSync('./src/events').forEach(dir => {
    const eventDir = path.join(__dirname, '..', 'events', dir);
    const commands = fs.readdirSync(eventDir).filter(file => file.endsWith('.js'));
    for (let file of commands) {
      let pull = require(path.join(eventDir, file));
      if (pull.name) {
        client.events.set(pull.name, pull);
        console.log(`[E] ${"(#" + client.events.size + ")"} Loaded a file: ${pull.name} successfully!`);
      } else {
        console.log(`[E] Couldn't load the file ${file}. missing name or aliases.`);
        continue;
      }
    }
  });
};
