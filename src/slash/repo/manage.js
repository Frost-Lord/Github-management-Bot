const Discord = require("discord.js");
const { GenRepo, getRepoDetails } = require("../../utils/api");
const RepoSchema = require("../../../Database/Schema/repo.js");
const client = global.client;

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("manage")
        .setDescription("Manage a Repositorie")
        .addSubcommand(subcommand => subcommand
            .setName('repo')
            .setDescription('Manage a Repositorie')
            .addStringOption(option => option
                .setName('type')
                .setDescription('Type of the Repositorie')
                .addChoices(
                    { name: "User Repo", value: "User" },
                    { name: "Org Repo", value: "Org" }
                )
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('name')
                .setDescription('Name of the Repositorie')
                .setRequired(true)
            )
        ),
    permissions: ["ManageGuild"],
    name: "List",

    async execute(interaction) {
        await interaction.deferReply();
        const type = interaction.options.getString("type");

        let OwnerName;
        let RepoName;

        const Scema = await RepoSchema.findOne({ id: interaction.guild.id });
        if (!Scema) await GenRepo(interaction.guild.id).then(() => {
            interaction.editReply({ content: "Please wait for 5 seconds and try again." })
        })

        const NotFoundEmbed = new Discord.EmbedBuilder()
            .setColor(0x90EE90)
            .setTitle("**Repo not found**")
            .setDescription("⚠️ `Make sure you have typed the name correctly as it is case sensitive.`")


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
                    .setEmoji("📦")
            )

        const embed = new Discord.EmbedBuilder()
            .setColor(0x90EE90)

        if (type === "User") {
            const repo = Scema.UserRepos.find(repo => repo.name === interaction.options.getString('name'))
            if (!repo) return interaction.editReply({ embeds: [NotFoundEmbed] })

            OwnerName = repo.owner.login;
            RepoName = repo.name;

            embed.setTitle(repo.name)
            embed.setDescription(repo.description ? repo.description : "No Description")
            embed.addFields([
                { name: "Stats", value: `Forks: ${repo.forks_count}\nWatchers: ${repo.watchers_count}\nStars: ${repo.stargazers_count}`, inline: true },
                { name: "Permissions", value: `Admin: \`${repo.permissions.admin}\` \n Maintain: \`${repo.permissions.admin}\` \n Push: \`${repo.permissions.push}\` \n Triage: \`${repo.permissions.triage}\` \n Pull: \`${repo.permissions.pull}\`  `, inline: true },
                { name: "Type", value: repo.private ? "Private" : "Public", inline: true },
                { name: "Owner", value: `[${repo.owner.login}](${repo.owner.url})`, inline: true },
            ])
            embed.setTimestamp()

            interaction.editReply({ embeds: [embed], components: [row] });
        } else if (type === "Org") {
            let repo;
            Scema.OrgRepos.some(org => {
                for (let orgName in org) {
                    repo = org[orgName].find(repo => repo.name === interaction.options.getString('name'));
                    if (repo) {
                        return true;
                    }
                }
            });
            if (!repo) return interaction.editReply({ embeds: [NotFoundEmbed] })
            
            OwnerName = repo.owner.login;
            RepoName = repo.name;

            embed.setTitle(repo.name)
            embed.setDescription(repo.description ? repo.description : "No Description")
            interaction.editReply({ embeds: [embed], components: [row] });
        }

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on("collect", async (btn) => {
            await btn.deferUpdate();
            let data = await getRepoDetails(OwnerName, RepoName);
            let description = "";
            if (btn.customId === "Pull Requests") {
                if (data.pullRequests.length === 0) {
                    description = "No pull requests found";
                } else {
                    description = data.pullRequests.slice(0, 5).map((pr, index) => `${index+1}. [${pr.title}](${pr.html_url}) - ${pr.user.login}`).join('\n');
                }
            } else if (btn.customId === "Issues") {
                if (data.issues.length === 0) {
                    description = "No issues found";
                } else {
                    description = data.issues.slice(0, 5).map((issue, index) => `${index+1}. [${issue.title}](${issue.html_url}) - ${issue.user.login}`).join('\n');
                }
            } else if (btn.customId === "Branches") {
                if (data.branches.length === 0) {
                    description = "No branches found";
                } else {
                    description = data.branches.slice(0, 5).map((branch, index) => `${index+1}. ${branch.name}`).join('\n');
                }
            } else if (btn.customId === "Commits") {
                if (data.commits.length === 0) {
                    description = "No commits found";
                } else {
                    description = data.commits.slice(0, 5).map((commit, index) => `${index+1}. [${commit.sha.substring(0,7)}](${commit.html_url}) - ${commit.commit.message.split("\n")[0]}`).join('\n\n');
                }
            } else if (btn.customId === "Releases") {
                if (data.releases.length === 0) {
                    description = "No releases found";
                } else {
                    description = data.releases.slice(0, 5).map((release, index) => `${index+1}. [${release.name || release.tag_name}](${release.html_url}) - ${release.author.login}`).join('\n');
                }
            }
        
            description = `\`\`\`${description}\`\`\``;
        
            let newEmbed = new Discord.EmbedBuilder()
                .setColor('#90EE90')
                .setDescription(description);
        
            await btn.editReply({ embeds: [newEmbed], components: [row] });
        });          
        
    },
};