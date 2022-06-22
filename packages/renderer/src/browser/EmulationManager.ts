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
import type {Protocol} from 'devtools-protocol';
import {CDPSession} from './Connection';
import {Viewport} from './PuppeteerViewport';

export class EmulationManager {
	#client: CDPSession;

	constructor(client: CDPSession) {
		this.#client = client;
	}

	async emulateViewport(viewport: Viewport): Promise<void> {
		const {height, width} = viewport;
		const {deviceScaleFactor} = viewport;
		const screenOrientation: Protocol.Emulation.ScreenOrientation = {
			angle: 0,
			type: 'portraitPrimary',
		};

		await Promise.all([
			this.#client.send('Emulation.setDeviceMetricsOverride', {
				mobile: false,
				width,
				height,
				deviceScaleFactor,
				screenOrientation,
			}),
		]);
	}
}
