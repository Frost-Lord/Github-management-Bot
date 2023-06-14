const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection
} = require("discord.js");
require("dotenv").config();
const mongoose = require("mongoose");

const client = (global.client = new Client({
    partials: [
        Partials.Message,
        Partials.GuildPresences,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember,
        Partials.MessageReaction,
        Partials.Invite,
        Partials.Webhook,
        Partials.Emoji,
        Partials.Guild,
        Partials.GuildChannel,
        Partials.GuildEmoji,
        Partials.GuildMember,
        Partials.GuildMemberRole,
        Partials.GuildMessage,
        Partials.GuildMessageReaction,
        Partials.GuildRole,
    ],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
}));

client.events = new Collection();
client.slash = new Collection();

/////////////////////////////////////////////////////////////////////////////////////
["events"].forEach((file) => {
    require(`./src/handlers/${file}`)(client);
});

client.login(process.env.TOKEN).catch((err) => {
    console.warn(
        "[CRASH] Something went wrong while connecting to your bot..." + "\n"
    );
    console.warn("[CRASH] Error from Discord API:" + err);
    process.exit();
});

mongoose
  .connect(process.env["MONGO_DB"], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Unable to connect to MongoDB Database.\nError: " + err);
  });
mongoose.connection.on("err", (err) => {
  console.error(`Mongoose connection error: \n ${err.stack}`);
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection disconnected");
});