import Lenis from 'lenis';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {$, $$, env} from './env';

let lenis: Lenis | null = null;

/** Rolagem suave (desativada com movimento reduzido e em telas touch). */
export function initSmoothScroll() {
	if (env.reducedMotion || !env.finePointer) return null;
	lenis = new Lenis({duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4)});
	lenis.on('scroll', ScrollTrigger.update);
	gsap.ticker.add((time) => lenis?.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);
	return lenis;
}

export function scrollToTarget(target: HTMLElement | number) {
	if (lenis) {
		lenis.scrollTo(target, {offset: 0, duration: 1.4});
		return;
	}
	const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
	window.scrollTo({top, behavior: env.reducedMotion ? 'auto' : 'smooth'});
}

/** Links âncora, barra superior que reage à rolagem e menu mobile. */
export function initNavigation() {
	const nav = $('[data-nav]');
	const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
	const menu = $('[data-menu]');

	const closeMenu = (focusToggle = false) => {
		if (!menu || !toggle || toggle.getAttribute('aria-expanded') !== 'true') return;
		toggle.setAttribute('aria-expanded', 'false');
		toggle.querySelector('.sr-only')!.textContent = 'Abrir menu';
		menu.classList.remove('is-open');
		lenis?.start();
		document.body.style.overflow = '';
		const onEnd = () => {
			if (!menu.classList.contains('is-open')) menu.hidden = true;
		};
		menu.addEventListener('transitionend', onEnd, {once: true});
		window.setTimeout(onEnd, 900);
		if (focusToggle) toggle.focus();
	};

	const openMenu = () => {
		if (!menu || !toggle) return;
		menu.hidden = false;
		requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
		toggle.setAttribute('aria-expanded', 'true');
		toggle.querySelector('.sr-only')!.textContent = 'Fechar menu';
		lenis?.stop();
		document.body.style.overflow = 'hidden';
		nav?.classList.remove('is-hidden');
		menu.querySelector<HTMLElement>('a')?.focus({preventScroll: true});
	};

	toggle?.addEventListener('click', () => {
		if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
		else openMenu();
	});
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closeMenu(true);
	});
	window.addEventListener('resize', () => {
		if (window.innerWidth > 860) closeMenu();
	});

	// Âncoras com rolagem suave e foco acessível no destino
	document.addEventListener('click', (e) => {
		const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
		if (!link) return;
		const id = link.getAttribute('href')!.slice(1);
		const target = id ? document.getElementById(id) : null;
		if (!target) return;
		e.preventDefault();
		closeMenu();
		scrollToTarget(id === 'topo' ? 0 : target);
		history.replaceState(null, '', id === 'topo' ? location.pathname : `#${id}`);
		if (id !== 'topo') {
			target.setAttribute('tabindex', '-1');
			target.focus({preventScroll: true});
		}
	});

	// Barra: compacta após o hero, esconde ao descer, volta ao subir
	if (nav) {
		let lastY = window.scrollY;
		const onScroll = () => {
			const y = window.scrollY;
			nav.classList.toggle('is-scrolled', y > 40);
			const goingDown = y > lastY + 4;
			const goingUp = y < lastY - 4;
			if (goingDown && y > window.innerHeight * 0.8) nav.classList.add('is-hidden');
			else if (goingUp) nav.classList.remove('is-hidden');
			lastY = y;
		};
		window.addEventListener('scroll', onScroll, {passive: true});
		onScroll();
		nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
	}

	// Barra em tema claro enquanto passa sobre a seção de processo
	const light = $('.process');
	if (nav && light) {
		ScrollTrigger.create({
			trigger: light,
			start: () => `top ${nav.offsetHeight / 2}`,
			end: () => `bottom ${nav.offsetHeight / 2}`,
			onToggle: (self) => nav.classList.toggle('is-light', self.isActive),
		});
	}

	// Link ativo conforme a seção visível
	const links = $$<HTMLAnchorElement>('.nav__links a');
	links.forEach((link) => {
		const section = document.querySelector(link.getAttribute('href')!);
		if (!section) return;
		ScrollTrigger.create({
			trigger: section,
			start: 'top 55%',
			end: 'bottom 55%',
			onToggle: (self) => {
				link.classList.toggle('is-active', self.isActive);
				if (self.isActive) link.setAttribute('aria-current', 'true');
				else link.removeAttribute('aria-current');
			},
		});
	});
}
