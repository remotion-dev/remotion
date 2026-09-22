export const sortItemsByCommitOrder = <T>(
	items: readonly T[],
	getOrder: (item: T) => number | null,
): T[] => {
	return items
		.map((item, internalOrder) => ({
			item,
			internalOrder,
			commitOrder: getOrder(item),
		}))
		.sort((a, b) => {
			if (a.commitOrder === null && b.commitOrder === null) {
				return a.internalOrder - b.internalOrder;
			}

			if (a.commitOrder === null) {
				return 1;
			}

			if (b.commitOrder === null) {
				return -1;
			}

			return a.commitOrder - b.commitOrder || a.internalOrder - b.internalOrder;
		})
		.map(({item}) => item);
};
