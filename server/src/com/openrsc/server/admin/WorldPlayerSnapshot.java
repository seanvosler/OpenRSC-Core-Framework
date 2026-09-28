package com.openrsc.server.admin;

import com.openrsc.server.constants.Skill;
import com.openrsc.server.model.PlayerAppearance;
import com.openrsc.server.model.entity.player.Player;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Transport-safe authoritative world-view snapshot of one online player.
 */
public final class WorldPlayerSnapshot {

	private final int databaseId;
	private final int serverIndex;
	private final String username;
	private final int x;
	private final int y;
	private final int combatLevel;
	private final boolean inCombat;
	private final Integer direction;
	private final boolean sleeping;
	private final boolean skulled;
	private final int hits;
	private final int maxHits;
	private final int[] wornItems;
	private final int hair;
	private final int top;
	private final int bottom;
	private final int skin;

	private WorldPlayerSnapshot(final Player player) {
		databaseId = player.getDatabaseID();
		serverIndex = player.getIndex();
		username = player.getUsername();
		x = player.getX();
		y = player.getY();
		combatLevel = player.getCombatLevel();
		inCombat = player.inCombat();
		final int sprite = player.getSprite();
		direction = sprite >= 0 && sprite <= 7 ? sprite : null;
		sleeping = player.isSleeping();
		skulled = player.isSkulled();
		hits = player.getSkills().getLevel(Skill.HITS.id());
		maxHits = player.getSkills().getMaxStat(Skill.HITS.id());

		final int[] currentWornItems = player.getWornItems();
		wornItems = new int[currentWornItems.length];
		System.arraycopy(currentWornItems, 0, wornItems, 0, currentWornItems.length);

		final PlayerAppearance appearance = player.getSettings().getAppearance();
		hair = Byte.toUnsignedInt(appearance.getHairColour());
		top = Byte.toUnsignedInt(appearance.getTopColour());
		bottom = Byte.toUnsignedInt(appearance.getTrouserColour());
		skin = Byte.toUnsignedInt(appearance.getSkinColour(player.getClientLimitations().maxSkinColor));
	}

	public static WorldPlayerSnapshot from(final Player player) {
		return new WorldPlayerSnapshot(player);
	}

	public JSONObject toJson() {
		final JSONArray sprites = new JSONArray();
		for (final int wornItem : wornItems) {
			sprites.put(wornItem);
		}

		return new JSONObject()
			.put("databaseId", databaseId)
			.put("serverIndex", serverIndex)
			.put("username", username)
			.put("x", x)
			.put("y", y)
			.put("combatLevel", combatLevel)
			.put("inCombat", inCombat)
			.put("direction", direction == null ? JSONObject.NULL : direction)
			.put("sleeping", sleeping)
			.put("skulled", skulled)
			.put("hits", hits)
			.put("maxHits", maxHits)
			.put(
				"appearance",
				new JSONObject()
					.put("sprites", sprites)
					.put("hair", hair)
					.put("top", top)
					.put("bottom", bottom)
					.put("skin", skin)
			);
	}
}
