package com.openrsc.server.admin;

import com.openrsc.server.plugins.AbstractRegistrar;
import com.openrsc.server.plugins.AbstractShop;
import com.openrsc.server.plugins.DefaultHandler;
import com.openrsc.server.plugins.MiniGameInterface;
import com.openrsc.server.plugins.QuestInterface;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;

/**
 * Transport-safe metadata for one instantiated OpenRSC plugin class.
 */
public final class PluginSummary {

	private final String className;
	private final String simpleName;
	private final String packageName;
	private final List<String> triggerNames;
	private final List<String> kinds;
	private final QuestMetadata quest;
	private final MiniGameMetadata minigame;
	private PluginSummary(
		final Class<?> pluginType,
		final Collection<Class<?>> triggerTypes,
		final QuestInterface quest,
		final MiniGameInterface minigame
	) {
		this.className = pluginType.getName();
		this.simpleName = pluginType.getSimpleName();
		final Package pluginPackage = pluginType.getPackage();
		this.packageName = pluginPackage == null ? "" : pluginPackage.getName();

		this.triggerNames = new ArrayList<>();
		for (final Class<?> triggerType : triggerTypes) {
			this.triggerNames.add(triggerType.getSimpleName());
		}
		this.triggerNames.sort(Comparator.naturalOrder());

		this.kinds = new ArrayList<>();
		if (QuestInterface.class.isAssignableFrom(pluginType)) {
			kinds.add("quest");
		}
		if (MiniGameInterface.class.isAssignableFrom(pluginType)) {
			kinds.add("minigame");
		}
		if (AbstractShop.class.isAssignableFrom(pluginType)) {
			kinds.add("shop");
		}
		if (AbstractRegistrar.class.isAssignableFrom(pluginType)) {
			kinds.add("registrar");
		}
		if (DefaultHandler.class.isAssignableFrom(pluginType)) {
			kinds.add("default-handler");
		}
		if (!triggerNames.isEmpty()) {
			kinds.add("trigger-handler");
		}
		if (kinds.isEmpty()) {
			kinds.add("plugin");
		}

		this.quest = quest == null ? null : QuestMetadata.from(quest);
		this.minigame = minigame == null ? null : MiniGameMetadata.from(minigame);
	}
	public static PluginSummary from(
		final Class<?> pluginType,
		final Collection<Class<?>> triggerTypes,
		final QuestInterface quest,
		final MiniGameInterface minigame
	) {
		return new PluginSummary(pluginType, triggerTypes, quest, minigame);
	}

	public JSONObject toJson() {
		final JSONObject json = new JSONObject()
			.put("className", className)
			.put("simpleName", simpleName)
			.put("packageName", packageName)
			.put("triggerNames", new JSONArray(triggerNames))
			.put("kinds", new JSONArray(kinds));

		json.put("quest", quest == null ? JSONObject.NULL : quest.toJson());
		json.put("minigame", minigame == null ? JSONObject.NULL : minigame.toJson());
		return json;
	}

	private static final class QuestMetadata {
		private final int id;
		private final String name;
		private final int points;
		private final boolean members;

		private QuestMetadata(final int id, final String name, final int points, final boolean members) {
			this.id = id;
			this.name = name;
			this.points = points;
			this.members = members;
		}

		private static QuestMetadata from(final QuestInterface quest) {
			return new QuestMetadata(
				quest.getQuestId(),
				quest.getQuestName(),
				quest.getQuestPoints(),
				quest.isMembers()
			);
		}

		private JSONObject toJson() {
			return new JSONObject()
				.put("id", id)
				.put("name", name)
				.put("points", points)
				.put("members", members);
		}
	}
	private static final class MiniGameMetadata {
		private final int id;
		private final String name;
		private final boolean members;

		private MiniGameMetadata(final int id, final String name, final boolean members) {
			this.id = id;
			this.name = name;
			this.members = members;
		}

		private static MiniGameMetadata from(final MiniGameInterface minigame) {
			return new MiniGameMetadata(
				minigame.getMiniGameId(),
				minigame.getMiniGameName(),
				minigame.isMembers()
			);
		}

		private JSONObject toJson() {
			return new JSONObject()
				.put("id", id)
				.put("name", name)
				.put("members", members);
		}
	}
}
