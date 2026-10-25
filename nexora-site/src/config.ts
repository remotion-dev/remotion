/**
 * Informações do negócio — EDITE AQUI.
 *
 * Todos os valores marcados com `placeholder: true` são provisórios e aparecem
 * no site com o selo "EDITAR". Substitua pelo dado real e remova a flag
 * (ou defina como `false`) para o selo desaparecer.
 */

export type EditableValue = {
	value: string;
	href?: string;
	placeholder?: boolean;
};

export type SiteConfig = {
	availability: EditableValue;
	email: EditableValue;
	phone: EditableValue | null;
	location: EditableValue | null;
	social: {label: string; value: EditableValue}[];
	/**
	 * Endpoint opcional que recebe o formulário via POST (JSON), por exemplo
	 * Formspree, Basin ou uma função serverless própria. Se ficar vazio, o
	 * formulário abre o aplicativo de e-mail do visitante com a mensagem pronta.
	 */
	formEndpoint: string;
};

export const config: SiteConfig = {
	availability: {value: 'Agenda aberta para novos projetos', placeholder: true},
	email: {
		value: 'contato@seudominio.com.br',
		href: 'mailto:contato@seudominio.com.br',
		placeholder: true,
	},
	phone: {
		value: '+55 (00) 00000-0000',
		href: 'https://wa.me/5500000000000',
		placeholder: true,
	},
	location: {value: 'Cidade, Estado — Brasil', placeholder: true},
	social: [
		{
			label: 'Instagram',
			value: {value: '@seuperfil', href: 'https://instagram.com/', placeholder: true},
		},
		{
			label: 'LinkedIn',
			value: {value: 'NEXORA Digital', href: 'https://www.linkedin.com/', placeholder: true},
		},
	],
	formEndpoint: '',
};
