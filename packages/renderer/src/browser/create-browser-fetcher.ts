/**
 * Copyright 2020 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {puppeteer} from './node';
import type {Product} from './Product';
import {PUPPETEER_REVISIONS} from './revisions';

const supportedProducts = {
	chrome: 'Chromium',
	firefox: 'Firefox Nightly',
} as const;

export async function downloadBrowser(product: Product): Promise<void> {
	const browserFetcher = puppeteer.createBrowserFetcher({
		product,
		path: null,
		platform: null,
	});
	const revision = await getRevision();
	await fetchBinary(revision);

	function getRevision(): string {
		if (product === 'chrome') {
			return PUPPETEER_REVISIONS.chromium;
		}

		throw new Error(`Unsupported product ${product}`);
	}

	function fetchBinary(_revision: string) {
		const revisionInfo = browserFetcher.revisionInfo(_revision);

		// Do nothing if the revision is already downloaded.
		if (revisionInfo.local) {
			console.log(
				`${supportedProducts[product]} is already in ${revisionInfo.folderPath}; skipping download.`
			);
			return;
		}

		function onSuccess(localRevisions: string[]): void {
			console.log(
				`${supportedProducts[product]} (${revisionInfo.revision}) downloaded to ${revisionInfo.folderPath}`
			);
			localRevisions = localRevisions.filter((__revision) => {
				return __revision !== revisionInfo.revision;
			});
			const cleanupOldVersions = localRevisions.map((__revision) => {
				return browserFetcher.remove(__revision);
			});
			Promise.all([...cleanupOldVersions]);
		}

		function onError(error: Error) {
			console.error(
				`ERROR: Failed to set up ${supportedProducts[product]} r${_revision}! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download.`
			);
			console.error(error);
			process.exit(1);
		}

		function onProgress(downloadedBytes: number, totalBytes: number) {
			console.log(
				'Downloading',
				supportedProducts[product],
				toMegabytes(downloadedBytes) + '/' + toMegabytes(totalBytes)
			);
		}

		return browserFetcher
			.download(revisionInfo.revision, onProgress)
			.then(() => {
				return browserFetcher.localRevisions();
			})
			.then(onSuccess)
			.catch(onError);
	}

	function toMegabytes(bytes: number) {
		const mb = bytes / 1024 / 1024;
		return `${Math.round(mb * 10) / 10} Mb`;
	}
}
