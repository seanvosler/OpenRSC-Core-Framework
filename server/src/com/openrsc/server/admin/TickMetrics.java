package com.openrsc.server.admin;

import com.openrsc.server.Server;
import org.json.JSONObject;

/**
 * Snapshot of profiling values OpenRSC already records for its latest game tick.
 */
public final class TickMetrics {

	private final double durationMillis;
	private final double lateMillis;
	private final double eventsMillis;
	private final double incomingPacketsMillis;
	private final double outgoingPacketsMillis;
	private final double worldUpdateMillis;
	private final double playersMillis;
	private final double npcsMillis;
	private final double messageQueuesMillis;
	private final double clientUpdateMillis;
	private final double cleanupMillis;
	private final double walkActionsMillis;
	private TickMetrics(final Server server) {
		durationMillis = nanosToMillis(server.getLastTickDuration());
		lateMillis = Math.max(durationMillis - server.getConfig().GAME_TICK, 0.0d);
		eventsMillis = nanosToMillis(server.getLastEventsDuration());
		incomingPacketsMillis = nanosToMillis(server.getLastIncomingPacketsDuration());
		outgoingPacketsMillis = nanosToMillis(server.getLastOutgoingPacketsDuration());
		worldUpdateMillis = nanosToMillis(server.getLastWorldUpdateDuration());
		playersMillis = nanosToMillis(server.getLastProcessPlayersDuration());
		npcsMillis = nanosToMillis(server.getLastProcessNpcsDuration());
		messageQueuesMillis = nanosToMillis(server.getLastProcessMessageQueuesDuration());
		clientUpdateMillis = nanosToMillis(server.getLastUpdateClientsDuration());
		cleanupMillis = nanosToMillis(server.getLastDoCleanupDuration());
		walkActionsMillis = nanosToMillis(server.getLastExecuteWalkToActionsDuration());
	}

	public static TickMetrics from(final Server server) {
		return new TickMetrics(server);
	}
	private static double nanosToMillis(final long nanos) {
		return nanos / 1_000_000.0d;
	}

	public JSONObject toJson() {
		return new JSONObject()
			.put("durationMillis", durationMillis)
			.put("lateMillis", lateMillis)
			.put("eventsMillis", eventsMillis)
			.put("incomingPacketsMillis", incomingPacketsMillis)
			.put("outgoingPacketsMillis", outgoingPacketsMillis)
			.put("worldUpdateMillis", worldUpdateMillis)
			.put("playersMillis", playersMillis)
			.put("npcsMillis", npcsMillis)
			.put("messageQueuesMillis", messageQueuesMillis)
			.put("clientUpdateMillis", clientUpdateMillis)
			.put("cleanupMillis", cleanupMillis)
			.put("walkActionsMillis", walkActionsMillis);
	}
}
