import {useEffect, useState} from 'react';

export const useModelCacheStatus = <Model extends string>({
	isModelCached,
	models,
	refreshKey,
}: {
	readonly isModelCached: (model: Model) => Promise<boolean>;
	readonly models: readonly {readonly name: Model}[];
	readonly refreshKey: string;
}): ReadonlySet<Model> => {
	const [cachedModels, setCachedModels] = useState<ReadonlySet<Model>>(
		new Set(),
	);

	useEffect(() => {
		let cancelled = false;
		Promise.all(
			models.map(async ({name}) => ({
				cached: await isModelCached(name),
				name,
			})),
		)
			.then((results) => {
				if (!cancelled) {
					const nextCachedModels = new Set<Model>();
					for (const result of results) {
						if (result.cached) {
							nextCachedModels.add(result.name);
						}
					}

					setCachedModels(nextCachedModels);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setCachedModels(new Set());
				}
			});

		return () => {
			cancelled = true;
		};
	}, [isModelCached, models, refreshKey]);

	return cachedModels;
};
