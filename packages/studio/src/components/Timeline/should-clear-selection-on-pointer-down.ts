export const shouldClearSelectionOnPointerDown = (event: {
	readonly button: number;
}) => {
	return event.button === 0;
};
