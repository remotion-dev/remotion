import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import type {IncomingMessage} from 'node:http';
import type {Socket} from 'node:net';
import type {PickOpenTimelineRequest} from '@remotion/studio-shared';

export const supportsNativeFilePicker = (request: IncomingMessage): boolean => {
	const address = request.socket.remoteAddress;
	return (
		(process.platform === 'darwin' || process.platform === 'win32') &&
		!process.env.SSH_CONNECTION &&
		!process.env.SSH_TTY &&
		process.env.SESSIONNAME !== 'Services' &&
		(address === '127.0.0.1' ||
			address === '::1' ||
			address === '::ffff:127.0.0.1')
	);
};

let pickerOpen = false;
let prewarmEnabled = false;
type NativeFilePickerResult = {
	path: string | null;
	directory: string | null;
};
type MacPicker = {
	child: ChildProcessWithoutNullStreams;
	result: Promise<NativeFilePickerResult>;
};
let preparedMacPicker: MacPicker | null = null;
let activeMacPicker: MacPicker | null = null;

const parsePickerResult = (output: string): NativeFilePickerResult => {
	const result: unknown = JSON.parse(output);
	if (
		typeof result !== 'object' ||
		result === null ||
		!('path' in result) ||
		!('directory' in result) ||
		(result.path !== null && typeof result.path !== 'string') ||
		(result.directory !== null && typeof result.directory !== 'string')
	) {
		throw new Error('The native file picker returned an invalid result.');
	}

	return {path: result.path, directory: result.directory};
};

const createMacPicker = (initialDirectory: string): MacPicker => {
	const script = `function run(argv) {
  ObjC.import('AppKit');
  var app = $.NSApplication.sharedApplication;
  app.setActivationPolicy($.NSApplicationActivationPolicyAccessory);
  var panel = $.NSOpenPanel.openPanel;
  panel.allowsMultipleSelection = false;
  panel.canCreateDirectories = false;
  panel.directoryURL = $.NSURL.fileURLWithPath(argv[0]);
  var request = null;
  var positioned = false;
  ObjC.registerSubclass({
    name: 'RemotionFilePickerPositioner',
    superclass: 'NSObject',
    methods: {
      'positionPanel:': {
        types: ['void', ['id']],
        implementation: function() {
          if (positioned || !request || !request.position) return;
          positioned = true;
          try {
            var screens = $.NSScreen.screens;
            var primary = screens.objectAtIndex(0).frame;
            var x = request.position.x;
            var y = primary.origin.y + primary.size.height - request.position.y;
            var visible = screens.objectAtIndex(0).visibleFrame;
            var nearest = Infinity;
            for (var i = 0; i < screens.count; i++) {
              var candidate = screens.objectAtIndex(i).visibleFrame;
              var dx = x - Math.max(candidate.origin.x, Math.min(x, candidate.origin.x + candidate.size.width));
              var dy = y - Math.max(candidate.origin.y, Math.min(y, candidate.origin.y + candidate.size.height));
              var distance = dx * dx + dy * dy;
              if (distance < nearest) {
                nearest = distance;
                visible = candidate;
              }
            }
            var size = panel.frame.size;
            panel.setFrameOrigin($.NSMakePoint(
              Math.max(visible.origin.x, Math.min(x - size.width / 2, visible.origin.x + visible.size.width - size.width)),
              Math.max(visible.origin.y, Math.min(y - size.height / 2, visible.origin.y + visible.size.height - size.height))
            ));
          } finally {
            panel.alphaValue = 1;
          }
        }
      }
    }
  });
  var positioner = $.RemotionFilePickerPositioner.alloc.init;
  $.NSNotificationCenter.defaultCenter.addObserverSelectorNameObject(positioner, 'positionPanel:', $.NSWindowDidBecomeKeyNotification, panel);

  var data = $.NSFileHandle.fileHandleWithStandardInput.readDataToEndOfFile;
  if (data.length === 0) return JSON.stringify({path: null, directory: null});
  request = JSON.parse(ObjC.unwrap($.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding)));
  panel.title = request.type === 'timeline' ? 'Import OpenTimeline' : 'Locate timeline media';
  panel.canChooseFiles = request.type === 'timeline';
  panel.canChooseDirectories = request.type === 'media-directory';
  if (request.directory !== argv[0]) panel.directoryURL = $.NSURL.fileURLWithPath(request.directory);
  if (request.type === 'timeline') panel.allowedFileTypes = $(['otio']);
  if (request.position) panel.alphaValue = 0;
  app.activateIgnoringOtherApps(true);
  var selected = panel.runModal === $.NSModalResponseOK ? ObjC.unwrap(panel.URL.path) : null;
  if (positioner) $.NSNotificationCenter.defaultCenter.removeObserver(positioner);
  return JSON.stringify({
    path: selected,
    directory: request.type === 'media-directory' && selected !== null
      ? selected : ObjC.unwrap(panel.directoryURL.path)
  });
}`;
	const child = spawn(
		'/usr/bin/osascript',
		['-l', 'JavaScript', '-e', script, initialDirectory],
		{stdio: ['pipe', 'pipe', 'pipe']},
	);
	const stdout: Uint8Array[] = [];
	const stderr: Uint8Array[] = [];
	const onExit = () => child.kill();
	process.once('exit', onExit);
	const result = new Promise<NativeFilePickerResult>((resolve, reject) => {
		const onError = (error: Error) => {
			child.kill();
			reject(error);
		};

		child.stdout.on('data', (data: Uint8Array) =>
			stdout.push(Uint8Array.from(data)),
		);
		child.stderr.on('data', (data: Uint8Array) =>
			stderr.push(Uint8Array.from(data)),
		);
		child.on('error', onError);
		child.stdin.on('error', onError);
		child.on('close', (code) => {
			process.off('exit', onExit);
			if (preparedMacPicker?.child === child) preparedMacPicker = null;
			if (code !== 0) {
				reject(
					new Error(
						Buffer.concat(stderr).toString('utf8').trim() ||
							`File picker exited with code ${code}`,
					),
				);
				return;
			}

			try {
				resolve(parsePickerResult(Buffer.concat(stdout).toString('utf8')));
			} catch (error) {
				reject(error);
			}
		});
	});
	result.catch(() => undefined);
	return {child, result};
};

export const prewarmNativeFilePicker = (initialDirectory: string): void => {
	if (process.platform !== 'darwin') return;
	prewarmEnabled = true;
	if (preparedMacPicker || pickerOpen) return;
	preparedMacPicker = createMacPicker(initialDirectory);
	preparedMacPicker.child.unref();
	for (const stream of [
		preparedMacPicker.child.stdin,
		preparedMacPicker.child.stdout,
		preparedMacPicker.child.stderr,
	]) {
		(stream as Socket).unref();
	}
};

export const closeNativeFilePicker = (): void => {
	prewarmEnabled = false;
	preparedMacPicker?.child.kill();
	activeMacPicker?.child.kill();
	preparedMacPicker = null;
};

export const openNativeFilePicker = async ({
	type,
	initialDirectory,
	signal,
	position,
}: {
	type: 'timeline' | 'media-directory';
	initialDirectory: string;
	signal: AbortSignal;
	position: PickOpenTimelineRequest['position'];
}): Promise<NativeFilePickerResult> => {
	if (process.platform !== 'darwin' && process.platform !== 'win32') {
		throw new Error('Native file pickers are supported on macOS and Windows.');
	}

	if (pickerOpen) throw new Error('A file picker is already open.');
	if (signal.aborted) throw new Error('File selection was cancelled.');
	pickerOpen = true;
	let nextDirectory = initialDirectory;
	try {
		const directory =
			existsSync(initialDirectory) && statSync(initialDirectory).isDirectory()
				? initialDirectory
				: process.cwd();
		if (process.platform === 'darwin') {
			const picker = preparedMacPicker ?? createMacPicker(directory);
			preparedMacPicker = null;
			activeMacPicker = picker;
			picker.child.ref();
			for (const stream of [
				picker.child.stdin,
				picker.child.stdout,
				picker.child.stderr,
			]) {
				(stream as Socket).ref();
			}

			try {
				const result = await new Promise<NativeFilePickerResult>(
					(resolve, reject) => {
						const onAbort = () => {
							picker.child.kill();
							reject(new Error('File selection was cancelled.'));
						};

						signal.addEventListener('abort', onAbort, {once: true});
						picker.result.then(resolve, reject).finally(() => {
							signal.removeEventListener('abort', onAbort);
						});
						if (signal.aborted) {
							onAbort();
							return;
						}

						picker.child.stdin.end(JSON.stringify({type, directory, position}));
					},
				);
				nextDirectory = result.directory ?? directory;
				return result;
			} finally {
				activeMacPicker = null;
			}
		}

		const powerShell = `
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Application]::EnableVisualStyles()
if ($env:REMOTION_PICKER_TYPE -eq 'timeline') {
  $dialog = New-Object System.Windows.Forms.OpenFileDialog
  $dialog.Title = 'Import OpenTimeline'
  $dialog.Filter = 'OpenTimelineIO (*.otio)|*.otio'
  $dialog.InitialDirectory = $env:REMOTION_PICKER_DIRECTORY
  $dialog.CheckFileExists = $true
  $dialog.Multiselect = $false
} else {
  $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
  $dialog.Description = 'Locate timeline media'
  $dialog.SelectedPath = $env:REMOTION_PICKER_DIRECTORY
  $dialog.ShowNewFolderButton = $false
}
$owner = New-Object System.Windows.Forms.Form
$owner.TopMost = $true
$owner.ShowInTaskbar = $false
if ($env:REMOTION_PICKER_POSITION -ne 'null') {
  $position = $env:REMOTION_PICKER_POSITION | ConvertFrom-Json
  $point = New-Object System.Drawing.Point([int]$position.x, [int]$position.y)
  $workArea = [System.Windows.Forms.Screen]::FromPoint($point).WorkingArea
  $owner.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual
  $owner.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None
  $owner.Size = New-Object System.Drawing.Size(2, 2)
  $owner.Location = New-Object System.Drawing.Point(
    [Math]::Max($workArea.Left, [Math]::Min($point.X - 1, $workArea.Right - 2)),
    [Math]::Max($workArea.Top, [Math]::Min($point.Y - 1, $workArea.Bottom - 2))
  )
  $owner.Opacity = 0
  $owner.Show()
}
try {
  $selectedPath = $null
  $directory = $null
  if ($dialog.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) {
    if ($env:REMOTION_PICKER_TYPE -eq 'timeline') {
      $selectedPath = $dialog.FileName
      $directory = [System.IO.Path]::GetDirectoryName($dialog.FileName)
    } else {
      $selectedPath = $dialog.SelectedPath
      $directory = $dialog.SelectedPath
    }
  }
  [Console]::Write((@{path = $selectedPath; directory = $directory} | ConvertTo-Json -Compress))
} finally {
  $dialog.Dispose()
  $owner.Dispose()
}`;
		return await new Promise<NativeFilePickerResult>((resolve, reject) => {
			const child = spawn(
				'powershell.exe',
				[
					'-NoProfile',
					'-STA',
					'-EncodedCommand',
					Buffer.from(powerShell, 'utf16le').toString('base64'),
				],
				{
					windowsHide: true,
					env: {
						...process.env,
						REMOTION_PICKER_TYPE: type,
						REMOTION_PICKER_DIRECTORY: directory,
						REMOTION_PICKER_POSITION: JSON.stringify(position),
					},
					stdio: ['pipe', 'pipe', 'pipe'],
				},
			);
			const stdout: Uint8Array[] = [];
			const stderr: Uint8Array[] = [];
			const onAbort = () => {
				child.kill();
				reject(new Error('File selection was cancelled.'));
			};

			signal.addEventListener('abort', onAbort, {once: true});
			child.stdout.on('data', (data: Uint8Array) =>
				stdout.push(Uint8Array.from(data)),
			);
			child.stderr.on('data', (data: Uint8Array) =>
				stderr.push(Uint8Array.from(data)),
			);
			child.on('error', reject);
			child.stdin.on('error', reject);
			child.on('close', (code) => {
				signal.removeEventListener('abort', onAbort);
				if (code !== 0) {
					reject(
						new Error(
							Buffer.concat(stderr).toString('utf8').trim() ||
								`File picker exited with code ${code}`,
						),
					);
					return;
				}

				try {
					resolve(parsePickerResult(Buffer.concat(stdout).toString('utf8')));
				} catch (error) {
					reject(error);
				}
			});
			child.stdin.end();
		});
	} finally {
		pickerOpen = false;
		if (prewarmEnabled) prewarmNativeFilePicker(nextDirectory);
	}
};
