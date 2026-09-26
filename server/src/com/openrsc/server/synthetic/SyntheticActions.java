package com.openrsc.server.synthetic;

import com.openrsc.server.external.GameObjectDef;
import com.openrsc.server.model.entity.GameObject;
import com.openrsc.server.model.entity.player.Player;
import com.openrsc.server.plugins.triggers.OpLocTrigger;

public final class SyntheticActions {
    private SyntheticActions() {
    }

    public static GameObject findNearestMineableRock(Player player) {
        GameObject nearest = null;
        int bestDistance = Integer.MAX_VALUE;

        for (GameObject object : player.getViewArea().getGameObjectsInView()) {
            if (player.getWorld().getServer().getEntityHandler().getObjectMiningDef(object.getID()) == null) {
                continue;
            }

            GameObjectDef def = object.getGameObjectDef();
            if (def == null || def.getCommand1() == null || !def.getCommand1().equalsIgnoreCase("mine")) {
                continue;
            }

            int distance = Math.max(
                Math.abs(player.getX() - object.getX()),
                Math.abs(player.getY() - object.getY())
            );
            if (distance < bestDistance) {
                bestDistance = distance;
                nearest = object;
            }
        }

        return nearest;
    }

    public static boolean interactObject(Player player, GameObject object, String command) {
        if (player.isBusy() || !player.withinRange(object, 1)) {
            return false;
        }

        player.click = 0;
        player.resetAll();
        return player.getWorld().getServer().getPluginHandler().handlePlugin(
            OpLocTrigger.class,
            player,
            new Object[]{player, object, command.toLowerCase()}
        );
    }
}
