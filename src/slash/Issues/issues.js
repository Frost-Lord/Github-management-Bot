const Discord = require("discord.js");
const { GenRepo, UpdateRepo } = require("../../utils/api");
const RepoSchema = require("../../../Database/Schema/repo.js")
const client = global.client;

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("issues")
        .setDescription("Manage Issues")
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("Status")
                .setRequired(true)
                .addChoices(
                    { name: "List", value: "List" },
                    { name: "Create", value: "Create" },
                    { name: "Lock", value: "Lock" },
                    { name: "Unlock", value: "Unlock" },
                )
        ),
    permissions: ["ManageGuild"],
    name: "List",

    async execute(interaction) {
        let subCommand = interaction.options.getString("type");
        await interaction.deferReply();

        const Scema = await RepoSchema.findOne({ id: interaction.guild.id });
        if (!Scema) return await GenRepo(interaction.guild.id).then(() => {
            interaction.editReply({ content: "Please wait for 5 seconds and try again."})
        })

        const embed = new Discord.EmbedBuilder()
        .setColor(0x90EE90)
        .setTitle("**Pull Request:**")
        .setTimestamp()

        if (subCommand == "Create") {
        } else if (subCommand == "Delete") {
        } else if (subCommand == "Update") {
        } else if (subCommand == "Merge") {
        } else if (subCommand == "Comments") {
        }

    },
};