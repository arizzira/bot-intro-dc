require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  REST,
  Routes
} = require('discord.js');


const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel]
});


// ================= REGISTER SLASH COMMAND =================

 const commands = [
   {
     name: 'intro',
     description: 'Buat form intro member'
   }
 ];

 const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

 (async () => {
   try {
     console.log('Registering slash command...');

     await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Slash command berhasil didaftarkan!');
  } catch (error) {
    console.error(error);
  }
})();

// ================= INTERACTION =================
client.on(Events.InteractionCreate, async interaction => {

  // ================= SLASH COMMAND =================
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === 'intro') {

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📝 Intro Member Baru')
        .setDescription('Silakan klik tombol di bawah untuk mengisi form intro kamu!\n\n📋 **Form terdiri dari:**\n• Nama\n• Umur\n• Hobby\n• Tentang diri kamu')
        .setFooter({ text: 'Isi dengan jujur dan menarik ya!' });

      const button = new ButtonBuilder()
        .setCustomId('button_intro')
        .setLabel('Isi Intro')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({
        embeds: [embed],
        components: [row]
        
      });
    }
  }

  // ================= BUTTON =================
  if (interaction.isButton()) {
    if (interaction.customId === 'button_intro') {

      const modal = new ModalBuilder()
        .setCustomId('modal_intro')
        .setTitle('Form Intro Member');

      const nama = new TextInputBuilder()
        .setCustomId('nama')
        .setLabel('Nama')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const umur = new TextInputBuilder()
        .setCustomId('umur')
        .setLabel('Umur')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const hobby = new TextInputBuilder()
        .setCustomId('hobby')
        .setLabel('Hobby')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const tentang = new TextInputBuilder()
        .setCustomId('tentang')
        .setLabel('Tentang Kamu')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nama),
        new ActionRowBuilder().addComponents(umur),
        new ActionRowBuilder().addComponents(hobby),
        new ActionRowBuilder().addComponents(tentang)
      );

      await interaction.showModal(modal);
    }
  }

  // ================= MODAL SUBMIT =================
   if (interaction.isModalSubmit()) {
    if (interaction.customId === 'modal_intro') {

     const nama = interaction.fields.getTextInputValue('nama');
     const umur = interaction.fields.getTextInputValue('umur');
     const hobby = interaction.fields.getTextInputValue('hobby');
     const tentang = interaction.fields.getTextInputValue('tentang') || 'Tidak diisi';

     const channel = await client.channels.fetch(process.env.CHANNEL_ID);

     const embed = new EmbedBuilder()
      .setColor('#8e44ad')
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTitle(`✨ ${nama}`)
      .setDescription('Selamat datang di server! Jangan lupa sapa member lain ya 👋')
      .addFields(
        { name: '👤 Nama', value: `\`${nama}\``, inline: true },
        { name: '🎂 Umur', value: `\`${umur}\``, inline: true },
        { name: '🎮 Hobby', value: `\`${hobby}\`` },
        { name: '📝 Tentang Saya', value: `>>> ${tentang}` }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Intro Member • Welcome!' })
      .setTimestamp();

     const message = await channel.send({
      embeds: [embed]
    });

    // AUTO THREAD
    await message.startThread({
      name: `🧵 Intro ${nama}`,
      autoArchiveDuration: 1440
    });

    await interaction.reply({
      content: '✅ Intro berhasil dikirim ke #daftar-hadir!',
      ephemeral: true
    });

  }
}

      // ================= AUTO ROLE (OPTIONAL) =================
      // Ganti ROLE_ID dengan role kamu

    }
  

);


client.login(process.env.TOKEN);
