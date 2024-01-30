import type {GitSource} from '@remotion/studio-shared';
import type {ComboboxValue} from '../components/NewComposition/ComboBox';

export const getGitSourceName = (gitSource: GitSource) => {
	if (gitSource.type === 'github') {
		return 'GitHub';
	}

	throw new Error('Unknown git source type');
};

export const getGitSourceRepoName = (gitSource: GitSource) => {
	if (gitSource.type === 'github') {
		return `https://github.com/${gitSource.org}/${gitSource.name}/tree/${gitSource.ref}`;
	}

	throw new Error('Unknown git source type');
};

export const getGitMenuItem = (): ComboboxValue | null => {
	if (!window.remotion_gitSource) {
		return null;
	}

	return {
		id: 'open-git-source',
		value: 'open-git-source',
		label: `Open ${getGitSourceName(window.remotion_gitSource)} Repo`,
		onClick: () => {
			window.open(
				getGitSourceRepoName(window.remotion_gitSource as GitSource),
				'_blank',
			);
		},
		type: 'item' as const,
		keyHint: null,
		leftItem: null,
		subMenu: null,
		quickSwitcherLabel: `Open ${getGitSourceName(
			window.remotion_gitSource,
		)} repo`,
	};
};
