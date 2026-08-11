type ChromeTab = {
	readonly id?: number;
	readonly windowId?: number;
};

type ChromeWindow = {
	readonly id?: number;
};

declare const chrome: {
	readonly action: {
		readonly onClicked: {
			addListener: (listener: (tab: ChromeTab) => void) => void;
		};
	};
	readonly runtime: {
		readonly onMessage: {
			addListener: (
				listener: (message: unknown) => void | Promise<unknown>,
			) => void;
		};
		getURL: (path: string) => string;
		sendMessage: (message: unknown) => Promise<unknown>;
	};
	readonly scripting: {
		executeScript: (options: {
			readonly target: {readonly tabId: number};
			readonly files: readonly string[];
		}) => Promise<void>;
	};
	readonly tabs: {
		create: (options: {readonly url: string}) => Promise<unknown>;
		get: (tabId: number) => Promise<ChromeTab>;
		query: (options: {
			readonly active: boolean;
			readonly currentWindow: boolean;
		}) => Promise<ChromeTab[]>;
		sendMessage: (tabId: number, message: unknown) => Promise<unknown>;
		update: (
			tabId: number,
			options: {readonly active: boolean},
		) => Promise<ChromeTab>;
	};
	readonly storage: {
		readonly local: {
			get: (key: string) => Promise<Record<string, unknown>>;
			remove: (keys: string | readonly string[]) => Promise<void>;
			set: (items: Record<string, unknown>) => Promise<void>;
		};
		readonly session: {
			get: (key: string) => Promise<Record<string, unknown>>;
			remove: (key: string) => Promise<void>;
			set: (items: Record<string, unknown>) => Promise<void>;
		};
	};
	readonly windows: {
		getCurrent: () => Promise<ChromeWindow>;
		create: (options: {
			readonly url: string;
			readonly type: 'popup';
			readonly width: number;
			readonly height: number;
			readonly focused: boolean;
		}) => Promise<ChromeWindow>;
		update: (
			windowId: number,
			options: {readonly focused: boolean},
		) => Promise<ChromeWindow>;
		readonly onRemoved: {
			addListener: (listener: (windowId: number) => void) => void;
		};
	};
};
