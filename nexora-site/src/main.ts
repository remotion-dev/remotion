import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {initContactForm, renderConfig} from './modules/contact';
import {$, env} from './modules/env';
import {initCursor, initMagnetic, initTilt} from './modules/interactions';
import {
	initFooter,
	initLab,
	initManifesto,
	initMarquee,
	initProcess,
	initReveals,
	initServicePreview,
	initSplitHeadings,
	playIntro,
} from './modules/motion';
import {initNavigation, initSmoothScroll} from './modules/navigation';
import type {Armillary} from './scene/armillary';

let armillary: Armillary | null = null;
let heroRevealed = false;

const hasWebGL = () => {
	try {
		const canvas = document.createElement('canvas');
		return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
	} catch {
		return false;
	}
};

/** Carrega a cena 3D depois da primeira pintura, com qualidade por dispositivo. */
async function initScene() {
	const container = $('[data-scene]');
	if (!container || !hasWebGL()) return;
	const lowPower =
		env.isSmallScreen || (navigator.hardwareConcurrency ?? 8) <= 4 || !env.finePointer;
	try {
		const {createArmillary} = await import('./scene/armillary');
		armillary = createArmillary(container, {
			quality: lowPower ? 'low' : 'high',
			reducedMotion: env.reducedMotion,
		});
		container.classList.add('is-live');
		if (heroRevealed) armillary.reveal();

		ScrollTrigger.create({
			trigger: '.hero',
			start: 'top top',
			end: 'bottom top',
			onUpdate: (self) => armillary?.setScroll(self.progress),
		});
	} catch (err) {
		console.warn('[NEXORA] Cena 3D indisponível, mantendo ilustração estática.', err);
	}
}

function boot() {
	renderConfig();
	initSmoothScroll();
	// O Laboratório cria o pin primeiro: os gatilhos seguintes já consideram o espaço dele.
	initLab();
	initNavigation();
	initCursor();
	initMagnetic();
	initTilt();
	initSplitHeadings();
	initReveals();
	initManifesto();
	initServicePreview();
	initMarquee();
	initProcess();
	initFooter();
	initContactForm();

	playIntro(() => {
		heroRevealed = true;
		armillary?.reveal();
	});

	const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
	idle(() => void initScene());

	// Recalcula posições após o carregamento das fontes (alturas mudam)
	document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

boot();
