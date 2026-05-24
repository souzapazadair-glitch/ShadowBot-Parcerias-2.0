const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  REST,
  Routes,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.DISCORD_TOKEN;

// COLOQUE OS IDs
const GUILD_ID = "1507139696122400951";
const APROVACAO_CHANNEL_ID = "1508080625305915412";
const PARCERIAS_CHANNEL_ID = "1507783895305818203";

client.once(Events.ClientReady, async () => {
  console.log(`Bot online: ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName('parceria')
      .setDescription('Enviar pedido de parceria')
      .addStringOption(option =>
        option
          .setName('link')
          .setDescription('Link do servidor')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('descricao')
          .setDescription('Descrição do servidor')
          .setRequired(true)
      )
  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      client.user.id,
      GUILD_ID
    ),
    { body: commands }
  );

  console.log("Comando /parceria registrado.");
});

client.on(Events.InteractionCreate, async interaction => {

  // Slash command
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "parceria") {

      const link = interaction.options.getString("link");
      const descricao = interaction.options.getString("descricao");

      const canal =
        interaction.guild.channels.cache.get(
          APROVACAO_CHANNEL_ID
        );

      const embed = new EmbedBuilder()
        .setTitle("📩 Novo Pedido de Parceria")
        .addFields(
          {
            name: "Usuário",
            value: `${interaction.user}`
          },
          {
            name: "Link",
            value: link
          },
          {
            name: "Descrição",
            value: descricao
          }
        );

      const botoes =
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(
              `aprovar|${link}|${descricao}`
            )
            .setLabel("Aprovar")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("rejeitar")
            .setLabel("Rejeitar")
            .setStyle(ButtonStyle.Danger)
        );

      await canal.send({
        embeds: [embed],
        components: [botoes]
      });

      await interaction.reply({
        content:
          "✅ Pedido enviado para aprovação.",
        ephemeral: true
      });
    }
  }

  // Botões
  if (interaction.isButton()) {

    // Aprovar
    if (
      interaction.customId.startsWith(
        "aprovar"
      )
    ) {
      const partes =
        interaction.customId.split("|");

      const link = partes[1];
      const descricao = partes[2];

      const canalFinal =
        interaction.guild.channels.cache.get(
          PARCERIAS_CHANNEL_ID
        );

      await canalFinal.send(`
🤝 **Nova parceria aprovada!**

🔗 ${link}

📝 ${descricao}
      `);

      await interaction.update({
        content:
          "✅ Parceria aprovada.",
        embeds: [],
        components: []
      });
    }

    // Rejeitar
    if (
      interaction.customId === "rejeitar"
    ) {
      await interaction.update({
        content:
          "❌ Parceria rejeitada.",
        embeds: [],
        components: []
      });
    }
  }
});

client.login(TOKEN);