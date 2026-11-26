import type {DoubleClickAction} from '@remotion/renderer';
import type {
	ConfigUpdate,
	SourceFileVersion,
	StudioRuntimeConfig,
	UpdateConfigResponse,
} from '@remotion/studio-shared';
import {useCallback, useState} from 'react';
import {showNotification} from './Notifications/NotificationCenter';

type Selection = {clientId: string; value: DoubleClickAction | null};

export const useDoubleClickActionSetting = ({
	clientId,
	config,
	reloadedVersion,
	saveConfigUpdates,
}: {
	clientId: string | null;
	config: StudioRuntimeConfig | null;
	reloadedVersion: SourceFileVersion | null;
	saveConfigUpdates: (updates: ConfigUpdate[]) => Promise<UpdateConfigResponse>;
}) => {
	const [saving, setSaving] = useState<Selection | null>(null);
	const [saved, setSaved] = useState<
		(Selection & {version: SourceFileVersion}) | null
	>(null);
	const setDoubleClickAction = useCallback(
		(value: DoubleClickAction | null) => {
			if (
				clientId === null ||
				!config?.configFileStudioSettings ||
				config.doubleClickAction?.source === 'cli'
			) {
				return;
			}

			const request = {clientId, value};
			setSaving(request);
			saveConfigUpdates([
				value === null
					? {setter: 'setDoubleClickAction', type: 'delete'}
					: {setter: 'setDoubleClickAction', type: 'set', value},
			])
				.then((response) => {
					if (!response.success) throw new Error(response.reason);
					if (response.sourceVersion) {
						setSaved({...request, version: response.sourceVersion});
					}
				})
				.catch((err: Error) => {
					showNotification(
						`Could not save double-click action: ${err.message}`,
						5000,
					);
				})
				.finally(() =>
					setSaving((current) => (current === request ? null : current)),
				);
		},
		[clientId, config, saveConfigUpdates],
	);

	const effectiveAction = config?.doubleClickAction;
	let doubleClickAction =
		config?.configFileStudioSettings?.doubleClickAction ??
		(effectiveAction?.value === 'open-in-editor'
			? null
			: (effectiveAction?.value ?? null));
	if (effectiveAction?.source === 'cli') {
		doubleClickAction = effectiveAction.value;
	} else if (saving && saving.clientId === clientId) {
		doubleClickAction = saving.value;
	} else if (
		saved &&
		saved.clientId === clientId &&
		(saved.version.sessionId !== reloadedVersion?.sessionId ||
			saved.version.revision > reloadedVersion.revision)
	) {
		doubleClickAction = saved.value;
	}

	return {doubleClickAction, setDoubleClickAction};
};
