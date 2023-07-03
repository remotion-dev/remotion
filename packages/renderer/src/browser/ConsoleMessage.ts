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

import type {JSHandle} from './JSHandle';

export interface ConsoleMessageLocation {
	url?: string;
	lineNumber?: number;
	columnNumber?: number;
}

export type ConsoleMessageType =
	| 'log'
	| 'debug'
	| 'info'
	| 'error'
	| 'warning'
	| 'dir'
	| 'dirxml'
	| 'table'
	| 'trace'
	| 'clear'
	| 'startGroup'
	| 'startGroupCollapsed'
	| 'endGroup'
	| 'assert'
	| 'profile'
	| 'profileEnd'
	| 'count'
	| 'timeEnd'
	| 'verbose';

export class ConsoleMessage {
	type: ConsoleMessageType;
	text: string;
	args: JSHandle[];
	previewString: string;
	#stackTraceLocations: ConsoleMessageLocation[];

	constructor({
		type,
		text,
		args,
		stackTraceLocations,
		previewString,
	}: {
		type: ConsoleMessageType;
		text: string;
		args: JSHandle[];
		stackTraceLocations: ConsoleMessageLocation[];
		previewString: string;
	}) {
		this.type = type;
		this.text = text;
		this.args = args;
		this.previewString = previewString;
		this.#stackTraceLocations = stackTraceLocations;
	}

	location(): ConsoleMessageLocation {
		return this.#stackTraceLocations[0] ?? {};
	}

	stackTrace(): ConsoleMessageLocation[] {
		return this.#stackTraceLocations;
	}
}
