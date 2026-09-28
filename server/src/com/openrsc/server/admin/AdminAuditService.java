package com.openrsc.server.admin;

import com.openrsc.server.Server;
import com.openrsc.server.database.impl.mysql.queries.logging.GenericLog;

/**
 * Persists Admin 2026 mutation audit records through OpenRSC's existing logger.
 */
public final class AdminAuditService {

	private static final String PREFIX = "Admin2026Audit ";

	private AdminAuditService() {
	}

	public static void record(final Server server, final AdminAuditRecord record) {
		if (server == null || record == null || server.getGameLogger() == null) {
			return;
		}

		server.getGameLogger().addQuery(
			new GenericLog(server.getWorld(), PREFIX + record.toJson().toString())
		);
	}
}
