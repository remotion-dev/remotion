import {drawAppIcon} from './app-icons';
import {roundedRect, text, textInRow} from './primitives';

const font = {
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
	weight: null,
	align: null,
};

export const drawCodex = (
	ctx: CanvasRenderingContext2D,
	assets: Record<string, HTMLImageElement>,
) => {
	ctx.save();
	roundedRect(ctx, 0, 0, 667, 748, 6, '#171717');
	ctx.clip();
	ctx.save();
	// The original 640px Codex layout stays centered inside the 667px window.
	ctx.translate(13.5, 0);
	ctx.fillStyle = '#3b3b3b';
	ctx.fillRect(0, 41, 640, 1);
	drawAppIcon(ctx, 'folder', 12, 11.96, 14, 17.08, '#e4e4e4');
	textInRow(ctx, 'Make announcement video', {
		...font,
		x: 36,
		top: 0,
		height: 41,
		size: 15.5,
		color: '#e4e4e4',
		weight: 450,
		fontStyle: null,
	});
	drawAppIcon(ctx, 'ellipsis', 448, 11.5, 17.25, 18, '#8b8b8b');
	drawAppIcon(ctx, 'share', 481, 13, 18.9, 15.4, '#8b8b8b');
	textInRow(ctx, 'Share', {
		...font,
		x: 501,
		top: 0,
		height: 41,
		size: 12,
		color: '#8b8b8b',
		fontStyle: null,
	});
	drawAppIcon(ctx, 'sliders', 550, 13, 18.2, 14, '#8b8b8b');
	drawAppIcon(ctx, 'bottomPanel', 582, 12.3, 14, 15.4, '#8b8b8b');
	drawAppIcon(ctx, 'rightPanel', 613, 12.3, 14, 15.4, '#8b8b8b');

	const message =
		'Please import the videos I just recorded from ~/Downloads and put them on a timeline. caption it.';
	ctx.font = `400 16px ${font.fontFamily}`;
	const skillLabel = '/remotion-best-practices';
	const skillWidth = 21 + ctx.measureText(skillLabel).width;
	const lines: string[] = [];
	let line = '';
	for (const word of message.split(' ')) {
		const nextLine = line ? `${line} ${word}` : word;
		const availableWidth = 468 - (lines.length === 0 ? skillWidth + 8 : 0);
		if (line && ctx.measureText(nextLine).width > availableWidth) {
			lines.push(line);
			line = word;
		} else {
			line = nextLine;
		}
	}

	lines.push(line);
	const firstMessageHeight = lines.length * 24 + 24;
	roundedRect(ctx, 116, 74, 500, firstMessageHeight, 16, '#213569');
	for (let i = 0; i < lines.length; i++) {
		text(
			ctx,
			lines[i],
			132 + (i === 0 ? skillWidth + 8 : 0),
			90 + i * 24,
			16,
			'#f5f9fe',
			font,
		);
	}

	const skillTop = 90;
	const skillLeft = 132;
	const skillColor = '#5896e8';
	drawAppIcon(ctx, 'skill', skillLeft, skillTop - 1.5, 18, 18, skillColor);
	text(ctx, skillLabel, skillLeft + 21, skillTop, 16, skillColor, font);

	const assistantTop = 74 + firstMessageHeight + 18;
	text(
		ctx,
		'Imported your videos and added captions.',
		24,
		assistantTop + 4,
		16,
		'#e4e4e4',
		font,
	);
	const secondMessage = 'add our endcard to it';
	const secondMessageWidth = ctx.measureText(secondMessage).width + 32;
	const secondMessageTop = assistantTop + 42;
	roundedRect(
		ctx,
		616 - secondMessageWidth,
		secondMessageTop,
		secondMessageWidth,
		48,
		16,
		'#213569',
	);
	text(
		ctx,
		secondMessage,
		632 - secondMessageWidth,
		secondMessageTop + 16,
		16,
		'#f5f9fe',
		font,
	);
	const endcardMessageTop = secondMessageTop + 66;
	text(
		ctx,
		'Added your endcard.',
		24,
		endcardMessageTop + 4,
		16,
		'#e4e4e4',
		font,
	);
	const previewTop = endcardMessageTop + 36;
	const {endcard} = assets;
	const previewHeight =
		318 * (endcard ? endcard.naturalHeight / endcard.naturalWidth : 9 / 16);
	ctx.save();
	roundedRect(ctx, 24, previewTop, 320, previewHeight + 2, 7, '#1f1f1f');
	ctx.clip();
	if (endcard) {
		ctx.drawImage(endcard, 25, previewTop + 1, 318, previewHeight);
	}

	ctx.restore();
	roundedRect(
		ctx,
		24.5,
		previewTop + 0.5,
		319,
		previewHeight + 1,
		6.5,
		null,
		'#3b3b3b',
	);
	const actionsTop = previewTop + previewHeight + 14;
	drawAppIcon(ctx, 'copy', 24, actionsTop, 18, 18, '#8b8b8b');
	drawAppIcon(ctx, 'feedback', 54, actionsTop + 1, 16, 16, '#8b8b8b');
	drawAppIcon(ctx, 'handoff', 82, actionsTop, 18, 18, '#8b8b8b', 1.2);

	ctx.save();
	// Reduce the original 62px bottom gap by 30%, moving the whole composer.
	ctx.translate(0, (748 - 596 - 90) * 0.3);
	ctx.save();
	ctx.shadowColor = '#00000020';
	ctx.shadowBlur = 80;
	ctx.shadowOffsetY = 4;
	roundedRect(ctx, 24, 596, 592, 90, 19, '#252525');
	ctx.shadowColor = '#00000040';
	ctx.shadowBlur = 8;
	ctx.shadowOffsetY = 2;
	roundedRect(ctx, 24, 596, 592, 90, 19, '#252525');
	ctx.restore();
	roundedRect(ctx, 24.5, 596.5, 591, 89, 18.5, null, '#3b3b3b');
	text(ctx, 'Do anything', 36, 611, 16, '#8b8b8b', font);
	drawAppIcon(ctx, 'plus', 36, 656, 19, 19, '#e4e4e4', 1.45);
	drawAppIcon(ctx, 'alertCircle', 69, 657.25, 15, 15.75, '#e98047');
	text(ctx, 'Full access', 87, 659, 14, '#e98047');

	// Match the right-aligned model selector in the composer.
	ctx.font = '400 14px Arial, Helvetica, sans-serif';
	const modelWidth = ctx.measureText('GPT-6.1 Sol').width;
	const effortWidth = ctx.measureText('High').width;
	const selectorWidth =
		14 + 8 + 15 + 4 + modelWidth + 4 + effortWidth + 1 + 13 + 11 + 16;
	const selectorLeft = 569 - selectorWidth;
	const composerRowCenter = 665.5;
	drawAppIcon(
		ctx,
		'spinner',
		selectorLeft - 5.7,
		composerRowCenter - 15.4 / 2,
		15.4,
		15.4,
		'#8b8b8b',
	);
	drawAppIcon(
		ctx,
		'bolt',
		selectorLeft + 18.5,
		composerRowCenter - 15 / 2,
		18,
		15,
		'#e4e4e4',
	);
	for (const {label, x, color} of [
		{label: 'GPT-6.1 Sol', x: selectorLeft + 38, color: '#e4e4e4'},
		{label: 'High', x: selectorLeft + 41 + modelWidth, color: '#8b8b8b'},
	]) {
		textInRow(ctx, label, {
			x,
			top: composerRowCenter - 9,
			height: 18,
			size: 14,
			color,
			fontFamily: null,
			weight: null,
			align: null,
			fontStyle: null,
		});
	}

	drawAppIcon(
		ctx,
		'chevronDown',
		selectorLeft + 43.4 + modelWidth + effortWidth,
		composerRowCenter - 16.25 / 2,
		18.2,
		16.25,
		'#8b8b8b',
	);
	drawAppIcon(ctx, 'microphone', 554, composerRowCenter - 8, 16, 16, '#e4e4e4');
	roundedRect(ctx, 582, 653, 26, 25, 12.5, '#395ab9');
	drawAppIcon(ctx, 'voice', 587, 657.5, 16, 16, '#ffffff');
	ctx.restore();
	ctx.restore();
	const border = 667 / 720;
	roundedRect(
		ctx,
		border / 2,
		border / 2,
		667 - border,
		748 - border,
		6 - border / 2,
		null,
		'#454545',
		border,
	);
	ctx.restore();
};
