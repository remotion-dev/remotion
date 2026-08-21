import type {LiteEvent, LiteFiberSummary} from 'react-scan/lite';

export type StoredReactScanEvent = {
	event: LiteEvent;
	eventIndex: number;
	receivedAt: string;
	sequence: number;
	sessionId: string;
};

type ComponentMetrics = {
	changedHooks: Map<number, number>;
	changedProps: Map<string, number>;
	contextChangeCount: number;
	firstMountCount: number;
	instanceIds: Set<number>;
	maxInclusiveDurationMs: number;
	name: string;
	ownerName: string | null;
	parentRenderCount: number;
	renderCount: number;
	source: LiteFiberSummary['source'];
	stateChangeCount: number;
	totalInclusiveDurationMs: number;
	totalSelfDurationMs: number;
};

const round = (value: number) => Number(value.toFixed(3));

const mapToRecord = <Key extends string | number>(map: Map<Key, number>) =>
	Object.fromEntries(
		[...map.entries()]
			.sort(([left], [right]) => String(left).localeCompare(String(right)))
			.map(([key, value]) => [String(key), value]),
	);

const getRenderedFibers = (tree: LiteFiberSummary[]) => {
	const rootStartTime = tree.find(
		(fiber) => fiber.depth === 0,
	)?.actualStartTime;
	if (rootStartTime === undefined) {
		return [];
	}

	const renderedFiberIndices = new Set<number>();
	for (let index = 0; index < tree.length; index++) {
		const fiber = tree[index];
		if (fiber.actualDuration > 0 && fiber.actualStartTime >= rootStartTime) {
			renderedFiberIndices.add(index);
		}
	}

	const childDurations = tree.map(() => 0);
	const ancestors: number[] = [];

	for (let index = 0; index < tree.length; index++) {
		const fiber = tree[index];

		while (
			ancestors.length > 0 &&
			tree[ancestors[ancestors.length - 1]].depth >= fiber.depth
		) {
			ancestors.pop();
		}

		if (renderedFiberIndices.has(index)) {
			for (
				let ancestorIndex = ancestors.length - 1;
				ancestorIndex >= 0;
				ancestorIndex--
			) {
				const parentIndex = ancestors[ancestorIndex];
				if (renderedFiberIndices.has(parentIndex)) {
					childDurations[parentIndex] += fiber.actualDuration;
					break;
				}
			}
		}

		ancestors.push(index);
	}

	return [...renderedFiberIndices].map((index) => ({
		fiber: tree[index],
		selfDuration: Math.max(
			0,
			tree[index].actualDuration - childDurations[index],
		),
	}));
};

const getComponentKey = (fiber: LiteFiberSummary) => {
	const source = fiber.source;
	if (!source) {
		return `${fiber.name}\0${fiber.ownerName ?? ''}`;
	}

	return [
		fiber.name,
		source.fileName,
		source.lineNumber ?? '',
		source.columnNumber ?? '',
	].join('\0');
};

export const summarizeReactScanEvents = (events: StoredReactScanEvent[]) => {
	const componentMetrics = new Map<string, ComponentMetrics>();
	const eventCounts = new Map<string, number>();
	const slowestCommits: Array<{
		durationMs: number;
		priorityName: string | null;
		renderedFiberCount: number;
		timestamp: number;
	}> = [];
	let commitCount = 0;
	let maxCommitDurationMs = 0;
	let totalCommitDurationMs = 0;
	const profilingHooksStatuses = new Map<
		string,
		{
			available: boolean;
			bundleType: number | null;
			count: number;
			reactVersion: string | null;
			reason: string | null;
		}
	>();

	for (const storedEvent of events) {
		const event = storedEvent.event;
		eventCounts.set(event.kind, (eventCounts.get(event.kind) ?? 0) + 1);

		if (event.kind === 'profiling-hooks-status') {
			const status = {
				available: event.available ?? false,
				bundleType: event.bundleType ?? null,
				count: 1,
				reactVersion: event.reactVersion ?? null,
				reason: event.reason ?? null,
			};
			const key = JSON.stringify(status);
			const existing = profilingHooksStatuses.get(key);
			if (existing) {
				existing.count++;
			} else {
				profilingHooksStatuses.set(key, status);
			}
		}

		if (event.kind !== 'commit' || !event.tree) {
			continue;
		}

		commitCount++;
		const renderedFibers = getRenderedFibers(event.tree);
		const commitDuration = Math.max(
			0,
			...event.tree
				.filter((fiber) => fiber.depth === 0)
				.map((fiber) => fiber.actualDuration),
		);
		totalCommitDurationMs += commitDuration;
		maxCommitDurationMs = Math.max(maxCommitDurationMs, commitDuration);
		slowestCommits.push({
			durationMs: round(commitDuration),
			priorityName: event.priorityName ?? null,
			renderedFiberCount: renderedFibers.length,
			timestamp: round(event.timestamp),
		});

		for (const {fiber, selfDuration} of renderedFibers) {
			const key = getComponentKey(fiber);
			let metrics = componentMetrics.get(key);
			if (!metrics) {
				metrics = {
					changedHooks: new Map(),
					changedProps: new Map(),
					contextChangeCount: 0,
					firstMountCount: 0,
					instanceIds: new Set(),
					maxInclusiveDurationMs: 0,
					name: fiber.name,
					ownerName: fiber.ownerName ?? null,
					parentRenderCount: 0,
					renderCount: 0,
					source: fiber.source ?? null,
					stateChangeCount: 0,
					totalInclusiveDurationMs: 0,
					totalSelfDurationMs: 0,
				};
				componentMetrics.set(key, metrics);
			}

			metrics.renderCount++;
			metrics.totalInclusiveDurationMs += fiber.actualDuration;
			metrics.totalSelfDurationMs += selfDuration;
			metrics.maxInclusiveDurationMs = Math.max(
				metrics.maxInclusiveDurationMs,
				fiber.actualDuration,
			);
			if (fiber.fiberId !== undefined) {
				metrics.instanceIds.add(fiber.fiberId);
			}

			const change = fiber.changeDescription;
			if (!change) {
				continue;
			}

			metrics.firstMountCount += Number(change.isFirstMount);
			metrics.stateChangeCount += Number(change.state);
			metrics.contextChangeCount += Number(change.context);
			metrics.parentRenderCount += Number(change.parent);
			for (const prop of change.props ?? []) {
				metrics.changedProps.set(
					prop,
					(metrics.changedProps.get(prop) ?? 0) + 1,
				);
			}
			for (const hook of change.hooks) {
				metrics.changedHooks.set(
					hook,
					(metrics.changedHooks.get(hook) ?? 0) + 1,
				);
			}
		}
	}

	const topComponents = [...componentMetrics.values()]
		.sort(
			(left, right) =>
				right.totalSelfDurationMs - left.totalSelfDurationMs ||
				right.totalInclusiveDurationMs - left.totalInclusiveDurationMs,
		)
		.slice(0, 100)
		.map((metrics) => ({
			averageInclusiveDurationMs: round(
				metrics.totalInclusiveDurationMs / metrics.renderCount,
			),
			changedHooks: mapToRecord(metrics.changedHooks),
			changedProps: mapToRecord(metrics.changedProps),
			contextChangeCount: metrics.contextChangeCount,
			firstMountCount: metrics.firstMountCount,
			instanceCount: metrics.instanceIds.size,
			maxInclusiveDurationMs: round(metrics.maxInclusiveDurationMs),
			name: metrics.name,
			ownerName: metrics.ownerName,
			parentRenderCount: metrics.parentRenderCount,
			renderCount: metrics.renderCount,
			source: metrics.source,
			stateChangeCount: metrics.stateChangeCount,
			totalInclusiveDurationMs: round(metrics.totalInclusiveDurationMs),
			totalSelfDurationMs: round(metrics.totalSelfDurationMs),
		}));

	return {
		commitCount,
		eventCount: events.length,
		eventCounts: mapToRecord(eventCounts),
		generatedAt: new Date().toISOString(),
		maxCommitDurationMs: round(maxCommitDurationMs),
		profilingHooksStatuses: [...profilingHooksStatuses.values()].sort(
			(left, right) => Number(left.available) - Number(right.available),
		),
		schemaVersion: 1,
		slowestCommits: slowestCommits
			.sort((left, right) => right.durationMs - left.durationMs)
			.slice(0, 25),
		topComponents,
		totalCommitDurationMs: round(totalCommitDurationMs),
	};
};
