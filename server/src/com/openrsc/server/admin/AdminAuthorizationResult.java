package com.openrsc.server.admin;

/**
 * Result of authenticating an Admin 2026 request and checking one capability.
 */
public final class AdminAuthorizationResult {

	public enum Status {
		AUTHORIZED,
		AUTH_NOT_CONFIGURED,
		UNAUTHORIZED,
		FORBIDDEN
	}

	private final Status status;
	private final AdminOperator operator;

	private AdminAuthorizationResult(final Status status, final AdminOperator operator) {
		this.status = status;
		this.operator = operator;
	}

	public static AdminAuthorizationResult authorized(final AdminOperator operator) {
		return new AdminAuthorizationResult(Status.AUTHORIZED, operator);
	}

	public static AdminAuthorizationResult authNotConfigured() {
		return new AdminAuthorizationResult(Status.AUTH_NOT_CONFIGURED, null);
	}

	public static AdminAuthorizationResult unauthorized() {
		return new AdminAuthorizationResult(Status.UNAUTHORIZED, null);
	}

	public static AdminAuthorizationResult forbidden(final AdminOperator operator) {
		return new AdminAuthorizationResult(Status.FORBIDDEN, operator);
	}

	public Status getStatus() {
		return status;
	}

	public AdminOperator getOperator() {
		return operator;
	}

	public boolean isAuthorized() {
		return status == Status.AUTHORIZED;
	}
}
