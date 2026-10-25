import {config, type EditableValue} from '../config';
import {$, $$} from './env';

const placeholderTag = () => {
	const tag = document.createElement('span');
	tag.className = 'placeholder-tag';
	tag.textContent = 'EDITAR';
	tag.title = 'Dado provisório — substitua em src/config.ts';
	return tag;
};

const fill = (el: HTMLElement, item: EditableValue) => {
	el.textContent = item.value;
	if (el instanceof HTMLAnchorElement && item.href) {
		el.href = item.href;
		if (/^https?:/.test(item.href)) {
			el.target = '_blank';
			el.rel = 'noopener noreferrer';
		}
	}
	if (item.placeholder) el.after(placeholderTag());
};

/** Link + selo (quando provisório) — o selo precisa de um pai para ser inserido. */
const anchor = (item: EditableValue) => {
	const wrap = document.createElement('span');
	const a = document.createElement('a');
	a.className = 'link';
	a.dataset.cursor = 'link';
	wrap.appendChild(a);
	fill(a, item);
	return wrap;
};

/** Preenche contatos, redes e textos a partir de src/config.ts. */
export function renderConfig() {
	$$('[data-config-text]').forEach((el) => {
		const key = el.dataset.configText as 'availability';
		const item = config[key];
		if (item) fill(el, item);
	});
	$$<HTMLAnchorElement>('[data-config-link]').forEach((el) => {
		const key = el.dataset.configLink as 'email';
		const item = config[key];
		if (item) fill(el, item);
	});

	const direct = $('[data-contact-list]');
	if (direct) {
		const rows: [string, EditableValue | null][] = [
			['E-mail', config.email],
			['WhatsApp', config.phone],
			['Base', config.location],
		];
		rows.forEach(([label, item]) => {
			if (!item) return;
			const wrap = document.createElement('div');
			const dt = document.createElement('dt');
			dt.className = 'mono';
			dt.textContent = label;
			const dd = document.createElement('dd');
			if (item.href) dd.appendChild(anchor(item));
			else {
				const span = document.createElement('span');
				dd.appendChild(span);
				fill(span, item);
			}
			wrap.append(dt, dd);
			direct.appendChild(wrap);
		});
	}

	const footerContact = $('[data-footer-contact]');
	[config.email, config.phone].forEach((item) => {
		if (!item || !footerContact) return;
		const li = document.createElement('li');
		li.appendChild(anchor(item));
		footerContact.appendChild(li);
	});

	const footerSocial = $('[data-footer-social]');
	config.social.forEach(({label, value}) => {
		if (!footerSocial) return;
		const li = document.createElement('li');
		li.appendChild(anchor({...value, value: label}));
		footerSocial.appendChild(li);
	});

	$$('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));

	const pending = [config.availability, config.email, config.phone, config.location, ...config.social.map((s) => s.value)]
		.filter((v) => v?.placeholder)
		.map((v) => v!.value);
	if (pending.length) {
		console.info(`[NEXORA] ${pending.length} dado(s) provisório(s) em src/config.ts:`, pending);
	}
}

/** Validação acessível + envio via endpoint configurado ou e-mail. */
export function initContactForm() {
	const form = $<HTMLFormElement>('[data-contact-form]');
	const status = $('[data-form-status]');
	if (!form || !status) return;
	const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
	const submitLabel = submit.querySelector('.btn__label')!;

	const setStatus = (msg: string, kind: 'error' | 'success' | '' = '') => {
		status.textContent = msg;
		status.classList.toggle('is-error', kind === 'error');
		status.classList.toggle('is-success', kind === 'success');
	};

	const fields = $$<HTMLInputElement | HTMLTextAreaElement>('input[required], textarea[required]', form);
	const messages: Record<string, string> = {
		nome: 'Informe seu nome.',
		email: 'Informe um e-mail válido.',
		mensagem: 'Conte um pouco mais sobre o projeto (mínimo de 10 caracteres).',
	};

	const validate = (field: HTMLInputElement | HTMLTextAreaElement) => {
		const valid = field.checkValidity();
		field.closest('.field')?.classList.toggle('is-invalid', !valid);
		field.setAttribute('aria-invalid', String(!valid));
		return valid;
	};

	fields.forEach((field) => {
		field.addEventListener('blur', () => field.value && validate(field));
		field.addEventListener('input', () => {
			if (field.closest('.field')?.classList.contains('is-invalid')) validate(field);
		});
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const invalid = fields.filter((f) => !validate(f));
		if (invalid.length) {
			setStatus(messages[invalid[0].name] ?? 'Verifique os campos destacados.', 'error');
			invalid[0].focus();
			return;
		}

		const data = new FormData(form);
		const payload = {
			nome: String(data.get('nome') ?? ''),
			email: String(data.get('email') ?? ''),
			empresa: String(data.get('empresa') ?? ''),
			interesse: data.getAll('interesse').map(String),
			mensagem: String(data.get('mensagem') ?? ''),
		};

		submit.disabled = true;
		submitLabel.textContent = 'Enviando…';
		setStatus('');

		try {
			if (config.formEndpoint) {
				const res = await fetch(config.formEndpoint, {
					method: 'POST',
					headers: {'Content-Type': 'application/json', Accept: 'application/json'},
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error(String(res.status));
				form.reset();
				setStatus('Mensagem enviada. Obrigado! Retornaremos em breve.', 'success');
			} else {
				// Sem endpoint configurado: abre o e-mail do visitante com a mensagem pronta.
				const lines = [`Nome: ${payload.nome}`, `E-mail: ${payload.email}`];
				if (payload.empresa) lines.push(`Empresa: ${payload.empresa}`);
				if (payload.interesse.length) lines.push(`Interesse: ${payload.interesse.join(', ')}`);
				lines.push('', payload.mensagem);
				const body = lines.join('\n');
				const to = config.email.value;
				const subject = `Novo projeto — ${payload.nome}`;
				window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
				setStatus(`Preparamos a mensagem no seu aplicativo de e-mail. Se ele não abrir, escreva para ${to}.`, 'success');
			}
		} catch {
			setStatus(`Não foi possível enviar agora. Escreva para ${config.email.value}.`, 'error');
		} finally {
			submit.disabled = false;
			submitLabel.textContent = 'Enviar mensagem';
		}
	});
}
