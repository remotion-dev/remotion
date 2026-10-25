import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SplitText} from 'gsap/SplitText';
import {renderArt, isArtName} from './art';
import {$, $$, env} from './env';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Abertura: palavra-marca + linha de progresso, depois a cortina sobe e o
 * hero é revelado em camadas. A cortina abre em ≈ 1 s; o conteúdo já está no
 * DOM desde o início, então nada fica inacessível.
 */
export function playIntro(onHeroReveal: () => void) {
	const intro = $('.intro');
	const title = $('[data-hero-title]');
	const fades = $$('[data-hero-fade]');
	const nav = $('[data-nav]');

	if (env.reducedMotion || !intro || !title) {
		intro?.remove();
		onHeroReveal();
		return;
	}

	const split = SplitText.create(title.querySelectorAll('.line'), {type: 'lines', mask: 'lines'});
	gsap.set(split.lines, {yPercent: 110});
	gsap.set(fades, {autoAlpha: 0, y: 24});
	if (nav) gsap.set(nav, {autoAlpha: 0, y: -16});

	const letters = intro.querySelectorAll('.intro__word span');
	const tl = gsap.timeline({defaults: {ease: 'expo.out'}});
	tl.from(letters, {yPercent: 110, duration: 0.9, stagger: 0.05})
		.from('.intro__caption', {autoAlpha: 0, y: 8, duration: 0.8}, 0.25)
		.to('.intro__line span', {scaleX: 1, duration: 0.75, ease: 'power2.inOut'}, 0.05)
		.to(intro.querySelector('.intro__inner'), {autoAlpha: 0, y: -12, duration: 0.45, ease: 'power2.in'}, 0.8)
		.to(intro, {clipPath: 'inset(0 0 100% 0)', duration: 0.95, ease: 'expo.inOut'}, 0.95)
		.add(onHeroReveal, 1.1)
		.to(split.lines, {yPercent: 0, duration: 1.3, stagger: 0.09}, 1.25)
		.to(fades, {autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08}, 1.6)
		.to(nav, {autoAlpha: 1, y: 0, duration: 1}, 1.65)
		.add(() => {
			intro.remove();
			// Remove as máscaras para não interferir em redimensionamentos
			split.revert();
		});
}

/** Títulos de seção revelados por linhas mascaradas. */
export function initSplitHeadings() {
	$$('[data-split]').forEach((el) => {
		if (env.reducedMotion) return;
		SplitText.create(el, {
			type: 'lines',
			mask: 'lines',
			autoSplit: true,
			onSplit: (self) =>
				gsap.from(self.lines, {
					yPercent: 105,
					duration: 1.2,
					ease: 'expo.out',
					stagger: 0.08,
					scrollTrigger: {trigger: el, start: 'top 85%', once: true},
				}),
		});
	});
}

/** Revelação simples para blocos de apoio (texto, listas, formulário). */
export function initReveals() {
	if (env.reducedMotion) return;
	gsap.set('[data-reveal]', {autoAlpha: 0});
	ScrollTrigger.batch('[data-reveal]', {
		start: 'top 88%',
		once: true,
		onEnter: (batch) =>
			gsap.fromTo(
				batch,
				{autoAlpha: 0, y: 36},
				{autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.1, overwrite: true},
			),
	});
}

/** Manifesto: as palavras ganham presença conforme a leitura avança. */
export function initManifesto() {
	const el = $('[data-manifesto]');
	if (!el || env.reducedMotion) return;
	const split = SplitText.create(el, {type: 'words', wordsClass: 'word'});
	gsap.fromTo(
		split.words,
		{opacity: 0.14},
		{
			opacity: 1,
			ease: 'none',
			stagger: 0.05,
			scrollTrigger: {trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6},
		},
	);
}

/** Lista de serviços: prévia visual que acompanha o cursor. */
export function initServicePreview() {
	const preview = $('[data-service-preview]');
	const list = $('[data-services]');
	if (!preview || !list) return;

	const items = new Map<string, HTMLElement>();
	$$('[data-service]', list).forEach((row) => {
		const name = row.dataset.service;
		if (!isArtName(name) || items.has(name)) return;
		const item = document.createElement('div');
		item.className = 'service-preview__item';
		item.innerHTML = renderArt(name);
		preview.appendChild(item);
		items.set(name, item);
	});

	if (!env.finePointer) return;

	const xTo = gsap.quickTo(preview, 'x', {duration: 0.7, ease: 'power3.out'});
	const yTo = gsap.quickTo(preview, 'y', {duration: 0.7, ease: 'power3.out'});
	const rotTo = gsap.quickTo(preview, 'rotation', {duration: 0.9, ease: 'power3.out'});
	let lastX = 0;
	let placed = false;

	list.addEventListener('pointermove', (e) => {
		const w = preview.offsetWidth;
		const h = preview.offsetHeight;
		// Mantém a prévia à direita do cursor, sem cobrir o título
		const x = Math.min(e.clientX + 72, window.innerWidth - w - 24);
		const y = Math.min(Math.max(e.clientY - h / 2, 24), window.innerHeight - h - 24);
		if (!placed) {
			gsap.set(preview, {x, y});
			placed = true;
		}
		xTo(x);
		yTo(y);
		if (!env.reducedMotion) rotTo(gsap.utils.clamp(-6, 6, (e.clientX - lastX) * 0.4));
		lastX = e.clientX;
	});

	$$('[data-service]', list).forEach((row) => {
		row.addEventListener('pointerenter', () => {
			items.forEach((item, key) => item.classList.toggle('is-active', key === row.dataset.service));
			preview.classList.add('is-visible');
		});
	});
	list.addEventListener('pointerleave', () => {
		preview.classList.remove('is-visible');
		placed = false;
	});
}

/** Laboratório: arte dos cards + rolagem horizontal fixada no desktop. */
export function initLab() {
	$$('[data-art]').forEach((el) => {
		const name = el.dataset.art;
		if (isArtName(name)) el.innerHTML = renderArt(name);
	});

	const section = $('[data-lab]');
	const track = $('[data-lab-track]');
	const bar = $('[data-lab-bar]');
	if (!section || !track) return;

	const mm = gsap.matchMedia();
	mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
		section.classList.add('is-horizontal');
		const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

		const tween = gsap.to(track, {
			x: () => -distance(),
			ease: 'none',
			scrollTrigger: {
				trigger: section,
				pin: section.querySelector('.lab__pin'),
				start: 'top top',
				end: () => `+=${distance()}`,
				scrub: 0.8,
				invalidateOnRefresh: true,
				onUpdate: (self) => bar && gsap.set(bar, {scaleX: self.progress}),
			},
		});

		// Parallax interno: a arte desliza levemente dentro da moldura
		$$('.lab-card__visual svg', track).forEach((svg) => {
			gsap.fromTo(
				svg,
				{xPercent: -4},
				{
					xPercent: 4,
					ease: 'none',
					scrollTrigger: {
						trigger: svg.parentElement,
						containerAnimation: tween,
						start: 'left right',
						end: 'right left',
						scrub: true,
					},
				},
			);
		});

		return () => section.classList.remove('is-horizontal');
	});

	// Telas menores: entrada vertical dos cards
	mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
		$$('.lab-card', track).forEach((card) => {
			gsap.from(card, {
				autoAlpha: 0,
				y: 60,
				duration: 1.1,
				ease: 'power3.out',
				scrollTrigger: {trigger: card, start: 'top 90%', once: true},
			});
		});
	});
}

/** Faixa contínua que acelera e inclina conforme a velocidade da rolagem. */
export function initMarquee() {
	const wrap = $('[data-marquee]');
	const track = wrap?.querySelector<HTMLElement>('.marquee__track');
	if (!wrap || !track) return;
	// Duplica o conteúdo para o laço contínuo
	track.innerHTML += track.innerHTML;
	if (env.reducedMotion) return;

	let x = 0;
	let boost = 0;
	let visible = false;
	const half = () => track.scrollWidth / 2;
	const skew = gsap.quickTo(track, 'skewX', {duration: 0.5, ease: 'power3.out'});

	ScrollTrigger.create({
		trigger: wrap,
		start: 'top bottom',
		end: 'bottom top',
		onToggle: (self) => (visible = self.isActive),
		onUpdate: (self) => {
			const v = self.getVelocity();
			boost = gsap.utils.clamp(-14, 14, v / 120);
			skew(gsap.utils.clamp(-6, 6, v / -300));
		},
	});

	gsap.ticker.add((_t, delta) => {
		if (!visible) return;
		boost *= 0.92;
		x -= (0.6 + Math.abs(boost)) * (delta / 16.7);
		const h = half();
		if (-x >= h) x += h;
		gsap.set(track, {x});
	});
}

/** Processo: etapa ativa + medidor de progresso. */
export function initProcess() {
	const steps = $$('[data-steps] .step');
	const meter = $('[data-process-meter]');
	steps.forEach((step) => {
		ScrollTrigger.create({
			trigger: step,
			start: 'top 62%',
			end: 'bottom 38%',
			onToggle: (self) => step.classList.toggle('is-active', self.isActive),
		});
	});
	const list = $('[data-steps]');
	if (list && meter) {
		gsap.to(meter, {
			scaleX: 1,
			ease: 'none',
			scrollTrigger: {trigger: list, start: 'top 62%', end: 'bottom 62%', scrub: 0.5},
		});
	}
}

/** Rodapé: palavra-marca sobe ao entrar na tela. */
export function initFooter() {
	const word = $('[data-footer-word]');
	if (!word || env.reducedMotion) return;
	gsap.from(word, {
		yPercent: 40,
		opacity: 0,
		duration: 1.6,
		ease: 'expo.out',
		scrollTrigger: {trigger: word, start: 'top 95%', once: true},
	});
}
