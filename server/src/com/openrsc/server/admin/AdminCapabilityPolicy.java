package com.openrsc.server.admin;

import com.openrsc.server.model.entity.player.Group;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * Conservative default capability bundles derived from existing OpenRSC groups.
 *
 * Mutation capabilities are granted one operation at a time only after the
 * corresponding OpenRSC command/domain behavior has been audited.
 */
public final class AdminCapabilityPolicy {

	private AdminCapabilityPolicy() {
	}

	public static Set<AdminCapability> forGroup(final int groupId) {
		final EnumSet<AdminCapability> capabilities = EnumSet.of(
			AdminCapability.SERVER_READ,
			AdminCapability.WORLD_READ,
			AdminCapability.PLAYERS_READ,
			AdminCapability.PLUGINS_READ,
			AdminCapability.EVENTS_READ
		);

		switch (groupId) {
			case Group.OWNER:
			case Group.ADMIN:
			case Group.SUPER_MOD:
			case Group.MOD:
			case Group.PLAYER_MOD:
				capabilities.add(AdminCapability.LOGS_READ);
				capabilities.add(AdminCapability.LOGS_STAFF);
				capabilities.add(AdminCapability.PLAYERS_MESSAGE);
				break;
			case Group.DEV:
				capabilities.add(AdminCapability.LOGS_READ);
				capabilities.add(AdminCapability.LOGS_STAFF);
				break;
			case Group.EVENT:
				capabilities.add(AdminCapability.LOGS_READ);
				break;
			default:
				break;
		}

		return Collections.unmodifiableSet(capabilities);
	}
}
