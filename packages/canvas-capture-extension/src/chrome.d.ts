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
			addListener: (listener: (message: unknown) => void) => void;
		};
	};
	readonly scripting: {
		executeScript: (options: {
			readonly target: {readonly tabId: number};
			readonly files: readonly string[];
		}) => Promise<void>;
	};
	readonly tabs: {
		sendMessage: (tabId: number, message: unknown) => Promise<unknown>;
	};
};
