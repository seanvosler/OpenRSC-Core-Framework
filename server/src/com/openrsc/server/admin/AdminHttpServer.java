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
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

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
			httpServer.createContext("/admin/api/plugins", AdminHttpServer::handlePlugins);
			httpServer.createContext("/admin/api/players", AdminHttpServer::handlePlayers);
			httpServer.createContext("/admin/api/synthetic-population", AdminHttpServer::handleSyntheticPopulation);
			httpServer.createContext("/admin/api/events", AdminHttpServer::handleEvents);

			final AtomicInteger threadNumber = new AtomicInteger(1);
			executor = Executors.newFixedThreadPool(8, runnable -> {
				final Thread thread = new Thread(
					runnable,
					"Admin2026Http-" + threadNumber.getAndIncrement()
				);
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

	private static void handlePlugins(final HttpExchange exchange) throws IOException {
		if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
			exchange.getResponseHeaders().set("Allow", "GET");
			sendJson(exchange, 405, new JSONObject().put("error", "method_not_allowed"));
			return;
		}

		final List<Server> servers = new ArrayList<>(Server.serversList.values());
		servers.sort(Comparator.comparing(Server::getName));

		final JSONArray inventories = new JSONArray();
		for (final Server server : servers) {
			inventories.put(PluginInventoryStatus.from(server).toJson());
		}

		final JSONObject response = new JSONObject()
			.put("generatedAtEpochMillis", System.currentTimeMillis())
			.put("servers", inventories);

		sendJson(exchange, 200, response);
	}

	private static void handlePlayers(final HttpExchange exchange) throws IOException {
		if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
			exchange.getResponseHeaders().set("Allow", "GET");
			sendJson(exchange, 405, new JSONObject().put("error", "method_not_allowed"));
			return;
		}

		final List<Server> servers = new ArrayList<>(Server.serversList.values());
		servers.sort(Comparator.comparing(Server::getName));

		final JSONArray playerLists = new JSONArray();
		for (final Server server : servers) {
			playerLists.put(PlayerListStatus.from(server).toJson());
		}

		final JSONObject response = new JSONObject()
			.put("generatedAtEpochMillis", System.currentTimeMillis())
			.put("servers", playerLists);

		sendJson(exchange, 200, response);
	}

	private static void handleSyntheticPopulation(final HttpExchange exchange) throws IOException {
		if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
			exchange.getResponseHeaders().set("Allow", "GET");
			sendJson(exchange, 405, new JSONObject().put("error", "method_not_allowed"));
			return;
		}

		final List<Server> servers = new ArrayList<>(Server.serversList.values());
		servers.sort(Comparator.comparing(Server::getName));

		final JSONArray populations = new JSONArray();
		for (final Server server : servers) {
			populations.put(SyntheticPopulationStatus.from(server).toJson());
		}

		sendJson(
			exchange,
			200,
			new JSONObject()
				.put("generatedAtEpochMillis", System.currentTimeMillis())
				.put("servers", populations)
		);
	}

	private static void handleEvents(final HttpExchange exchange) throws IOException {
		if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
			exchange.getResponseHeaders().set("Allow", "GET");
			sendJson(exchange, 405, new JSONObject().put("error", "method_not_allowed"));
			return;
		}

		exchange.getResponseHeaders().set("Content-Type", "text/event-stream; charset=utf-8");
		exchange.getResponseHeaders().set("Cache-Control", "no-cache");
		exchange.getResponseHeaders().set("X-Accel-Buffering", "no");
		exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
		exchange.sendResponseHeaders(200, 0);

		final AdminEventBus eventBus = AdminEventBus.getInstance();

		try (
			AdminEventBus.Subscription subscription = eventBus.subscribe();
			OutputStream output = exchange.getResponseBody()
		) {
			writeSse(output, "retry: 3000\n\n");

			for (final AdminEvent event : eventBus.getRecentSnapshot()) {
				writeSseEvent(output, event);
			}

			while (true) {
				final AdminEvent event = subscription.poll(15, TimeUnit.SECONDS);
				if (event == null) {
					writeSse(output, ": keepalive\n\n");
				} else {
					writeSseEvent(output, event);
				}
			}
		} catch (final InterruptedException ex) {
			Thread.currentThread().interrupt();
		} catch (final IOException ignored) {
			// Normal path when a browser/tab disconnects from the SSE stream.
		}
	}

	private static void writeSseEvent(final OutputStream output, final AdminEvent event)
		throws IOException {
		writeSse(
			output,
			"id: " + event.getId() + "\n" +
				"data: " + event.toJson().toString() + "\n\n"
		);
	}

	private static void writeSse(final OutputStream output, final String message)
		throws IOException {
		output.write(message.getBytes(StandardCharsets.UTF_8));
		output.flush();
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
