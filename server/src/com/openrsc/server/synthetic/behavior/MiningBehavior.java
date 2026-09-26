package com.openrsc.server.synthetic.behavior;

import com.openrsc.server.constants.ItemId;
import com.openrsc.server.constants.Skill;
import com.openrsc.server.model.entity.GameObject;
import com.openrsc.server.model.entity.player.Player;
import com.openrsc.server.synthetic.SyntheticActions;
import com.openrsc.server.synthetic.SyntheticActor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Optional;

public final class MiningBehavior implements SyntheticBehavior {
    private static final Logger LOGGER = LogManager.getLogger();
    private GameObject target;
    private long lastMineDecision = -100;

    @Override
    public String getName() {
        return "MINER";
    }

    @Override
    public void onStart(SyntheticActor actor) {
        actor.setState("searching-rock");
    }

    @Override
    public void onTick(SyntheticActor actor) {
        final Player player = actor.getPlayer();

        if (player.isBusy() || !player.getOwnedPlugins().isEmpty()) {
            actor.setState("mining-plugin-active");
            return;
        }

        if (actor.getDecisionCount() - lastMineDecision < 3) {
            return;
        }

        if (target == null || player.getViewArea().getGameObject(
                target.getID(), target.getX(), target.getY()) == null) {
            target = SyntheticActions.findNearestMineableRock(player);
            if (target == null) {
                actor.setState("no-rock-in-view");
                return;
            }

            actor.setState("target-rock:" + target.getID() + "@" + target.getX() + "," + target.getY());
            LOGGER.info(
                "Synthetic miner {} targeted rock {} at ({},{})",
                player.getUsername(), target.getID(), target.getX(), target.getY()
            );
        }

        if (!player.withinRange(target, 1)) {
            if (player.finishedPath()) {
                player.walkToEntityAStar(target.getX(), target.getY());
                actor.setState("walking-to-rock:" + target.getX() + "," + target.getY());
            }
            return;
        }

        final int copperBefore = player.getCarriedItems().getInventory().countId(
            ItemId.COPPER_ORE.id(),
            Optional.of(false)
        );
        final int miningXpBefore = player.getSkills().getExperience(Skill.MINING.id());

        final boolean dispatched = SyntheticActions.interactObject(player, target, "mine");
        lastMineDecision = actor.getDecisionCount();
        actor.setState(dispatched ? "mining-dispatched" : "mining-not-dispatched");

        LOGGER.info(
            "Synthetic miner {} mining dispatch={} rock={} at ({},{}) copper={} miningXp={}",
            player.getUsername(),
            dispatched,
            target.getID(),
            target.getX(),
            target.getY(),
            copperBefore,
            miningXpBefore
        );

        target = null;
    }

    @Override
    public void onStop(SyntheticActor actor) {
        actor.getPlayer().resetPath();
    }
}
