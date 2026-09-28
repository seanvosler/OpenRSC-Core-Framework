package com.openrsc.server.admin;

/**
 * Stable capability identifiers used by Admin 2026 authorization.
 */
public enum AdminCapability {
	SERVER_READ("server.read"),
	WORLD_READ("world.read"),
	PLAYERS_READ("players.read"),
	PLUGINS_READ("plugins.read"),
	EVENTS_READ("events.read"),
	LOGS_READ("logs.read"),
	LOGS_STAFF("logs.staff"),

	PLAYERS_MESSAGE("players.message"),
	PLAYERS_TELEPORT("players.teleport"),
	PLAYERS_KICK("players.kick"),
	PLAYERS_MUTE("players.mute"),
	PLAYERS_BAN("players.ban"),
	WORLD_BROADCAST("world.broadcast"),
	WORLD_SAVE_ALL("world.saveAll"),
	SERVER_RESTART("server.restart"),
	PLUGINS_RELOAD("plugins.reload");

	private final String id;

	AdminCapability(final String id) {
		this.id = id;
	}

	public String getId() {
		return id;
	}
}
