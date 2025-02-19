import React, {
	createContext,
	useCallback,
	useImperativeHandle,
	useMemo,
} from 'react';

// Key: Composition ID, Value: initialized defaultProps
type Props = Record<string, Record<string, unknown>>;

export type EditorPropsContextType = {
	props: Props;
	updateProps: (options: {
		id: string;
		defaultProps: Record<string, unknown>;
		newProps:
			| Record<string, unknown>
			| ((oldProps: Record<string, unknown>) => Record<string, unknown>);
	}) => void;
	resetUnsaved: () => void;
};

export const EditorPropsContext = createContext<EditorPropsContextType>({
	props: {},
	updateProps: () => {
		throw new Error('Not implemented');
	},
	resetUnsaved: () => {
		throw new Error('Not implemented');
	},
});

export const editorPropsProviderRef = React.createRef<{
	getProps: () => Props;
	setProps: React.Dispatch<React.SetStateAction<Props>>;
}>();

export const timeValueRef = React.createRef<{
	goToFrame: () => void;
	seek: (newFrame: number) => void;
}>();

export const EditorPropsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [props, setProps] = React.useState<Props>({});

	const updateProps = useCallback(
		({
			defaultProps,
			id,
			newProps,
		}: {
			id: string;
			defaultProps: unknown;
			newProps: unknown | ((oldProps: unknown) => unknown);
		}) => {
			setProps((prev) => {
				return {
					...prev,
					[id]:
						typeof newProps === 'function'
							? newProps(prev[id] ?? defaultProps)
							: newProps,
				};
			});
		},
		[],
	);

	const resetUnsaved = useCallback(() => {
		setProps({});
	}, []);

	useImperativeHandle(editorPropsProviderRef, () => {
		return {
			getProps: () => props,
			setProps,
		};
	}, [props]);

	const ctx = useMemo((): EditorPropsContextType => {
		return {props, updateProps, resetUnsaved};
	}, [props, resetUnsaved, updateProps]);

	return (
		<EditorPropsContext.Provider value={ctx}>
			{children}
		</EditorPropsContext.Provider>
	);
};
