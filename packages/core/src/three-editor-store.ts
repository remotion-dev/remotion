export type ThreeEditorMode = 'translate' | 'rotate' | 'scale';
export type ThreeEditorVector3 = readonly [number, number, number];

export type ThreeEditorTransform = {
	readonly position: ThreeEditorVector3;
	readonly rotation: ThreeEditorVector3;
	readonly scale: ThreeEditorVector3;
};

export type ThreeEditorSnapshot = {
	readonly selectedSequenceId: string | null;
	readonly registeredSequenceIds: readonly string[];
	readonly mode: ThreeEditorMode;
	readonly referencePosition: ThreeEditorVector3 | null;
	readonly availableModes: readonly ThreeEditorMode[];
};

type ThreeEditorHandlers = {
	readonly select: (sequenceId: string) => void;
	readonly preview: (
		sequenceId: string,
		mode: ThreeEditorMode,
		transform: ThreeEditorTransform,
		frame: number,
	) => void;
	readonly commit: (
		sequenceId: string,
		mode: ThreeEditorMode,
		transform: ThreeEditorTransform,
		frame: number,
	) => void;
};

const listeners = new Set<() => void>();
const registeredSequenceIds = new Set<string>();
let handlers: ThreeEditorHandlers | null = null;
let snapshot: ThreeEditorSnapshot = {
	selectedSequenceId: null,
	registeredSequenceIds: [],
	mode: 'translate',
	referencePosition: null,
	availableModes: [],
};

const publish = (next: ThreeEditorSnapshot) => {
	snapshot = next;
	for (const listener of listeners) listener();
};

/** Studio-only bridge between the timeline React tree and an R3F canvas. */
export const ThreeEditorStore = {
	subscribe: (listener: () => void) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},
	getSnapshot: () => snapshot,
	register: (sequenceId: string) => {
		registeredSequenceIds.add(sequenceId);
		publish({...snapshot, registeredSequenceIds: [...registeredSequenceIds]});
		return () => {
			registeredSequenceIds.delete(sequenceId);
			publish({
				...snapshot,
				registeredSequenceIds: [...registeredSequenceIds],
				selectedSequenceId:
					snapshot.selectedSequenceId === sequenceId
						? null
						: snapshot.selectedSequenceId,
			});
		};
	},
	setSelectedSequence: (
		sequenceId: string | null,
		referencePosition: ThreeEditorVector3 | null,
		availableModes: readonly ThreeEditorMode[],
	) => {
		const previous = snapshot.referencePosition;
		if (
			snapshot.selectedSequenceId === sequenceId &&
			snapshot.availableModes.length === availableModes.length &&
			snapshot.availableModes.every(
				(mode, index) => mode === availableModes[index],
			) &&
			(previous === referencePosition ||
				(previous !== null &&
					referencePosition !== null &&
					previous.every((value, index) => value === referencePosition[index])))
		) {
			return;
		}

		publish({
			...snapshot,
			selectedSequenceId: sequenceId,
			referencePosition,
			availableModes,
			mode: availableModes.includes(snapshot.mode)
				? snapshot.mode
				: (availableModes[0] ?? snapshot.mode),
		});
	},
	setMode: (mode: ThreeEditorMode) => publish({...snapshot, mode}),
	setHandlers: (next: ThreeEditorHandlers) => {
		handlers = next;
		return () => {
			if (handlers === next) handlers = null;
		};
	},
	requestSelect: (sequenceId: string) => handlers?.select(sequenceId),
	preview: (
		sequenceId: string,
		mode: ThreeEditorMode,
		transform: ThreeEditorTransform,
		frame: number,
	) => handlers?.preview(sequenceId, mode, transform, frame),
	commit: (
		sequenceId: string,
		mode: ThreeEditorMode,
		transform: ThreeEditorTransform,
		frame: number,
	) => handlers?.commit(sequenceId, mode, transform, frame),
};
