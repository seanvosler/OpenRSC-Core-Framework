package com.openrsc.server.synthetic;

import com.openrsc.server.Server;
import com.openrsc.server.model.PlayerAppearance;
import com.openrsc.server.model.Point;
import com.openrsc.server.constants.ItemId;
import com.openrsc.server.model.container.Item;
import com.openrsc.server.model.entity.player.Player;
import com.openrsc.server.net.rsc.ClientLimitations;
import com.openrsc.server.synthetic.behavior.IdleBehavior;
import com.openrsc.server.synthetic.behavior.MiningBehavior;
import com.openrsc.server.synthetic.behavior.SyntheticBehavior;
import com.openrsc.server.synthetic.behavior.WanderBehavior;
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
    private static final String BEHAVIOR_PROPERTY = "openrsc.synthetic.behavior";
    private static final String SPAWN_X_PROPERTY = "openrsc.synthetic.spawnX";
    private static final String SPAWN_Y_PROPERTY = "openrsc.synthetic.spawnY";
    private static final String CLIENT_VERSION_PROPERTY = "openrsc.synthetic.clientVersion";
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

        final SyntheticPopulationService population = server.getSyntheticPopulationService();
        if (population.isRunning()) {
            LOGGER.info("Synthetic population already active; start request ignored");
            return;
        }
        if (population.size() > 0) {
            LOGGER.warn("Cleaning stale synthetic population state before start");
            population.stopAll();
        }
        final String requestedBehavior = System.getProperty(BEHAVIOR_PROPERTY, "mixed-basic").trim().toLowerCase();

        for (int i = 1; i <= count; i++) {
            final Player player = createSyntheticPlayer(server, i);
            server.getWorld().getPlayers().add(player);
            player.updateRegion();

            final Point anchor = player.getLocation();
            final SyntheticBehavior behavior;
            if ("miner".equals(requestedBehavior)) {
                behavior = new MiningBehavior();
                final boolean pickaxeAdded = player.getCarriedItems().getInventory().add(
                    new Item(ItemId.BRONZE_PICKAXE.id(), 1),
                    false
                );
                LOGGER.info(
                    "Synthetic miner fixture: {} bronzePickaxeAdded={}",
                    player.getUsername(),
                    pickaxeAdded
                );
            } else if ("wander".equals(requestedBehavior)
                    || ("mixed-basic".equals(requestedBehavior) && i == 1)) {
                behavior = new WanderBehavior(1000L + i, anchor, 4);
            } else {
                behavior = new IdleBehavior();
            }
            final SyntheticActor actor = new SyntheticActor(player, behavior);
            population.add(actor);

            LOGGER.info(
                "Synthetic player online: {} (pid={}, behavior={}, x={}, y={})",
                player.getUsername(), player.getIndex(), behavior.getName(), player.getX(), player.getY()
            );
        }

        population.start();
        LOGGER.info(
            "Synthetic population ready: {} players (world total={})",
            count, server.getWorld().getPlayers().size()
        );
    }

    public static int stopIfRunning(final Server server) {
        return server.getSyntheticPopulationService().stopAll();
    }

    private static Player createSyntheticPlayer(final Server server, final int ordinal) {
        final String username = String.format("SynthBot%02d", ordinal);
        final long usernameHash = DataConversions.usernameToHash(username);
        final Player player = new Player(server.getWorld(), usernameHash);

        player.setAttribute("dummyplayer", true);
        player.setAttribute("syntheticplayer", true);
        player.setAttribute("syntheticOrdinal", ordinal);
        player.setDatabaseID(-ordinal);
        final int syntheticClientVersion = Integer.getInteger(CLIENT_VERSION_PROPERTY, 235);
        player.setClientVersion(syntheticClientVersion);
        player.setClientLimitations(
            ClientLimitations.forClientVersion(syntheticClientVersion)
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

        final int baseSpawnX = Integer.getInteger(
            SPAWN_X_PROPERTY,
            server.getConfig().RESPAWN_LOCATION_X
        );
        final int baseSpawnY = Integer.getInteger(
            SPAWN_Y_PROPERTY,
            server.getConfig().RESPAWN_LOCATION_Y
        );
        final int spawnX = baseSpawnX + ((ordinal - 1) % 5);
        final int spawnY = baseSpawnY + ((ordinal - 1) / 5);
        player.setLocation(Point.location(spawnX, spawnY), true);
        player.setLoggedIn(true);
        return player;
    }
}
