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

import {Log} from '../logger';
import {
	download,
	getDownloadsFolder,
	getPlatform,
	getRevisionInfo,
	getThoriumDownloadUrl,
} from './BrowserFetcher';
import type {Product} from './Product';

const supportedProducts = {
	chrome: 'Chromium',
} as const;

export async function downloadBrowser(product: Product): Promise<void> {
	const revisionInfo = getRevisionInfo(product);

	await download({
		progressCallback: (downloadedBytes, totalBytes) => {
			Log.info(
				'Downloading Thorium',
				toMegabytes(downloadedBytes) + '/' + toMegabytes(totalBytes)
			);
		},
		product,
		platform: getPlatform(product),
		downloadsFolder: getDownloadsFolder(),
		downloadURL: getThoriumDownloadUrl(getPlatform(product)),
	});

	Log.info(
		`${supportedProducts[product]} (${revisionInfo.url}) downloaded to ${revisionInfo.folderPath}`
	);
}

function toMegabytes(bytes: number) {
	const mb = bytes / 1024 / 1024;
	return `${Math.round(mb * 10) / 10} Mb`;
}
