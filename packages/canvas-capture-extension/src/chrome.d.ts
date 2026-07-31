type ChromeTab = {
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
		sendMessage: (tabId: number, message: unknown) => Promise<unknown>;
	};
	readonly storage: {
		readonly local: {
			get: (key: string) => Promise<Record<string, unknown>>;
			remove: (keys: string | readonly string[]) => Promise<void>;
			set: (items: Record<string, unknown>) => Promise<void>;
		};
	};
};
