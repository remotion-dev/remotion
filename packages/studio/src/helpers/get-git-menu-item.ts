import type {GitSource} from '@remotion/studio-shared';
import type {ComboboxValue} from '../components/NewComposition/ComboBox';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';

export const getGitSourceName = (gitSource: GitSource) => {
	if (gitSource.type === 'github') {
		return 'GitHub';
	}

	throw new Error('Unknown git source type');
};

export const getGitSourceBranchUrl = (gitSource: GitSource) => {
	if (gitSource.type === 'github') {
		const relativeFromGitRoot = gitSource.relativeFromGitRoot.replaceAll(
			'\\',
			'/',
		);

		return `https://github.com/${gitSource.org}/${gitSource.name}/tree/${
			gitSource.ref
		}${relativeFromGitRoot ? `/${relativeFromGitRoot}` : ''}`;
	}

	throw new Error('Unknown git source type');
};

export const getGitRefUrl = (
	gitSource: GitSource,
	originalLocation: OriginalPosition,
	remotionRoot: string,
) => {
	if (gitSource.type === 'github') {
		if (!originalLocation.source) {
			return getGitSourceBranchUrl(gitSource);
		}

		const source = originalLocation.source.replaceAll('\\', '/');
		const root = remotionRoot.replaceAll('\\', '/').replace(/\/+$/, '');
		const shouldCompareCaseInsensitive =
			/^[a-z]:\//i.test(source) || /^[a-z]:\//i.test(root);
		const comparableSource = shouldCompareCaseInsensitive
			? source.toLowerCase()
			: source;
		const comparableRoot = shouldCompareCaseInsensitive
			? root.toLowerCase()
			: root;
		const sourceIsInsideRoot =
			root.length > 0 && comparableSource.startsWith(`${comparableRoot}/`);
		const relativeSource = sourceIsInsideRoot
			? source.slice(root.length + 1)
			: source.replace(/^\.\/+/, '');

		if (/^(?:[a-z]:\/|\/)/i.test(relativeSource)) {
			return getGitSourceBranchUrl(gitSource);
		}

		const filePath = [
			gitSource.relativeFromGitRoot.replaceAll('\\', '/'),
			relativeSource,
		]
			.filter(Boolean)
			.map((part) => part.replace(/^\/+|\/+$/g, ''))
			.join('/');
		const lineSuffix = originalLocation.line
			? `#L${originalLocation.line}`
			: '';

		return `https://github.com/${gitSource.org}/${gitSource.name}/blob/${gitSource.ref}/${filePath}${lineSuffix}`;
	}

	throw new Error('Unknown git source type');
};

export const hasReadOnlyGitSource = () => {
	return Boolean(window.remotion_isReadOnlyStudio && window.remotion_gitSource);
};

export const openGitSource = ({
	folder,
	location,
}: {
	folder: boolean;
	location: OriginalPosition | null;
}) => {
	const gitSource = window.remotion_gitSource;
	if (!gitSource) {
		return;
	}

	window.open(
		folder || !location
			? getGitSourceBranchUrl(gitSource)
			: getGitRefUrl(gitSource, location, window.remotion_cwd),
		'_blank',
	);
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
				getGitSourceBranchUrl(window.remotion_gitSource as GitSource),
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
