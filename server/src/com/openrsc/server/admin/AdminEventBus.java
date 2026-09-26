package com.openrsc.server.admin;

import com.openrsc.server.Server;
import com.openrsc.server.model.entity.player.Player;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Small process-local event bus for dashboard consumers.
 *
 * Publishing is non-blocking. Each subscriber has a bounded queue; when a
 * subscriber falls behind, its oldest queued event is discarded.
 */
public final class AdminEventBus {

	private static final int RECENT_EVENT_LIMIT = 200;
	private static final int SUBSCRIBER_QUEUE_LIMIT = 100;
	private static final AdminEventBus INSTANCE = new AdminEventBus();

	private final AtomicLong nextId = new AtomicLong(1);
	private final Deque<AdminEvent> recentEvents = new ArrayDeque<>();
	private final CopyOnWriteArrayList<Subscription> subscriptions = new CopyOnWriteArrayList<>();

	private AdminEventBus() {
	}

	public static AdminEventBus getInstance() {
		return INSTANCE;
	}
	public void publishPlayerLoggedIn(final Server server, final Player player) {
		publish("player.logged_in", server.getName(), PlayerSummary.from(player).toJson());
	}

	public void publishPlayerLoggedOut(final Server server, final Player player) {
		publish("player.logged_out", server.getName(), PlayerSummary.from(player).toJson());
	}

	public void publish(final String type, final String serverName, final org.json.JSONObject data) {
		final AdminEvent event = new AdminEvent(
			nextId.getAndIncrement(),
			type,
			System.currentTimeMillis(),
			serverName,
			data
		);

		synchronized (recentEvents) {
			recentEvents.addLast(event);
			while (recentEvents.size() > RECENT_EVENT_LIMIT) {
				recentEvents.removeFirst();
			}
		}

		for (final Subscription subscription : subscriptions) {
			subscription.offer(event);
		}
	}

	public List<AdminEvent> getRecentSnapshot() {
		synchronized (recentEvents) {
			return Collections.unmodifiableList(new ArrayList<>(recentEvents));
		}
	}

	public Subscription subscribe() {
		final Subscription subscription = new Subscription(this);
		subscriptions.add(subscription);
		return subscription;
	}

	private void unsubscribe(final Subscription subscription) {
		subscriptions.remove(subscription);
	}
	public static final class Subscription implements AutoCloseable {

		private final AdminEventBus owner;
		private final ArrayBlockingQueue<AdminEvent> queue =
			new ArrayBlockingQueue<>(SUBSCRIBER_QUEUE_LIMIT);
		private volatile boolean closed;

		private Subscription(final AdminEventBus owner) {
			this.owner = owner;
		}

		private void offer(final AdminEvent event) {
			if (closed) {
				return;
			}

			if (!queue.offer(event)) {
				queue.poll();
				queue.offer(event);
			}
		}

		public AdminEvent poll(final long timeout, final TimeUnit unit) throws InterruptedException {
			return queue.poll(timeout, unit);
		}

		@Override
		public void close() {
			if (!closed) {
				closed = true;
				owner.unsubscribe(this);
				queue.clear();
			}
		}
	}
}
