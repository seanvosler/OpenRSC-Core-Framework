package com.openrsc.server.admin;

import com.openrsc.server.Server;
import com.openrsc.server.plugins.MiniGameInterface;
import com.openrsc.server.plugins.QuestInterface;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Read-only plugin/content inventory for one OpenRSC server instance.
 */
public final class PluginInventoryStatus {

	private final String serverName;
	private final boolean reloading;
	private final int instantiatedPlugins;
	private final int triggerTypes;
	private final int quests;
	private final int minigames;
	private final int shops;
	private final List<PluginSummary> plugins;
	private PluginInventoryStatus(final Server server) {
		this.serverName = server.getName();
		this.reloading = server.getPluginHandler().isReloading();

		final Set<Class<?>> pluginTypes = server.getPluginHandler().getPluginTypesSnapshot();
		final Map<Class<?>, Set<Class<?>>> triggerRegistrations =
			server.getPluginHandler().getTriggerRegistrationsSnapshot();

		this.instantiatedPlugins = pluginTypes.size();
		this.triggerTypes = countDistinctTriggerTypes(triggerRegistrations);
		this.quests = server.getWorld().getQuests().size();
		this.minigames = server.getWorld().getMiniGames().size();
		this.shops = server.getWorld().getShops().size();

		final Map<Class<?>, QuestInterface> questsByType = new LinkedHashMap<>();
		for (final QuestInterface quest : server.getWorld().getQuests()) {
			questsByType.put(quest.getClass(), quest);
		}

		final Map<Class<?>, MiniGameInterface> minigamesByType = new LinkedHashMap<>();
		for (final MiniGameInterface minigame : server.getWorld().getMiniGames()) {
			minigamesByType.put(minigame.getClass(), minigame);
		}

		final List<Class<?>> sortedTypes = new ArrayList<>(pluginTypes);
		sortedTypes.sort(Comparator.comparing(Class::getName));

		this.plugins = new ArrayList<>();
		for (final Class<?> pluginType : sortedTypes) {
			this.plugins.add(
				PluginSummary.from(
					pluginType,
					triggerRegistrations.getOrDefault(pluginType, Collections.emptySet()),
					questsByType.get(pluginType),
					minigamesByType.get(pluginType)
				)
			);
		}
	}
	public static PluginInventoryStatus from(final Server server) {
		return new PluginInventoryStatus(server);
	}

	private static int countDistinctTriggerTypes(final Map<Class<?>, Set<Class<?>>> registrations) {
		final Set<Class<?>> distinct = new java.util.HashSet<>();
		for (final Set<Class<?>> triggerTypes : registrations.values()) {
			distinct.addAll(triggerTypes);
		}
		return distinct.size();
	}

	public JSONObject toJson() {
		final JSONArray pluginJson = new JSONArray();
		for (final PluginSummary plugin : plugins) {
			pluginJson.put(plugin.toJson());
		}

		return new JSONObject()
			.put("serverName", serverName)
			.put("reloading", reloading)
			.put("instantiatedPlugins", instantiatedPlugins)
			.put("triggerTypes", triggerTypes)
			.put("quests", quests)
			.put("minigames", minigames)
			.put("shops", shops)
			.put("plugins", pluginJson);
	}
}
