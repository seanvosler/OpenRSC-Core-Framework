package com.openrsc.server.admin;

import com.openrsc.server.model.entity.GroundItem;
import org.json.JSONObject;

/**
 * Transport-safe authoritative world-view snapshot of one ground item.
 */
public final class WorldGroundItemSnapshot {

	private final int id;
	private final String name;
	private final int amount;
	private final int x;
	private final int y;

	private WorldGroundItemSnapshot(final GroundItem item) {
		id = item.getID();
		name = item.getDef().getName();
		amount = item.getAmount();
		x = item.getX();
		y = item.getY();
	}

	public static WorldGroundItemSnapshot from(final GroundItem item) {
		return new WorldGroundItemSnapshot(item);
	}

	public JSONObject toJson() {
		return new JSONObject()
			.put("id", id)
			.put("name", name)
			.put("amount", amount)
			.put("x", x)
			.put("y", y);
	}
}
