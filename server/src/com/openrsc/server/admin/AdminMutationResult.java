package com.openrsc.server.admin;

import org.json.JSONObject;

/**
 * Transport-safe result for one Admin 2026 mutation attempt.
 */
public final class AdminMutationResult {

	private final String requestId;
	private final boolean success;
	private final String action;
	private final String serverName;
	private final String target;
	private final String errorCode;
	private final String detail;

	private AdminMutationResult(
		final String requestId,
		final boolean success,
		final String action,
		final String serverName,
		final String target,
		final String errorCode,
		final String detail
	) {
		this.requestId = requestId;
		this.success = success;
		this.action = action;
		this.serverName = serverName;
		this.target = target;
		this.errorCode = errorCode;
		this.detail = detail;
	}

	public static AdminMutationResult success(
		final String requestId,
		final String action,
		final String serverName,
		final String target,
		final String detail
	) {
		return new AdminMutationResult(
			requestId,
			true,
			action,
			serverName,
			target,
			null,
			detail
		);
	}

	public static AdminMutationResult failure(
		final String requestId,
		final String action,
		final String serverName,
		final String target,
		final String errorCode,
		final String detail
	) {
		return new AdminMutationResult(
			requestId,
			false,
			action,
			serverName,
			target,
			errorCode,
			detail
		);
	}

	public boolean isSuccess() {
		return success;
	}

	public String getRequestId() {
		return requestId;
	}

	public String getErrorCode() {
		return errorCode;
	}

	public JSONObject toJson() {
		return new JSONObject()
			.put("requestId", requestId)
			.put("success", success)
			.put("action", action)
			.put("serverName", serverName == null ? JSONObject.NULL : serverName)
			.put("target", target == null ? JSONObject.NULL : target)
			.put("errorCode", errorCode == null ? JSONObject.NULL : errorCode)
			.put("detail", detail == null ? JSONObject.NULL : detail);
	}
}
