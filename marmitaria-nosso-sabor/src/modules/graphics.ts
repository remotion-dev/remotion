/**
 * Ilustrações vetoriais do site: ícones das categorias, ingredientes que
 * flutuam no topo, o caminho "sacola → WhatsApp → sua casa" e o relógio
 * com a faixa de funcionamento.
 */
import {store} from '../data';

const stroke = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';

/** Ícones das categorias (traço desenhado na animação). */
export const categoryIcons: Record<string, string> = {
	// Panela com vapor (feijoada de sábado)
	sabado: `<path ${stroke} d="M4 11h16v2.5A6.5 6.5 0 0 1 13.5 20h-3A6.5 6.5 0 0 1 4 13.5V11Z"/><path ${stroke} d="M2 11h20"/><path ${stroke} d="M9 7.5c-.8-1 .8-1.6 0-2.8M12.5 7.5c-.8-1 .8-1.6 0-2.8M16 7.5c-.8-1 .8-1.6 0-2.8"/>`,
	// Marmitex com tampa
	executiva: `<path ${stroke} d="M3.5 11h17l-1.6 7.4a2 2 0 0 1-2 1.6H7.1a2 2 0 0 1-2-1.6L3.5 11Z"/><path ${stroke} d="M2.5 11h19M12 11v9"/><path ${stroke} d="M4 7.5h16l-1 2H5Z"/>`,
	// Tigela com folhas
	saladas: `<path ${stroke} d="M3 12.5h18a9 9 0 0 1-18 0Z"/><path ${stroke} d="M12 12.5c0-4 2-6.5 5.5-7.5-.6 3.4-2.4 6-5.5 7.5ZM12 12.5c-.8-3.2-3-5.2-6.2-5.4.8 3 3 5 6.2 5.4Z"/>`,
	// Copo com canudo
	bebidas: `<path ${stroke} d="M6 7.5h12l-1.4 12.5H7.4L6 7.5Z"/><path ${stroke} d="M13.5 7.5 15.5 3H19M6.6 12h10.8"/>`,
	// Pudim
	doces: `<path ${stroke} d="M7 18.5h10l-1.6-8.5H8.6L7 18.5Z"/><path ${stroke} d="M8.6 10c0-2 1.5-3.5 3.4-3.5s3.4 1.5 3.4 3.5M4.5 18.5h15"/><path ${stroke} d="M10 13.5c1 .8 3 .8 4 0"/>`,
};

export const iconSvg = (id: string) =>
	`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${categoryIcons[id] ?? categoryIcons.executiva}</svg>`;

/** Ingredientes que flutuam ao redor da marmita (posições em % do hero). */
type Bit = {x: number; y: number; d: number; r: number; kind: 'rice' | 'bean' | 'leaf' | 'pepper' | 'garlic'; s: number};
const bits: Bit[] = [
	{x: 52, y: 14, d: 0.6, r: 20, kind: 'leaf', s: 1.1},
	{x: 92, y: 18, d: 1, r: -30, kind: 'bean', s: 1},
	{x: 96, y: 52, d: 0.4, r: 60, kind: 'rice', s: 1.2},
	{x: 86, y: 86, d: 0.8, r: -10, kind: 'pepper', s: 1},
	{x: 56, y: 88, d: 1.2, r: 40, kind: 'bean', s: 0.8},
	{x: 47, y: 62, d: 0.3, r: -50, kind: 'rice', s: 0.9},
	{x: 70, y: 8, d: 0.9, r: 15, kind: 'rice', s: 1},
	{x: 99, y: 34, d: 0.7, r: 120, kind: 'leaf', s: 0.8},
	{x: 63, y: 95, d: 0.5, r: 80, kind: 'garlic', s: 1},
	{x: 40, y: 8, d: 0.35, r: 10, kind: 'rice', s: 0.7},
	{x: 6, y: 92, d: 0.5, r: -20, kind: 'leaf', s: 0.9},
	{x: 33, y: 96, d: 0.9, r: 30, kind: 'bean', s: 0.9},
];

const bitShape: Record<Bit['kind'], string> = {
	rice: `<ellipse cx="0" cy="0" rx="13" ry="5" fill="#f4ead6"/><ellipse cx="-3" cy="-1.6" rx="6" ry="1.4" fill="#fff" opacity=".7"/>`,
	bean: `<ellipse cx="0" cy="0" rx="14" ry="9" fill="#1f0f09"/><path d="M-9 -2c4-4 12-4 15 0" stroke="#5a3a2c" stroke-width="2" fill="none" opacity=".8"/><ellipse cx="-4" cy="-4" rx="4" ry="1.6" fill="#fff" opacity=".35"/>`,
	leaf: `<path d="M-18 6C-12-10 6-14 20-8 10 6-6 12-18 6Z" fill="#3f7a2c"/><path d="M-16 5C-6 0 6-4 18-7" stroke="#8cc06a" stroke-width="1.5" fill="none" opacity=".7"/>`,
	pepper: `<circle r="8" fill="#d63a22"/><circle cx="-2.5" cy="-2.5" r="2.5" fill="#fff" opacity=".45"/>`,
	garlic: `<path d="M0-12C7-6 10 2 8 7S-5 12-8 7-7-6 0-12Z" fill="#efe3cf"/><path d="M0-10V9" stroke="#c9b597" stroke-width="1.2"/>`,
};

export function floatingBits(mobile: boolean) {
	const list = mobile ? bits.filter((_, i) => i % 2 === 0) : bits;
	return list
		.map(
			(b) =>
				`<span class="bit" data-depth="${b.d}" style="left:${b.x}%;top:${b.y}%"><svg viewBox="-24 -24 48 48" style="transform:rotate(${b.r}deg) scale(${b.s})">${bitShape[b.kind]}</svg></span>`,
		)
		.join('');
}

/** Caminho do pedido: sacola → WhatsApp → casa. */
export function routeSvg() {
	return `<svg class="route" viewBox="0 0 1200 200" aria-hidden="true">
		<path class="route__base" d="M80 120 C 260 20, 380 190, 600 100 S 960 30, 1120 110" />
		<path class="route__line" d="M80 120 C 260 20, 380 190, 600 100 S 960 30, 1120 110" />
		<g class="route__stop" data-stop="0" transform="translate(80 120)">
			<circle r="34"/><g transform="translate(-14 -16)"><path ${stroke} d="M3 8h22l-1.6 18H4.6L3 8Z M9 8V6a5 5 0 0 1 10 0v2"/></g>
		</g>
		<g class="route__stop" data-stop="1" transform="translate(600 100)">
			<circle r="34"/><g transform="translate(-14 -14)"><path ${stroke} d="M14 1.5A12.5 12.5 0 0 0 3.3 20.4L1.5 26.5l6.3-1.7A12.5 12.5 0 1 0 14 1.5Z"/><path d="M9.5 8.5c0 5 4 9.5 9.5 9.5l1.4-2.1-2.8-1.4-1.4 1.4c-1.4-.6-3.2-2.4-3.8-3.8l1.4-1.4-1.4-2.8-2.9.6Z" fill="currentColor"/></g>
		</g>
		<g class="route__stop" data-stop="2" transform="translate(1120 110)">
			<circle r="34"/><g transform="translate(-14 -15)"><path ${stroke} d="M2 13 14 3l12 10M5 11v15h18V11M11 26v-8h6v8"/></g>
		</g>
		<g class="route__rider"><circle r="13"/><path d="M-6 1h12l-1 6h-10Z M-4 1v-2.5a4 4 0 0 1 8 0V1" fill="none" stroke-width="1.6"/></g>
	</svg>`;
}

/** Relógio de 12 h com a faixa de funcionamento destacada. */
export function clockSvg() {
	const toMin = (t: string) => {
		const [h, m] = t.split(':').map(Number);
		return h * 60 + m;
	};
	const angle = (min: number) => ((min % 720) / 720) * 360;
	const a0 = angle(toMin(store.hours.open));
	const a1 = angle(toMin(store.hours.close));
	const span = (a1 - a0 + 360) % 360;
	const R = 120;
	const pt = (a: number, r: number) => {
		const rad = ((a - 90) * Math.PI) / 180;
		return [150 + Math.cos(rad) * r, 150 + Math.sin(rad) * r];
	};
	const [sx, sy] = pt(a0, R);
	const [ex, ey] = pt(a1, R);
	const arc = `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`;
	let ticks = '';
	for (let i = 0; i < 60; i++) {
		const big = i % 5 === 0;
		const [x1, y1] = pt(i * 6, big ? 98 : 103);
		const [x2, y2] = pt(i * 6, 108);
		ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${big ? 'big' : ''}"/>`;
	}
	let nums = '';
	for (let h = 1; h <= 12; h++) {
		const [x, y] = pt(h * 30, 80);
		nums += `<text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}">${h}</text>`;
	}
	return `<svg class="clock" viewBox="0 0 300 300" role="img" aria-label="Relógio: funcionamento das ${store.hours.open} às ${store.hours.close}">
		<circle class="clock__face" cx="150" cy="150" r="140"/>
		<circle class="clock__track" cx="150" cy="150" r="${R}"/>
		<path class="clock__arc" d="${arc}"/>
		<g class="clock__ticks">${ticks}</g>
		<g class="clock__nums">${nums}</g>
		<g class="clock__hand clock__hand--h" data-hand-h><line x1="150" y1="158" x2="150" y2="96"/></g>
		<g class="clock__hand clock__hand--m" data-hand-m><line x1="150" y1="162" x2="150" y2="62"/></g>
		<circle class="clock__pin" cx="150" cy="150" r="6"/>
	</svg>`;
}

/** Ponteiros na hora atual do aparelho. */
export function tickClock(root: ParentNode = document) {
	const now = new Date();
	const m = now.getMinutes() + now.getSeconds() / 60;
	const h = (now.getHours() % 12) + m / 60;
	root.querySelector<SVGGElement>('[data-hand-h]')?.style.setProperty('--a', `${h * 30}deg`);
	root.querySelector<SVGGElement>('[data-hand-m]')?.style.setProperty('--a', `${m * 6}deg`);
}
