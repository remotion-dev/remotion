import '@fontsource-variable/bricolage-grotesque/wdth.css';
import '@fontsource-variable/figtree/wght.css';
import './styles/main.css';

import Lenis from 'lenis';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SplitText} from 'gsap/SplitText';
import {MotionPathPlugin} from 'gsap/MotionPathPlugin';
import logoUrl from './assets/logo.png';
import feijoadaImg from './assets/feijoada-light.webp';
import parmegianaImg from './assets/frango-parmegiana.webp';
import {clockSvg, floatingBits, routeSvg, tickClock} from './modules/graphics';
import {initCart, initMenu, renderStore} from './modules/ui';
import type {Marmita} from './scene/marmita';

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));

/* Rolagem suave só com mouse e sem preferência por menos movimento */
let lenis: Lenis | null = null;
if (!reduced && fine) {
	lenis = new Lenis({duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4)});
	lenis.on('scroll', ScrollTrigger.update);
	gsap.ticker.add((t) => lenis?.raf(t * 1000));
	gsap.ticker.lagSmoothing(0);
}

renderStore(logoUrl);
$<HTMLImageElement>('[data-fallback-a]')!.src = feijoadaImg;
$<HTMLImageElement>('[data-fallback-b]')!.src = parmegianaImg;
initMenu();
initCart(lenis);

/* Âncoras */
document.addEventListener('click', (e) => {
	const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
	if (!a) return;
	const id = a.getAttribute('href')!.slice(1);
	const el = id ? document.getElementById(id) : null;
	if (!el) return;
	e.preventDefault();
	const y = id === 'inicio' ? 0 : el.getBoundingClientRect().top + scrollY - 70;
	if (lenis) lenis.scrollTo(y, {duration: 1.3});
	else scrollTo({top: y, behavior: reduced ? 'auto' : 'smooth'});
});

/* Topo: fundo ao rolar, esconde ao descer */
const top = $('[data-top]')!;
let lastY = scrollY;
addEventListener(
	'scroll',
	() => {
		const y = scrollY;
		top.classList.toggle('is-solid', y > 30);
		if (y > lastY + 6 && y > 500) top.classList.add('is-away');
		else if (y < lastY - 6) top.classList.remove('is-away');
		lastY = y;
	},
	{passive: true},
);
top.addEventListener('focusin', () => top.classList.remove('is-away'));

/* Botões magnéticos discretos */
if (fine && !reduced) {
	$$('[data-magnetic]').forEach((el) => {
		const x = gsap.quickTo(el, 'x', {duration: 0.5, ease: 'power3.out'});
		const y = gsap.quickTo(el, 'y', {duration: 0.5, ease: 'power3.out'});
		el.addEventListener('pointermove', (e) => {
			const r = el.getBoundingClientRect();
			x(gsap.utils.clamp(-8, 8, (e.clientX - r.left - r.width / 2) * 0.2));
			y(gsap.utils.clamp(-6, 6, (e.clientY - r.top - r.height / 2) * 0.3));
		});
		el.addEventListener('pointerleave', () => gsap.to(el, {x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)'}));
	});
}

/* Ilustrações */
const bitsLayer = $('[data-bits]');
if (bitsLayer) bitsLayer.innerHTML = floatingBits(innerWidth < 900);
const routeBox = $('[data-route]');
if (routeBox) routeBox.innerHTML = routeSvg();
const clockBox = $('[data-clock]');
if (clockBox) {
	clockBox.innerHTML = clockSvg();
	tickClock(clockBox);
	setInterval(() => tickClock(clockBox), 30_000);
}

/* Fitas cruzadas: cada uma corre num sentido e acelera com a rolagem */
$$('[data-strip]').forEach((wrap) => {
	const track = wrap.querySelector<HTMLElement>('.strip__track');
	if (!track) return;
	track.innerHTML += track.innerHTML;
	if (reduced) return;
	const dir = Number(wrap.dataset.dir ?? -1);
	let x = dir > 0 ? -track.scrollWidth / 2 : 0;
	let boost = 0;
	ScrollTrigger.create({
		trigger: wrap,
		start: 'top bottom',
		end: 'bottom top',
		onUpdate: (st) => (boost = gsap.utils.clamp(-10, 10, st.getVelocity() / 150)),
	});
	gsap.ticker.add((_t, dt) => {
		boost *= 0.93;
		x += dir * (0.6 + Math.abs(boost)) * (dt / 16.7);
		const half = track.scrollWidth / 2;
		if (dir < 0 && -x >= half) x += half;
		if (dir > 0 && x >= 0) x -= half;
		gsap.set(track, {x});
	});
});

/* Entrada da página e revelações */
let marmita: Marmita | null = null;
let heroDone = false;
const heroIn = () => {
	heroDone = true;
	marmita?.open();
};

if (reduced) {
	heroIn();
	$$('.route__stop').forEach((el) => el.classList.add('is-on'));
} else {
	const title = $('[data-hero-title]')!;
	const split = SplitText.create(title.querySelectorAll('.ln'), {type: 'lines', mask: 'lines'});
	const bitsEls = $$('.bit');
	gsap
		.timeline({defaults: {ease: 'expo.out'}})
		.from(split.lines, {yPercent: 110, duration: 1.2, stagger: 0.08}, 0.1)
		.from('[data-hero-in]', {autoAlpha: 0, y: 20, duration: 1, stagger: 0.08}, 0.45)
		.from(top, {autoAlpha: 0, y: -12, duration: 0.8}, 0.3)
		.from(bitsEls, {scale: 0, rotation: -90, autoAlpha: 0, duration: 1.4, ease: 'back.out(1.8)', stagger: 0.05}, 0.7)
		.add(heroIn, 0.5)
		.add(() => split.revert());

	// Ingredientes: flutuação contínua + profundidade com o mouse e a rolagem
	bitsEls.forEach((el, i) => {
		const svg = el.querySelector('svg')!;
		gsap.to(svg, {y: gsap.utils.random(-14, 14), rotation: `+=${gsap.utils.random(-25, 25)}`, duration: gsap.utils.random(2.6, 4.2), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.1});
		const depth = Number(el.dataset.depth);
		gsap.to(el, {yPercent: -260 * depth, ease: 'none', scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true}});
	});
	const hero = $('.hero')!;
	if (fine) {
		const movers = bitsEls.map((el) => ({
			x: gsap.quickTo(el, 'x', {duration: 1, ease: 'power3.out'}),
			y: gsap.quickTo(el, 'y', {duration: 1, ease: 'power3.out'}),
			d: Number(el.dataset.depth),
		}));
		hero.addEventListener('pointermove', (e) => {
			const r = hero.getBoundingClientRect();
			const nx = (e.clientX - r.left) / r.width - 0.5;
			const ny = (e.clientY - r.top) / r.height - 0.5;
			hero.style.setProperty('--mx', `${(nx + 0.5) * 100}%`);
			hero.style.setProperty('--my', `${(ny + 0.5) * 100}%`);
			movers.forEach((m) => {
				m.x(nx * -60 * m.d);
				m.y(ny * -40 * m.d);
			});
		});
	}
	// O texto do hero sai suavemente enquanto a marmita sobe
	gsap.to('.hero__copy', {yPercent: -12, autoAlpha: 0.2, ease: 'none', scrollTrigger: {trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true}});

	// Títulos de seção: letras sobem com leve giro
	$$('[data-split-h]').forEach((h) => {
		const st = SplitText.create(h, {type: 'chars,words', mask: 'words'});
		gsap.from(st.chars, {
			yPercent: 110,
			rotation: 8,
			duration: 0.9,
			ease: 'back.out(1.7)',
			stagger: 0.025,
			scrollTrigger: {trigger: h, start: 'top 85%', once: true},
		});
	});

	gsap.set('[data-rise]', {autoAlpha: 0, y: 40});
	ScrollTrigger.batch('[data-rise]', {
		start: 'top 88%',
		once: true,
		onEnter: (b) => gsap.to(b, {autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1}),
	});

	// Fitas: entram girando um pouco mais e assentam
	gsap.from('.ribbons .strip', {rotation: (i) => (i ? -8 : 8), yPercent: 60, duration: 1.4, ease: 'expo.out', stagger: 0.1, scrollTrigger: {trigger: '.ribbons', start: 'top 92%', once: true}});

	// Painel kraft: abre como uma tampa de papel
	gsap.fromTo(
		'.how',
		{clipPath: 'inset(6% 5% 6% 5% round 80px)'},
		{clipPath: 'inset(0% 0% 0% 0% round 44px)', ease: 'none', scrollTrigger: {trigger: '.how', start: 'top bottom', end: 'top 35%', scrub: true}},
	);
	gsap.from('.how__n', {
		yPercent: 60,
		autoAlpha: 0,
		duration: 1.1,
		ease: 'back.out(1.6)',
		stagger: 0.12,
		scrollTrigger: {trigger: '.how__steps', start: 'top 85%', once: true},
	});

	// Caminho do pedido desenhado pela rolagem, com a sacola percorrendo
	const line = $<SVGPathElement>('.route__line');
	const rider = $('.route__rider');
	const steps = $$('.how__step');
	const stops = $$('.route__stop');
	if (line && rider) {
		const len = line.getTotalLength();
		gsap.set(line, {strokeDasharray: len, strokeDashoffset: len});
		$('.how')!.classList.add('how--live');
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: '.how__route',
				start: 'top 75%',
				end: 'bottom 30%',
				scrub: 0.8,
				onUpdate: (st) => {
					const p = st.progress;
					[0, 0.48, 0.97].forEach((at, i) => {
						const on = p >= at;
						stops[i]?.classList.toggle('is-on', on);
						steps[i]?.classList.toggle('is-on', on);
					});
				},
			},
		});
		tl.to(line, {strokeDashoffset: 0, ease: 'none'}, 0).to(
			rider,
			{motionPath: {path: line, align: line, alignOrigin: [0.5, 0.5]}, ease: 'none'},
			0,
		);
		stops.forEach((s) => {
			const c = s.querySelector('circle');
			s.addEventListener('pointerenter', () => gsap.to(c, {scale: 1.15, transformOrigin: 'center', duration: 0.4}));
			s.addEventListener('pointerleave', () => gsap.to(c, {scale: 1, duration: 0.5}));
		});
	}

	// Relógio: a faixa de funcionamento se desenha e os ponteiros giram até a hora certa
	const arc = $<SVGPathElement>('.clock__arc');
	if (arc) {
		const len = arc.getTotalLength();
		gsap.set(arc, {strokeDasharray: len, strokeDashoffset: len});
		gsap.timeline({scrollTrigger: {trigger: '.where__time', start: 'top 80%', once: true}})
			.from('.clock', {scale: 0.7, rotation: -40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', transformOrigin: 'center'})
			.to(arc, {strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut'}, 0.3)
			.from('.clock__ticks line', {autoAlpha: 0, duration: 0.4, stagger: 0.01}, 0.2)
			.from('.where__clock > span', {xPercent: -20, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.12}, 0.4);
	}

	// Rodapé: letras sobem uma a uma
	const foot = $('[data-foot-word]');
	if (foot) {
		const st = SplitText.create(foot, {type: 'chars'});
		gsap.from(st.chars, {
			yPercent: 100,
			autoAlpha: 0,
			duration: 1.2,
			ease: 'expo.out',
			stagger: 0.04,
			scrollTrigger: {trigger: foot, start: 'top 98%', once: true},
		});
	}
}

/* Cena 3D sob demanda */
const hasWebGL = () => {
	try {
		const c = document.createElement('canvas');
		return !!(c.getContext('webgl2') || c.getContext('webgl'));
	} catch {
		return false;
	}
};
const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 150));
idle(async () => {
	const container = $('[data-scene]');
	if (!container || !hasWebGL()) return;
	try {
		const {createMarmita} = await import('./scene/marmita');
		const low = innerWidth < 900 || (navigator.hardwareConcurrency ?? 8) <= 4 || !fine;
		marmita = await createMarmita(container, {quality: low ? 'low' : 'high', reducedMotion: reduced, logoUrl});
		container.classList.add('is-live');
		if (heroDone) marmita.open();
		ScrollTrigger.create({trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: (s) => marmita?.setScroll(s.progress)});
	} catch (err) {
		console.warn('[Nosso Sabor] 3D indisponível; mantendo as fotos.', err);
	}
});

document.fonts?.ready.then(() => ScrollTrigger.refresh());
