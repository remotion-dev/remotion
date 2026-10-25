import '@fontsource-variable/bricolage-grotesque/wdth.css';
import '@fontsource-variable/figtree/wght.css';
import './styles/main.css';

import Lenis from 'lenis';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SplitText} from 'gsap/SplitText';
import logoUrl from './assets/logo.png';
import feijoadaImg from './assets/feijoada-light.webp';
import parmegianaImg from './assets/frango-parmegiana.webp';
import {initCart, initMenu, renderStore} from './modules/ui';
import type {Marmita} from './scene/marmita';

gsap.registerPlugin(ScrollTrigger, SplitText);

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

/* Faixa contínua com reação à velocidade da rolagem */
const strip = $('[data-strip] .strip__track');
if (strip) {
	strip.innerHTML += strip.innerHTML;
	if (!reduced) {
		let x = 0;
		let boost = 0;
		ScrollTrigger.create({trigger: strip, start: 'top bottom', end: 'bottom top', onUpdate: (s) => (boost = gsap.utils.clamp(-10, 10, s.getVelocity() / 150))});
		gsap.ticker.add((_t, dt) => {
			boost *= 0.93;
			x -= (0.7 + Math.abs(boost)) * (dt / 16.7);
			const half = strip.scrollWidth / 2;
			if (-x >= half) x += half;
			gsap.set(strip, {x});
		});
	}
}

/* Entrada da página e revelações */
let marmita: Marmita | null = null;
let heroDone = false;
const heroIn = () => {
	heroDone = true;
	marmita?.open();
};

if (reduced) {
	heroIn();
} else {
	const title = $('[data-hero-title]')!;
	const split = SplitText.create(title.querySelectorAll('.ln'), {type: 'lines', mask: 'lines'});
	gsap
		.timeline({defaults: {ease: 'expo.out'}})
		.from(split.lines, {yPercent: 110, duration: 1.2, stagger: 0.08}, 0.1)
		.from('[data-hero-in]', {autoAlpha: 0, y: 20, duration: 1, stagger: 0.08}, 0.45)
		.from(top, {autoAlpha: 0, y: -12, duration: 0.8}, 0.3)
		.add(heroIn, 0.5)
		.add(() => split.revert());

	gsap.set('[data-rise]', {autoAlpha: 0, y: 40});
	ScrollTrigger.batch('[data-rise]', {
		start: 'top 88%',
		once: true,
		onEnter: (b) => gsap.to(b, {autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1}),
	});
	gsap.from('.how__n', {
		yPercent: 60,
		autoAlpha: 0,
		duration: 1.1,
		ease: 'back.out(1.6)',
		stagger: 0.12,
		scrollTrigger: {trigger: '.how__steps', start: 'top 80%', once: true},
	});
	gsap.from('.where__clock span', {
		yPercent: 40,
		autoAlpha: 0,
		duration: 1.2,
		ease: 'expo.out',
		stagger: 0.12,
		scrollTrigger: {trigger: '.where__clock', start: 'top 85%', once: true},
	});
	gsap.fromTo('.foot__word', {yPercent: 30}, {yPercent: 0, ease: 'none', scrollTrigger: {trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true}});
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
