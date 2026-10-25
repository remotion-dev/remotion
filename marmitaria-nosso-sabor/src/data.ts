/**
 * Dados da Marmitaria Nosso Sabor — EDITE AQUI.
 *
 * Tudo o que veio do cardápio atual (nome, endereço, telefone, e-mail,
 * horário, categorias, pratos, preços e fotos) já está preenchido.
 * O que ainda não sabemos está marcado com `// EDITAR` e é listado no
 * console do navegador ao abrir o site.
 */
import feijoadaImg from './assets/feijoada-light.webp';
import parmegianaImg from './assets/frango-parmegiana.webp';

export type Size = {label: 'P' | 'M' | 'G'; price: number | null};

export type Dish = {
	id: string;
	name: string;
	description: string;
	image: string | null;
	sizes: Size[];
};

export type Category = {id: string; name: string; dishes: Dish[]};

export const store = {
	name: 'Marmitaria Nosso Sabor',
	address: 'Av. dos Esportes, 964',
	// EDITAR: cidade/bairro, para o link do mapa ficar exato. Ex.: 'Centro, Campinas - SP'
	city: '',
	phoneDisplay: '(19) 99892-7863',
	whatsapp: '5519998927863',
	email: 'marmitarianossosabor964@gmail.com',
	hours: {open: '10:30', close: '14:00'},
	// EDITAR: dias de funcionamento (0 = domingo … 6 = sábado). Confirme antes de publicar.
	days: [1, 2, 3, 4, 5, 6],
	daysConfirmed: false,
	// EDITAR: deixe vazio para esconder. Ex.: 'https://instagram.com/seuperfil'
	instagram: '',
	facebook: '',
};

export const menu: Category[] = [
	{
		id: 'sabado',
		name: 'Sábado',
		dishes: [
			{
				id: 'feijoada-light',
				name: 'Feijoada light',
				description: 'Acompanhada de arroz soltinho, feijão preto cremoso, couve refogada e torresmo crocante.',
				image: feijoadaImg,
				sizes: [
					{label: 'P', price: 20},
					{label: 'M', price: 22},
					{label: 'G', price: 26},
				],
			},
			{
				id: 'frango-parmegiana',
				name: 'Frango à parmegiana',
				description: 'Frango empanado, coberto com molho de tomate e queijo derretido.',
				image: parmegianaImg,
				sizes: [
					{label: 'P', price: 20},
					// EDITAR: preços dos tamanhos M e G (null = "a confirmar")
					{label: 'M', price: null},
					{label: 'G', price: null},
				],
			},
		],
	},
	// EDITAR: pratos das categorias abaixo. Enquanto estiverem vazias, o site
	// convida o cliente a consultar o cardápio do dia pelo WhatsApp.
	{id: 'executiva', name: 'Executiva', dishes: []},
	{id: 'saladas', name: 'Saladas', dishes: []},
	{id: 'bebidas', name: 'Bebidas', dishes: []},
	{id: 'doces', name: 'Doces', dishes: []},
];

export const formatPrice = (value: number) =>
	value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

export const whatsappLink = (text?: string) =>
	`https://wa.me/${store.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const mapsLink = () =>
	`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
		[store.name, store.address, store.city].filter(Boolean).join(', '),
	)}`;

/** Situação atual a partir do horário (e dos dias configurados). */
export function openStatus(now = new Date()) {
	const [oh, om] = store.hours.open.split(':').map(Number);
	const [ch, cm] = store.hours.close.split(':').map(Number);
	const minutes = now.getHours() * 60 + now.getMinutes();
	const openDay = store.days.includes(now.getDay());
	const isOpen = openDay && minutes >= oh * 60 + om && minutes < ch * 60 + cm;
	if (isOpen) return {isOpen, label: `Aberto agora · até ${store.hours.close.replace(':', 'h')}`};
	const opensToday = openDay && minutes < oh * 60 + om;
	return {
		isOpen,
		label: opensToday
			? `Fechado · abre hoje às ${store.hours.open.replace(':', 'h')}`
			: `Fechado · abre às ${store.hours.open.replace(':', 'h')}`,
	};
}
