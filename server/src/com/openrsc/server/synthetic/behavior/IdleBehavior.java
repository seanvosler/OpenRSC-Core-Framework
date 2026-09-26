package com.openrsc.server.synthetic.behavior;

import com.openrsc.server.synthetic.SyntheticActor;

public final class IdleBehavior implements SyntheticBehavior {
    @Override
    public String getName() {
        return "IDLE";
    }

    @Override
    public void onStart(SyntheticActor actor) {
        actor.setState("idle");
    }

    @Override
    public void onTick(SyntheticActor actor) {
        actor.setState("idle");
    }

    @Override
    public void onStop(SyntheticActor actor) {
    }
}
