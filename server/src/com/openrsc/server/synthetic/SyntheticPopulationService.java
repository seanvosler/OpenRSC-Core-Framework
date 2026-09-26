package com.openrsc.server.synthetic;

import com.openrsc.server.Server;
import com.openrsc.server.event.DelayedEvent;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class SyntheticPopulationService {
    private static final Logger LOGGER = LogManager.getLogger();
    private final Server server;
    private final List<SyntheticActor> actors = new ArrayList<>();

    public SyntheticPopulationService(Server server) {
        this.server = server;
    }

    public void add(SyntheticActor actor) {
        actors.add(actor);
    }

    public List<SyntheticActor> getActors() {
        return Collections.unmodifiableList(actors);
    }

    public void start() {
        for (SyntheticActor actor : actors) {
            actor.start();
        }

        server.getGameEventHandler().add(
            new DelayedEvent(
                server.getWorld(),
                null,
                server.getConfig().GAME_TICK * 2L,
                "Synthetic behavior loop"
            ) {
                @Override
                public void run() {
                    for (SyntheticActor actor : actors) {
                        try {
                            actor.tick();
                        } catch (Exception e) {
                            LOGGER.error(
                                "Synthetic behavior failure for {} ({})",
                                actor.getPlayer().getUsername(),
                                actor.getBehaviorName(),
                                e
                            );
                        }
                    }
                }
            }
        );

        LOGGER.info("Synthetic behavior runtime started for {} actors", actors.size());
    }
}
