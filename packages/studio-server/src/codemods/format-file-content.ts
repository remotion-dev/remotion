// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type PrettierType = typeof import('prettier');

export const formatFileContent = async ({
	input,
	prettierConfigOverride,
}: {
	input: string;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{output: string; formatted: boolean}> => {
	let prettier: PrettierType | null = null;

	try {
		prettier = await import('prettier');
	} catch {
		return {
			output: input,
			formatted: false,
		};
	}

	const {format, resolveConfig, resolveConfigFile} = prettier as PrettierType;

	let prettierConfig: Record<string, unknown> | null;

	if (prettierConfigOverride !== undefined && prettierConfigOverride !== null) {
		prettierConfig = prettierConfigOverride;
	} else {
		const configFilePath = await resolveConfigFile();
		if (!configFilePath) {
			return {
				output: input,
				formatted: false,
			};
		}

		prettierConfig = await resolveConfig(configFilePath);
	}

	if (!prettierConfig) {
		return {
			output: input,
			formatted: false,
		};
	}

	const prettified = await format(input, {
		...prettierConfig,
		filepath: 'test.tsx',
		plugins: [],
		endOfLine: 'lf',
	});

	return {
		output: prettified,
		formatted: true,
	};
};
