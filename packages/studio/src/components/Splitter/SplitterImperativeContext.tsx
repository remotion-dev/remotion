import React, {createContext, useMemo, useRef} from 'react';
import type {SplitterOrientation, SplitterPosition} from './SplitterContext';

export type SplitterState = SplitterPosition & {
	id: string;
	label: string;
	orientation: SplitterOrientation;
	isDragging: boolean;
};

type SplitterController = {
	getState: () => SplitterState | null;
	setPosition: (positionInPixels: number) => SplitterState;
};

type SplitterRegistry = {
	getSplitters: () => SplitterState[];
	setSplitterPosition: (id: string, positionInPixels: number) => SplitterState;
	registerSplitter: (id: string, controller: SplitterController) => () => void;
};

export const SplitterImperativeContext = createContext<SplitterRegistry>({
	getSplitters: () => [],
	setSplitterPosition: () => {
		throw new Error('Splitter is unavailable.');
	},
	registerSplitter: () => () => undefined,
});

export const SplitterImperativeProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const controllers = useRef(new Map<string, SplitterController>());
	const value = useMemo((): SplitterRegistry => {
		return {
			getSplitters: () => {
				return [...controllers.current.values()].flatMap((controller) => {
					const state = controller.getState();
					return state === null ? [] : [state];
				});
			},
			setSplitterPosition: (id, positionInPixels) => {
				if (!Number.isFinite(positionInPixels)) {
					throw new Error('Splitter position must be a finite number.');
				}

				const controller = controllers.current.get(id);
				if (!controller) {
					throw new Error(`Splitter ${id} is unavailable.`);
				}

				return controller.setPosition(positionInPixels);
			},
			registerSplitter: (id, controller) => {
				controllers.current.set(id, controller);
				return () => {
					if (controllers.current.get(id) === controller) {
						controllers.current.delete(id);
					}
				};
			},
		};
	}, []);

	return (
		<SplitterImperativeContext.Provider value={value}>
			{children}
		</SplitterImperativeContext.Provider>
	);
};
