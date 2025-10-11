export const renderPartitions = ({
	frames,
	concurrency,
}: {
	frames: number[];
	concurrency: number;
}) => {
	const partitions: number[][] = [];
	let start = 0;

	for (let i = 0; i < concurrency; i++) {
		const end = start + Math.ceil((frames.length - start) / (concurrency - i));
		partitions.push(frames.slice(start, end));
		start = end;
	}

	return {
		partitions,
		getNextFrame: (pageIndex: number) => {
			if (partitions[pageIndex].length === 0) {
				const partitionLengths = partitions.map((p) => p.length);
				if (partitionLengths.every((p) => p === 0)) {
					throw new Error('No more frames to render');
				}

				let longestRemainingPartitionIndex = -1;
				for (let i = 0; i < partitions.length; i++) {
					if (longestRemainingPartitionIndex === -1) {
						longestRemainingPartitionIndex = i;
						continue;
					}

					if (
						partitions[i].length >
						partitions[longestRemainingPartitionIndex].length
					) {
						longestRemainingPartitionIndex = i;
					}
				}

				if (longestRemainingPartitionIndex === -1) {
					throw new Error('No more frames to render');
				}

				// Round up - let's say only one frame is left to render, we should take this one
				const slicePoint =
					Math.ceil(partitions[longestRemainingPartitionIndex].length / 2) -
					// but don't forget it's zero indexed :)
					1;

				partitions[pageIndex] =
					partitions[longestRemainingPartitionIndex].slice(slicePoint);
				partitions[longestRemainingPartitionIndex] = partitions[
					longestRemainingPartitionIndex
				].slice(0, slicePoint);
			}

			const value = partitions[pageIndex].shift();
			if (value === undefined) {
				throw new Error('No more frames to render');
			}

			return value;
		},
	};
};
