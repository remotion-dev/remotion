import {gsap} from 'gsap';
import {$, $$, clamp, env} from './env';

/** Cursor personalizado: ponto preciso + anel com atraso suave. */
export function initCursor() {
	if (!env.finePointer || env.reducedMotion) return;
	const root = $('.cursor');
	const ring = $('.cursor__ring');
	const dot = $('.cursor__dot');
	const label = $('.cursor__label');
	if (!root || !ring || !dot || !label) return;

	document.documentElement.classList.add('has-cursor');
	root.classList.add('is-hidden');

	const ringX = gsap.quickTo(ring, 'x', {duration: 0.55, ease: 'power3.out'});
	const ringY = gsap.quickTo(ring, 'y', {duration: 0.55, ease: 'power3.out'});
	const dotX = gsap.quickSetter(dot, 'x', 'px');
	const dotY = gsap.quickSetter(dot, 'y', 'px');

	let shown = false;
	window.addEventListener(
		'pointermove',
		(e) => {
			if (e.pointerType !== 'mouse') return;
			dotX(e.clientX);
			dotY(e.clientY);
			ringX(e.clientX);
			ringY(e.clientY);
			if (!shown) {
				shown = true;
				gsap.set(ring, {x: e.clientX, y: e.clientY});
				root.classList.remove('is-hidden');
			}
		},
		{passive: true},
	);

	document.addEventListener('pointerleave', () => root.classList.add('is-hidden'));
	document.addEventListener('pointerenter', () => root.classList.remove('is-hidden'));
	window.addEventListener('pointerdown', () => root.classList.add('is-down'));
	window.addEventListener('pointerup', () => root.classList.remove('is-down'));

	const states = ['is-link', 'is-view', 'is-hover', 'is-text'];
	document.addEventListener('pointerover', (e) => {
		const target = e.target as HTMLElement;
		root.classList.remove(...states);
		if (target.closest('input, textarea')) {
			root.classList.add('is-text');
			return;
		}
		const el = target.closest<HTMLElement>('[data-cursor], a, button, label.chip');
		if (!el) return;
		const kind = el.dataset.cursor ?? 'link';
		root.classList.add(`is-${kind}`);
		label.textContent = kind === 'view' ? 'Ver' : '';
	});
}

/** Botões magnéticos discretos — deslocamento limitado, retorno elástico. */
export function initMagnetic() {
	const items = $$('[data-magnetic]');
	items.forEach((el) => {
		// Preenchimento do botão nasce do ponto de entrada do cursor
		el.addEventListener('pointerenter', (e) => {
			const r = el.getBoundingClientRect();
			el.style.setProperty('--bx', `${e.clientX - r.left}px`);
			el.style.setProperty('--by', `${e.clientY - r.top}px`);
		});
		el.addEventListener('pointerleave', (e) => {
			const r = el.getBoundingClientRect();
			el.style.setProperty('--bx', `${e.clientX - r.left}px`);
			el.style.setProperty('--by', `${e.clientY - r.top}px`);
		});
	});

	if (!env.finePointer || env.reducedMotion) return;

	items.forEach((el) => {
		const label = el.querySelector<HTMLElement>('.btn__label');
		const xTo = gsap.quickTo(el, 'x', {duration: 0.6, ease: 'power3.out'});
		const yTo = gsap.quickTo(el, 'y', {duration: 0.6, ease: 'power3.out'});
		const lxTo = label ? gsap.quickTo(label, 'x', {duration: 0.6, ease: 'power3.out'}) : null;
		const lyTo = label ? gsap.quickTo(label, 'y', {duration: 0.6, ease: 'power3.out'}) : null;
		const max = 10;

		el.addEventListener('pointermove', (e) => {
			const r = el.getBoundingClientRect();
			const dx = e.clientX - (r.left + r.width / 2);
			const dy = e.clientY - (r.top + r.height / 2);
			xTo(clamp(dx * 0.22, -max, max));
			yTo(clamp(dy * 0.3, -max * 0.6, max * 0.6));
			lxTo?.(clamp(dx * 0.08, -4, 4));
			lyTo?.(clamp(dy * 0.1, -3, 3));
		});
		el.addEventListener('pointerleave', () => {
			gsap.to(el, {x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)'});
			if (label) gsap.to(label, {x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)'});
		});
	});
}

/** Inclinação 3D limitada nos cards do Laboratório, com reflexo dinâmico. */
export function initTilt() {
	if (!env.finePointer || env.reducedMotion) return;
	$$('[data-tilt]').forEach((card) => {
		const visual = card.querySelector<HTMLElement>('[data-depth]');
		if (!visual) return;
		const rx = gsap.quickTo(visual, 'rotationX', {duration: 0.8, ease: 'power3.out'});
		const ry = gsap.quickTo(visual, 'rotationY', {duration: 0.8, ease: 'power3.out'});
		const max = 6;

		card.addEventListener('pointermove', (e) => {
			const r = visual.getBoundingClientRect();
			const px = (e.clientX - r.left) / r.width;
			const py = (e.clientY - r.top) / r.height;
			ry((px - 0.5) * max * 2);
			rx((0.5 - py) * max * 2);
			visual.style.setProperty('--gx', `${px * 100}%`);
			visual.style.setProperty('--gy', `${py * 100}%`);
		});
		card.addEventListener('pointerleave', () => {
			rx(0);
			ry(0);
		});
	});
}
