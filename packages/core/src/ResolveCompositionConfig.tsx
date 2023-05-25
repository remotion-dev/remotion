import type {PropsWithChildren} from 'react';
import {
	createContext,
	createRef,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import type {z} from 'zod';
import type {AnyComposition, TCompMetadata} from './CompositionManager.js';
import {CompositionManager} from './CompositionManager.js';
import {EditorPropsContext} from './EditorProps.js';
import {resolveVideoConfig} from './resolve-video-config.js';
import type {VideoConfig} from './video-config.js';

type ResolveCompositionConfigContect = Record<string, VideoConfig | undefined>;

const ResolveCompositionContext =
	createContext<ResolveCompositionConfigContect | null>(null);

export const resolveCompositionsRef = createRef<{
	setCurrentRenderModalComposition: (compositionId: string | null) => void;
}>();

export const ResolveCompositionConfig: React.FC<
	PropsWithChildren<{
		children: React.ReactNode;
	}>
> = ({children}) => {
	const existingContext = useContext(ResolveCompositionContext);
	if (existingContext) {
		throw new Error(
			'Cannot nest ResolveCompositionConfig components. You can only have one per project.'
		);
	}

	const [currentRenderModalComposition, setCurrentRenderModalComposition] =
		useState<string | null>(null);
	const {compositions, currentComposition} = useContext(CompositionManager);
	const selectedComposition = compositions.find(
		(c) => c.id === currentComposition
	);
	const renderModalComposition = compositions.find(
		(c) => c.id === currentRenderModalComposition
	);
	const {props: allEditorProps} = useContext(EditorPropsContext);

	useImperativeHandle(
		resolveCompositionsRef,
		() => {
			return {
				setCurrentRenderModalComposition: (id: string | null) => {
					setCurrentRenderModalComposition(id);
				},
			};
		},
		[]
	);

	const [resolvedConfigs, setResolvedConfigs] = useState<
		Record<string, VideoConfig | undefined>
	>({});

	const selectedEditorProps = useMemo(() => {
		return selectedComposition
			? allEditorProps[selectedComposition.id] ?? {}
			: {};
	}, [allEditorProps, selectedComposition]);

	const renderModalProps = useMemo(() => {
		return renderModalComposition
			? allEditorProps[renderModalComposition.id] ?? {}
			: {};
	}, [allEditorProps, renderModalComposition]);

	const doResolution = useCallback(
		(composition: AnyComposition, editorProps: object) => {
			setResolvedConfigs((r) => ({
				...r,
				[composition.id]: undefined,
			}));
			resolveVideoConfig({composition, editorProps}).then((c) => {
				setResolvedConfigs((r) => ({
					...r,
					[composition.id]: c,
				}));
			});
		},
		[]
	);

	const isTheSame = selectedComposition?.id === renderModalComposition?.id;

	useEffect(() => {
		if (selectedComposition) {
			doResolution(selectedComposition, selectedEditorProps);
		}
	}, [doResolution, selectedComposition, selectedEditorProps]);

	useEffect(() => {
		if (renderModalComposition && !isTheSame) {
			doResolution(renderModalComposition, renderModalProps);
		}
	}, [doResolution, isTheSame, renderModalComposition, renderModalProps]);

	return (
		<ResolveCompositionContext.Provider value={resolvedConfigs}>
			{children}
		</ResolveCompositionContext.Provider>
	);
};

export const useResolvedVideoConfig = (
	preferredCompositionId: string | null
) => {
	const context = useContext(
		ResolveCompositionContext
	) as ResolveCompositionConfigContect;
	const {compositions, currentComposition} = useContext(CompositionManager);
	const compositionId = preferredCompositionId ?? currentComposition;
	const composition = compositions.find((c) => c.id === compositionId);

	if (!composition) {
		return null;
	}

	// TODO: Might be out of date
	if (!context[composition.id]) {
		return null;
	}

	return context[composition.id] as TCompMetadata<z.ZodTypeAny, unknown>;
};
