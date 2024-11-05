export const calculateProgress = ({
	millisecondsWritten,
	expectedOutputMilliseconds,
}: {
	millisecondsWritten: number;
	expectedOutputMilliseconds: number | null;
}) => {
	if (expectedOutputMilliseconds === null) {
		return null;
	}

	return millisecondsWritten / expectedOutputMilliseconds;
};
