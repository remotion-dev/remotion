// Explorer needs `/select,<path>` as one argv entry. Two args get quoted
// separately on Windows and the selection target is ignored.
export const getWindowsExplorerSelectArgs = (
	resolvedPath: string,
): string[] => {
	return [`/select,${resolvedPath}`];
};
