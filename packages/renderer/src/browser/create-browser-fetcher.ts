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

import {
	download,
	getDownloadHost,
	getDownloadsFolder,
	getFolderPath,
	getPlatform,
	getRevisionInfo,
	localRevisions,
	removeBrowser,
} from './BrowserFetcher';
import type {Product} from './Product';
import {PUPPETEER_REVISIONS} from './revisions';

const supportedProducts = {
	chrome: 'Chromium',
	firefox: 'Firefox Nightly',
} as const;

function getRevision(product: Product): string {
	if (product === 'chrome') {
		return PUPPETEER_REVISIONS.chromium;
	}

	throw new Error(`Unsupported product ${product}`);
}

export function downloadBrowser(product: Product): Promise<void> {
	const revision = getRevision(product);

	const revisionInfo = getRevisionInfo(revision, product);

	function onSuccess(_localRevisions: string[]): void {
		console.log(
			`${supportedProducts[product]} (${revisionInfo.revision}) downloaded to ${revisionInfo.folderPath}`
		);
		_localRevisions = _localRevisions.filter((__revision) => {
			return __revision !== revisionInfo.revision;
		});
		const cleanupOldVersions = _localRevisions.map((__revision) => {
			return removeBrowser(
				__revision,
				getFolderPath(
					revision,
					getDownloadsFolder(product),
					getPlatform(product)
				)
			);
		});
		Promise.all([...cleanupOldVersions]);
	}

	function onError(error: Error) {
		console.error(
			`ERROR: Failed to set up ${supportedProducts[product]} r${revision}! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download.`
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

	return download(
		revisionInfo.revision,
		onProgress,
		product,
		getPlatform(product),
		getDownloadHost(product),
		getDownloadsFolder(product)
	)
		.then(() => {
			return localRevisions(
				getDownloadsFolder(product),
				product,
				getPlatform(product)
			);
		})
		.then(onSuccess)
		.catch(onError);
}

function toMegabytes(bytes: number) {
	const mb = bytes / 1024 / 1024;
	return `${Math.round(mb * 10) / 10} Mb`;
}
