package com.openrsc.server.synthetic;

import com.openrsc.server.Server;
import com.openrsc.server.event.DelayedEvent;
import com.openrsc.server.model.PlayerAppearance;
import com.openrsc.server.model.Point;
import com.openrsc.server.model.entity.player.Player;
import com.openrsc.server.net.rsc.ClientLimitations;
import com.openrsc.server.util.rsc.DataConversions;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * Minimal development-only bootstrap for server-side synthetic players.
 *
 * Enabled only with -Dopenrsc.synthetic.enabled=true.
 */
public final class SyntheticPlayerBootstrap {
    private static final Logger LOGGER = LogManager.getLogger();
    private static final String ENABLED_PROPERTY = "openrsc.synthetic.enabled";

    private SyntheticPlayerBootstrap() {
    }

    public static void startIfEnabled(final Server server) {
        if (!Boolean.getBoolean(ENABLED_PROPERTY)) {
            return;
        }

        final String username = System.getProperty("openrsc.synthetic.username", "Synthetic One");
        final long usernameHash = DataConversions.usernameToHash(username);
        final Player player = new Player(server.getWorld(), usernameHash);

        player.setAttribute("dummyplayer", true);
        player.setAttribute("syntheticplayer", true);
        player.setDatabaseID(-1);
        player.setClientVersion(server.getConfig().CLIENT_VERSION);
        player.setClientLimitations(ClientLimitations.forClientVersion(server.getConfig().CLIENT_VERSION));
        player.getSettings().setAppearance(new PlayerAppearance(2, 8, 14, 0, 1, 2));
        player.setLocation(
            Point.location(server.getConfig().RESPAWN_LOCATION_X, server.getConfig().RESPAWN_LOCATION_Y),
            true
        );
        player.setLoggedIn(true);

        // Bypass World.registerPlayer(): it performs persistence/social work for real accounts.
        server.getWorld().getPlayers().add(player);
        player.updateRegion();

        LOGGER.info(
            "Synthetic player online: {} (pid={}, x={}, y={})",
            player.getUsername(), player.getIndex(), player.getX(), player.getY()
        );

        final int targetX = player.getX() + 3;
        final int targetY = player.getY();
        player.walk(targetX, targetY);
        LOGGER.info("Synthetic player walking: {} -> ({},{})", player.getUsername(), targetX, targetY);

        server.getGameEventHandler().add(
            new DelayedEvent(server.getWorld(), player, server.getConfig().GAME_TICK * 5L, "Synthetic movement check") {
                @Override
                public void run() {
                    LOGGER.info(
                        "Synthetic movement result: {} (x={}, y={}, finished={})",
                        player.getUsername(), player.getX(), player.getY(), player.finishedPath()
                    );
                    stop();
                }
            }
        );
    }
}
