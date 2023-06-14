const Discord = require("discord.js");
const { GenRepo } = require("../../utils/api");
const RepoSchema = require("../../../Database/Schema/repo.js")
const client = global.client;

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("manage")
        .setDescription("Manage a Repositorie")
		.addStringOption(option =>
            option.setName('name')
            .setDescription('Name of the Repositorie')
            .setRequired(true)
    ),
    permissions: ["ManageGuild"],
    name: "List",

    async execute(interaction) {
        await interaction.deferReply();
        await interaction.options.getString('name');

        const Scema = await RepoSchema.findOne({ id: interaction.guild.id });
        if (!Scema) await GenRepo(interaction.guild.id).then(() => {
            interaction.editReply({ content: "Please wait for 5 seconds and try again."})
        })

        const repo = Scema.UserRepos.find(repo => repo.name === interaction.options.getString('name'))
        if (!repo) return interaction.editReply({ content: "Repo not found"})
        
        const embed = new Discord.EmbedBuilder()
        .setColor(0x90EE90)
        .setTitle(repo.name)
        .setDescription(repo.description ? repo.description : "No Description")
        .addFields([
            { name: "Owner", value: `[${repo.owner.login}](${repo.owner.url})`, inline: true },
            { name: "Type", value: repo.private ? "Private" : "Public", inline: true },
            { name: "Permissions", value: `Admin: ${repo.permissions.admin} \n Maintain: ${repo.permissions.admin} \n Push: ${repo.permissions.push} \n Triage: ${repo.permissions.triage} \n Pull: ${repo.permissions.pull}  `, inline: true },
            { name: "Stats", value: `Forks: ${repo.forks_count}\nWatchers: ${repo.watchers_count}\nStars: ${repo.stargazers_count}`, inline: true },
        ])
        .setTimestamp()

        const row = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
            .setCustomId("Pull Requests")
            .setLabel("Pull Requests")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🪢"),
            new Discord.ButtonBuilder()
            .setCustomId("Issues")
            .setLabel("Issues")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("📝"),
            new Discord.ButtonBuilder()
            .setCustomId("Branches")
            .setLabel("Branches")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🌳"),
            new Discord.ButtonBuilder()
            .setCustomId("Commits")
            .setLabel("Commits")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("📜"),
            new Discord.ButtonBuilder()
            .setCustomId("Releases")
            .setLabel("Releases")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("📦"),
            new Discord.ButtonBuilder()
            .setCustomId("Refresh")
            .setLabel("Refresh")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔄")
        )

        interaction.editReply({ embeds: [embed], components: [row] });
    },
};