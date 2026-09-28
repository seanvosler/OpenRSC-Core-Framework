package com.openrsc.server.admin;

import org.json.JSONObject;

/**
 * Transport contract for one future Admin 2026 mutation audit record.
 *
 * Storage is intentionally not implemented yet; mutations remain disabled.
 */
public final class AdminAuditRecord {

	private final long timestampEpochMillis;
	private final String requestId;
	private final String operatorName;
	private final int operatorGroupId;
	private final String capability;
	private final String action;
	private final String serverName;
	private final String target;
	private final boolean success;
	private final String errorCode;

	public AdminAuditRecord(
		final long timestampEpochMillis,
		final String requestId,
		final AdminOperator operator,
		final AdminCapability capability,
		final String action,
		final String serverName,
		final String target,
		final boolean success,
		final String errorCode
	) {
		this.timestampEpochMillis = timestampEpochMillis;
		this.requestId = requestId;
		this.operatorName = operator.getName();
		this.operatorGroupId = operator.getGroupId();
		this.capability = capability.getId();
		this.action = action;
		this.serverName = serverName;
		this.target = target;
		this.success = success;
		this.errorCode = errorCode;
	}

	public JSONObject toJson() {
		return new JSONObject()
			.put("timestampEpochMillis", timestampEpochMillis)
			.put("requestId", requestId)
			.put("operatorName", operatorName)
			.put("operatorGroupId", operatorGroupId)
			.put("capability", capability)
			.put("action", action)
			.put("serverName", serverName)
			.put("target", target == null ? JSONObject.NULL : target)
			.put("success", success)
			.put("errorCode", errorCode == null ? JSONObject.NULL : errorCode);
	}
}
