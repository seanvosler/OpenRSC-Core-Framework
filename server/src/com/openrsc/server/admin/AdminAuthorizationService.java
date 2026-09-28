package com.openrsc.server.admin;

/**
 * Reusable server-side authorization boundary for Admin 2026 operations.
 */
public final class AdminAuthorizationService {

	private AdminAuthorizationService() {
	}

	public static AdminAuthorizationResult authorize(
		final String authorizationHeader,
		final AdminCapability capability
	) {
		if (!AdminAuthService.isConfigured()) {
			return AdminAuthorizationResult.authNotConfigured();
		}

		final AdminOperator operator = AdminAuthService.authenticate(authorizationHeader);
		if (operator == null) {
			return AdminAuthorizationResult.unauthorized();
		}

		if (!operator.hasCapability(capability)) {
			return AdminAuthorizationResult.forbidden(operator);
		}

		return AdminAuthorizationResult.authorized(operator);
	}
}
