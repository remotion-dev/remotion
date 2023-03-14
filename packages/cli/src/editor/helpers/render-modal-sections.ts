import type {Codec} from '@remotion/renderer';
import {useMemo, useState} from 'react';
import type {RenderType} from '../components/RenderModal/RenderModalAdvanced';

type Section = 'general' | 'picture' | 'advanced' | 'gif' | 'audio';

export const useRenderModalSections = (
	renderMode: RenderType,
	codec: Codec
) => {
	const [selectedTab, setTab] = useState<Section>('general');

	const shownTabs = useMemo((): Section[] => {
		if (renderMode === 'audio') {
			return ['general', 'audio', 'advanced'];
		}

		if (renderMode === 'still') {
			return ['general', 'picture', 'advanced'];
		}

		if (renderMode === 'video') {
			if (codec === 'gif') {
				return ['general', 'picture', 'audio', 'gif', 'advanced'];
			}

			return ['general', 'picture', 'audio', 'advanced'];
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
