import {gsap} from 'gsap';
import {formatPrice, menu, openStatus, store, whatsappLink, mapsLink, type Dish} from '../data';
import {cart, findDish, orderLink, priceOf} from './cart';
import {iconSvg} from './graphics';

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) =>
	Array.from(root.querySelectorAll<T>(s));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/* -------------------------------------------------------------------------- */
/* Dados da loja                                                               */
/* -------------------------------------------------------------------------- */
export function renderStore(logoUrl: string) {
	$$<HTMLImageElement>('[data-logo]').forEach((img) => (img.src = logoUrl));
	const hours = `${store.hours.open.replace(':', 'h')} às ${store.hours.close.replace(':', 'h')}`;
	$$('[data-hours]').forEach((el) => (el.textContent = hours));
	$$('[data-address]').forEach((el) => (el.textContent = store.address));
	$$('[data-phone]').forEach((el) => (el.textContent = store.phoneDisplay));
	$$('[data-email]').forEach((el) => (el.textContent = store.email));
	$$('[data-open-time]').forEach((el) => (el.textContent = store.hours.open));
	$$('[data-close-time]').forEach((el) => (el.textContent = store.hours.close));
	$$('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));
	$$<HTMLAnchorElement>('[data-wa-link]').forEach((a) => (a.href = whatsappLink('Olá! Gostaria de fazer um pedido.')));
	$$<HTMLAnchorElement>('[data-maps]').forEach((a) => (a.href = mapsLink()));

	const names = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
	const d = [...store.days].sort();
	const contiguous = d.every((v, i) => i === 0 || v === d[i - 1] + 1);
	const daysText = contiguous && d.length > 1 ? `De ${names[d[0]]} a ${names[d[d.length - 1]]}` : d.map((i) => names[i]).join(', ');
	$$('[data-days]').forEach((el) => (el.textContent = `${daysText}. Delivery ou retirada no balcão.`));

	const social = [
		['Instagram', store.instagram],
		['Facebook', store.facebook],
	].filter(([, href]) => href);
	const socialBox = $('[data-social-links]');
	if (social.length && socialBox) {
		socialBox.innerHTML = social
			.map(([label, href]) => `<a class="ulink" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`)
			.join('');
		$('[data-social]')!.hidden = false;
	}

	const updateStatus = () => {
		const s = openStatus();
		$$('[data-status]').forEach((el) => {
			el.classList.toggle('is-open', s.isOpen);
			el.querySelector('span')!.textContent = s.label;
		});
	};
	updateStatus();
	setInterval(updateStatus, 60_000);

	$('[data-copy-email]')?.addEventListener('click', async (e) => {
		const btn = e.currentTarget as HTMLButtonElement;
		try {
			await navigator.clipboard.writeText(store.email);
			btn.textContent = 'Copiado';
		} catch {
			const range = document.createRange();
			range.selectNodeContents($('[data-email]')!);
			getSelection()?.removeAllRanges();
			getSelection()?.addRange(range);
			btn.textContent = 'Selecionado';
		}
		setTimeout(() => (btn.textContent = 'Copiar'), 2000);
	});

	const pending: string[] = [];
	if (!store.city) pending.push('cidade/bairro');
	if (!store.daysConfirmed) pending.push('dias de funcionamento');
	menu.forEach((c) => {
		if (!c.dishes.length) pending.push(`pratos da categoria ${c.name}`);
		c.dishes.forEach((dish) => dish.sizes.forEach((s) => s.price === null && pending.push(`preço ${dish.name} ${s.label}`)));
	});
	if (pending.length) console.info('[Nosso Sabor] Dados a confirmar em src/data.ts:', pending);
}

/* -------------------------------------------------------------------------- */
/* Cardápio                                                                    */
/* -------------------------------------------------------------------------- */
let toastTimer = 0;
export function toast(msg: string) {
	const el = $('[data-toast]');
	if (!el) return;
	el.textContent = msg;
	el.classList.add('is-on');
	clearTimeout(toastTimer);
	toastTimer = window.setTimeout(() => el.classList.remove('is-on'), 2200);
}

const dishCard = (dish: Dish) => {
	const first = dish.sizes.find((s) => s.price !== null) ?? dish.sizes[0];
	const sizes = dish.sizes
		.map(
			(s) => `<label class="size">
				<input type="radio" name="t-${dish.id}" value="${s.label}" ${s === first ? 'checked' : ''} />
				<span><b>${s.label}</b><small>${s.price === null ? 'a confirmar' : formatPrice(s.price)}</small></span>
			</label>`,
		)
		.join('');
	return `<article class="dish" data-dish="${dish.id}">
		<div class="dish__info">
			<h3 class="dish__name">${esc(dish.name)}</h3>
			<p class="dish__desc">${esc(dish.description)}</p>
			<fieldset class="sizes"><legend class="sr-only">Tamanho de ${esc(dish.name)}</legend>${sizes}</fieldset>
			<div class="dish__buy">
				<span class="dish__price" data-price></span>
				<button class="add" type="button" data-add>
					<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" /></svg>
					Adicionar
				</button>
			</div>
		</div>
		<div class="dish__photo">${dish.image ? `<img src="${dish.image}" alt="${esc(dish.name)}" loading="lazy" width="248" height="228" />` : ''}</div>
	</article>`;
};

export function initMenu() {
	const tabs = $('[data-tabs]')!;
	const list = $('[data-dishes]')!;
	const search = $<HTMLInputElement>('[data-search]')!;
	let active = menu.find((c) => c.dishes.length)?.id ?? menu[0].id;

	tabs.innerHTML = menu
		.map(
			(c) =>
				`<button class="tab" type="button" role="tab" id="tab-${c.id}" aria-controls="cardapio-lista" data-tab="${c.id}">${iconSvg(c.id)}<span>${esc(c.name)}</span>${c.dishes.length ? `<small>${c.dishes.length}</small>` : ''}</button>`,
		)
		.join('');
	list.id = 'cardapio-lista';
	list.setAttribute('role', 'tabpanel');

	const syncPrice = (card: HTMLElement) => {
		const dish = findDish(card.dataset.dish!)!;
		const size = $<HTMLInputElement>('input:checked', card)?.value;
		const price = dish.sizes.find((s) => s.label === size)?.price ?? null;
		const el = $('[data-price]', card)!;
		el.classList.toggle('is-tbd', price === null);
		const prev = Number(el.dataset.value);
		el.dataset.value = price === null ? '' : String(price);
		if (price === null) {
			el.textContent = 'Preço a confirmar';
			return;
		}
		// O valor "conta" do preço anterior até o novo
		if (!reduced() && el.dataset.value && prev && prev !== price) {
			const o = {v: prev};
			gsap.to(o, {v: price, duration: 0.6, ease: 'power3.out', onUpdate: () => (el.textContent = formatPrice(o.v))});
			gsap.fromTo(el, {y: -6, scale: 1.08}, {y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)'});
		} else {
			el.textContent = formatPrice(price);
		}
	};

	const render = (animate: boolean) => {
		const q = search.value.trim().toLowerCase();
		$$('[data-tab]', tabs).forEach((t) => t.setAttribute('aria-selected', String(!q && t.dataset.tab === active)));
		list.setAttribute('aria-labelledby', `tab-${active}`);

		let dishes: Dish[];
		if (q) {
			dishes = menu.flatMap((c) => c.dishes).filter((d) => `${d.name} ${d.description}`.toLowerCase().includes(q));
		} else {
			dishes = menu.find((c) => c.id === active)?.dishes ?? [];
		}

		if (dishes.length) {
			list.innerHTML = dishes.map(dishCard).join('');
			$$('.dish', list).forEach(syncPrice);
		} else {
			const cat = menu.find((c) => c.id === active)!;
			const title = q ? `Nada encontrado para “${esc(search.value.trim())}”` : `${esc(cat.name)}: cardápio do dia`;
			const text = q
				? 'Tente outro nome ou pergunte direto pra gente no WhatsApp.'
				: 'As opções desta categoria mudam com frequência. Chame no WhatsApp que a gente te passa o que tem hoje.';
			const wa = whatsappLink(q ? `Olá! Vocês têm ${search.value.trim()}?` : `Olá! Quais são as opções de ${cat.name} hoje?`);
			list.innerHTML = `<div class="menu-empty"><h3>${title}</h3><p>${text}</p>
				<a class="btn btn--fire" href="${wa}" target="_blank" rel="noopener noreferrer"><span>Perguntar no WhatsApp</span></a></div>`;
		}
		if (animate && !reduced()) {
			gsap.fromTo(
				list.children,
				{autoAlpha: 0, y: 30, clipPath: 'inset(0% 0% 100% 0% round 20px)'},
				{autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'clipPath'},
			);
		}
	};

	tabs.addEventListener('click', (e) => {
		const tab = (e.target as HTMLElement).closest<HTMLElement>('[data-tab]');
		if (!tab) return;
		active = tab.dataset.tab!;
		search.value = '';
		render(true);
		tab.scrollIntoView({block: 'nearest', inline: 'center', behavior: reduced() ? 'auto' : 'smooth'});
	});
	tabs.addEventListener('keydown', (e) => {
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
		const all = $$<HTMLButtonElement>('[data-tab]', tabs);
		const i = all.findIndex((t) => t.dataset.tab === active);
		const next = all[(i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
		next.focus();
		next.click();
	});
	let searchTimer = 0;
	search.addEventListener('input', () => {
		clearTimeout(searchTimer);
		searchTimer = window.setTimeout(() => render(true), 140);
	});

	list.addEventListener('change', (e) => {
		const card = (e.target as HTMLElement).closest<HTMLElement>('.dish');
		if (card) syncPrice(card);
	});
	list.addEventListener('click', (e) => {
		const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-add]');
		if (!btn) return;
		const card = btn.closest<HTMLElement>('.dish')!;
		const dish = findDish(card.dataset.dish!)!;
		const size = $<HTMLInputElement>('input:checked', card)!.value;
		cart.add(dish.id, size);
		toast(`${dish.name} (${size}) na sacola`);
		flyToBag($<HTMLImageElement>('img', card), btn);
		plusOne(btn);
	});

	// Inclinação 3D suave dos cards (somente mouse)
	if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced()) {
		list.addEventListener('pointermove', (e) => {
			const card = (e.target as HTMLElement).closest<HTMLElement>('.dish');
			if (!card) return;
			const r = card.getBoundingClientRect();
			const px = (e.clientX - r.left) / r.width;
			const py = (e.clientY - r.top) / r.height;
			card.style.setProperty('--gx', `${px * 100}%`);
			card.style.setProperty('--gy', `${py * 100}%`);
			gsap.to(card, {rotationY: (px - 0.5) * 6, rotationX: (0.5 - py) * 6, transformPerspective: 900, duration: 0.6, ease: 'power3.out', overwrite: 'auto'});
		});
		list.addEventListener(
			'pointerout',
			(e) => {
				const card = (e.target as HTMLElement).closest<HTMLElement>('.dish');
				if (card && !card.contains(e.relatedTarget as Node)) gsap.to(card, {rotationX: 0, rotationY: 0, duration: 0.8, ease: 'power3.out'});
			},
		);
	}

	render(false);
}

/** "+1" que sobe a partir do botão. */
function plusOne(btn: HTMLElement) {
	if (reduced()) return;
	const r = btn.getBoundingClientRect();
	const el = document.createElement('span');
	el.className = 'plus-one';
	el.textContent = '+1';
	el.style.position = 'fixed';
	el.style.left = `${r.left + r.width / 2 - 10}px`;
	el.style.top = `${r.top - 6}px`;
	document.body.appendChild(el);
	gsap.fromTo(el, {y: 0, autoAlpha: 1, scale: 0.6}, {y: -46, autoAlpha: 0, scale: 1.2, duration: 0.9, ease: 'power2.out', onComplete: () => el.remove()});
	gsap.fromTo(btn, {scale: 0.92}, {scale: 1, duration: 0.5, ease: 'back.out(3)'});
}

/** Miniatura do prato "voa" até o botão da sacola. */
function flyToBag(img: HTMLImageElement | null, from: HTMLElement) {
	const target = [...$$('[data-mbar]'), $('.bag-btn')!].find((el) => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0);
	const bump = () => {
		$('.bag-btn')?.classList.remove('is-bump');
		void $('.bag-btn')?.offsetWidth;
		$('.bag-btn')?.classList.add('is-bump');
	};
	if (reduced() || !target || !img) return bump();
	const a = from.getBoundingClientRect();
	const b = target.getBoundingClientRect();
	const fly = document.createElement('div');
	fly.className = 'flyer';
	fly.innerHTML = `<img src="${img.src}" alt="" />`;
	document.body.appendChild(fly);
	gsap.set(fly, {left: a.left + a.width / 2 - 22, top: a.top + a.height / 2 - 22});
	const dx = b.left + b.width / 2 - (a.left + a.width / 2);
	const dy = b.top + b.height / 2 - (a.top + a.height / 2);
	gsap
		.timeline({onComplete: () => (fly.remove(), bump())})
		.to(fly, {x: dx, duration: 0.75, ease: 'power1.inOut'}, 0)
		.to(fly, {y: dy, duration: 0.75, ease: 'back.in(1.6)'}, 0)
		.to(fly, {scale: 0.4, duration: 0.75, ease: 'power2.in'}, 0);
}

/* -------------------------------------------------------------------------- */
/* Sacola                                                                      */
/* -------------------------------------------------------------------------- */
export function initCart(lenis: {stop: () => void; start: () => void} | null) {
	const root = $('[data-cart]')!;
	const items = $('[data-cart-items]')!;
	const empty = $('[data-cart-empty]')!;
	const form = $<HTMLFormElement>('[data-order]')!;
	const foot = $('[data-cart-foot]')!;
	const note = $('[data-cart-note]')!;
	const error = $('[data-order-error]')!;
	const mbar = $('[data-mbar]')!;
	const addrField = $('[data-address-field]')!;
	let lastFocus: HTMLElement | null = null;

	const render = () => {
		$$('[data-cart-count]').forEach((el) => (el.textContent = String(cart.count)));
		$$('[data-cart-total]').forEach((el) => (el.textContent = formatPrice(cart.total)));
		const has = cart.count > 0;
		empty.hidden = has;
		form.hidden = !has;
		foot.hidden = !has;
		mbar.hidden = !has;
		requestAnimationFrame(() => mbar.classList.toggle('is-on', has));
		note.textContent = cart.hasUnpriced
			? 'Alguns itens estão com preço a confirmar. A taxa de entrega e o valor final são confirmados no WhatsApp.'
			: 'A taxa de entrega e o valor final são confirmados no WhatsApp.';
		items.innerHTML = cart.lines
			.map((l, i) => {
				const dish = findDish(l.dishId)!;
				const price = priceOf(l);
				return `<li class="citem">
					${dish.image ? `<img src="${dish.image}" alt="" />` : '<span class="citem__ph"></span>'}
					<div><p class="citem__name">${esc(dish.name)}</p>
					<p class="citem__meta">Tamanho ${l.size} · ${price === null ? 'a confirmar' : formatPrice(price * l.qty)}</p></div>
					<div class="qty" role="group" aria-label="Quantidade de ${esc(dish.name)} ${l.size}">
						<button type="button" data-qty="${i}" data-d="-1" aria-label="Diminuir">−</button>
						<span>${l.qty}</span>
						<button type="button" data-qty="${i}" data-d="1" aria-label="Aumentar">+</button>
					</div>
				</li>`;
			})
			.join('');
	};
	cart.subscribe(render);
	render();

	items.addEventListener('click', (e) => {
		const b = (e.target as HTMLElement).closest<HTMLElement>('[data-qty]');
		if (b) cart.change(Number(b.dataset.qty), Number(b.dataset.d));
	});

	const open = () => {
		lastFocus = document.activeElement as HTMLElement;
		root.hidden = false;
		requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-open')));
		lenis?.stop();
		document.body.style.overflow = 'hidden';
		setTimeout(() => $<HTMLElement>('.cart__head .icon-btn', root)?.focus(), 60);
	};
	const close = () => {
		if (root.hidden) return;
		root.classList.remove('is-open');
		lenis?.start();
		document.body.style.overflow = '';
		setTimeout(() => (root.hidden = true), 450);
		lastFocus?.focus?.();
	};
	$$('[data-open-cart]').forEach((b) => b.addEventListener('click', open));
	$$('[data-close-cart]').forEach((b) => b.addEventListener('click', close));
	document.addEventListener('keydown', (e) => {
		if (root.hidden) return;
		if (e.key === 'Escape') close();
		// Mantém o foco dentro da sacola
		if (e.key === 'Tab') {
			const f = $$<HTMLElement>('button, a[href], input, textarea', root).filter((el) => el.offsetParent !== null);
			if (!f.length) return;
			if (e.shiftKey && document.activeElement === f[0]) {
				e.preventDefault();
				f[f.length - 1].focus();
			} else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
				e.preventDefault();
				f[0].focus();
			}
		}
	});

	const syncMode = () => {
		const delivery = $<HTMLInputElement>('input[name="modo"]:checked', form)?.value === 'Delivery';
		addrField.hidden = !delivery;
		$<HTMLInputElement>('#o-end')!.required = delivery;
	};
	form.addEventListener('change', syncMode);
	syncMode();

	const send = () => {
		const data = new FormData(form);
		const info = {
			modo: String(data.get('modo') ?? 'Delivery'),
			nome: String(data.get('nome') ?? '').trim(),
			endereco: String(data.get('endereco') ?? '').trim(),
			obs: String(data.get('obs') ?? '').trim(),
		};
		const nome = $<HTMLInputElement>('#o-nome')!;
		const end = $<HTMLInputElement>('#o-end')!;
		nome.setAttribute('aria-invalid', String(!info.nome));
		end.setAttribute('aria-invalid', String(info.modo === 'Delivery' && !info.endereco));
		if (!info.nome) {
			error.textContent = 'Informe seu nome para enviarmos o pedido.';
			nome.focus();
			return;
		}
		if (info.modo === 'Delivery' && !info.endereco) {
			error.textContent = 'Informe o endereço de entrega ou escolha "Para retirar".';
			end.focus();
			return;
		}
		error.textContent = '';
		const a = document.createElement('a');
		a.href = orderLink(info);
		a.target = '_blank';
		a.rel = 'noopener noreferrer';
		document.body.appendChild(a);
		a.click();
		a.remove();
		toast('Abrindo o WhatsApp com o seu pedido…');
	};
	$('[data-send-order]')!.addEventListener('click', (e) => {
		e.preventDefault();
		send();
	});
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		send();
	});

	return {open, close};
}
