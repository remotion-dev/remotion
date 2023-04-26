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

export async function downloadBrowser(product: Product): Promise<void> {
	const revision = getRevision(product);
	const revisionInfo = getRevisionInfo(revision, product);

	try {
		await download(
			revisionInfo.revision,
			(downloadedBytes, totalBytes) => {
				console.log(
					'Downloading',
					supportedProducts[product],
					toMegabytes(downloadedBytes) + '/' + toMegabytes(totalBytes)
				);
			},
			product,
			getPlatform(product),
			getDownloadHost(product),
			getDownloadsFolder(product)
		);
		const _localRevisions = await localRevisions(
			getDownloadsFolder(product),
			product,
			getPlatform(product)
		);

		console.log(
			`${supportedProducts[product]} (${revisionInfo.revision}) downloaded to ${revisionInfo.folderPath}`
		);
		await Promise.all(
			_localRevisions
				.filter((__revision) => {
					return __revision !== revisionInfo.revision;
				})
				.map((__revision) => {
					return removeBrowser(
						__revision,
						getFolderPath(
							revision,
							getDownloadsFolder(product),
							getPlatform(product)
						)
					);
				})
		);
	} catch (err) {
		throw new Error(
			`Failed to set up ${supportedProducts[product]} r${revision}! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download.`
		);
	}
}

function toMegabytes(bytes: number) {
	const mb = bytes / 1024 / 1024;
	return `${Math.round(mb * 10) / 10} Mb`;
}
