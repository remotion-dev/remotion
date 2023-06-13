/**
 * Copyright 2017 Google Inc. All rights reserved.
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
import fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {HeadlessBrowser} from './Browser';
import {BrowserRunner} from './BrowserRunner';

import type {PuppeteerNodeLaunchOptions} from './LaunchOptions';

import {getRevisionInfo} from './BrowserFetcher';
import type {Product} from './Product';

const tmpDir = () => {
	return process.env.PUPPETEER_TMP_DIR || os.tmpdir();
};

export interface ProductLauncher {
	launch(object: PuppeteerNodeLaunchOptions): Promise<HeadlessBrowser>;
	executablePath: (path?: any) => string;
	product: Product;
}

export class ChromeLauncher implements ProductLauncher {
	_preferredRevision: string;

	constructor(preferredRevision: string) {
		this._preferredRevision = preferredRevision;
	}

	async launch(options: PuppeteerNodeLaunchOptions): Promise<HeadlessBrowser> {
		const {
			args = [],
			dumpio = false,
			executablePath,
			env = process.env,
			defaultViewport,
			timeout = 60000,
			debuggingPort,
			indent,
		} = options;

		const chromeArguments = args;

		if (
			!chromeArguments.some((argument) => {
				return argument.startsWith('--remote-debugging-');
			})
		) {
			chromeArguments.push(`--remote-debugging-port=${debuggingPort || 0}`);
		}

		// Check for the user data dir argument, which will always be set even
		// with a custom directory specified via the userDataDir option.
		const userDataDir = await fs.promises.mkdtemp(
			path.join(tmpDir(), 'puppeteer_dev_chrome_profile-')
		);
		chromeArguments.push(`--user-data-dir=${userDataDir}`);

		let chromeExecutable = executablePath;
		if (!chromeExecutable) {
			const {missingText, executablePath: exPath} = resolveExecutablePath(this);
			if (missingText) {
				throw new Error(missingText);
			}

			chromeExecutable = exPath;
		}

		const runner = new BrowserRunner({
			executablePath: chromeExecutable,
			processArguments: chromeArguments,
			userDataDir,
		});
		runner.start({
			dumpio,
			env,
			indent,
		});

		let browser;
		try {
			const connection = await runner.setupConnection({
				timeout,
				preferredRevision: this._preferredRevision,
			});
			browser = await HeadlessBrowser._create({
				connection,
				defaultViewport,
				closeCallback: runner.close.bind(runner),
			});
		} catch (error) {
			runner.kill();
			throw error;
		}

		try {
			await browser.waitForTarget(
				(t) => {
					return t.type() === 'page';
				},
				{timeout}
			);
		} catch (error) {
			await browser.close(false);
			throw error;
		}

		return browser;
	}

	executablePath(): string {
		const results = resolveExecutablePath(this);
		return results.executablePath;
	}

	get product(): Product {
		return 'chrome';
	}
}

function resolveExecutablePath(launcher: ChromeLauncher): {
	executablePath: string;
	missingText?: string;
} {
	const {product, _preferredRevision} = launcher;

	const revisionInfo = getRevisionInfo(_preferredRevision, 'chrome');

	const firefoxHelp = `Run \`PUPPETEER_PRODUCT=firefox npm install\` to download a supported Firefox browser binary.`;
	const chromeHelp = `Run \`npm install\` to download the correct Chromium revision (${launcher._preferredRevision}).`;
	const missingText = revisionInfo.local
		? undefined
		: `Could not find expected browser (${product}) locally. ${
				product === 'chrome' ? chromeHelp : firefoxHelp
		  }`;
	return {executablePath: revisionInfo.executablePath, missingText};
}
