package com.openrsc.server.admin;

import com.openrsc.server.model.world.World;
import org.json.JSONObject;

/**
 * Small immutable snapshot of live world counts suitable for admin transport.
 */
public final class WorldStatus {

	private final int players;
	private final int npcs;
	private final int shops;
	private final int snapshots;

	private WorldStatus(final int players, final int npcs, final int shops, final int snapshots) {
		this.players = players;
		this.npcs = npcs;
		this.shops = shops;
		this.snapshots = snapshots;
	}
	public static WorldStatus from(final World world) {
		return new WorldStatus(
			world.countPlayers(),
			world.countNpcs(),
			world.getShops().size(),
			world.getSnapshots().size()
		);
	}

	public JSONObject toJson() {
		return new JSONObject()
			.put("players", players)
			.put("npcs", npcs)
			.put("shops", shops)
			.put("snapshots", snapshots);
	}
}
