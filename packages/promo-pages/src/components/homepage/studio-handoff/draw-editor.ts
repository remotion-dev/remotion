import {drawAppIcon} from './app-icons';
import {editorCode} from './editor-code';
import {roundedRect, text, textInRow} from './primitives';

const font = {
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
	weight: null,
	align: null,
};

export const drawEditor = (ctx: CanvasRenderingContext2D) => {
	const scale = 667 / 720;
	ctx.save();
	roundedRect(ctx, 0, 0, 667, 748, 6, '#131414');
	ctx.clip();
	ctx.save();
	ctx.scale(scale, scale);
	ctx.translate(1, 1);
	ctx.fillStyle = '#181919';
	ctx.fillRect(0, 0, 718, 28);
	ctx.fillStyle = '#2b2b2b';
	ctx.fillRect(0, 27, 718, 1);
	for (const [index, color] of ['#ff5f57', '#febc2e', '#28c840'].entries()) {
		roundedRect(ctx, 8 + index * 20, 7.5, 12, 12, 6, color);
	}

	textInRow(ctx, 'WhatsNew.tsx — announcements', {
		...font,
		x: 359,
		top: 0,
		height: 27,
		size: 12,
		color: '#999999',
		align: 'center',
		fontStyle: null,
	});
	drawAppIcon(ctx, 'editorEllipsis', 694, 6.5, 14, 14, '#888888');
	const tabs = [
		{label: 'WhatsNew.tsx', width: 126},
		{label: 'Root.tsx', width: 111},
		{label: 'SlideInOverlay.tsx', width: 163},
	];
	let tabLeft = 0;
	for (const [index, tab] of tabs.entries()) {
		const active = index === 0;
		if (!active) {
			ctx.fillStyle = '#181919';
			ctx.fillRect(tabLeft, 28, tab.width, 34);
			ctx.fillStyle = '#2b2b2b';
			ctx.fillRect(tabLeft, 28, 1, 34);
		}

		const inset = active ? 0 : 1;
		drawAppIcon(ctx, 'react', tabLeft + 10 + inset, 38, 14, 14, '#519aba');
		ctx.font = `${index === 2 ? 'italic ' : ''}400 12px ${font.fontFamily}`;
		const labelWidth = tab.width - 54 - inset;
		let {label} = tab;
		if (ctx.measureText(label).width > labelWidth) {
			while (label && ctx.measureText(`${label}…`).width > labelWidth) {
				label = label.slice(0, -1);
			}

			label += '…';
		}

		textInRow(ctx, label, {
			...font,
			x: tabLeft + 31 + inset,
			top: 28,
			height: 34,
			size: 12,
			color: active ? '#e7e7e7' : '#8e8e8e',
			fontStyle: index === 2 ? 'italic' : null,
		});
		drawAppIcon(
			ctx,
			'editorClose',
			tabLeft + tab.width - 23,
			38,
			14,
			14,
			active ? '#e7e7e7' : '#8e8e8e',
		);
		tabLeft += tab.width;
	}

	drawAppIcon(ctx, 'editorEllipsis', 696, 36, 14, 14, '#777777');
	let breadcrumbLeft = 16;
	for (const crumb of [
		'src',
		'announcements',
		'whats-new-in-remotion',
		'WhatsNew.tsx',
		'…',
	]) {
		if (crumb === 'WhatsNew.tsx') {
			drawAppIcon(ctx, 'react', breadcrumbLeft, 66.5, 13, 13, '#519aba');
			breadcrumbLeft += 18;
		}

		textInRow(ctx, crumb, {
			...font,
			x: breadcrumbLeft,
			top: 62,
			height: 22,
			size: 12,
			color: '#9c9c9c',
			fontStyle: null,
		});
		breadcrumbLeft += ctx.measureText(crumb).width;
		if (crumb !== '…') {
			breadcrumbLeft += 6;
			textInRow(ctx, '›', {
				...font,
				x: breadcrumbLeft,
				top: 62,
				height: 22,
				size: 12,
				color: '#686868',
				fontStyle: null,
			});
			breadcrumbLeft += ctx.measureText('›').width + 6;
		}
	}

	ctx.fillStyle = '#131414';
	ctx.fillRect(0, 82, 718, 748 / scale - 82);
	const codeFont = {
		fontFamily: 'Menlo, Monaco, "Courier New", monospace',
		weight: null,
		align: null,
	};
	for (const [index, tokens] of editorCode.entries()) {
		const top = 85.5 + index * 21;
		text(ctx, String(index + 1), 43, top, 14, '#858585', {
			...codeFont,
			align: 'right',
		});
		let left = 68;
		for (const [content, color] of tokens) {
			text(ctx, content, left, top, 14, color, codeFont);
			left += ctx.measureText(content).width;
		}
	}

	ctx.restore();
	roundedRect(
		ctx,
		scale / 2,
		scale / 2,
		667 - scale,
		748 - scale,
		6 - scale / 2,
		null,
		'#454545',
		scale,
	);
	ctx.restore();
};
