package com.openrsc.server.admin;

import com.openrsc.server.Server;
import org.json.JSONObject;

import java.util.concurrent.TimeUnit;

/**
 * Read-only transport snapshot of one OpenRSC server instance.
 */
public final class ServerStatus {

	private final String name;
	private final boolean running;
	private final boolean restarting;
	private final boolean shuttingDown;
	private final long uptimeMillis;
	private final long currentTick;
	private final int gameTickMillis;
	private final TickMetrics tick;
	private final WorldStatus world;
	private ServerStatus(final Server server) {
		name = server.getName();
		running = server.isRunning();
		restarting = server.isRestarting();
		shuttingDown = server.isShuttingDown();

		final long started = server.getServerStartedTime();
		uptimeMillis = started == 0
			? 0
			: TimeUnit.NANOSECONDS.toMillis(Math.max(System.nanoTime() - started, 0));

		currentTick = started == 0 ? 0 : server.getCurrentTick();
		gameTickMillis = server.getConfig().GAME_TICK;
		tick = TickMetrics.from(server);
		world = WorldStatus.from(server.getWorld());
	}
	public static ServerStatus from(final Server server) {
		return new ServerStatus(server);
	}

	public JSONObject toJson() {
		return new JSONObject()
			.put("name", name)
			.put("running", running)
			.put("restarting", restarting)
			.put("shuttingDown", shuttingDown)
			.put("uptimeMillis", uptimeMillis)
			.put("currentTick", currentTick)
			.put("gameTickMillis", gameTickMillis)
			.put("tick", tick.toJson())
			.put("world", world.toJson());
	}
}
