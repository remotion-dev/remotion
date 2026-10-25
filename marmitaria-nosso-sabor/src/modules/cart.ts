import {formatPrice, menu, store, whatsappLink, type Dish} from '../data';

export type CartLine = {dishId: string; size: string; qty: number};

const KEY = 'nosso-sabor:sacola';
const listeners = new Set<() => void>();
let lines: CartLine[] = load();

function load(): CartLine[] {
	try {
		const raw = localStorage.getItem(KEY);
		const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
		// Descarta itens que não existem mais no cardápio
		return parsed.filter((l) => findDish(l.dishId)?.sizes.some((s) => s.label === l.size));
	} catch {
		return [];
	}
}

function save() {
	try {
		localStorage.setItem(KEY, JSON.stringify(lines));
	} catch {
		/* armazenamento indisponível: a sacola vale só nesta visita */
	}
	listeners.forEach((fn) => fn());
}

export function findDish(id: string): Dish | undefined {
	for (const c of menu) {
		const d = c.dishes.find((x) => x.id === id);
		if (d) return d;
	}
	return undefined;
}

export const priceOf = (l: CartLine) => findDish(l.dishId)?.sizes.find((s) => s.label === l.size)?.price ?? null;

export const cart = {
	get lines() {
		return lines;
	},
	get count() {
		return lines.reduce((n, l) => n + l.qty, 0);
	},
	get total() {
		return lines.reduce((sum, l) => sum + (priceOf(l) ?? 0) * l.qty, 0);
	},
	get hasUnpriced() {
		return lines.some((l) => priceOf(l) === null);
	},
	add(dishId: string, size: string) {
		const line = lines.find((l) => l.dishId === dishId && l.size === size);
		if (line) line.qty += 1;
		else lines = [...lines, {dishId, size, qty: 1}];
		save();
	},
	change(index: number, delta: number) {
		const line = lines[index];
		if (!line) return;
		line.qty += delta;
		if (line.qty <= 0) lines = lines.filter((_, i) => i !== index);
		save();
	},
	clear() {
		lines = [];
		save();
	},
	subscribe(fn: () => void) {
		listeners.add(fn);
		return () => listeners.delete(fn);
	},
};

export type OrderInfo = {modo: string; nome: string; endereco: string; obs: string};

/** Mensagem do pedido no formato que chega ao WhatsApp da casa. */
export function orderMessage(info: OrderInfo) {
	const out = [`Olá, ${store.name}! Quero fazer um pedido:`, ''];
	lines.forEach((l) => {
		const dish = findDish(l.dishId);
		const price = priceOf(l);
		out.push(
			`• ${l.qty}x ${dish?.name ?? l.dishId} (${l.size}) — ${price === null ? 'preço a confirmar' : formatPrice(price * l.qty)}`,
		);
	});
	out.push('', `Total dos itens: ${formatPrice(cart.total)}${cart.hasUnpriced ? ' + itens a confirmar' : ''}`);
	out.push(`Forma: ${info.modo}`);
	out.push(`Nome: ${info.nome}`);
	if (info.modo === 'Delivery') out.push(`Endereço: ${info.endereco}`);
	if (info.obs) out.push(`Observações: ${info.obs}`);
	return out.join('\n');
}

export const orderLink = (info: OrderInfo) => whatsappLink(orderMessage(info));
