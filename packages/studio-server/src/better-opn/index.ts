// Copied from https://github.com/michaellzc/better-opn#readme

import {exec} from 'node:child_process';
import type {Writable} from 'stream';
import open = require('open');

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
		(typeof browser !== 'string' ||
			browser === 'google chrome' ||
			browser === 'chrome');

	if (shouldTryOpenChromiumWithAppleScript) {
		let appleScriptDenied = false;

		// Will use the first open browser found from list
		const supportedChromiumBrowsers = [
			'Google Chrome',
			'Google Chrome Canary',
			'Microsoft Edge',
			'Brave Browser',
			'Vivaldi',
			'Chromium',
			'Arc',
		] as const;
		const processes = await new Promise<string>((resolve, reject) => {
			exec('ps cax', (err, stdout) => {
				if (err) {
					reject(err);
				} else {
					resolve(stdout);
				}
			});
		});

		const browsersToTry = supportedChromiumBrowsers.filter((b) =>
			processes.includes(b),
		);

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
    set theURL to "${encodeURI(url)}"
    set matchURL to "${
			process.env.OPEN_MATCH_HOST_ONLY === 'true'
				? encodeURI(normalizeURLToMatch(url))
				: encodeURI(url)
		}"
    
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
				await new Promise<void>((resolve, reject) => {
					const proc = exec(`osascript -`, (error) => {
						if (error) {
							reject(error);
						} else {
							// Ignore errors.
							// It it breaks, it will fallback to `opn` anyway
							resolve();
						}
					});
					(proc.stdin as Writable).write(appleScript);
					(proc.stdin as Writable).end();
				});

				return Promise.resolve(true);
			} catch (error) {
				const appleScriptError = (error as Error).message;
				if (
					appleScriptError
						.toLowerCase()
						.includes('not authorised to send apple events')
				) {
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
