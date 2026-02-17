import type {PromptSubmission} from './prompt-types';

export const formatLikeCount = (n: number): string => {
	if (n < 1000) return String(n);
	if (n < 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
	if (n < 1000000) return `${Math.floor(n / 1000)}k`;
	return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
};

const LIKED_KEY = 'remotion-prompt-likes';

export const getLikedIds = (): Set<string> => {
	try {
		const stored = localStorage.getItem(LIKED_KEY);
		return new Set(stored ? JSON.parse(stored) : []);
	} catch {
		return new Set();
	}
};

export const saveLikedId = (id: string) => {
	const liked = getLikedIds();
	liked.add(id);
	try {
		localStorage.setItem(LIKED_KEY, JSON.stringify([...liked]));
	} catch {
		// Ignore storage errors to avoid breaking like functionality
	}
};

export const removeLikedId = (id: string) => {
	const liked = getLikedIds();
	liked.delete(id);
	try {
		localStorage.setItem(LIKED_KEY, JSON.stringify([...liked]));
	} catch {
		// Ignore storage errors to avoid breaking like functionality
	}
};

export const getAvatarUrl = (s: PromptSubmission): string | null => {
	if (s.customAvatarUrl) return s.customAvatarUrl;
	if (s.githubUsername) return `https://github.com/${s.githubUsername}.png`;
	if (s.xUsername) return `https://unavatar.io/x/${s.xUsername}`;
	return null;
};

export const getAuthorName = (s: PromptSubmission): string => {
	if (s.githubUsername) return s.githubUsername;
	if (s.xUsername) return `@${s.xUsername}`;
	return 'Anonymous';
};

export const getRelativeTime = (dateStr: string): string => {
	const now = Date.now();
	const then = new Date(dateStr).getTime();
	const seconds = Math.floor((now - then) / 1000);

	if (seconds < 60) return 'just now';
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
	const years = Math.floor(months / 12);
	return `${years} year${years === 1 ? '' : 's'} ago`;
};
