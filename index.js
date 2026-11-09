
import {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  ChannelType,
  REST,
  Routes
} from "discord.js";

import { commands } from "./commands.js";

const { TOKEN } = process.env;

if (!TOKEN) {
  console.error("WILL: falta la variable TOKEN.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// CONFIGURACIÓN
const CONFIG = {
  spamLimit: 7,
  spamWindow: 8000,
  timeoutMinutes: 10,
  raidLimit: 8,
  raidWindow: 10000
};

// MEMORIA TEMPORAL
const spamCounters = new Map();
const joinCounters = new Map();
const lockedChannels = new Map();

// FUNCIONES AUXILIARES
const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

async function log(guild, title, description, color = 0x5865F2) {
  try {
    const channel = guild.systemChannel;

    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description.slice(0, 4000))
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("WILL LOG:", error.message);
  }
}

async function replyError(interaction, message) {
  const response = { content: `⚠️ ${message}`, ephemeral: true };

  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(response);
  }

  return interaction.reply(response);
}

async function getTarget(interaction) {
  const user = interaction.options.getUser("usuario", true);
  const member = await interaction.guild.members.fetch(user.id)
    .catch(() => null);

  if (!member) {
    throw new Error("El usuario no pertenece al servidor.");
  }

  if (user.id === interaction.user.id) {
    throw new Error("No puedes moderarte a ti mismo.");
  }

  if (user.id === interaction.guild.ownerId) {
    throw new Error("No puedes moderar al propietario.");
  }

  const actor = await interaction.guild.members.fetch(interaction.user.id);
  const botMember = interaction.guild.members.me;

  if (
    interaction.user.id !== interaction.guild.ownerId &&
    member.roles.highest.comparePositionTo(actor.roles.highest) >= 0
  ) {
    throw new Error("El rol del usuario es igual o superior al tuyo.");
  }

  if (
    member.roles.highest.comparePositionTo(botMember.roles.highest) >= 0
  ) {
    throw new Error("El rol de WILL está por debajo del usuario.");
  }

  return member;
}

// BLOQUEO DE CANALES
async function lockChannel(channel) {
  if (lockedChannels.has(channel.id)) {
    throw new Error("Este canal ya está bloqueado por WILL.");
  }

  const everyone = channel.permissionOverwrites.cache.get(
    channel.guild.id
  );

  let previous = "neutral";

  if (everyone?.allow.has(PermissionFlagsBits.SendMessages)) {
    previous = "allow";
  } else if (everyone?.deny.has(PermissionFlagsBits.SendMessages)) {
    previous = "deny";
  }

  await channel.permissionOverwrites.edit(
    channel.guild.id,
    { SendMessages: false },
    { reason: "WILL: protección del servidor" }
  );

  lockedChannels.set(channel.id, {
    guildId: channel.guild.id,
    previous
  });
}

async function unlockChannel(channel) {
  const saved = lockedChannels.get(channel.id);

  if (!saved) {
    throw new Error("WILL no tiene un bloqueo guardado aquí.");
  }

  const value =
    saved.previous === "allow" ? true :
    saved.previous === "deny" ? false :
    null;

  await channel.permissionOverwrites.edit(
    channel.guild.id,
    { SendMessages: value },
    { reason: "WILL: restauración de permisos" }
  );

  lockedChannels.delete(channel.id);
}

// INICIO
client.once(Events.ClientReady, bot => {
  console.log("--------------------------------");
  console.log(`WILL conectado como ${bot.user.tag}`);
  console.log(`Servidores: ${bot.guilds.cache.size}`);
  console.log("Protección activa.");
  console.log("--------------------------------");

  client.user.setPresence({
    activities: [{
      name: "protegiendo servidores",
      type: 3
    }],
    status: "online"
  });
});

// COMANDOS
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (!interaction.guild) {
    return interaction.reply({
      content: "WILL solo funciona en servidores.",
      ephemeral: true
    });
  }

  const name = interaction.commandName;
  const guild = interaction.guild;

  try {

    // ESTADO
    if (name === "will") {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("WILL | Security System")
            .setDescription(
              "Sistema operativo.\n\n" +
              "🛡️ Anti-spam: activo\n" +
              "🚨 Anti-raid: activo\n" +
              "🔒 Lockdown: disponible\n" +
              "⚙️ Moderación: activa"
            )
            .setTimestamp()
        ]
      });
    }

    // BAN
    if (name === "ban") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
        throw new Error("Necesitas el permiso Banear miembros.");
      }

      const target = await getTarget(interaction);

      if (!target.bannable) {
        throw new Error("No puedo banear a este usuario.");
      }

      const reason =
        interaction.options.getString("motivo") || "Sin motivo especificado";

      await target.ban({
        reason: reason.slice(0, 500)
      });

      await interaction.reply({
        content: `🔨 ${target.user.tag} ha sido baneado.`,
        ephemeral: true
      });

      await log(guild, "Usuario baneado",
        `${target.user.tag}\nModerador: ${interaction.user.tag}\nMotivo: ${reason}`,
        0xED4245);
    }

    // KICK
    else if (name === "kick") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
        throw new Error("Necesitas el permiso Expulsar miembros.");
      }

      const target = await getTarget(interaction);

      if (!target.kickable) {
        throw new Error("No puedo expulsar a este usuario.");
      }

      const reason =
        interaction.options.getString("motivo") || "Sin motivo";

      await target.kick(reason.slice(0, 500));

      await interaction.reply({
        content: `👢 ${target.user.tag} ha sido expulsado.`,
        ephemeral: true
      });

      await log(guild, "Usuario expulsado",
        `${target.user.tag}\nModerador: ${interaction.user.tag}\nMotivo: ${reason}`,
        0xED4245);
    }

    // TIMEOUT
    else if (name === "timeout") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
        throw new Error("Necesitas el permiso Moderar miembros.");
      }

      const target = await getTarget(interaction);
      const minutes = interaction.options.getInteger("minutos", true);
      const reason =
        interaction.options.getString("motivo") || "Sin motivo";

      if (!target.moderatable) {
        throw new Error("No puedo aplicar timeout a este usuario.");
      }

      await target.timeout(
        minutes * 60000,
        reason.slice(0, 500)
      );

      await interaction.reply({
        content: `⏳ Timeout aplicado a ${target.user.tag} durante ${minutes} minutos.`,
        ephemeral: true
      });

      await log(guild, "Timeout aplicado",
        `${target.user.tag}\nDuración: ${minutes} minutos\nMotivo: ${reason}`,
        0xFEE75C);
    }

    // PURGE
    else if (name === "purge") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
        throw new Error("Necesitas Gestionar mensajes.");
      }

      const amount = interaction.options.getInteger("cantidad", true);

      await interaction.deferReply({ ephemeral: true });

      const deleted = await interaction.channel.bulkDelete(amount, true);

      await interaction.editReply(
        `🧹 Se eliminaron ${deleted.size} mensajes. Los mensajes de más de 14 días no pueden eliminarse mediante borrado masivo.`
      );

      await log(guild, "Limpieza de mensajes",
        `${interaction.user.tag} eliminó ${deleted.size} mensajes en ${interaction.channel}.`,
        0xFEE75C);
    }

    // LOCKDOWN
    else if (name === "lockdown") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        throw new Error("Necesitas Gestionar canales.");
      }

      const channel =
        interaction.options.getChannel("canal") || interaction.channel;

      if (!channel.isTextBased() || !channel.permissionOverwrites) {
        throw new Error("Canal no compatible.");
      }

      await lockChannel(channel);

      await interaction.reply({
        content: `🔒 ${channel} bloqueado correctamente.`,
        ephemeral: true
      });

      await log(guild, "Canal bloqueado",
        `${channel} bloqueado por ${interaction.user.tag}.`);
    }

    // UNLOCKDOWN
    else if (name === "unlockdown") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        throw new Error("Necesitas Gestionar canales.");
      }

      const channel =
        interaction.options.getChannel("canal") || interaction.channel;

      await unlockChannel(channel);

      await interaction.reply({
        content: `🔓 ${channel} desbloqueado.`,
        ephemeral: true
      });

      await log(guild, "Canal desbloqueado",
        `${channel} restaurado por ${interaction.user.tag}.`);
    }

    // EMERGENCIA
    else if (name === "emergency") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        throw new Error("Solo administradores pueden activar esto.");
      }

      if (!interaction.options.getBoolean("confirmar")) {
        throw new Error("Operación cancelada.");
      }

      await interaction.deferReply({ ephemeral: true });

      const channels = await guild.channels.fetch();
      let success = 0;
      let failed = 0;

      for (const channel of channels.values()) {
        if (!channel?.isTextBased() || !channel.permissionOverwrites) continue;

        try {
          await lockChannel(channel);
          success++;
        } catch {
          failed++;
        }
      }

      await interaction.editReply(
        `🚨 Bloqueo de emergencia terminado.\nBloqueados: ${success}\nFallidos: ${failed}`
      );

      await log(guild, "🚨 EMERGENCIA ACTIVADA",
        `Activada por ${interaction.user.tag}.\nCanales bloqueados: ${success}`,
        0xED4245);
    }

    // RESTAURAR EMERGENCIA
    else if (name === "emergency-release") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        throw new Error("Solo administradores pueden ejecutar esto.");
      }

      if (!interaction.options.getBoolean("confirmar")) {
        throw new Error("Operación cancelada.");
      }

      await interaction.deferReply({ ephemeral: true });

      const channels = await guild.channels.fetch();
      let success = 0;
      let failed = 0;

      for (const channel of channels.values()) {
        if (!channel) continue;
        if (!lockedChannels.has(channel.id)) continue;

        try {
          await unlockChannel(channel);
          success++;
        } catch {
          failed++;
        }
      }

      await interaction.editReply(
        `Restauración terminada.\nCanales restaurados: ${success}\nFallidos: ${failed}`
      );

      await log(guild, "Fin de emergencia",
        `Restauración ejecutada por ${interaction.user.tag}.\nCanales restaurados: ${success}`,
        0x57F287);
    }

    // PRUEBA ANTI-SPAM CONTROLADA
    else if (name === "antispam-test") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
        throw new Error("Necesitas Gestionar mensajes.");
      }

      const channel = interaction.options.getChannel("canal", true);
      const amount = interaction.options.getInteger("cantidad", true);
      const confirm = interaction.options.getBoolean("confirmar", true);

      if (!confirm) {
        throw new Error("Prueba cancelada.");
      }

      if (amount > 5) {
        throw new Error("Máximo 5 mensajes por prueba.");
      }

      await interaction.reply({
        content: `🧪 Prueba iniciada en ${channel}. Se enviarán ${amount} mensajes.`,
        ephemeral: true
      });

      for (let i = 0; i < amount; i++) {
        await channel.send(
          `🧪 PRUEBA ANTI-SPAM DE WILL (${i + 1}/${amount})`
        );

        await sleep(1500);
      }

      await log(guild, "Prueba anti-spam",
        `${interaction.user.tag} realizó una prueba en ${channel}.`);
    }

  } catch (error) {
    console.error(`WILL /${name}:`, error);
    await replyError(interaction, error.message || "Error desconocido.")
      .catch(() => {});
  }
});

// ANTI-SPAM AUTOMÁTICO
client.on(Events.MessageCreate, async message => {
  if (!message.guild || message.author.bot || !message.member) return;

  if (
    message.member.permissions.has(PermissionFlagsBits.ManageMessages)
  ) return;

  const now = Date.now();
  const key = `${message.guild.id}:${message.author.id}`;

  const recent = (spamCounters.get(key) || [])
    .filter(time => now - time < CONFIG.spamWindow);

  recent.push(now);
  spamCounters.set(key, recent);

  if (recent.length < CONFIG.spamLimit) return;

  spamCounters.delete(key);

  if (!message.member.moderatable) return;

  try {
    await message.member.timeout(
      CONFIG.timeoutMinutes * 60000,
      "WILL: detección automática de spam"
    );

    await log(
      message.guild,
      "🛡️ Anti-spam activado",
      `${message.author.tag} recibió timeout automático.\nMensajes: ${recent.length}\nDuración: ${CONFIG.timeoutMinutes} minutos.`,
      0xED4245
    );
  } catch (error) {
    console.error("ANTI-SPAM:", error.message);
  }
});

// ANTI-RAID: DETECCIÓN Y ALERTA
client.on(Events.GuildMemberAdd, async member => {
  const now = Date.now();
  const guildId = member.guild.id;

  const recent = (joinCounters.get(guildId) || [])
    .filter(time => now - time < CONFIG.raidWindow);

  recent.push(now);
  joinCounters.set(guildId, recent);

  if (recent.length === CONFIG.raidLimit) {
    await log(
      member.guild,
      "🚨 POSIBLE RAID",
      `${recent.length} miembros han entrado en ${CONFIG.raidWindow / 1000} segundos.\nRevisa el servidor y activa /emergency si es necesario.`,
      0xED4245
    );
  }
});

// LIMPIEZA DE MEMORIA
setInterval(() => {
  const now = Date.now();

  for (const [key, times] of spamCounters) {
    const valid = times.filter(
      time => now - time < CONFIG.spamWindow
    );

    if (valid.length) spamCounters.set(key, valid);
    else spamCounters.delete(key);
  }

  for (const [key, times] of joinCounters) {
    const valid = times.filter(
      time => now - time < CONFIG.raidWindow
    );

    if (valid.length) joinCounters.set(key, valid);
    else joinCounters.delete(key);
  }
}, 30000).unref();

// ERRORES
process.on("unhandledRejection", error => {
  console.error("WILL UNHANDLED:", error);
});

async function startWILL() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  console.log("WILL está registrando sus comandos...");

  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    {
      body: commands.map(command => command.toJSON())
    }
  );

  console.log("Comandos registrados correctamente.");

  await client.login(TOKEN);
}

startWILL().catch(console.error);
