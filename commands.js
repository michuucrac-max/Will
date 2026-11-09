
import {
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} from "discord.js";

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const commands = [

  new SlashCommandBuilder()
    .setName("will")
    .setDescription("Muestra la información de WILL"),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o =>
      o.setName("usuario").setDescription("Usuario que será baneado").setRequired(true))
    .addStringOption(o =>
      o.setName("motivo").setDescription("Motivo del baneo").setRequired(false)),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o =>
      o.setName("usuario").setDescription("Usuario que será expulsado").setRequired(true))
    .addStringOption(o =>
      o.setName("motivo").setDescription("Motivo de la expulsión").setRequired(false)),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Silencia temporalmente a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o =>
      o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o =>
      o.setName("minutos").setDescription("Duración en minutos").setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(o =>
      o.setName("motivo").setDescription("Motivo").setRequired(false)),

  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Elimina mensajes recientes")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o =>
      o.setName("cantidad").setDescription("Cantidad de mensajes (1-100)").setRequired(true).setMinValue(1).setMaxValue(100)),

  new SlashCommandBuilder()
    .setName("banall")
    .setDescription("Banea a todos los miembros normales del servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o.setName("confirmacion").setDescription("Escribe exactamente: CONFIRMO BANALL").setRequired(true)),

  new SlashCommandBuilder()
    .setName("kickall")
    .setDescription("Expulsa a todos los miembros normales del servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o =>
      o.setName("confirmacion").setDescription("Escribe exactamente: CONFIRMO KICKALL").setRequired(true)),

  new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Bloquea un canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal que se bloqueará")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("unlockdown")
    .setDescription("Desbloquea un canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal que se desbloqueará")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("emergency")
    .setDescription("Activa el bloqueo de emergencia del servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(o =>
      o.setName("confirmar").setDescription("Confirmar bloqueo").setRequired(true)),

  new SlashCommandBuilder()
    .setName("emergency-release")
    .setDescription("Restaura los canales bloqueados por la emergencia")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(o =>
      o.setName("confirmar").setDescription("Confirmar restauración").setRequired(true)),

  new SlashCommandBuilder()
    .setName("antispam-test")
    .setDescription("Envía mensajes de prueba para comprobar el anti-spam")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal de prueba")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addIntegerOption(o =>
      o.setName("cantidad").setDescription("Cantidad (1-5)").setRequired(true).setMinValue(1).setMaxValue(5))
    .addStringOption(o =>
      o.setName("confirmacion").setDescription("Escribe exactamente: CONFIRMO PRUEBA").setRequired(true))

];

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

async function deploy() {
  if (!TOKEN || !CLIENT_ID) {
    throw new Error("Faltan las variables TOKEN o CLIENT_ID.");
  }

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands.map(command => command.toJSON()) }
  );

  console.log("WILL: comandos registrados correctamente.");
}
