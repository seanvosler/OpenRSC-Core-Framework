package com.openrsc.server.synthetic.behavior;

import com.openrsc.server.synthetic.SyntheticActor;

public interface SyntheticBehavior {
    String getName();

    void onStart(SyntheticActor actor);

    void onTick(SyntheticActor actor);

    void onStop(SyntheticActor actor);
}
