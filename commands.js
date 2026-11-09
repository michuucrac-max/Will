import {
  SlashCommandBuilder,
  ChannelType
} from "discord.js";

const commands = [

  // ESTADO
  new SlashCommandBuilder()
    .setName("will")
    .setDescription("Muestra el estado de WILL"),

  // BAN
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea a un usuario")
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
    .setDescription("Aplica un timeout")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutos")
        .setDescription("Duración en minutos")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo")
        .setRequired(false)
    ),

  // PURGE
  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Elimina una cantidad de mensajes")
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad de mensajes (1-100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

  // PURGEALL
  new SlashCommandBuilder()
    .setName("purgeall")
    .setDescription("Elimina todo el historial del canal actual")
    .addStringOption(o =>
      o.setName("confirmacion")
        .setDescription("Escribe BORRAR TODO")
        .setRequired(true)
    ),

  // KICKALL
  new SlashCommandBuilder()
    .setName("kickall")
    .setDescription("Expulsa a todos los miembros elegibles")
    .addStringOption(o =>
      o.setName("confirmacion")
        .setDescription("Escribe CONFIRMO KICKALL")
        .setRequired(true)
    ),

  // BANALL
  new SlashCommandBuilder()
    .setName("banall")
    .setDescription("Banea a todos los miembros elegibles")
    .addStringOption(o =>
      o.setName("confirmacion")
        .setDescription("Escribe CONFIRMO BANALL")
        .setRequired(true)
    ),

  // LOCKDOWN
  new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Bloquea un canal")
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal que será bloqueado")
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
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal que será desbloqueado")
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
    .addBooleanOption(o =>
      o.setName("confirmar")
        .setDescription("Confirmar operación")
        .setRequired(true)
    ),

  // EMERGENCY RELEASE
  new SlashCommandBuilder()
    .setName("emergency-release")
    .setDescription("Restaura los canales bloqueados")
    .addBooleanOption(o =>
      o.setName("confirmar")
        .setDescription("Confirmar restauración")
        .setRequired(true)
    ),

  // ANTISPAM TEST
  new SlashCommandBuilder()
    .setName("antispam-test")
    .setDescription("Realiza una prueba de envío")
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal de prueba")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad de mensajes (1-5)")
        .setMinValue(1)
        .setMaxValue(5)
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("confirmacion")
        .setDescription("Escribe CONFIRMO PRUEBA")
        .setRequired(true)
    )

];

export { commands };
