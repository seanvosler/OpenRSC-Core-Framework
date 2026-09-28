package com.openrsc.server.admin;

import com.openrsc.server.Server;
import com.openrsc.server.model.entity.player.Player;
import com.openrsc.server.net.rsc.ActionSender;
import com.openrsc.server.util.rsc.MessageType;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Narrow Admin 2026 player mutations. All mutable player behavior is dispatched
 * through the OpenRSC game-event handler.
 */
public final class AdminPlayerActions {

	private static final int MAX_MESSAGE_LENGTH = 240;
	private static final long ACTION_TIMEOUT_SECONDS = 2L;

	private AdminPlayerActions() {
	}

	public static AdminMutationResult sendModeratorAlert(
		final Server server,
		final int databaseId,
		final String rawMessage,
		final String requestId
	) {
		final String action = "players.message";
		final String serverName = server == null ? null : server.getName();
		final String target = "player:" + databaseId;

		if (server == null) {
			return AdminMutationResult.failure(
				requestId, action, null, target, "server_not_found", "Server not found"
			);
		}

		final String message = rawMessage == null ? "" : rawMessage.trim();
		if (message.isEmpty()) {
			return AdminMutationResult.failure(
				requestId, action, serverName, target, "message_required", "Message is required"
			);
		}
		if (message.length() > MAX_MESSAGE_LENGTH) {
			return AdminMutationResult.failure(
				requestId,
				action,
				serverName,
				target,
				"message_too_long",
				"Message must be " + MAX_MESSAGE_LENGTH + " characters or fewer"
			);
		}

		final CompletableFuture<AdminMutationResult> future = new CompletableFuture<>();
		server.getGameEventHandler().submit(() -> {
			final Player player = server.getWorld().getPlayerID(databaseId);
			if (player == null || !player.loggedIn()) {
				future.complete(AdminMutationResult.failure(
					requestId,
					action,
					serverName,
					target,
					"player_not_online",
					"Player is not online"
				));
				return;
			}

			if (player.getClientLimitations().supportsMessageBox) {
				ActionSender.sendBox(
					player,
					"@yel@Alert from an Administrator:%@whi@ " + message,
					false
				);
			}
			player.playerServerMessage(
				MessageType.QUEST,
				"@gre@Administrator:@whi@ " + message
			);

			future.complete(AdminMutationResult.success(
				requestId,
				action,
				serverName,
				"player:" + player.getDatabaseID() + ":" + player.getUsername(),
				"Message delivered to online player"
			));
		}, "Admin2026.players.message");

		try {
			return future.get(ACTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
		} catch (final Exception ex) {
			return AdminMutationResult.failure(
				requestId,
				action,
				serverName,
				target,
				"action_timeout",
				"Server did not complete the action in time"
			);
		}
	}
}
