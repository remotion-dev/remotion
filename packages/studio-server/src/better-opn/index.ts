// Copied from https://github.com/michaellzc/better-opn#readme

import {exec, spawn} from 'node:child_process';
import open = require('open');

const supportedChromiumBrowsers = [
	'Google Chrome',
	'Google Chrome Canary',
	'Microsoft Edge',
	'Brave Browser',
	'Vivaldi',
	'Chromium',
	'Arc',
] as const;

export const getChromiumBrowsersToTry = (processes: string) => {
	const processNames = new Set(
		processes
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean),
	);

	return supportedChromiumBrowsers.filter((browser) =>
		processNames.has(browser),
	);
};

const CHILD_PROCESS_TIMEOUT_IN_MILLISECONDS = 10_000;

const getRunningChromiumBrowsers = async () => {
	const processes = await new Promise<string>((resolve, reject) => {
		exec(
			'ps -cax -o comm=',
			{timeout: CHILD_PROCESS_TIMEOUT_IN_MILLISECONDS},
			(err, stdout) => {
				if (err) {
					reject(err);
				} else {
					resolve(stdout);
				}
			},
		);
	});

	return getChromiumBrowsersToTry(processes);
};

const runAppleScript = ({
	appleScript,
	args,
}: {
	appleScript: string;
	args: string[];
}) => {
	return new Promise<string>((resolve, reject) => {
		const proc = spawn('osascript', ['-', ...args]);
		const stdoutChunks: Uint8Array[] = [];
		const stderrChunks: Uint8Array[] = [];
		let settled = false;

		const timeout = setTimeout(() => {
			if (settled) {
				return;
			}

			settled = true;
			proc.kill();
			reject(new Error('osascript timed out'));
		}, CHILD_PROCESS_TIMEOUT_IN_MILLISECONDS);

		const rejectOnce = (error: Error) => {
			if (settled) {
				return;
			}

			settled = true;
			clearTimeout(timeout);
			proc.kill();
			reject(error);
		};

		proc.stdout.on('data', (chunk: Uint8Array) => stdoutChunks.push(chunk));
		proc.stderr.on('data', (chunk: Uint8Array) => stderrChunks.push(chunk));
		proc.stdin.on('error', rejectOnce);
		proc.on('error', rejectOnce);
		proc.on('close', (code) => {
			if (settled) {
				return;
			}

			settled = true;
			clearTimeout(timeout);
			const stdout = Buffer.concat(stdoutChunks).toString('utf8');
			if (code === 0) {
				resolve(stdout);
				return;
			}

			const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();
			reject(new Error(stderr || `osascript exited with code ${code}`));
		});
		proc.stdin.end(appleScript);
	});
};

const isAppleScriptPermissionError = (error: unknown) => {
	const message = (error as Error).message.toLowerCase();
	return (
		message.includes('not authorised to send apple events') ||
		message.includes('not authorized to send apple events')
	);
};

const normalizeURLToMatch = (target: string) => {
	// We may encounter URL parse error but want to fallback to default behavior
	try {
		// Url module is deprecated on newer version of NodeJS, only use it when URL class is not supported (like Node 8)
		const URL =
			typeof global.URL === 'undefined' ? require('url').URL : global.URL;
		const url = new URL(target);
		return url.origin;
	} catch {
		return target;
	}
};

export const getFocusBrowserTabAppleScript = (
	chromiumBrowser: (typeof supportedChromiumBrowsers)[number],
) => {
	return `
property targetTabIndex: -1
property targetWindow: null
property theProgram: "${chromiumBrowser}"

on run argv
  set targetURL to item 1 of argv

  using terms from application "Google Chrome"
    tell application theProgram
      set found to my lookupTabWithUrl(targetURL)
      if not found then
        return false
      end if

      set targetWindow's active tab index to targetTabIndex
      set index of targetWindow to 1
      activate
      return true
    end tell
  end using terms from
end run

on lookupTabWithUrl(lookupUrl)
  using terms from application "Google Chrome"
    tell application theProgram
      set found to false
      repeat with theWindow in every window
        set theTabIndex to 0
        repeat with theTab in every tab of theWindow
          set theTabIndex to theTabIndex + 1
          if (theTab's URL as string) is lookupUrl then
            set targetTabIndex to theTabIndex
            set targetWindow to theWindow
            set found to true
            exit repeat
          end if
        end repeat

        if found then
          exit repeat
        end if
      end repeat
    end tell
  end using terms from
  return found
end lookupTabWithUrl
`.trim();
};

export const focusBrowserTab = async ({url}: {url: string}) => {
	if (process.platform !== 'darwin') {
		return false;
	}

	let browsersToTry: ReturnType<typeof getChromiumBrowsersToTry>;
	try {
		browsersToTry = await getRunningChromiumBrowsers();
	} catch {
		return false;
	}

	for (const chromiumBrowser of browsersToTry) {
		try {
			const result = await runAppleScript({
				appleScript: getFocusBrowserTabAppleScript(chromiumBrowser),
				args: [url],
			});
			if (result.trim() === 'true') {
				return true;
			}
		} catch (error) {
			if (isAppleScriptPermissionError(error)) {
				return false;
			}
		}
	}

	return false;
};

// Copy from
// https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/openBrowser.js#L64
const startBrowserProcess = async ({
	browser,
	url,
	args,
}: {
	browser: string | undefined;
	url: string;
	args: string[];
}) => {
	const tryNewInstance = args.length > 0;

	const shouldTryOpenChromiumWithAppleScript =
		process.platform === 'darwin' &&
		!tryNewInstance &&
		(!browser || browser === 'google chrome' || browser === 'chrome');

	if (shouldTryOpenChromiumWithAppleScript) {
		let appleScriptDenied = false;

		// Will use the first open browser found from list
		const browsersToTry = await getRunningChromiumBrowsers();

		for (const chromiumBrowser of browsersToTry) {
			if (appleScriptDenied) {
				continue;
			}

			try {
				// Try our best to reuse existing tab
				// on OSX Chromium-based browser with AppleScript
				const appleScript = `
(*
  Copyright (c) 2015-present, Facebook, Inc.
  This source code is licensed under the MIT license found in the
  LICENSE file in the root directory of this source tree.
  *)
  
  property targetTab: null
  property targetTabIndex: -1
  property targetWindow: null
  property theProgram: "${chromiumBrowser}"
  
  on run argv
    set theURL to item 1 of argv
    set matchURL to item 2 of argv
    
    using terms from application "Google Chrome"
      tell application theProgram
  
        if (count every window) = 0 then
          make new window
        end if
  
        -- 1: Looking for tab running debugger
        -- then, Reload debugging tab if found
        -- then return
        set found to my lookupTabWithUrl(matchURL)
        if found then
          set targetWindow's active tab index to targetTabIndex
          tell targetTab to reload
          tell targetWindow to activate
          set index of targetWindow to 1
          return
        end if
  
        -- 2: Looking for Empty tab
        -- In case debugging tab was not found
        -- We try to find an empty tab instead
        set found to my lookupTabWithUrl("chrome://newtab/")
        if found then
          set targetWindow's active tab index to targetTabIndex
          set URL of targetTab to theURL
          tell targetWindow to activate
          return
        end if
  
        -- 3: Create new tab
        -- both debugging and empty tab were not found
        -- make a new tab with url
        tell window 1
          activate
          make new tab with properties {URL:theURL}
        end tell
      end tell
    end using terms from
  end run
  
  -- Function:
  -- Lookup tab with given url
  -- if found, store tab, index, and window in properties
  -- (properties were declared on top of file)
  on lookupTabWithUrl(lookupUrl)
    using terms from application "Google Chrome"
      tell application theProgram
        -- Find a tab with the given url
        set found to false
        set theTabIndex to -1
        repeat with theWindow in every window
          set theTabIndex to 0
          repeat with theTab in every tab of theWindow
            set theTabIndex to theTabIndex + 1
            if (theTab's URL as string) contains lookupUrl then
              -- assign tab, tab index, and window to properties
              set targetTab to theTab
              set targetTabIndex to theTabIndex
              set targetWindow to theWindow
              set found to true
              exit repeat
            end if
          end repeat
  
          if found then
            exit repeat
          end if
        end repeat
      end tell
    end using terms from
    return found
  end lookupTabWithUrl
`.trim();
				await runAppleScript({
					appleScript,
					args: [encodeURI(url), encodeURI(normalizeURLToMatch(url))],
				});

				return Promise.resolve(true);
			} catch (error) {
				if (isAppleScriptPermissionError(error)) {
					appleScriptDenied = true;
				}

				// Ignore errors.
				// It it breaks, it will fallback to `opn` anyway
			}
		}
	}

	// Fallback to opn
	// (It will always open new tab)
	return open(url, {
		...(browser ? {app: {name: browser, arguments: args}} : {}),
		newInstance: tryNewInstance,
		wait: false,
	});
};

const getBrowserArgs = (browserArgs: string | undefined) => {
	if (browserArgs) {
		return browserArgs.split(' ');
	}

	if (process.env.BROWSER_ARGS) {
		return process.env.BROWSER_ARGS.split(' ');
	}

	return [];
};

export const openBrowser = ({
	url,
	browserFlag,
	browserArgs,
}: {
	url: string;
	browserFlag: string | undefined;
	browserArgs: string | undefined;
}) => {
	return startBrowserProcess({
		browser: browserFlag ?? process.env.BROWSER,
		url,
		args: getBrowserArgs(browserArgs),
	});
};
