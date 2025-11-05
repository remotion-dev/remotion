import {
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {AnyZodObject} from 'zod';
import type {TComposition} from './CompositionManager';
import {compositionsRef, type AnyComposition} from './CompositionManager';
import type {
	CanvasContent,
	CompositionManagerContext,
	CompositionManagerSetters,
} from './CompositionManagerContext';
import {
	CompositionManager,
	CompositionSetters,
} from './CompositionManagerContext';
import type {BaseMetadata} from './CompositionManagerContext.js';
import type {TFolder} from './Folder';

export const CompositionManagerProvider = ({
	children,
	onlyRenderComposition,
	currentCompositionMetadata,
}: {
	readonly children: React.ReactNode;
	readonly onlyRenderComposition: string | null;
	readonly currentCompositionMetadata: BaseMetadata | null;
}) => {
	const [folders, setFolders] = useState<TFolder[]>([]);
	const [canvasContent, setCanvasContent] = useState<CanvasContent | null>(
		null,
	);
	const [compositions, setCompositions] = useState<AnyComposition[]>([]);

	// CompositionManagerProvider state
	const currentcompositionsRef = useRef<AnyComposition[]>(compositions);

	const updateCompositions = useCallback(
		(updateComps: (comp: AnyComposition[]) => AnyComposition[]) => {
			setCompositions((comps) => {
				const updated = updateComps(comps);
				currentcompositionsRef.current = updated;
				return updated;
			});
		},
		[],
	);

	const registerComposition = useCallback(
		<Schema extends AnyZodObject, Props extends Record<string, unknown>>(
			comp: TComposition<Schema, Props>,
		) => {
			updateCompositions((comps) => {
				if (comps.find((c) => c.id === comp.id)) {
					throw new Error(
						`Multiple composition with id ${comp.id} are registered.`,
					);
				}

				const value = [...comps, comp]
					.slice()

					.sort((a, b) => a.nonce - b.nonce) as AnyComposition[];
				return value;
			});
		},
		[updateCompositions],
	);

	const unregisterComposition = useCallback((id: string) => {
		setCompositions((comps) => {
			return comps.filter((c) => c.id !== id);
		});
	}, []);

	const registerFolder = useCallback((name: string, parent: string | null) => {
		setFolders((prevFolders) => {
			return [
				...prevFolders,
				{
					name,
					parent,
				},
			];
		});
	}, []);

	const unregisterFolder = useCallback(
		(name: string, parent: string | null) => {
			setFolders((prevFolders) => {
				return prevFolders.filter(
					(p) => !(p.name === name && p.parent === parent),
				);
			});
		},
		[],
	);

	useImperativeHandle(compositionsRef, () => {
		return {
			getCompositions: () => currentcompositionsRef.current,
		};
	}, []);

	const updateCompositionDefaultProps = useCallback(
		(id: string, newDefaultProps: Record<string, unknown>) => {
			setCompositions((comps) => {
				const updated = comps.map((c) => {
					if (c.id === id) {
						return {
							...c,
							defaultProps: newDefaultProps,
						};
					}

					return c;
				});

				return updated;
			});
		},
		[],
	);

	const compositionManagerSetters = useMemo((): CompositionManagerSetters => {
		return {
			registerComposition,
			unregisterComposition,
			registerFolder,
			unregisterFolder,
			setCanvasContent,
			updateCompositionDefaultProps,
			onlyRenderComposition,
		};
	}, [
		registerComposition,
		registerFolder,
		unregisterComposition,
		unregisterFolder,
		updateCompositionDefaultProps,
		onlyRenderComposition,
	]);

	const compositionManagerContextValue =
		useMemo((): CompositionManagerContext => {
			return {
				compositions,
				folders,
				currentCompositionMetadata,
				canvasContent,
			};
		}, [compositions, folders, currentCompositionMetadata, canvasContent]);

	return (
		<CompositionManager.Provider value={compositionManagerContextValue}>
			<CompositionSetters.Provider value={compositionManagerSetters}>
				{children}
			</CompositionSetters.Provider>
		</CompositionManager.Provider>
	);
};
