export type ConfigFileChangeType = 'runtime' | 'reload' | 'restart';

export const getConfigFileChangeMessage = (
	changeType: ConfigFileChangeType,
): string => {
	if (changeType === 'restart') {
		return 'Restart Studio to apply config file changes';
	}

	if (changeType === 'reload') {
		return 'Reload page to apply config file changes';
	}

	return 'Config file changed';
};
