export const getConnectedCompositions = <
	Composition extends {readonly componentFromProps?: unknown},
>({
	compositions,
	singleChildComponent,
}: {
	readonly compositions: readonly Composition[];
	readonly singleChildComponent: unknown;
}): Composition[] => {
	if (
		singleChildComponent === null ||
		typeof singleChildComponent === 'undefined'
	) {
		return [];
	}

	return compositions.filter(
		(composition) => composition.componentFromProps === singleChildComponent,
	);
};
