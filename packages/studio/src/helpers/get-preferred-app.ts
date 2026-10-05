export const getPreferredApp = <
	App extends {id: string; nameWithType: string},
>({
	installedApps,
	configuredId,
	runningIds,
	recentlyUsedIds,
	fallbackIds,
}: {
	installedApps: readonly App[];
	configuredId: string | null;
	runningIds: readonly string[];
	recentlyUsedIds: readonly string[];
	fallbackIds: readonly string[];
}): App | null => {
	const configuredApp = installedApps.find((app) => app.id === configuredId);
	if (configuredApp) {
		return configuredApp;
	}

	return (
		[...installedApps]
			.sort((a, b) => {
				const runningDifference =
					Number(runningIds.includes(b.id)) - Number(runningIds.includes(a.id));
				if (runningDifference !== 0) {
					return runningDifference;
				}

				for (const ids of [recentlyUsedIds, fallbackIds]) {
					const aIndex = ids.indexOf(a.id);
					const bIndex = ids.indexOf(b.id);
					const difference =
						(aIndex === -1 ? ids.length : aIndex) -
						(bIndex === -1 ? ids.length : bIndex);
					if (difference !== 0) {
						return difference;
					}
				}

				return a.nameWithType.localeCompare(b.nameWithType);
			})
			.at(0) ?? null
	);
};
