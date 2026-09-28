package com.openrsc.server.admin;

import com.openrsc.server.model.entity.player.Group;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

/**
 * Authenticated Admin 2026 operator identity.
 */
public final class AdminOperator {

	private final String name;
	private final int groupId;
	private final String groupName;
	private final Set<AdminCapability> capabilities;

	AdminOperator(final String name, final int groupId, final Set<AdminCapability> capabilities) {
		this.name = name;
		this.groupId = groupId;
		this.groupName = Group.GROUP_NAMES.getOrDefault(groupId, "Unknown");
		this.capabilities = capabilities;
	}

	public String getName() {
		return name;
	}

	public int getGroupId() {
		return groupId;
	}

	public boolean hasCapability(final AdminCapability capability) {
		return capabilities.contains(capability);
	}

	public JSONObject toJson() {
		final List<String> ids = new ArrayList<>();
		for (final AdminCapability capability : capabilities) {
			ids.add(capability.getId());
		}
		ids.sort(Comparator.naturalOrder());

		return new JSONObject()
			.put("name", name)
			.put("groupId", groupId)
			.put("groupName", groupName)
			.put("capabilities", new JSONArray(ids));
	}
}
