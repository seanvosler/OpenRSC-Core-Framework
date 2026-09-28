package com.openrsc.server.admin;

import com.openrsc.server.constants.Skill;
import com.openrsc.server.model.entity.npc.Npc;
import org.json.JSONObject;

/**
 * Transport-safe authoritative world-view snapshot of one NPC.
 */
public final class WorldNpcSnapshot {

	private final int serverIndex;
	private final int id;
	private final String name;
	private final int x;
	private final int y;
	private final boolean inCombat;
	private final int hits;
	private final int maxHits;

	private WorldNpcSnapshot(final Npc npc) {
		serverIndex = npc.getIndex();
		id = npc.getID();
		name = npc.getDef().getName();
		x = npc.getX();
		y = npc.getY();
		inCombat = npc.inCombat();
		hits = npc.getSkills().getLevel(Skill.HITS.id());
		maxHits = npc.getSkills().getMaxStat(Skill.HITS.id());
	}

	public static WorldNpcSnapshot from(final Npc npc) {
		return new WorldNpcSnapshot(npc);
	}

	public JSONObject toJson() {
		return new JSONObject()
			.put("serverIndex", serverIndex)
			.put("id", id)
			.put("name", name)
			.put("x", x)
			.put("y", y)
			.put("inCombat", inCombat)
			.put("hits", hits)
			.put("maxHits", maxHits);
	}
}
