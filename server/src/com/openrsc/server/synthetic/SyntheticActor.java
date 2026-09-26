package com.openrsc.server.synthetic;

import com.openrsc.server.model.entity.player.Player;
import com.openrsc.server.synthetic.behavior.SyntheticBehavior;

public final class SyntheticActor {
    private final Player player;
    private final SyntheticBehavior behavior;
    private String state = "created";
    private long decisionCount = 0;

    public SyntheticActor(Player player, SyntheticBehavior behavior) {
        this.player = player;
        this.behavior = behavior;
    }

    public void start() {
        behavior.onStart(this);
    }

    public void tick() {
        decisionCount++;
        behavior.onTick(this);
    }

    public void stop() {
        behavior.onStop(this);
    }

    public Player getPlayer() {
        return player;
    }

    public SyntheticBehavior getBehavior() {
        return behavior;
    }

    public String getBehaviorName() {
        return behavior.getName();
    }

    public long getDecisionCount() {
        return decisionCount;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
        player.setAttribute("syntheticBehavior", getBehaviorName());
        player.setAttribute("syntheticState", state);
    }
}
