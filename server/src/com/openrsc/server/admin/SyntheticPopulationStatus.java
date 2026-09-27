package com.openrsc.server.admin;

import com.openrsc.server.Server;
import com.openrsc.server.synthetic.SyntheticActor;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;

public final class SyntheticPopulationStatus {

	private final String serverName;
	private final boolean running;
	private final int actorCount;
	private final List<SyntheticActor> actors;

	private SyntheticPopulationStatus(final Server server) {
		serverName = server.getName();
		running = server.getSyntheticPopulationService().isRunning();
		actors = server.getSyntheticPopulationService().getActors();
		actorCount = actors.size();
	}

	public static SyntheticPopulationStatus from(final Server server) {
		return new SyntheticPopulationStatus(server);
	}
	public JSONObject toJson() {
		final JSONArray actorJson = new JSONArray();
		for (final SyntheticActor actor : actors) {
			actorJson.put(new JSONObject()
				.put("playerIndex", actor.getPlayer().getIndex())
				.put("databaseId", actor.getPlayer().getDatabaseID())
				.put("username", actor.getPlayer().getUsername())
				.put("behavior", actor.getBehaviorName())
				.put("state", actor.getState())
				.put("decisionCount", actor.getDecisionCount())
				.put("x", actor.getPlayer().getX())
				.put("y", actor.getPlayer().getY()));
		}

		return new JSONObject()
			.put("serverName", serverName)
			.put("running", running)
			.put("actorCount", actorCount)
			.put("actors", actorJson);
	}
}
