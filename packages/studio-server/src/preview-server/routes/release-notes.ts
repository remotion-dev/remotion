import type {
	GetReleaseNotesRequest,
	GetReleaseNotesResponse,
} from '@remotion/studio-shared';
import semver from 'semver';
import type {ApiHandler} from '../api-types';

const githubApiVersion = '2022-11-28';
const releaseNotesTimeout = 5000;
const maximumReleaseNotes = 5;

export const getReleaseNotesHandler: ApiHandler<
	GetReleaseNotesRequest,
	GetReleaseNotesResponse
> = async ({input}) => {
	const currentVersion = semver.valid(input.currentVersion);
	const latestVersion = semver.valid(input.latestVersion);
	if (currentVersion === null || latestVersion === null) {
		throw new Error(
			`Invalid Remotion version range: ${input.currentVersion} to ${input.latestVersion}`,
		);
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), releaseNotesTimeout);

	try {
		const releaseResponse = await fetch(
			'https://api.github.com/repos/remotion-dev/remotion/releases?per_page=100',
			{
				headers: {
					accept: 'application/vnd.github+json',
					'user-agent': 'Remotion Studio',
					'x-github-api-version': githubApiVersion,
				},
				signal: controller.signal,
			},
		);

		if (!releaseResponse.ok) {
			return {hasMore: false, releases: []};
		}

		const githubReleases = (await releaseResponse.json()) as unknown;
		if (!Array.isArray(githubReleases)) {
			return {hasMore: false, releases: []};
		}

		const matchingReleases = githubReleases
			.flatMap((release) => {
				if (typeof release !== 'object' || release === null) {
					return [];
				}

				const {
					body,
					published_at: publishedAt,
					tag_name: tagName,
				} = release as Record<string, unknown>;
				if (typeof tagName !== 'string') {
					return [];
				}

				const version = semver.valid(
					tagName.startsWith('v') ? tagName.slice(1) : tagName,
				);
				if (
					version === null ||
					!semver.gt(version, currentVersion) ||
					!semver.lte(version, latestVersion)
				) {
					return [];
				}

				return [
					{
						body: typeof body === 'string' ? body : null,
						publishedAt: typeof publishedAt === 'string' ? publishedAt : null,
						version,
					},
				];
			})
			.sort((a, b) => semver.rcompare(a.version, b.version));

		const hasMore = matchingReleases.length > maximumReleaseNotes;
		const releases = await Promise.all(
			matchingReleases.slice(0, maximumReleaseNotes).map(async (release) => {
				if (release.body === null || release.body.trim() === '') {
					return {
						publishedAt: release.publishedAt,
						releaseNotesHtml: null,
						version: release.version,
					};
				}

				try {
					const markdownResponse = await fetch(
						'https://api.github.com/markdown',
						{
							body: JSON.stringify({
								context: 'remotion-dev/remotion',
								mode: 'gfm',
								text: release.body,
							}),
							headers: {
								accept: 'text/html',
								'content-type': 'application/json',
								'user-agent': 'Remotion Studio',
								'x-github-api-version': githubApiVersion,
							},
							method: 'POST',
							signal: controller.signal,
						},
					);

					if (!markdownResponse.ok) {
						return {
							publishedAt: release.publishedAt,
							releaseNotesHtml: null,
							version: release.version,
						};
					}

					const releaseNotesHtml = await markdownResponse.text();
					return {
						publishedAt: release.publishedAt,
						releaseNotesHtml: releaseNotesHtml || null,
						version: release.version,
					};
				} catch {
					return {
						publishedAt: release.publishedAt,
						releaseNotesHtml: null,
						version: release.version,
					};
				}
			}),
		);

		return {hasMore, releases};
	} catch {
		return {hasMore: false, releases: []};
	} finally {
		clearTimeout(timeout);
	}
};
