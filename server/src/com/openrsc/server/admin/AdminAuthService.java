package com.openrsc.server.admin;

import com.openrsc.server.model.entity.player.Group;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Minimal local-development bearer-token authentication.
 *
 * This is intentionally not the final production identity model.
 */
public final class AdminAuthService {

	public static final String TOKEN_PROPERTY = "openrsc.admin.authToken";
	public static final String OPERATOR_PROPERTY = "openrsc.admin.operator";
	public static final String GROUP_PROPERTY = "openrsc.admin.group";

	private static final String BEARER_PREFIX = "Bearer ";

	private AdminAuthService() {
	}

	public static boolean isConfigured() {
		final String token = System.getProperty(TOKEN_PROPERTY);
		return token != null && !token.trim().isEmpty();
	}

	public static AdminOperator authenticate(final String authorizationHeader) {
		if (!isConfigured() || authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
			return null;
		}

		final String expected = System.getProperty(TOKEN_PROPERTY);
		final String supplied = authorizationHeader.substring(BEARER_PREFIX.length());

		if (!constantTimeEquals(expected, supplied)) {
			return null;
		}

		final String operatorName = System.getProperty(OPERATOR_PROPERTY, "Local Operator");
		final int groupId = parseGroupId(System.getProperty(GROUP_PROPERTY));

		return new AdminOperator(
			operatorName,
			groupId,
			AdminCapabilityPolicy.forGroup(groupId)
		);
	}

	private static int parseGroupId(final String value) {
		if (value == null || value.trim().isEmpty()) {
			return Group.USER;
		}

		try {
			return Integer.parseInt(value);
		} catch (final NumberFormatException ignored) {
			return Group.USER;
		}
	}

	private static boolean constantTimeEquals(final String expected, final String supplied) {
		return MessageDigest.isEqual(
			expected.getBytes(StandardCharsets.UTF_8),
			supplied.getBytes(StandardCharsets.UTF_8)
		);
	}
}
