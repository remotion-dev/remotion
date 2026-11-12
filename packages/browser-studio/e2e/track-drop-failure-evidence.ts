import type {Locator, Page, TestInfo} from '@playwright/test';

export const captureTrackDropFailureEvidence = async ({
	page,
	preview,
	rulerBottom,
	testInfo,
}: {
	page: Page;
	preview: Locator;
	rulerBottom: number;
	testInfo: TestInfo;
}) => {
	const element = await preview.elementHandle();
	if (!element)
		throw new Error('Track drop preview disappeared before capture');
	const geometry = await element.evaluate((ghost, oldRulerBottom) => {
		const bounds = ghost.getBoundingClientRect();
		const ruler = document.querySelector<HTMLElement>('[data-timeline-ruler]');
		const rulerBounds = ruler?.getBoundingClientRect() ?? null;
		const point = {x: bounds.x + bounds.width / 2, y: oldRulerBottom - 2};
		const previous = ghost.style.pointerEvents;
		const priority = ghost.style.getPropertyPriority('pointer-events');
		let hits: {tag: string; preview: boolean; ruler: boolean}[] = [];
		try {
			ghost.style.pointerEvents = 'auto';
			hits = document.elementsFromPoint(point.x, point.y).map((hit) => ({
				tag: hit.tagName,
				preview: hit === ghost,
				ruler: hit === ruler,
			}));
		} finally {
			ghost.style.setProperty('pointer-events', previous, priority);
		}

		const ancestors = [];
		for (let node: Element | null = ghost; node; node = node.parentElement) {
			const style = getComputedStyle(node);
			ancestors.push({
				tag: node.tagName,
				id: node.id,
				className: node.getAttribute('class'),
				bounds: node.getBoundingClientRect().toJSON(),
				scrollTop: node.scrollTop,
				scrollLeft: node.scrollLeft,
				overflowX: style.overflowX,
				overflowY: style.overflowY,
				clipPath: style.clipPath,
				pointerEvents: style.pointerEvents,
				zIndex: style.zIndex,
				position: style.position,
				contain: style.contain,
				transform: style.transform,
			});
		}

		return {
			time: performance.now(),
			oldRulerBottom,
			ruler: rulerBounds?.toJSON() ?? null,
			rulerPointerEvents: ruler ? getComputedStyle(ruler).pointerEvents : null,
			preview: bounds.toJSON(),
			point,
			pointInViewport:
				point.x >= 0 &&
				point.x < innerWidth &&
				point.y >= 0 &&
				point.y < innerHeight,
			pointInCurrentRuler: rulerBounds
				? point.x >= rulerBounds.left &&
					point.x < rulerBounds.right &&
					point.y >= rulerBounds.top &&
					point.y < rulerBounds.bottom
				: false,
			hits,
			ancestors,
			iframe: window.frameElement?.getBoundingClientRect().toJSON() ?? null,
			viewport: {width: innerWidth, height: innerHeight, devicePixelRatio},
			userAgent: navigator.userAgent,
		};
	}, rulerBottom);
	await testInfo.attach('track-drop-failure-geometry', {
		body: JSON.stringify(geometry, null, 2),
		contentType: 'application/json',
	});
	const visibility = await element.evaluate((ghost) => ({
		value: ghost.style.visibility,
		priority: ghost.style.getPropertyPriority('visibility'),
	}));
	const phases = [];
	try {
		// Only failure diagnostics change visibility. Restore it even if encoding
		// fails; none of these captures replaces the already-frozen test verdict.
		for (const phase of ['visible', 'hidden', 'restored'] as const) {
			await element.evaluate(
				(ghost, value) => {
					ghost.style.setProperty('visibility', value.value, value.priority);
				},
				phase === 'hidden' ? {value: 'hidden', priority: ''} : visibility,
			);
			phases.push(
				await element.evaluate(
					(ghost, name) => ({
						phase: name,
						time: performance.now(),
						connected: ghost.isConnected,
						preview: ghost.getBoundingClientRect().toJSON(),
						ruler:
							document
								.querySelector('[data-timeline-ruler]')
								?.getBoundingClientRect()
								.toJSON() ?? null,
						scrollTop:
							document.querySelector('.__remotion-vertical-scrollbar')
								?.scrollTop ?? null,
					}),
					phase,
				),
			);
			const path = testInfo.outputPath(`track-drop-${phase}.png`);
			await page.screenshot({path});
			await testInfo.attach(`track-drop-${phase}`, {
				path,
				contentType: 'image/png',
			});
		}
	} finally {
		await element.evaluate((ghost, value) => {
			ghost.style.setProperty('visibility', value.value, value.priority);
		}, visibility);
		await testInfo.attach('track-drop-paint-phases', {
			body: JSON.stringify(phases, null, 2),
			contentType: 'application/json',
		});
	}
};
