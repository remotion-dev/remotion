import React, {useContext, useMemo, useSyncExternalStore} from 'react';
import type {SequenceControls} from './CompositionManager.js';
import type {InteractivitySchema} from './interactivity-schema.js';

export type InteractiveEditorValues = Readonly<Record<string, unknown>>;

export type InteractiveEditorConnection = {
	readonly select: () => void;
	readonly setHovered: (hovered: boolean) => void;
	readonly start: () => void;
	readonly preview: (values: InteractiveEditorValues) => void;
	readonly commit: (values: InteractiveEditorValues | null) => void;
	readonly cancel: () => void;
};

type InteractiveEditorState = {
	readonly selected: boolean;
	readonly hovered: boolean;
};

const IDLE_STATE: InteractiveEditorState = {selected: false, hovered: false};
const noopSubscribe = () => () => undefined;
const getIdleState = () => IDLE_STATE;

export type InteractiveEditorSlot = {
	readonly getState: () => InteractiveEditorState;
	readonly subscribe: (listener: () => void) => () => void;
	readonly setState: (state: InteractiveEditorState) => void;
	readonly getConnection: () => InteractiveEditorConnection | null;
	readonly setConnection: (
		connection: InteractiveEditorConnection | null,
	) => void;
};

export const createInteractiveEditorSlot = (): InteractiveEditorSlot => {
	let state = IDLE_STATE;
	let connection: InteractiveEditorConnection | null = null;
	const listeners = new Set<() => void>();
	return {
		getState: () => state,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		setState: (next) => {
			if (next.selected === state.selected && next.hovered === state.hovered) {
				return;
			}

			state = next;
			for (const listener of listeners) listener();
		},
		getConnection: () => connection,
		setConnection: (next) => {
			connection = next;
			if (next === null) {
				state = IDLE_STATE;
				for (const listener of listeners) listener();
			}
		},
	};
};

const slotsByRuntimeValues = new WeakMap<object, InteractiveEditorSlot>();

export const setInteractiveEditorSlot = (
	controls: Pick<SequenceControls, 'runtimeValues'>,
	slot: InteractiveEditorSlot,
) => {
	slotsByRuntimeValues.set(controls.runtimeValues, slot);
};

export const getInteractiveEditorSlot = (
	controls: Pick<SequenceControls, 'runtimeValues'>,
): InteractiveEditorSlot | null => {
	return slotsByRuntimeValues.get(controls.runtimeValues) ?? null;
};

export const InteractiveEditorContext =
	React.createContext<InteractiveEditorSlot | null>(null);

type SchemaValues<S extends InteractivitySchema> = {
	readonly [K in keyof S]?: unknown;
};

export type InteractiveEditor<S extends InteractivitySchema> = {
	/** Whether this element is selected in Remotion Studio. */
	readonly selected: boolean;
	/** Whether this element is hovered in Studio (canvas or timeline). */
	readonly hovered: boolean;
	/** Make this element the Studio selection, e.g. after a raycast hit. */
	readonly select: () => void;
	/** Report pointer hover from your own hit testing. */
	readonly setHovered: (hovered: boolean) => void;
	/**
	 * Begin an edit gesture. Call it from the pointer-down handler of your
	 * gizmo so Studio keeps the selection.
	 */
	readonly start: () => void;
	/** Show values live without writing to source. Starts a gesture if needed. */
	readonly preview: (values: SchemaValues<S>) => void;
	/** Save values (static or as keyframe at the current frame) as one undo step. Without values, saves the last preview. */
	readonly commit: (values?: SchemaValues<S>) => void;
	/** Discard the gesture's preview. */
	readonly cancel: () => void;
};

export const useInteractiveEditor = <
	S extends InteractivitySchema = InteractivitySchema,
>(): InteractiveEditor<S> => {
	const slot = useContext(InteractiveEditorContext);
	const state = useSyncExternalStore(
		slot?.subscribe ?? noopSubscribe,
		slot?.getState ?? getIdleState,
		getIdleState,
	);
	const actions = useMemo(() => {
		const connection = () => slot?.getConnection() ?? null;
		return {
			select: () => connection()?.select(),
			setHovered: (hovered: boolean) => connection()?.setHovered(hovered),
			start: () => connection()?.start(),
			preview: (values: SchemaValues<S>) =>
				connection()?.preview(values as InteractiveEditorValues),
			commit: (values?: SchemaValues<S>) =>
				connection()?.commit((values as InteractiveEditorValues) ?? null),
			cancel: () => connection()?.cancel(),
		};
	}, [slot]);
	return useMemo(
		() => ({...actions, selected: state.selected, hovered: state.hovered}),
		[actions, state],
	);
};
