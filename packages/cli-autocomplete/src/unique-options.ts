// eslint-disable-next-line @withfig/fig-linter/no-missing-default-export
export const uniqueOptions = (options: Fig.Option[]) => {
	const seenOptions: Record<string, Fig.Option> = {};
	const uniqueOptions: Fig.Option[] = [];

	for (const option of options) {
		if (typeof option.name !== "string") {
			throw new Error("this script does not support arrays of options");
		}
		if (!seenOptions[option.name]) {
			seenOptions[option.name] = option;
			uniqueOptions.push(option);
		}
	}

	return uniqueOptions;
};
