package com.openrsc.server.synthetic;

import com.openrsc.server.Server;
import com.openrsc.server.event.DelayedEvent;
import com.openrsc.server.event.rsc.GameTickEvent;
import com.openrsc.server.model.entity.player.Player;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class SyntheticPopulationService {
    private static final Logger LOGGER = LogManager.getLogger();

    private final Server server;
    private final List<SyntheticActor> actors = new ArrayList<>();
    private DelayedEvent behaviorLoop;
    private boolean running;

    public SyntheticPopulationService(Server server) {
        this.server = server;
    }

    public synchronized void add(SyntheticActor actor) {
        if (running) {
            throw new IllegalStateException("Cannot add synthetic actors while population is running");
        }
        actors.add(actor);
    }
    public synchronized List<SyntheticActor> getActors() {
        return Collections.unmodifiableList(new ArrayList<>(actors));
    }

    public synchronized boolean isRunning() {
        return running;
    }

    public synchronized int size() {
        return actors.size();
    }

    public synchronized void start() {
        if (running) {
            return;
        }

        if (actors.isEmpty()) {
            LOGGER.info("Synthetic population start skipped: no actors configured");
            return;
        }

        for (SyntheticActor actor : actors) {
            actor.start();
        }

        behaviorLoop = new DelayedEvent(
            server.getWorld(),
            null,
            server.getConfig().GAME_TICK * 2L,
            "Synthetic behavior loop"
        ) {
            @Override
            public void run() {
                tickActors();
            }
        };

        if (!server.getGameEventHandler().add(behaviorLoop)) {
            behaviorLoop = null;
            throw new IllegalStateException("Unable to register synthetic behavior loop");
        }

        running = true;
        LOGGER.info("Synthetic behavior runtime started for {} actors", actors.size());
    }
    private void tickActors() {
        final List<SyntheticActor> snapshot;
        synchronized (this) {
            if (!running) {
                return;
            }
            snapshot = new ArrayList<>(actors);
        }

        for (SyntheticActor actor : snapshot) {
            try {
                actor.tick();
            } catch (Exception e) {
                LOGGER.error(
                    "Synthetic behavior failure for {} ({})",
                    actor.getPlayer().getUsername(),
                    actor.getBehaviorName(),
                    e
                );
                actor.setState("error");
            }
        }
    }

    public synchronized int stopAll() {
        final int actorCount = actors.size();
        running = false;

        if (behaviorLoop != null) {
            behaviorLoop.stop();
            if (server.getGameEventHandler().has(behaviorLoop)) {
                server.getGameEventHandler().remove(behaviorLoop);
            }
            behaviorLoop = null;
        }

        for (SyntheticActor actor : new ArrayList<>(actors)) {
            teardownActor(actor);
        }

        actors.clear();
        LOGGER.info("Synthetic population stopped: {} actors removed", actorCount);
        return actorCount;
    }
    private void teardownActor(final SyntheticActor actor) {
        final Player player = actor.getPlayer();

        try {
            actor.stop();
        } catch (Exception e) {
            LOGGER.error("Synthetic behavior stop failed for {}", player.getUsername(), e);
        } finally {
            actor.setState("stopped");
        }

        for (final GameTickEvent event : server.getGameEventHandler().getPlayerEvents(player)) {
            event.stop();
            if (server.getGameEventHandler().has(event)) {
                server.getGameEventHandler().remove(event);
            }
        }

        try {
            player.resetAll();
        } catch (Exception e) {
            LOGGER.warn("Synthetic player reset failed for {}", player.getUsername(), e);
        }

        player.setLoggedIn(false);

        if (!player.isRemoved() && player.getRegion() != null) {
            player.remove();
        }

        server.getWorld().removePlayer(player.getUsernameHash());
        server.getWorld().getPlayers().remove(player);
    }
}
