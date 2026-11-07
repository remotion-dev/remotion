import {roundedRect, text, textInRow} from './primitives';
import {drawStudioIcon} from './studio-icons';

const BACKGROUND = '#1f2428';
const LIGHT_TEXT = '#a6a7a9';
const FOREGROUND = '#d2d3d4';
const BLUE = '#0b84f3';
const TRACK_BACKGROUND = '#15181b';
const ROW_SCALE = 1340 / 2700;
const DURATION = 1294;
const TIMELINE_ITEM_GAP = 1;

export const studioAssetUrls: Record<string, string> = {
	studioFilmstrip:
		'https://remotion.media/homepage/whats-new-timeline-capture-693f4bc1679c.png',
};

const clip = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
) => {
	ctx.beginPath();
	ctx.rect(x, y, Math.max(0, width), Math.max(0, height));
	ctx.clip();
};

const caret = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	expanded: boolean,
	color: string,
) => {
	ctx.save();
	ctx.translate(x + size / 2, y + size / 2);
	if (!expanded) {
		ctx.rotate(-Math.PI / 2);
	}

	ctx.translate(-size / 2, -size / 2);
	ctx.beginPath();
	ctx.moveTo(size * 0.06, size * 0.37);
	ctx.lineTo(size / 2, size * 0.81);
	ctx.lineTo(size * 0.94, size * 0.37);
	ctx.lineTo(size * 0.9, size * 0.33);
	ctx.lineTo(size / 2, size * 0.73);
	ctx.lineTo(size * 0.1, size * 0.33);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
	ctx.restore();
};

// Same seeded waveform heights as the original Studio composition.
const random = (seed: string) => {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
	}

	let value = hash + 0x6d2b79f5;
	value = Math.imul(value ^ (value >>> 15), value | 1);
	value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
	return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const soundtrackPeaks = Array.from(
	{length: Math.ceil(DURATION / 2)},
	(_, index) =>
		3 +
		random(`soundtrack-${index}`) *
			23 *
			(0.45 + 0.55 * Math.abs(Math.sin(index * 0.16))),
);
const effects = [
	{from: 35, duration: 80},
	{from: 330, duration: 100},
	{from: 650, duration: 95},
	{from: 970, duration: 120},
].map((effect, effectIndex) => ({
	...effect,
	peaks: Array.from({length: 80}, (_, index) => {
		const progress = index / 79;
		let envelope: number;
		switch (effectIndex) {
			case 0:
				envelope = Math.min(1, progress * 12) * (1 - progress) ** 1.6;
				break;
			case 1:
				envelope = Math.sin(progress * Math.PI) ** 1.7;
				break;
			case 2:
				envelope = Math.min(
					1,
					Math.exp(-(((progress - 0.2) / 0.08) ** 2)) +
						0.7 * Math.exp(-(((progress - 0.62) / 0.14) ** 2)),
				);
				break;
			default:
				envelope =
					Math.min(1, progress * 12, (1 - progress) * 12) *
					(0.5 + 0.5 * Math.abs(Math.sin(progress * Math.PI * 5)));
		}

		return (
			2 +
			(100 * ROW_SCALE - 6) *
				envelope *
				(0.25 + random(`effect-${effect.from}-${index}`) * 0.75)
		);
	}),
}));

const waveform = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	peaks: number[],
) => {
	ctx.beginPath();
	for (let i = 0; i < peaks.length; i++) {
		ctx.lineTo(x + (i / peaks.length) * width, y + (height - peaks[i]) / 2);
		ctx.lineTo(
			x + ((i + 1) / peaks.length) * width,
			y + (height - peaks[i]) / 2,
		);
	}

	for (let i = peaks.length - 1; i >= 0; i--) {
		ctx.lineTo(
			x + ((i + 1) / peaks.length) * width,
			y + (height + peaks[i]) / 2,
		);
		ctx.lineTo(x + (i / peaks.length) * width, y + (height + peaks[i]) / 2);
	}

	ctx.closePath();
	ctx.fillStyle = 'rgba(255,255,255,0.6)';
	ctx.fill();
};

export const drawStudio = (
	ctx: CanvasRenderingContext2D,
	{
		width,
		responsivenessProgress,
		assets,
	}: {
		width: number;
		responsivenessProgress: number;
		assets: Record<string, HTMLImageElement>;
	},
) => {
	const height = 748;
	const timelineHeight = 582 * ROW_SCALE + 12;
	const topPanelHeight = height - 30 - 3 - timelineHeight;
	const canvasHeight = topPanelHeight - 40;
	// Keep the fully open panel widths while sliding them behind the window edges.
	const leftWidth = 215;
	const rightWidth = 297;
	const leftOccupied = (leftWidth + 3) * (1 - responsivenessProgress);
	const rightOccupied = (rightWidth + 3) * (1 - responsivenessProgress);
	const canvasWidth = Math.max(17, width - leftOccupied - rightOccupied);
	const toolbarY = 30 + canvasHeight;
	const timelineY = 30 + topPanelHeight + 3;

	ctx.save();
	clip(ctx, 0, 0, width, height);
	roundedRect(ctx, 0, 0, width, height, 0, BACKGROUND);
	roundedRect(ctx, 0, 29, width, 1, 0, '#000');
	for (const side of ['left', 'right'] as const) {
		const x = side === 'left' ? 10 : width - 26;
		roundedRect(ctx, x + 0.5, 7, 15, 15, 2.5, null, '#d8d8d8');
		const dividerX = side === 'left' ? x + 5.75 : x + 10.25;
		roundedRect(ctx, dividerX, 7.5, 1, 14, 0, '#d8d8d8');
		ctx.save();
		ctx.globalAlpha *= 1 - responsivenessProgress;
		roundedRect(
			ctx,
			side === 'left' ? x + 1 : x + 10.25,
			7.5,
			4.75,
			14,
			0,
			'#d8d8d8',
		);
		ctx.restore();
	}

	drawStudioIcon(ctx, 'RemotionGlyph', 42, 7.5, 14, '#d8d8d8');
	textInRow(ctx, 'announcements / WhatsNew', {
		x: 72,
		top: 0,
		height: 29,
		size: 13,
		color: '#cccccc',
		fontFamily: null,
		weight: null,
		align: null,
		fontStyle: null,
	});
	const breadcrumbIconX =
		79 + ctx.measureText('announcements / WhatsNew').width;
	drawStudioIcon(ctx, 'VscodeIcon', breadcrumbIconX, 6.5, 16, '#1594f6');
	caret(ctx, breadcrumbIconX + 25, 8, 10, true, '#5a6065');
	drawStudioIcon(ctx, 'SettingsIcon', width - 50, 6.5, 16, '#d8d8d8');

	// The sidebars slide behind their clipping bounds while the canvas expands.
	ctx.save();
	clip(ctx, 0, 30, leftOccupied, canvasHeight);
	ctx.translate(-responsivenessProgress * (leftWidth + 3), 30);
	roundedRect(ctx, 0, 0, 109, 2, 0, BLUE);
	text(ctx, 'Compositions', 10, 11, 13, '#fff');
	roundedRect(ctx, 109, 0, leftWidth - 109, 34, 0, '#2f363d');
	text(ctx, 'Assets', 119, 11, 13, LIGHT_TEXT);
	roundedRect(ctx, 0, 68, leftWidth, 1, 0, '#000');
	roundedRect(ctx, 8, 38, leftWidth - 40, 26, 4, 'rgba(255,255,255,0.06)');
	drawStudioIcon(ctx, 'SearchIcon', 19, 44, 14, '#8d9296');
	textInRow(ctx, 'Search...', {
		x: 40,
		top: 38,
		height: 26,
		size: 12,
		color: LIGHT_TEXT,
		fontFamily: null,
		weight: null,
		align: null,
		fontStyle: null,
	});
	text(ctx, '⌘+K', leftWidth - 67, 46, 11, '#72777c');
	text(ctx, '…', leftWidth - 23, 38, 16, LIGHT_TEXT);
	for (const [index, name] of [
		'Logo',
		'Showcases',
		'WhatsNew',
		'WhatsNew',
		'Endcard',
		'VideoElements',
	].entries()) {
		const y = 73 + index * 29;
		const isComposition = index === 3 || index === 4;
		if (index === 3) {
			roundedRect(ctx, 8, y, leftWidth - 12, 28, 4, 'rgba(255,255,255,0.06)');
		}

		drawStudioIcon(
			ctx,
			isComposition
				? 'VideoIcon'
				: index === 2
					? 'FolderOpenIcon'
					: 'FolderIcon',
			isComposition ? 28 : 20,
			y + 5,
			18,
			index === 3 ? '#fff' : LIGHT_TEXT,
		);
		textInRow(ctx, name, {
			x: isComposition ? 54 : 46,
			top: y,
			height: 28,
			size: 13,
			color: index === 3 ? '#fff' : LIGHT_TEXT,
			fontFamily: null,
			weight: null,
			align: null,
			fontStyle: null,
		});
	}

	roundedRect(ctx, leftWidth, 0, 3, canvasHeight, 0, '#000');
	ctx.restore();

	const previewScale = Math.min(
		(canvasWidth - 16) / 1920,
		(canvasHeight - 15) / 1080,
	);
	const previewWidth = 1920 * previewScale;
	const previewHeight = 1080 * previewScale;
	const previewX = leftOccupied + (canvasWidth - previewWidth) / 2;
	const previewY = 30 + (canvasHeight - previewHeight) / 2;
	const {endcard} = assets;
	if (endcard) {
		ctx.drawImage(endcard, previewX, previewY, previewWidth, previewHeight);
	}

	roundedRect(
		ctx,
		previewX + previewWidth * 0.6 - 1,
		previewY - 1,
		previewWidth * 0.4 + 2,
		previewHeight + 2,
		0,
		null,
		BLUE,
		2,
	);
	ctx.save();
	clip(ctx, width - rightOccupied, 30, rightOccupied, canvasHeight);
	ctx.translate(width - rightOccupied, 30);
	roundedRect(ctx, 0, 0, 3, canvasHeight, 0, '#000');
	ctx.translate(3, 0);
	roundedRect(ctx, 0, 0, rightWidth / 2, 2, 0, BLUE);
	text(ctx, 'Sequence', 10, 11, 13, '#fff');
	roundedRect(ctx, rightWidth / 2, 0, rightWidth / 2, 34, 0, '#2f363d');
	text(ctx, 'Jobs', rightWidth / 2 + 10, 11, 13, LIGHT_TEXT);
	textInRow(ctx, 'Endcard', {
		x: 10,
		top: 38,
		height: 28,
		size: 13,
		color: '#fff',
		fontFamily: null,
		weight: null,
		align: null,
		fontStyle: null,
	});
	drawStudioIcon(ctx, 'BracesIcon', 10, 71, 18, LIGHT_TEXT);
	textInRow(ctx, 'EndCard.tsx:49', {
		x: 36,
		top: 66,
		height: 28,
		size: 13,
		color: LIGHT_TEXT,
		fontFamily: null,
		weight: null,
		align: null,
		fontStyle: null,
	});
	for (const section of [
		{label: 'Controls', y: 98, expanded: true},
		{label: 'Transform', y: 166, expanded: false},
		{label: 'Crop', y: 198, expanded: false},
		{label: 'Effects', y: 230, expanded: false},
		{label: 'Actions', y: 262, expanded: true},
	]) {
		textInRow(ctx, section.label, {
			x: 10,
			top: section.y,
			height: 28,
			size: 12,
			color: LIGHT_TEXT,
			fontFamily: null,
			weight: 600,
			align: null,
			fontStyle: null,
		});
		if (section.label === 'Effects') {
			roundedRect(ctx, rightWidth - 25, section.y + 13.5, 13, 1, 0, FOREGROUND);
			roundedRect(ctx, rightWidth - 19, section.y + 7.5, 1, 13, 0, FOREGROUND);
		} else {
			caret(
				ctx,
				16 + ctx.measureText(section.label).width,
				section.y + 10,
				8,
				section.expanded,
				LIGHT_TEXT,
			);
		}
	}

	textInRow(ctx, 'Platform', {
		x: 10,
		top: 126,
		height: 28,
		size: 12,
		color: LIGHT_TEXT,
		fontFamily: null,
		weight: null,
		align: null,
		fontStyle: null,
	});
	roundedRect(ctx, rightWidth - 89.4, 129, 79.4, 22, 4, '#2f363d', '#13161b');
	textInRow(ctx, 'youtube', {
		x: rightWidth - 81.4,
		top: 126,
		height: 28,
		size: 12,
		color: '#fff',
		fontFamily: null,
		weight: null,
		align: null,
		fontStyle: null,
	});
	caret(ctx, rightWidth - 25, 136, 8, true, '#fff');
	for (const [index, action] of (
		[
			{label: 'Duplicate', icon: 'DuplicateIcon'},
			{label: 'Delete', icon: 'TrashIcon'},
		] as const
	).entries()) {
		const top = 290 + index * 28;
		drawStudioIcon(ctx, action.icon, 8, top + 3, 22, LIGHT_TEXT);
		textInRow(ctx, action.label, {
			x: 36,
			top,
			height: 28,
			size: 13,
			color: LIGHT_TEXT,
			fontFamily: null,
			weight: null,
			align: null,
			fontStyle: null,
		});
	}

	ctx.restore();

	roundedRect(ctx, 0, toolbarY, width, 1, 0, 'rgba(0,0,0,0.5)');
	const toolbarOpacity = Math.max(
		0,
		Math.min(1, (0.6 - responsivenessProgress) / 0.2),
	);
	ctx.save();
	ctx.globalAlpha *= toolbarOpacity;
	drawStudioIcon(ctx, 'CanvasFitIcon', 20, toolbarY + 10, 20, FOREGROUND);
	textInRow(ctx, 'Fit', {
		x: 44,
		top: toolbarY,
		height: 40,
		size: 12,
		color: FOREGROUND,
		fontFamily: null,
		weight: null,
		align: null,
		fontStyle: null,
	});
	caret(ctx, 80, toolbarY + 15, 10, true, FOREGROUND);
	drawStudioIcon(ctx, 'PlaybackRateIcon', 114, toolbarY + 10, 20, FOREGROUND);
	textInRow(ctx, '1x', {
		x: 138,
		top: toolbarY,
		height: 40,
		size: 12,
		color: FOREGROUND,
		fontFamily: null,
		weight: null,
		align: null,
		fontStyle: null,
	});
	caret(ctx, 172, toolbarY + 15, 10, true, FOREGROUND);
	const center = width / 2;
	for (const button of [
		{name: 'LoopIcon', x: -170, size: 18, color: BLUE},
		{name: 'VolumeIcon', x: -146, size: 21, color: FOREGROUND},
		{name: 'InPointIcon', x: -113, size: 16, color: FOREGROUND},
		{name: 'OutPointIcon', x: -95, size: 16, color: FOREGROUND},
		{name: 'JumpToStartIcon', x: -51, size: 18, color: FOREGROUND},
		{name: 'StepBackIcon', x: -26, size: 16, color: FOREGROUND},
		{name: 'StepForwardIcon', x: 16, size: 16, color: FOREGROUND},
		{name: 'CheckerboardIcon', x: 64, size: 18, color: BLUE},
		{name: 'MagnetIcon', x: 90, size: 18, color: BLUE},
		{name: 'FullscreenIcon', x: 152, size: 18, color: FOREGROUND},
	] as const) {
		drawStudioIcon(
			ctx,
			button.name,
			center + button.x,
			toolbarY + (40 - button.size) / 2,
			button.size,
			button.color,
		);
	}

	caret(ctx, center + 115, toolbarY + 15, 10, true, FOREGROUND);
	ctx.restore();
	drawStudioIcon(ctx, 'PlayIcon', width / 2 - 7, toolbarY + 13, 14, FOREGROUND);
	drawStudioIcon(ctx, 'RocketIcon', width - 105, toolbarY + 11, 18, FOREGROUND);
	textInRow(ctx, 'Render', {
		x: width - 81,
		top: toolbarY,
		height: 40,
		size: 12,
		color: FOREGROUND,
		fontFamily: null,
		weight: null,
		align: null,
		fontStyle: null,
	});
	caret(
		ctx,
		width - 81 + ctx.measureText('Render').width + 8,
		toolbarY + 14,
		12,
		true,
		'#9ba0a4',
	);
	roundedRect(ctx, 0, timelineY - 3, width, 3, 0, '#000');

	ctx.save();
	ctx.translate(0, timelineY);
	roundedRect(ctx, 0, 0, width, timelineHeight, 0, TRACK_BACKGROUND);
	roundedRect(ctx, 0, 0, 198, timelineHeight, 0, '#202428');
	const labels = [
		{
			label: 'Chapters',
			asset: null,
			top: 84 * ROW_SCALE,
			height: 60 * ROW_SCALE,
			selected: false,
			expanded: true,
			indent: 44,
		},
		{
			label: '<Video>',
			asset: 'whats11.mov',
			top: 144 * ROW_SCALE,
			height: 92 * ROW_SCALE,
			selected: false,
			expanded: false,
			indent: 60,
		},
		{
			label: '<BasicCaptions>',
			asset: null,
			top: 236 * ROW_SCALE,
			height: 44 * ROW_SCALE,
			selected: false,
			expanded: false,
			indent: 60,
		},
		{
			label: 'Soundtrack',
			asset: 'score.wav',
			top: 280 * ROW_SCALE,
			height: 34,
			selected: false,
			expanded: true,
			indent: 44,
		},
		{
			label: 'Endcard',
			asset: null,
			top: 280 * ROW_SCALE + 55,
			height: 58 * ROW_SCALE,
			selected: true,
			expanded: false,
			indent: 60,
		},
	];
	roundedRect(ctx, 0, labels[0].top - 1, 198, 1, 0, '#171b1e');
	for (const row of labels) {
		roundedRect(
			ctx,
			0,
			row.top,
			198,
			row.height,
			0,
			row.selected ? '#3b3f42' : '#202428',
		);
		roundedRect(ctx, 0, row.top + row.height - 1, 198, 1, 0, '#171b1e');
		drawStudioIcon(
			ctx,
			'EyeIcon',
			8,
			row.top + (row.height - 12) / 2,
			12,
			FOREGROUND,
		);
		if (row.expanded) {
			caret(ctx, 30, row.top + (row.height - 10) / 2, 10, true, LIGHT_TEXT);
		}

		if (row.selected) {
			drawStudioIcon(
				ctx,
				'VideoIcon',
				44,
				row.top + (row.height - 12) / 2,
				12,
				FOREGROUND,
			);
		}

		textInRow(
			ctx,
			row.label,
			{
				x: row.indent,
				top: row.top + (row.asset ? (row.height - 26) / 2 : 0),
				height: row.asset ? 13 : row.height,
				size: 12,
				color: FOREGROUND,
				fontFamily: null,
				weight: null,
				align: null,
				fontStyle: null,
			},
			198 - row.indent - 8,
		);
		if (row.asset) {
			textInRow(
				ctx,
				row.asset,
				{
					x: row.indent,
					top: row.top + row.height / 2,
					height: 13,
					size: 12,
					color: 'rgba(255,255,255,0.3)',
					fontFamily: null,
					weight: null,
					align: null,
					fontStyle: null,
				},
				198 - row.indent - 8,
			);
		}
	}

	const volumeRowTop = 280 * ROW_SCALE + 34;
	const volumeRowHeight = 21;
	const volumeRowCenter = volumeRowTop + volumeRowHeight / 2;
	drawStudioIcon(
		ctx,
		'PreviousKeyframeIcon',
		12,
		volumeRowCenter - 7,
		14,
		'#ccc',
	);
	drawStudioIcon(
		ctx,
		'KeyframeDiamondIcon',
		28,
		volumeRowCenter - 6,
		12,
		LIGHT_TEXT,
	);
	drawStudioIcon(ctx, 'NextKeyframeIcon', 42, volumeRowCenter - 7, 14, '#ccc');
	textInRow(ctx, 'Volume', {
		x: 62,
		top: volumeRowTop,
		height: volumeRowHeight,
		size: 12,
		color: LIGHT_TEXT,
		fontFamily: null,
		weight: null,
		align: null,
		fontStyle: null,
	});
	textInRow(ctx, '1.00', {
		x: 176,
		top: volumeRowTop,
		height: volumeRowHeight,
		size: 12,
		color: BLUE,
		fontFamily: null,
		weight: null,
		align: 'right',
		fontStyle: null,
	});
	const zoom = Math.max(1, width - 200 - 32) / DURATION;
	const trackX = 216;
	const filmstrip = assets.studioFilmstrip;
	for (const chapter of [
		{
			from: 0,
			duration: 250,
			name: 'Intro',
			caption:
				'Here are some of the things that we recently added to Remotion.',
			sourceLeft: 578,
		},
		{
			from: 250,
			duration: 864,
			name: 'Light leaks',
			caption:
				'First up, light leaks. They are a common effect in video editing and now we have a native component for it. They are procedurally generated.',
			sourceLeft: 1010,
		},
		{
			from: 1114,
			duration: 180,
			name: 'Outro',
			caption: 'Subscribe for more videos.',
			sourceLeft: null,
		},
	]) {
		const chapterX = trackX + chapter.from * zoom;
		const chapterWidth = chapter.duration * zoom;
		const active = chapter.from === 1114;
		for (const row of [
			{
				top: 84 * ROW_SCALE,
				height: 60 * ROW_SCALE,
				label: chapter.name,
				color: BLUE,
				icon: true,
				selected: false,
			},
			{
				top: 236 * ROW_SCALE,
				height: 44 * ROW_SCALE,
				label: chapter.caption,
				color: active ? '#b66f1f' : '#dd8625',
				icon: false,
				selected: false,
			},
			{
				top: 280 * ROW_SCALE + 55,
				height: 58 * ROW_SCALE,
				label: active ? 'Endcard' : 'Sound effects',
				color: BLUE,
				icon: active,
				selected: active,
			},
		]) {
			ctx.save();
			clip(ctx, chapterX, row.top, chapterWidth, row.height);
			ctx.globalAlpha *= active ? 1 : 0.5;
			roundedRect(
				ctx,
				chapterX + TIMELINE_ITEM_GAP / 2,
				row.top + TIMELINE_ITEM_GAP / 2,
				chapterWidth - TIMELINE_ITEM_GAP,
				row.height - TIMELINE_ITEM_GAP,
				0,
				row.color,
			);
			if (row.selected) {
				roundedRect(
					ctx,
					chapterX + 2,
					row.top + 2,
					chapterWidth - 4,
					row.height - 4,
					0,
					null,
					'#fff',
					2,
				);
			}

			const contentLeft = row.selected ? 9 : 5;
			const labelLeft = contentLeft + (row.icon ? 14 : 0);
			if (row.icon) {
				drawStudioIcon(
					ctx,
					'VideoIcon',
					chapterX + contentLeft,
					row.top + (row.height - 10) / 2,
					10,
					'#fff',
				);
			}

			textInRow(
				ctx,
				row.label,
				{
					x: chapterX + labelLeft,
					top: row.top,
					height: row.height,
					size: 12,
					color: '#fff',
					fontFamily: null,
					weight: null,
					align: null,
					fontStyle: null,
				},
				chapterWidth - labelLeft - 5,
			);
			ctx.restore();
		}

		// Thumbnails and waveform are one video item with the same gap as other clips.
		ctx.save();
		clip(
			ctx,
			chapterX + TIMELINE_ITEM_GAP / 2,
			144 * ROW_SCALE + TIMELINE_ITEM_GAP / 2,
			chapterWidth - TIMELINE_ITEM_GAP,
			92 * ROW_SCALE - TIMELINE_ITEM_GAP,
		);
		ctx.save();
		clip(ctx, chapterX, 144 * ROW_SCALE, chapterWidth, 52 * ROW_SCALE);
		ctx.globalAlpha *= active ? 1 : 0.5;
		if (active && endcard) {
			const thumbnailWidth = (52 * ROW_SCALE * 16) / 9;
			for (let x = 0; x < chapterWidth; x += thumbnailWidth) {
				ctx.drawImage(
					endcard,
					chapterX + x,
					144 * ROW_SCALE,
					thumbnailWidth,
					52 * ROW_SCALE,
				);
			}
		} else if (filmstrip && chapter.sourceLeft !== null) {
			// Crop only the actual video thumbnails; the surrounding UI is drawn above.
			if (chapter.from !== 0) {
				ctx.filter = 'brightness(1.7) contrast(1.17647)';
			}

			const sourceWidth = Math.min(
				chapterWidth / ROW_SCALE,
				filmstrip.naturalWidth - chapter.sourceLeft,
			);
			ctx.drawImage(
				filmstrip,
				chapter.sourceLeft,
				202,
				sourceWidth,
				52,
				chapterX,
				144 * ROW_SCALE,
				sourceWidth * ROW_SCALE,
				52 * ROW_SCALE,
			);
		}

		ctx.restore();
		ctx.save();
		clip(ctx, chapterX, 196 * ROW_SCALE, chapterWidth, 40 * ROW_SCALE);
		if (filmstrip) {
			// Preserve the actual speech waveform, including Intro's trimmed silence.
			const sourceLeft = active
				? 578 + 1932 * 0.75
				: (chapter.sourceLeft ?? 578);
			const sourceWidth =
				chapter.from === 0
					? 222
					: active
						? chapterWidth / ((zoom / 0.85) * ROW_SCALE)
						: 1500;
			ctx.globalAlpha *= chapter.from === 0 ? 0.5 : 1;
			if (active) {
				// Undo the capture's 50% dimming against the dark timeline background.
				ctx.filter = 'brightness(1.7) contrast(1.17647)';
			}

			ctx.drawImage(
				filmstrip,
				sourceLeft,
				254,
				sourceWidth,
				40,
				chapterX,
				196 * ROW_SCALE,
				chapterWidth,
				40 * ROW_SCALE,
			);
		}

		ctx.restore();
		ctx.restore();
	}

	const soundtrackY = 280 * ROW_SCALE;
	const soundtrackWidth = DURATION * zoom;
	const gradient = ctx.createLinearGradient(
		0,
		soundtrackY,
		0,
		soundtrackY + 34,
	);
	gradient.addColorStop(0, 'rgb(16,171,58)');
	gradient.addColorStop(0.6, 'rgb(43,165,63)');
	ctx.save();
	clip(
		ctx,
		trackX + TIMELINE_ITEM_GAP / 2,
		soundtrackY + TIMELINE_ITEM_GAP / 2,
		soundtrackWidth - TIMELINE_ITEM_GAP,
		34 - TIMELINE_ITEM_GAP,
	);
	roundedRect(ctx, trackX, soundtrackY, soundtrackWidth, 34, 2, null);
	ctx.fillStyle = gradient;
	ctx.fill();
	waveform(ctx, trackX, soundtrackY, soundtrackWidth, 34, soundtrackPeaks);
	ctx.fillStyle = 'rgba(0,0,0,0.6)';
	ctx.beginPath();
	ctx.moveTo(trackX, soundtrackY);
	ctx.lineTo(trackX, soundtrackY + 34);
	ctx.lineTo(trackX + 30 * zoom, soundtrackY);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(trackX + 1263 * zoom, soundtrackY);
	ctx.lineTo(trackX + soundtrackWidth, soundtrackY + 34);
	ctx.lineTo(trackX + soundtrackWidth, soundtrackY);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
	roundedRect(
		ctx,
		trackX,
		soundtrackY + 43.5,
		soundtrackWidth,
		2,
		0,
		'rgba(255,255,255,0.1)',
	);
	for (const frame of [0, 30, 1263, 1293]) {
		const x = trackX + frame * zoom;
		const y = soundtrackY + 44.5;
		ctx.beginPath();
		ctx.moveTo(x, y - 4.5);
		ctx.lineTo(x + 4.5, y);
		ctx.lineTo(x, y + 4.5);
		ctx.lineTo(x - 4.5, y);
		ctx.closePath();
		ctx.fillStyle = LIGHT_TEXT;
		ctx.fill();
		ctx.strokeStyle = 'rgba(0,0,0,0.4)';
		ctx.lineWidth = 1;
		ctx.stroke();
	}

	for (const effect of effects) {
		const x = trackX + effect.from * zoom;
		const y = 338 * ROW_SCALE + 55;
		ctx.save();
		clip(
			ctx,
			x + TIMELINE_ITEM_GAP / 2,
			y + TIMELINE_ITEM_GAP / 2,
			effect.duration * zoom - TIMELINE_ITEM_GAP,
			100 * ROW_SCALE - TIMELINE_ITEM_GAP,
		);
		ctx.globalAlpha *= 0.5;
		roundedRect(
			ctx,
			x,
			y,
			effect.duration * zoom,
			100 * ROW_SCALE,
			2,
			'#2ba53f',
		);
		waveform(ctx, x, y, effect.duration * zoom, 100 * ROW_SCALE, effect.peaks);
		ctx.restore();
	}

	roundedRect(ctx, 0, 0, width, 40, 0, BACKGROUND);
	text(ctx, '00:41.04', 8, 6.5, 14, FOREGROUND, {
		fontFamily: 'monospace',
		weight: null,
		align: null,
	});
	text(ctx, '1234', 8, 21.5, 10, LIGHT_TEXT, {
		fontFamily: 'monospace',
		weight: null,
		align: null,
	});
	drawStudioIcon(ctx, 'CanvasZoomOutIcon', 109, 10, 17, LIGHT_TEXT);
	roundedRect(ctx, 131, 17, 40, 4, 4, '#353a3e');
	roundedRect(ctx, 146, 14, 10, 10, 5, '#fff');
	drawStudioIcon(ctx, 'CanvasZoomIcon', 176, 10, 17, LIGHT_TEXT);
	const seconds = [
		1, 2, 5, 10, 15, 30, 60, 120, 180, 300, 600, 900, 1800, 3600,
	];
	const labelSeconds =
		seconds.find(
			(interval) => interval >= (8 + 8 * 12 * 0.6 + 16) / (zoom * 30),
		) ?? 3600;
	const majorInterval = labelSeconds * 30;
	const frameIntervals = [1, 2, 3, 5, 6, 10, 15];
	const minorFrames = frameIntervals.find((interval) => interval >= 5 / zoom);
	const minorSeconds = seconds.find(
		(interval) =>
			interval >= 16 / (zoom * 30) &&
			interval < labelSeconds &&
			labelSeconds % interval === 0,
	);
	const minorInterval = minorFrames ?? (minorSeconds ?? labelSeconds) * 30;
	const mediumInterval = minorFrames
		? (frameIntervals.find(
				(interval) => interval >= 24 / zoom && interval % minorFrames === 0,
			) ?? majorInterval)
		: (seconds.find(
				(interval) =>
					interval >= 48 / (zoom * 30) &&
					interval < labelSeconds &&
					interval % (minorSeconds ?? labelSeconds) === 0 &&
					labelSeconds % interval === 0,
			) ?? labelSeconds) * 30;
	ctx.save();
	clip(ctx, 200, 0, width - 200, 40);
	for (let tick = 0; tick < DURATION; tick++) {
		if (tick % majorInterval !== 0 && tick % minorInterval !== 0) {
			continue;
		}

		const x = trackX + tick * zoom;
		const tickHeight =
			tick % majorInterval === 0
				? 15
				: tick % mediumInterval === 0 || (minorFrames && tick % 30 === 0)
					? 5
					: 2;
		roundedRect(ctx, x, 0, 1, tickHeight, 0, '#3b4145');
		if (tick > 0 && tick % majorInterval === 0) {
			text(
				ctx,
				`00:${String(tick / 30).padStart(2, '0')}.00`,
				x + 8,
				8,
				12,
				LIGHT_TEXT,
			);
		}
	}

	ctx.restore();
	const playheadX = trackX + 1234 * zoom;
	roundedRect(ctx, playheadX, 0, 1, timelineHeight, 0, '#f02c00');
	ctx.beginPath();
	ctx.moveTo(playheadX - 8, 3);
	ctx.lineTo(playheadX + 9, 3);
	ctx.lineTo(playheadX + 9, 11);
	ctx.lineTo(playheadX + 0.5, 19);
	ctx.lineTo(playheadX - 8, 11);
	ctx.closePath();
	ctx.fillStyle = '#f02c00';
	ctx.fill();
	ctx.restore();
	ctx.restore();
};
