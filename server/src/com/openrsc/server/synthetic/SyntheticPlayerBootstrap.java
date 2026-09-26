package com.openrsc.server.synthetic;

import com.openrsc.server.Server;
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
    private static final String COUNT_PROPERTY = "openrsc.synthetic.count";
    private static final int DEFAULT_COUNT = 15;
    private static final int MAX_BOOTSTRAP_COUNT = 100;

    private SyntheticPlayerBootstrap() {
    }

    public static void startIfEnabled(final Server server) {
        if (!Boolean.getBoolean(ENABLED_PROPERTY)) {
            return;
        }

        final int requestedCount = Integer.getInteger(COUNT_PROPERTY, DEFAULT_COUNT);
        final int count = Math.max(1, Math.min(requestedCount, MAX_BOOTSTRAP_COUNT));

        if (requestedCount != count) {
            LOGGER.warn("Synthetic player count {} clamped to {}", requestedCount, count);
        }

        for (int i = 1; i <= count; i++) {
            final Player player = createSyntheticPlayer(server, i);
            server.getWorld().getPlayers().add(player);
            player.updateRegion();

            LOGGER.info(
                "Synthetic player online: {} (pid={}, x={}, y={})",
                player.getUsername(), player.getIndex(), player.getX(), player.getY()
            );
        }

        LOGGER.info(
            "Synthetic population ready: {} players (world total={})",
            count, server.getWorld().getPlayers().size()
        );
    }

    private static Player createSyntheticPlayer(final Server server, final int ordinal) {
        final String username = String.format("SynthBot%02d", ordinal);
        final long usernameHash = DataConversions.usernameToHash(username);
        final Player player = new Player(server.getWorld(), usernameHash);

        player.setAttribute("dummyplayer", true);
        player.setAttribute("syntheticplayer", true);
        player.setAttribute("syntheticOrdinal", ordinal);
        player.setDatabaseID(-ordinal);
        player.setClientVersion(server.getConfig().CLIENT_VERSION);
        player.setClientLimitations(
            ClientLimitations.forClientVersion(server.getConfig().CLIENT_VERSION)
        );

        final int hairColour = ordinal % 10;
        final int topColour = ordinal % 15;
        final int trouserColour = (ordinal * 3) % 15;
        final int skinColour = ordinal % 5;
        final int head = ordinal % 2 == 0 ? 4 : 1;
        final int body = ordinal % 2 == 0 ? 5 : 2;
        player.getSettings().setAppearance(
            new PlayerAppearance(hairColour, topColour, trouserColour, skinColour, head, body)
        );

        final int spawnX = server.getConfig().RESPAWN_LOCATION_X + ((ordinal - 1) % 5);
        final int spawnY = server.getConfig().RESPAWN_LOCATION_Y + ((ordinal - 1) / 5);
        player.setLocation(Point.location(spawnX, spawnY), true);
        player.setLoggedIn(true);
        return player;
    }
}
