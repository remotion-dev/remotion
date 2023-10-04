import type {Codec} from '@remotion/renderer';
import {useMemo, useState} from 'react';
import type {RenderType} from '../components/RenderModal/RenderModalAdvanced';

type Section = 'general' | 'picture' | 'advanced' | 'data' | 'gif' | 'audio';

export const useRenderModalSections = (
	renderMode: RenderType,
	codec: Codec,
) => {
	const [selectedTab, setTab] = useState<Section>('general');

	const shownTabs = useMemo((): Section[] => {
		if (renderMode === 'audio') {
			return ['general', 'data', 'audio', 'advanced'];
		}

		if (renderMode === 'still') {
			return ['general', 'data', 'picture', 'advanced'];
		}

		if (renderMode === 'sequence') {
			return ['general', 'data', 'picture', 'advanced'];
		}

		if (renderMode === 'video') {
			if (codec === 'gif') {
				return ['general', 'data', 'picture', 'gif', 'advanced'];
			}

			return ['general', 'data', 'picture', 'audio', 'advanced'];
		}

		throw new TypeError('Unknown render mode');
	}, [codec, renderMode]);

	const tab = useMemo(() => {
		if (!shownTabs.includes(selectedTab)) {
			return shownTabs[0];
		}

		return selectedTab;
	}, [selectedTab, shownTabs]);

	return useMemo(() => {
		return {tab, setTab, shownTabs};
	}, [tab, shownTabs]);
};
