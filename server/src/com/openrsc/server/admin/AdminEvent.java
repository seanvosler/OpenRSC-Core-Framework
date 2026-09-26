package com.openrsc.server.admin;

import org.json.JSONObject;

/**
 * Immutable transport event emitted by the Admin 2026 runtime bridge.
 */
public final class AdminEvent {

	private final long id;
	private final String type;
	private final long timestampEpochMillis;
	private final String serverName;
	private final JSONObject data;

	AdminEvent(
		final long id,
		final String type,
		final long timestampEpochMillis,
		final String serverName,
		final JSONObject data
	) {
		this.id = id;
		this.type = type;
		this.timestampEpochMillis = timestampEpochMillis;
		this.serverName = serverName;
		this.data = data;
	}

	public long getId() {
		return id;
	}

	public JSONObject toJson() {
		return new JSONObject()
			.put("id", id)
			.put("type", type)
			.put("timestampEpochMillis", timestampEpochMillis)
			.put("serverName", serverName)
			.put("data", data);
	}
}
