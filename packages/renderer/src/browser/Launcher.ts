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

const tmpDir = () => {
	return process.env.PUPPETEER_TMP_DIR || os.tmpdir();
};

export interface ProductLauncher {
	launch(object: PuppeteerNodeLaunchOptions): Promise<HeadlessBrowser>;
}

export class ChromeLauncher implements ProductLauncher {
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

		const userDataDir = await fs.promises.mkdtemp(
			path.join(tmpDir(), 'puppeteer_dev_chrome_profile-'),
		);
		chromeArguments.push(`--user-data-dir=${userDataDir}`);

		const runner = new BrowserRunner({
			executablePath,
			processArguments: chromeArguments,
			userDataDir,
		});
		runner.start({
			dumpio,
			env,
			indent,
			logLevel: options.logLevel,
			executablePath,
		});

		let browser;
		try {
			const connection = await runner.setupConnection({
				timeout,
			});
			browser = await HeadlessBrowser._create({
				connection,
				defaultViewport,
				closeCallback: runner.close.bind(runner),
				forgetEventLoop: runner.forgetEventLoop.bind(runner),
				rememberEventLoop: runner.rememberEventLoop.bind(runner),
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
				{timeout},
			);
		} catch (error) {
			await browser.close(false, options.logLevel, options.indent);
			throw error;
		}

		return browser;
	}
}
