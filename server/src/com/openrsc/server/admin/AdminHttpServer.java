package com.openrsc.server.admin;

import com.openrsc.server.Server;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Optional process-level HTTP bridge for the Admin 2026 control plane.
 */
public final class AdminHttpServer {

	private static final Logger LOGGER = LogManager.getLogger();
	private static final String ENABLED_PROPERTY = "openrsc.admin.enabled";
	private static final String BIND_PROPERTY = "openrsc.admin.bind";
	private static final String PORT_PROPERTY = "openrsc.admin.port";

	private static HttpServer httpServer;
	private static ExecutorService executor;

	private AdminHttpServer() {
	}

	public static synchronized void startIfEnabled() {
		if (!Boolean.parseBoolean(System.getProperty(ENABLED_PROPERTY, "false")) || httpServer != null) {
			return;
		}

		final String bind = System.getProperty(BIND_PROPERTY, "127.0.0.1");
		final int port;
		try {
			port = Integer.parseInt(System.getProperty(PORT_PROPERTY, "8787"));
		} catch (final NumberFormatException ex) {
			LOGGER.error("Admin 2026 HTTP server disabled: invalid {} value", PORT_PROPERTY, ex);
			return;
		}
		try {
			final InetAddress bindAddress = InetAddress.getByName(bind);
			if (!bindAddress.isLoopbackAddress()) {
				LOGGER.warn("Admin 2026 is binding to non-loopback address {}. Authentication is not implemented yet.", bind);
			}

			httpServer = HttpServer.create(new InetSocketAddress(bindAddress, port), 0);
			httpServer.createContext("/admin/api/status", AdminHttpServer::handleStatus);

			executor = Executors.newSingleThreadExecutor(runnable -> {
				final Thread thread = new Thread(runnable, "Admin2026Http");
				thread.setDaemon(true);
				return thread;
			});
			httpServer.setExecutor(executor);
			httpServer.start();

			LOGGER.info("Admin 2026 HTTP API listening on http://{}:{}/admin/api/status", bind, port);
		} catch (final IOException ex) {
			LOGGER.error("Admin 2026 HTTP server failed to start; gameplay will continue without it", ex);
			stop();
		}
	}
	public static synchronized void stopIfNoServers() {
		if (Server.serversList.isEmpty()) {
			stop();
		}
	}

	public static synchronized void stop() {
		if (httpServer != null) {
			httpServer.stop(0);
			httpServer = null;
		}

		if (executor != null) {
			executor.shutdownNow();
			executor = null;
		}
	}

	private static void handleStatus(final HttpExchange exchange) throws IOException {
		if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
			exchange.getResponseHeaders().set("Allow", "GET");
			sendJson(exchange, 405, new JSONObject().put("error", "method_not_allowed"));
			return;
		}

		final List<Server> servers = new ArrayList<>(Server.serversList.values());
		servers.sort(Comparator.comparing(Server::getName));
		final JSONArray serverStatuses = new JSONArray();
		for (final Server server : servers) {
			serverStatuses.put(ServerStatus.from(server).toJson());
		}

		final JSONObject response = new JSONObject()
			.put("generatedAtEpochMillis", System.currentTimeMillis())
			.put("servers", serverStatuses);

		sendJson(exchange, 200, response);
	}

	private static void sendJson(
		final HttpExchange exchange,
		final int statusCode,
		final JSONObject body
	) throws IOException {
		final byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
		exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
		exchange.getResponseHeaders().set("Cache-Control", "no-store");
		exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
		exchange.sendResponseHeaders(statusCode, bytes.length);

		try (OutputStream output = exchange.getResponseBody()) {
			output.write(bytes);
		}
	}
}
