export const calculateProgress = ({
	millisecondsWritten,
	expectedOutputDurationInMs,
}: {
	millisecondsWritten: number;
	expectedOutputDurationInMs: number | null;
}) => {
	if (expectedOutputDurationInMs === null) {
		return null;
	}

	return millisecondsWritten / expectedOutputDurationInMs;
};
