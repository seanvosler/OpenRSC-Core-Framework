package com.openrsc.server.admin;

import com.openrsc.server.model.entity.player.Group;
import com.openrsc.server.model.entity.player.Player;
import org.json.JSONObject;

/**
 * Privacy-safe summary of one currently online player.
 */
public final class PlayerSummary {

	private final int databaseId;
	private final int index;
	private final String username;
	private final int combatLevel;
	private final int x;
	private final int y;
	private final int fatigue;
	private final int questPoints;
	private final int groupId;
	private final String groupName;

	private PlayerSummary(final Player player) {
		databaseId = player.getDatabaseID();
		index = player.getIndex();
		username = player.getUsername();
		combatLevel = player.getCombatLevel();
		x = player.getX();
		y = player.getY();
		fatigue = player.getFatigue();
		questPoints = player.getQuestPoints();
		groupId = player.getGroupID();
		groupName = Group.GROUP_NAMES.getOrDefault(groupId, "Unknown");
	}

	public static PlayerSummary from(final Player player) {
		return new PlayerSummary(player);
	}

	public JSONObject toJson() {
		return new JSONObject()
			.put("databaseId", databaseId)
			.put("index", index)
			.put("username", username)
			.put("combatLevel", combatLevel)
			.put("x", x)
			.put("y", y)
			.put("fatigue", fatigue)
			.put("questPoints", questPoints)
			.put("groupId", groupId)
			.put("groupName", groupName);
	}
}
