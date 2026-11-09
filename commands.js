import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} from "discord.js";

// ======================================
// COMANDOS DE WILL
// ======================================

const commands = [

  // ESTADO
  new SlashCommandBuilder()
    .setName("will")
    .setDescription("Muestra la información de WILL"),

  // BAN
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario que será baneado")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo del baneo")
        .setRequired(false)
    ),

  // KICK
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario que será expulsado")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo de la expulsión")
        .setRequired(false)
    ),

  // TIMEOUT
  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Silencia temporalmente a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutos")
        .setDescription("Duración en minutos")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo")
        .setRequired(false)
    ),

  // PURGE
  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Elimina mensajes recientes")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad de mensajes (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  // LOCKDOWN
  new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Bloquea un canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal que se bloqueará")
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildAnnouncement
        )
        .setRequired(true)
    ),

  // UNLOCKDOWN
  new SlashCommandBuilder()
    .setName("unlockdown")
    .setDescription("Desbloquea un canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal que se desbloqueará")
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildAnnouncement
        )
        .setRequired(true)
    ),

  // EMERGENCY
  new SlashCommandBuilder()
    .setName("emergency")
    .setDescription("Activa el bloqueo de emergencia")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(o =>
      o.setName("confirmar")
        .setDescription("Confirmar bloqueo de emergencia")
        .setRequired(true)
    ),

  // EMERGENCY RELEASE
  new SlashCommandBuilder()
    .setName("emergency-release")
    .setDescription("Restaura los canales bloqueados")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(o =>
      o.setName("confirmar")
        .setDescription("Confirmar restauración")
        .setRequired(true)
    ),

  // ANTISPAM TEST
  new SlashCommandBuilder()
    .setName("antispam-test")
    .setDescription("Comprueba el sistema anti-spam")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal de prueba")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad de mensajes (1-5)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    )
    .addStringOption(o =>
      o.setName("confirmacion")
        .setDescription("Escribe exactamente: CONFIRMO PRUEBA")
        .setRequired(true)
    )

];

// EXPORTACIÓN
export { commands };
