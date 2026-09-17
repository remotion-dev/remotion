export type SettingsTab =
	| 'apps'
	| 'rendering'
	| 'studio'
	| 'packages'
	| 'models'
	| 'shortcuts'
	| 'skills'
	| 'license'
	| 'updates';

type StudioMode = {
	readonly isBrowserStudio: boolean;
	readonly previewServerConnected: boolean;
	readonly readOnlyStudio: boolean;
};

export const canEditStudioConfig = ({
	isBrowserStudio,
	previewServerConnected,
	readOnlyStudio,
}: StudioMode) => {
	return previewServerConnected && !readOnlyStudio && !isBrowserStudio;
};

export const canInstallPackagesInStudio = (studioMode: StudioMode) => {
	return studioMode.isBrowserStudio || canEditStudioConfig(studioMode);
};

export const getAvailableSettingsTabs = ({
	isBrowserStudio,
	packageManagerAvailable,
	previewServerConnected,
	readOnlyStudio,
	showUpdates,
}: StudioMode & {
	readonly packageManagerAvailable: boolean;
	readonly showUpdates: boolean;
}): SettingsTab[] => {
	const studioMode = {
		isBrowserStudio,
		previewServerConnected,
		readOnlyStudio,
	};
	const canEditConfig = canEditStudioConfig(studioMode);
	const canInstallPackages =
		canInstallPackagesInStudio(studioMode) &&
		(isBrowserStudio || packageManagerAvailable);

	return [
		...(canEditConfig ? (['studio', 'rendering'] as const) : []),
		'shortcuts',
		...(canInstallPackages ? (['packages'] as const) : []),
		...(canEditConfig ? (['skills'] as const) : []),
		...(isBrowserStudio || !readOnlyStudio ? (['models'] as const) : []),
		...(canEditConfig ? (['apps', 'license'] as const) : []),
		...(showUpdates ? (['updates'] as const) : []),
	];
};

export const getSafeSettingsTab = (
	requestedTab: SettingsTab,
	availableTabs: readonly SettingsTab[],
): SettingsTab => {
	return availableTabs.includes(requestedTab) ? requestedTab : 'shortcuts';
};
