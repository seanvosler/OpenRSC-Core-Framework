package com.openrsc.server.admin;

import com.openrsc.server.Server;
import com.openrsc.server.model.entity.player.Player;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Read-only snapshot of currently online players for one server.
 */
public final class PlayerListStatus {

	private final String serverName;
	private final List<PlayerSummary> players;

	private PlayerListStatus(final Server server) {
		serverName = server.getName();

		final List<Player> onlinePlayers = new ArrayList<>();
		for (final Player player : server.getWorld().getPlayers()) {
			onlinePlayers.add(player);
		}
		onlinePlayers.sort(Comparator.comparing(Player::getUsername, String.CASE_INSENSITIVE_ORDER));

		players = new ArrayList<>();
		for (final Player player : onlinePlayers) {
			players.add(PlayerSummary.from(player));
		}
	}

	public static PlayerListStatus from(final Server server) {
		return new PlayerListStatus(server);
	}

	public JSONObject toJson() {
		final JSONArray playerJson = new JSONArray();
		for (final PlayerSummary player : players) {
			playerJson.put(player.toJson());
		}

		return new JSONObject()
			.put("serverName", serverName)
			.put("onlineCount", players.size())
			.put("players", playerJson);
	}
}
