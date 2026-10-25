/**
 * Composições vetoriais geradas em código para os estudos do Laboratório e as
 * prévias de serviços. São leves, nítidas em qualquer densidade de tela e não
 * dependem de imagens externas ou licenças de terceiros.
 *
 * Todas usam viewBox 800×1000 (proporção 4:5).
 */

export type ArtName = 'monolito' | 'mare' | 'orbita' | 'grao' | 'pulso' | 'codigo';

let counter = 0;

const seeded = (seed: number) => () => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};

const grain = (id: string, opacity = 0.18) => `
	<filter id="${id}-n" x="0" y="0" width="100%" height="100%">
		<feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" result="t"/>
		<feColorMatrix in="t" type="matrix" values="0 0 0 0 1  0 0 0 0 .96  0 0 0 0 .9  0 0 0 ${opacity} 0"/>
	</filter>`;

const grainRect = (id: string) => `<rect width="800" height="1000" filter="url(#${id}-n)"/>`;

const wrap = (id: string, defs: string, body: string) =>
	`<svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation" focusable="false"><defs>${defs}${grain(id)}</defs>${body}${grainRect(id)}</svg>`;

function monolito(id: string) {
	const defs = `
		<linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#2a241d"/><stop offset=".62" stop-color="#16130f"/><stop offset="1" stop-color="#0d0b09"/>
		</linearGradient>
		<radialGradient id="${id}-light" cx="22%" cy="12%" r="70%">
			<stop offset="0" stop-color="#f3dcb2" stop-opacity=".55"/><stop offset=".45" stop-color="#c6a46c" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
		</radialGradient>
		<linearGradient id="${id}-slab" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stop-color="#6d5f4e"/><stop offset=".08" stop-color="#3f362c"/><stop offset="1" stop-color="#191612"/>
		</linearGradient>
		<linearGradient id="${id}-slab2" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stop-color="#2f2922"/><stop offset="1" stop-color="#14110e"/>
		</linearGradient>
		<linearGradient id="${id}-floor" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#1f1b16"/><stop offset="1" stop-color="#0a0908"/>
		</linearGradient>
		<filter id="${id}-blur"><feGaussianBlur stdDeviation="22"/></filter>`;
	const body = `
		<rect width="800" height="1000" fill="url(#${id}-bg)"/>
		<rect y="760" width="800" height="240" fill="url(#${id}-floor)"/>
		<rect width="800" height="1000" fill="url(#${id}-light)"/>
		<ellipse cx="430" cy="800" rx="250" ry="34" fill="#000" opacity=".65" filter="url(#${id}-blur)"/>
		<rect x="470" y="300" width="150" height="500" fill="url(#${id}-slab2)"/>
		<rect x="290" y="170" width="220" height="630" fill="url(#${id}-slab)"/>
		<rect x="290" y="170" width="3" height="630" fill="#e8cfa2" opacity=".55"/>
		<rect x="290" y="170" width="220" height="2" fill="#f0dcb6" opacity=".35"/>
		<path d="M290 800 L230 1000 L520 1000 L510 800Z" fill="#000" opacity=".28"/>
		<line x1="0" y1="760" x2="800" y2="760" stroke="#c6a46c" stroke-opacity=".18"/>`;
	return wrap(id, defs, body);
}

function mare(id: string) {
	const rand = seeded(7);
	let lines = '';
	for (let i = 0; i < 34; i++) {
		const y = 560 + i * 13;
		const amp = 6 + i * 0.9;
		const freq = 0.006 + rand() * 0.004;
		const phase = rand() * Math.PI * 2;
		let d = `M -20 ${y}`;
		for (let x = -20; x <= 820; x += 20) {
			d += ` L ${x} ${(y + Math.sin(x * freq + phase) * amp).toFixed(1)}`;
		}
		lines += `<path d="${d}" fill="none" stroke="#ece6db" stroke-width="${(0.6 + i * 0.04).toFixed(2)}" stroke-opacity="${(0.08 + i * 0.018).toFixed(3)}"/>`;
	}
	let reflections = '';
	for (let i = 0; i < 12; i++) {
		const y = 590 + i * 22;
		const w = 150 - i * 9 + rand() * 30;
		reflections += `<rect x="${400 - w / 2}" y="${y}" width="${w}" height="${2 + i * 0.3}" rx="1" fill="#e9c58c" opacity="${(0.5 - i * 0.035).toFixed(2)}"/>`;
	}
	const defs = `
		<linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#0f1c1d"/><stop offset=".55" stop-color="#26332f"/><stop offset=".62" stop-color="#3b3a30"/><stop offset="1" stop-color="#0b1112"/>
		</linearGradient>
		<radialGradient id="${id}-sun" cx="50%" cy="40%" r="60%">
			<stop offset="0" stop-color="#f6dfb4"/><stop offset=".6" stop-color="#d7ad6c"/><stop offset="1" stop-color="#a07a42"/>
		</radialGradient>
		<radialGradient id="${id}-halo" cx="50%" cy="54%" r="45%">
			<stop offset="0" stop-color="#e2b877" stop-opacity=".35"/><stop offset="1" stop-color="#e2b877" stop-opacity="0"/>
		</radialGradient>
		<clipPath id="${id}-horizon"><rect width="800" height="560"/></clipPath>`;
	const body = `
		<rect width="800" height="1000" fill="url(#${id}-sky)"/>
		<rect width="800" height="1000" fill="url(#${id}-halo)"/>
		<circle cx="400" cy="540" r="120" fill="url(#${id}-sun)" clip-path="url(#${id}-horizon)"/>
		${reflections}
		${lines}`;
	return wrap(id, defs, body);
}

function orbita(id: string) {
	const defs = `
		<radialGradient id="${id}-bg" cx="50%" cy="45%" r="75%">
			<stop offset="0" stop-color="#1f1c18"/><stop offset="1" stop-color="#080707"/>
		</radialGradient>
		<radialGradient id="${id}-sphere" cx="36%" cy="30%" r="75%">
			<stop offset="0" stop-color="#f3e2c2"/><stop offset=".18" stop-color="#b8935a"/><stop offset=".55" stop-color="#4a3a24"/><stop offset="1" stop-color="#0f0c08"/>
		</radialGradient>
		<linearGradient id="${id}-ring" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#f0d7a8"/><stop offset=".5" stop-color="#8d6c3c" stop-opacity=".5"/><stop offset="1" stop-color="#f0d7a8"/>
		</linearGradient>
		<filter id="${id}-glow"><feGaussianBlur stdDeviation="30"/></filter>`;
	const rings = [
		[300, 92, -18, 1.6],
		[340, 130, 24, 1.1],
		[255, 255, 0, 0.7],
		[120, 330, 52, 1.2],
	]
		.map(
			([rx, ry, rot, w]) =>
				`<ellipse cx="400" cy="480" rx="${rx}" ry="${ry}" transform="rotate(${rot} 400 480)" fill="none" stroke="url(#${id}-ring)" stroke-width="${w}" opacity=".85"/>`,
		)
		.join('');
	const body = `
		<rect width="800" height="1000" fill="url(#${id}-bg)"/>
		<circle cx="400" cy="480" r="190" fill="#c6a46c" opacity=".18" filter="url(#${id}-glow)"/>
		${rings}
		<circle cx="400" cy="480" r="128" fill="url(#${id}-sphere)"/>
		<circle cx="684" cy="430" r="9" fill="#f0d7a8"/>
		<circle cx="190" cy="600" r="5" fill="#ece6db" opacity=".8"/>
		<circle cx="478" cy="160" r="6" fill="#c6a46c"/>
		<ellipse cx="400" cy="860" rx="210" ry="18" fill="#000" opacity=".5" filter="url(#${id}-glow)"/>`;
	return wrap(id, defs, body);
}

function grao(id: string) {
	let dots = '';
	const cx = 400;
	const cy = 470;
	const R = 270;
	for (let y = cy - R; y <= cy + R; y += 16) {
		for (let x = cx - R; x <= cx + R; x += 16) {
			const dx = x - cx;
			const dy = y - cy;
			const dist = Math.sqrt(dx * dx + dy * dy) / R;
			if (dist > 1) continue;
			// Esfera iluminada pelo canto superior esquerdo
			const nz = Math.sqrt(Math.max(0, 1 - dist * dist));
			const light = Math.max(0, (-dx / R) * 0.5 + (-dy / R) * 0.6 + nz * 0.65);
			const r = 0.6 + light * 6.2;
			dots += `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}"/>`;
		}
	}
	const defs = `
		<linearGradient id="${id}-bg" x1="0" y1="0" x2=".4" y2="1">
			<stop offset="0" stop-color="#3a2417"/><stop offset="1" stop-color="#170e09"/>
		</linearGradient>`;
	const body = `
		<rect width="800" height="1000" fill="url(#${id}-bg)"/>
		<g fill="#efe1c9">${dots}</g>
		<text x="60" y="920" font-family="Instrument Serif, serif" font-style="italic" font-size="96" fill="#efe1c9" opacity=".92">grão</text>
		<text x="740" y="905" text-anchor="end" font-family="Geist Mono Variable, monospace" font-size="18" letter-spacing="3" fill="#efe1c9" opacity=".55">TORRA MÉDIA · 01</text>
		<line x1="60" y1="80" x2="740" y2="80" stroke="#efe1c9" stroke-opacity=".25"/>`;
	return wrap(id, defs, body);
}

function pulso(id: string) {
	const rand = seeded(42);
	const pts: [number, number][] = [];
	let v = 640;
	for (let i = 0; i <= 14; i++) {
		v += (rand() - 0.42) * 70;
		v = Math.min(720, Math.max(380, v));
		pts.push([90 + i * 44.3, v]);
	}
	// Curva suave (Catmull-Rom → Bézier)
	let d = `M ${pts[0][0]} ${pts[0][1]}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[i - 1] ?? pts[i];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2] ?? p2;
		const c1x = p1[0] + (p2[0] - p0[0]) / 6;
		const c1y = p1[1] + (p2[1] - p0[1]) / 6;
		const c2x = p2[0] - (p3[0] - p1[0]) / 6;
		const c2y = p2[1] - (p3[1] - p1[1]) / 6;
		d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0]} ${p2[1].toFixed(1)}`;
	}
	const last = pts[pts.length - 1];
	let grid = '';
	for (let x = 90; x <= 710; x += 62) grid += `<line x1="${x}" y1="330" x2="${x}" y2="760" />`;
	for (let y = 330; y <= 760; y += 86) grid += `<line x1="90" y1="${y}" x2="710" y2="${y}" />`;
	let bars = '';
	for (let i = 0; i < 18; i++) {
		const h = 18 + rand() * 70;
		bars += `<rect x="${92 + i * 34.5}" y="${880 - h}" width="18" height="${h.toFixed(1)}" rx="2" fill="#ece6db" opacity="${(0.12 + rand() * 0.25).toFixed(2)}"/>`;
	}
	const defs = `
		<linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#161915"/><stop offset="1" stop-color="#0a0b0a"/>
		</linearGradient>
		<linearGradient id="${id}-area" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#c6a46c" stop-opacity=".35"/><stop offset="1" stop-color="#c6a46c" stop-opacity="0"/>
		</linearGradient>
		<filter id="${id}-glow"><feGaussianBlur stdDeviation="8"/></filter>`;
	const body = `
		<rect width="800" height="1000" fill="url(#${id}-bg)"/>
		<rect x="60" y="120" width="680" height="790" rx="18" fill="#ece6db" fill-opacity=".03" stroke="#ece6db" stroke-opacity=".1"/>
		<text x="90" y="190" font-family="Geist Mono Variable, monospace" font-size="16" letter-spacing="3" fill="#ece6db" opacity=".5">PATRIMÔNIO · 12M</text>
		<text x="88" y="272" font-family="Instrument Serif, serif" font-size="84" fill="#ece6db">+18,4<tspan font-size="48" fill="#c6a46c">%</tspan></text>
		<g stroke="#ece6db" stroke-opacity=".07">${grid}</g>
		<path d="${d} L ${last[0]} 760 L 90 760 Z" fill="url(#${id}-area)"/>
		<path d="${d}" fill="none" stroke="#e0c79b" stroke-width="6" opacity=".55" filter="url(#${id}-glow)"/>
		<path d="${d}" fill="none" stroke="#f0dcb4" stroke-width="2.4"/>
		<circle cx="${last[0]}" cy="${last[1]}" r="9" fill="#0a0b0a" stroke="#f0dcb4" stroke-width="2.4"/>
		${bars}`;
	return wrap(id, defs, body);
}

function codigo(id: string) {
	const rand = seeded(11);
	let rows = '';
	const palette = ['#ece6db', '#c6a46c', '#8f9a8c', '#ece6db'];
	for (let i = 0; i < 26; i++) {
		const y = 190 + i * 26;
		let x = 110 + Math.floor(rand() * 4) * 26;
		const segs = 2 + Math.floor(rand() * 4);
		for (let s = 0; s < segs; s++) {
			const w = 30 + rand() * 120;
			if (x + w > 700) break;
			rows += `<rect x="${x.toFixed(0)}" y="${y}" width="${w.toFixed(0)}" height="9" rx="4.5" fill="${palette[Math.floor(rand() * palette.length)]}" opacity="${(0.25 + rand() * 0.55).toFixed(2)}"/>`;
			x += w + 12;
		}
		rows += `<text x="70" y="${y + 9}" font-family="Geist Mono Variable, monospace" font-size="11" fill="#ece6db" opacity=".25">${String(i + 1).padStart(2, '0')}</text>`;
	}
	const defs = `
		<linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#1b1916"/><stop offset="1" stop-color="#0b0a09"/>
		</linearGradient>
		<radialGradient id="${id}-glow" cx="80%" cy="85%" r="60%">
			<stop offset="0" stop-color="#c6a46c" stop-opacity=".28"/><stop offset="1" stop-color="#c6a46c" stop-opacity="0"/>
		</radialGradient>`;
	const body = `
		<rect width="800" height="1000" fill="url(#${id}-bg)"/>
		<rect width="800" height="1000" fill="url(#${id}-glow)"/>
		<circle cx="76" cy="120" r="6" fill="#ece6db" opacity=".3"/><circle cx="98" cy="120" r="6" fill="#ece6db" opacity=".2"/><circle cx="120" cy="120" r="6" fill="#ece6db" opacity=".12"/>
		${rows}
		<rect x="70" y="900" width="660" height="1" fill="#ece6db" opacity=".12"/>
		<text x="70" y="940" font-family="Geist Mono Variable, monospace" font-size="15" letter-spacing="2" fill="#c6a46c">BUILD ✓ · TYPESCRIPT · ACESSÍVEL</text>`;
	return wrap(id, defs, body);
}

const renderers: Record<ArtName, (id: string) => string> = {
	monolito,
	mare,
	orbita,
	grao,
	pulso,
	codigo,
};

export function renderArt(name: ArtName): string {
	counter += 1;
	return renderers[name](`art${counter}`);
}

export function isArtName(value: string | undefined): value is ArtName {
	return !!value && value in renderers;
}
