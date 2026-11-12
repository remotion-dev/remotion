import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import {svgUseFontData} from './fixtures/svg-use-data-font';
import {createFontFailureRecorder} from './font-failure-recorder';
import {fingerprintCssFontGroups} from './font-group-fingerprint';

for (const operation of ['check-only', 'resolve'] as const) {
	test.for(['normal', 'italic-weight', 'condensed'] as const)(
		'preserves unloaded source fonts for ' + operation + ' %s query',
		async (mode, t) => {
			const failure = createFontFailureRecorder(t);
			const urls = await svgUseFontData;
			const frame = document.createElement('iframe');
			frame.style.cssText =
				'position:fixed;left:0;top:0;width:320px;height:100px;background:white';
			document.body.append(frame);
			const ownerDocument = frame.contentDocument!;
			const ownerWindow = ownerDocument.defaultView!;
			const family = 'Unloaded source ' + crypto.randomUUID();
			const sheet = ownerDocument.createElement('style');
			const descriptors =
				mode === 'normal'
					? ''
					: ';font-style:italic;font-weight:700' +
						(mode === 'condensed' ? ';font-stretch:75%' : '');
			sheet.textContent =
				'@font-face{font-family:"' +
				family +
				'";src:url("' +
				urls[0] +
				'")' +
				descriptors +
				'}';
			ownerDocument.head.append(sheet);
			const sample = ownerDocument.createElement('span');
			sample.style.cssText =
				'display:none;font-family:"' +
				family +
				'",serif;font-size:36px' +
				(mode === 'normal'
					? ''
					: ';font-style:italic;font-weight:700' +
						(mode === 'condensed' ? ';font-stretch:75%' : ''));
			sample.textContent = 'Unloaded font AV fi';
			ownerDocument.body.append(sample);
			const events: string[] = [];
			const onEvent = (event: Event) => events.push(event.type);
			try {
				await ownerDocument.fonts.ready;
				for (let index = 0; index < 2; index++)
					await new Promise<void>((resolve) =>
						ownerWindow.requestAnimationFrame(() => resolve()),
					);
				const originals = Array.from(ownerDocument.fonts);
				const promises = originals.map((font) => font.loaded);
				const {ready} = ownerDocument.fonts;
				const capture = () => {
					const current = Array.from(ownerDocument.fonts);
					return {
						identitiesStable:
							current.length === originals.length &&
							current.every((font, index) => font === originals[index]),
						promisesStable:
							current.length === promises.length &&
							current.every((font, index) => font.loaded === promises[index]),
						statuses: current.map((font) => font.status),
						setStatus: ownerDocument.fonts.status,
						readyStable: ownerDocument.fonts.ready === ready,
					};
				};

				const computed = ownerWindow.getComputedStyle(sample);
				const query =
					computed.fontStyle +
					' ' +
					computed.fontWeight +
					' ' +
					(mode === 'condensed' ? 'condensed' : 'normal') +
					' ' +
					computed.fontSize +
					' ' +
					computed.fontFamily;
				const before = capture();
				for (const type of ['loading', 'loadingdone', 'loadingerror'])
					ownerDocument.fonts.addEventListener(type, onEvent);
				const check = ownerDocument.fonts.check(query, sample.textContent);
				const afterCheck = capture();
				const result =
					operation === 'resolve'
						? fingerprintCssFontGroups(
								ownerDocument,
								[{text: sample.textContent, style: computed, lang: 'en'}],
								[
									{
										name: 'active',
										rules: Array.from(
											sheet.sheet!.cssRules,
										) as CSSFontFaceRule[],
									},
								],
							)
						: null;
				const immediate = capture();
				for (let index = 0; index < 2; index++)
					await new Promise<void>((resolve) =>
						ownerWindow.requestAnimationFrame(() => resolve()),
					);
				const settled = capture();
				const report = () =>
					JSON.stringify(
						{
							operation,
							mode,
							query,
							check,
							before,
							afterCheck,
							result,
							immediate,
							settled,
							events,
							noFontLoadOrNativeScreenshot: true,
						},
						null,
						2,
					);
				const filename =
					'validation/svg-unloaded-source-font-query/' +
					server.browser +
					'/' +
					operation +
					'-' +
					mode;

				await failure.record(filename + '.json', report());
				expect(originals).toHaveLength(1);
				expect(before.statuses).toEqual(['unloaded']);
				expect(check).toBe(false);
				expect(afterCheck).toEqual(before);
				expect(immediate).toEqual(before);
				expect(settled).toEqual(before);
				expect(events).toEqual([]);
				if (operation === 'resolve') {
					expect(result?.matches).toEqual([]);
					expect(result?.reason).toContain('Source font query is not loaded');
				}
			} finally {
				for (const type of ['loading', 'loadingdone', 'loadingerror'])
					ownerDocument.fonts.removeEventListener(type, onEvent);
				frame.remove();
			}
		},
	);
}
