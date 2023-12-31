const Discord = require("discord.js");
const { GenRepo, UpdateRepo } = require("../../utils/api");
const RepoSchema = require("../../../Database/Schema/repo.js")
const client = global.client;

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("list")
        .setDescription("List all Repositories")
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("Status")
                .setRequired(true)
                .addChoices(
                    { name: "User Repo", value: "User" },
                    { name: "Org Repo", value: "Org" }
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
        .setTitle("List of Repositories")
        .setTimestamp()

        const row = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
            .setCustomId("Public")
            .setLabel("Filter by Public")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🌐"),
            new Discord.ButtonBuilder()
            .setCustomId("Private")
            .setLabel("Filter by Private")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔒"),
            new Discord.ButtonBuilder()
            .setCustomId("All")
            .setLabel("Filter by All")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🤖"),
            new Discord.ButtonBuilder()
            .setCustomId("Refresh")
            .setLabel("Refresh")
            .setStyle(Discord.ButtonStyle.Danger )
            .setEmoji("🔄")
        )

        if (subCommand == "User") {
            const UserRepos = Scema.UserRepos;
            embed.setDescription(`**Type All**\n\n${UserRepos.map((repo, index) => `**${index + 1}.** [${repo.name}](${repo.html_url})`).join("\n")} `)
            interaction.editReply({ embeds: [embed], components: [row] })

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on("collect", async (btn) => {
                if (btn.customId === "Public") {
                    await btn.deferUpdate();
                    const Public = UserRepos.filter((repo) => repo.private == false);
                    embed.setDescription(`**Type: Public**\n\n${Public.map((repo, index) => `${index + 1}. [${repo.name}](${repo.html_url})`).join("\n")} `)
                    interaction.editReply({ embeds: [embed], components: [row] })
                } else if (btn.customId === "Private") {
                    await btn.deferUpdate();
                    const Private = UserRepos.filter((repo) => repo.private == true);
                    embed.setDescription(`**Type: Private**\n\n${Private.map((repo, index) => `${index + 1}. [${repo.name}](${repo.html_url})`).join("\n")} `)
                    interaction.editReply({ embeds: [embed], components: [row] })
                } else if (btn.customId === "All") {
                    await btn.deferUpdate();
                    embed.setDescription(`**Type: All**\n\n${UserRepos.map((repo, index) => `${index + 1}. [${repo.name}](${repo.html_url})`).join("\n")} `)
                    interaction.editReply({ embeds: [embed], components: [row] })
                } else if (btn.customId === "Refresh") {
                    await btn.deferUpdate();
                    await GenRepo(interaction.guild.id, 'Update')
                    const newEmbed = new Discord.EmbedBuilder()
                    .setTitle("**Action Completed**")
                    .setDescription("🔄️ Refreshed the list of Repositories \n `Please wait for 5 seconds and re-run the command.` ")
                    interaction.editReply({ embeds: [newEmbed], components: [] })
                }
            });
        } else {
            const orgRepos = Scema.OrgRepos;

            const repoList = orgRepos.flatMap((repoArray) => {
              const orgNames = Object.keys(repoArray);
            
              return orgNames.flatMap((orgName) => {
                const subRepos = repoArray[orgName] || [];
            
                const subRepoList = subRepos.map((subRepo, subIndex) => {
                  return `${subIndex}. [${subRepo.name}](${subRepo.html_url})`;
                });
            
                return [`**${orgName}**`, ...subRepoList];
              });
            });
            
            const embed = new Discord.EmbedBuilder()
              .setTitle('Org Repos')
              .setDescription(repoList.join('\n'));
            
            interaction.editReply({ embeds: [embed], components: [row] });            
        }
    },
};