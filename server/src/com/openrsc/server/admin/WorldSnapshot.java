package com.openrsc.server.admin;

import com.openrsc.server.Server;
import com.openrsc.server.model.entity.GroundItem;
import com.openrsc.server.model.entity.npc.Npc;
import com.openrsc.server.model.entity.player.Player;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Versioned authoritative read-only world snapshot for Admin visualization.
 *
 * This contract intentionally contains copied primitives only. It never exposes
 * mutable OpenRSC domain objects to HTTP consumers.
 */
public final class WorldSnapshot {

	public static final int VERSION = 1;

	private final String serverName;
	private final long generatedAtEpochMillis;
	private final long serverTick;
	private final List<WorldPlayerSnapshot> players;
	private final List<WorldNpcSnapshot> npcs;
	private final List<WorldGroundItemSnapshot> groundItems;

	private WorldSnapshot(final Server server) {
		serverName = server.getName();
		generatedAtEpochMillis = System.currentTimeMillis();
		serverTick = server.getCurrentTick();

		final List<Player> onlinePlayers = new ArrayList<>();
		for (final Player player : server.getWorld().getPlayers()) {
			onlinePlayers.add(player);
		}
		onlinePlayers.sort(Comparator.comparingInt(Player::getIndex));

		players = new ArrayList<>();
		for (final Player player : onlinePlayers) {
			players.add(WorldPlayerSnapshot.from(player));
		}

		final List<Npc> liveNpcs = new ArrayList<>();
		for (final Npc npc : server.getWorld().getNpcs()) {
			liveNpcs.add(npc);
		}
		liveNpcs.sort(Comparator.comparingInt(Npc::getIndex));

		npcs = new ArrayList<>();
		for (final Npc npc : liveNpcs) {
			npcs.add(WorldNpcSnapshot.from(npc));
		}

		final List<GroundItem> liveGroundItems = server.getWorld()
			.getRegionManager()
			.snapshotGroundItems();
		liveGroundItems.sort(
			Comparator.comparingInt(GroundItem::getY)
				.thenComparingInt(GroundItem::getX)
				.thenComparingInt(GroundItem::getID)
		);

		groundItems = new ArrayList<>();
		for (final GroundItem item : liveGroundItems) {
			groundItems.add(WorldGroundItemSnapshot.from(item));
		}
	}

	public static WorldSnapshot from(final Server server) {
		return new WorldSnapshot(server);
	}

	public JSONObject toJson() {
		final JSONArray playerJson = new JSONArray();
		for (final WorldPlayerSnapshot player : players) {
			playerJson.put(player.toJson());
		}

		final JSONArray npcJson = new JSONArray();
		for (final WorldNpcSnapshot npc : npcs) {
			npcJson.put(npc.toJson());
		}

		final JSONArray groundItemJson = new JSONArray();
		for (final WorldGroundItemSnapshot item : groundItems) {
			groundItemJson.put(item.toJson());
		}

		return new JSONObject()
			.put("version", VERSION)
			.put("serverName", serverName)
			.put("generatedAtEpochMillis", generatedAtEpochMillis)
			.put("serverTick", serverTick)
			.put("players", playerJson)
			.put("npcs", npcJson)
			.put("groundItems", groundItemJson);
	}
}
