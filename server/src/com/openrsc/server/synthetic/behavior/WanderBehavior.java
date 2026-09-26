package com.openrsc.server.synthetic.behavior;

import com.openrsc.server.model.Point;
import com.openrsc.server.model.PathValidation;
import com.openrsc.server.model.entity.player.Player;
import com.openrsc.server.synthetic.SyntheticActor;

import java.util.Random;

public final class WanderBehavior implements SyntheticBehavior {
    private final Random random;
    private final Point anchor;
    private final int radius;

    public WanderBehavior(long seed, Point anchor, int radius) {
        this.random = new Random(seed);
        this.anchor = anchor;
        this.radius = radius;
    }

    @Override
    public String getName() {
        return "WANDER";
    }
    @Override
    public void onStart(SyntheticActor actor) {
        actor.setState("wandering");
    }

    @Override
    public void onTick(SyntheticActor actor) {
        Player player = actor.getPlayer();
        if (!player.finishedPath() || actor.getDecisionCount() % 3 != 0) {
            return;
        }

        for (int attempt = 0; attempt < 6; attempt++) {
            int x = anchor.getX() + random.nextInt(radius * 2 + 1) - radius;
            int y = anchor.getY() + random.nextInt(radius * 2 + 1) - radius;
            Point target = Point.location(x, y);
            if (PathValidation.checkPath(player.getWorld(), player.getLocation(), target)) {
                player.walk(x, y);
                actor.setState("walking:" + x + "," + y);
                return;
            }
        }

        actor.setState("wander-blocked");
    }

    @Override
    public void onStop(SyntheticActor actor) {
        actor.getPlayer().resetPath();
    }
}
