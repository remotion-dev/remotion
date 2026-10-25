import {
	ACESFilmicToneMapping,
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	CatmullRomCurve3,
	Color,
	CylinderGeometry,
	DirectionalLight,
	DodecahedronGeometry,
	DoubleSide,
	ExtrudeGeometry,
	Group,
	InstancedMesh,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	PlaneGeometry,
	PMREMGenerator,
	Scene,
	Shape,
	SphereGeometry,
	SRGBColorSpace,
	Sprite,
	SpriteMaterial,
	TubeGeometry,
	Vector3,
	WebGLRenderer,
} from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Marmitex de alumínio com feijoada light (arroz, feijão preto com
 * calabresa e carne, couve e torresmo). A tampa traz o logo da casa, sobe na
 * abertura e o vapor aparece. O cursor inclina a marmita; a rolagem a gira.
 */

export type MarmitaOptions = {quality: 'high' | 'low'; reducedMotion: boolean; logoUrl: string};
export type Marmita = {open: () => void; setScroll: (p: number) => void; destroy: () => void};

// Dimensões da bandeja (unidades da cena)
const W = 3.0;
const D = 2.1;
const H = 0.72;
const R = 0.28;
const BOTTOM = 0.84; // escala da base em relação à boca (paredes inclinadas)

function rand(seed: number) {
	return () => {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	};
}

/** Contorno de retângulo arredondado no plano XZ. */
function outline(w: number, d: number, r: number, perCorner: number) {
	const pts: [number, number][] = [];
	const hw = w / 2 - r;
	const hd = d / 2 - r;
	const corners: [number, number, number][] = [
		[hw, hd, 0],
		[-hw, hd, Math.PI / 2],
		[-hw, -hd, Math.PI],
		[hw, -hd, (Math.PI * 3) / 2],
	];
	for (const [cx, cz, a0] of corners) {
		for (let i = 0; i <= perCorner; i++) {
			const a = a0 + (i / perCorner) * (Math.PI / 2);
			pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
		}
	}
	return pts;
}

/** Empurra um ponto para dentro de um retângulo arredondado. */
function clampInside(x: number, z: number, hw: number, hd: number, r: number): [number, number] {
	x = Math.max(-hw, Math.min(hw, x));
	z = Math.max(-hd, Math.min(hd, z));
	const cx = hw - r;
	const cz = hd - r;
	const ax = Math.abs(x);
	const az = Math.abs(z);
	if (ax > cx && az > cz) {
		const dx = ax - cx;
		const dz = az - cz;
		const len = Math.hypot(dx, dz);
		if (len > r) {
			x = Math.sign(x) * (cx + (dx / len) * r);
			z = Math.sign(z) * (cz + (dz / len) * r);
		}
	}
	return [x, z];
}

/** Meia-largura interna da bandeja na altura y. */
const innerAt = (y: number, margin = 0.06) => {
	const s = BOTTOM + (1 - BOTTOM) * Math.min(1, Math.max(0, y / H));
	return {hw: (W / 2) * s - margin, hd: (D / 2) * s - margin, r: R * s};
};

const smooth = (e0: number, e1: number, x: number) => {
	const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
	return t * t * (3 - 2 * t);
};

// Regiões da comida (vista de cima): arroz à esquerda, feijoada à direita
// atrás, couve e torresmo à direita na frente.
const riceW = (x: number) => 1 - smooth(-0.05, 0.12, x);
const beansW = (x: number, z: number) => smooth(-0.05, 0.12, x) * (1 - smooth(-0.08, 0.08, z));
const couveW = (x: number, z: number) => smooth(-0.05, 0.12, x) * smooth(-0.08, 0.08, z) * (1 - smooth(0.62, 0.78, x));
const torreW = (x: number, z: number) => smooth(-0.05, 0.12, x) * smooth(-0.08, 0.08, z) * smooth(0.62, 0.78, x);

/** Altura da superfície da comida. */
function surface(x: number, z: number) {
	const rice = 0.6 + 0.16 * Math.cos(((x + 0.65) / 1.5) * Math.PI) * Math.cos((z / 2.2) * Math.PI) + 0.02 * Math.sin(x * 9 + z * 7);
	const beans = 0.5 + 0.015 * Math.sin(x * 6) * Math.cos(z * 5);
	const couve = 0.56 + 0.04 * Math.sin(x * 8 + z * 3);
	const torre = 0.54;
	return rice * riceW(x) + beans * beansW(x, z) + couve * couveW(x, z) + torre * torreW(x, z);
}

function buildTray(material: Material) {
	const per = 10;
	const top = outline(W, D, R, per);
	const bottom = outline(W * BOTTOM, D * BOTTOM, R * BOTTOM, per);
	const n = top.length;
	const pos: number[] = [];
	const idx: number[] = [];
	// Paredes com pequenas nervuras verticais, típicas da marmitex
	for (let i = 0; i < n; i++) {
		const ridge = 1 + 0.006 * Math.sin(i * 2.2);
		pos.push(bottom[i][0] * ridge, 0, bottom[i][1] * ridge);
		pos.push(top[i][0] * ridge, H, top[i][1] * ridge);
	}
	for (let i = 0; i < n; i++) {
		const a = i * 2;
		const b = ((i + 1) % n) * 2;
		idx.push(a, b, a + 1, b, b + 1, a + 1);
	}
	// Fundo
	const c = pos.length / 3;
	pos.push(0, 0, 0);
	for (let i = 0; i < n; i++) idx.push(c, ((i + 1) % n) * 2, i * 2);
	// Aba externa
	const lip = outline(W + 0.18, D + 0.18, R + 0.09, per);
	const l0 = pos.length / 3;
	for (let i = 0; i < n; i++) pos.push(lip[i][0], H + 0.005, lip[i][1]);
	for (let i = 0; i < n; i++) {
		const a = i * 2 + 1;
		const b = ((i + 1) % n) * 2 + 1;
		idx.push(a, b, l0 + i, b, l0 + ((i + 1) % n), l0 + i);
	}
	const g = new BufferGeometry();
	g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
	g.setIndex(idx);
	g.computeVertexNormals();
	const tray = new Mesh(g, material);

	// Borda enrolada da aba
	const curve = new CatmullRomCurve3(
		lip.map(([x, z]) => new Vector3(x, H + 0.005, z)),
		true,
	);
	const rim = new Mesh(new TubeGeometry(curve, 160, 0.03, 10, true), material);
	const group = new Group();
	group.add(tray, rim);
	return group;
}

function lidTexture(logo: HTMLImageElement | null) {
	const c = document.createElement('canvas');
	c.width = 1024;
	c.height = Math.round(1024 * ((D + 0.18) / (W + 0.18)));
	const ctx = c.getContext('2d')!;
	// Papel-cartão kraft com fibras
	ctx.fillStyle = '#c9a06c';
	ctx.fillRect(0, 0, c.width, c.height);
	const r = rand(9);
	for (let i = 0; i < 2600; i++) {
		ctx.fillStyle = `rgba(${r() > 0.5 ? '90,60,30' : '240,215,170'},${0.05 + r() * 0.08})`;
		ctx.fillRect(r() * c.width, r() * c.height, 1 + r() * 7, 1);
	}
	const cx = c.width / 2;
	const cy = c.height / 2;
	if (logo) {
		const s = c.height * 0.5;
		ctx.save();
		ctx.beginPath();
		ctx.arc(cx, cy - c.height * 0.06, s / 2, 0, Math.PI * 2);
		ctx.clip();
		ctx.drawImage(logo, cx - s / 2, cy - c.height * 0.06 - s / 2, s, s);
		ctx.restore();
	}
	ctx.fillStyle = '#2a1c0f';
	ctx.textAlign = 'center';
	ctx.font = '700 46px "Bricolage Grotesque Variable", Arial, sans-serif';
	ctx.fillText('Marmitaria Nosso Sabor', cx, c.height * 0.86);
	ctx.strokeStyle = 'rgba(42,28,15,.35)';
	ctx.lineWidth = 3;
	ctx.strokeRect(26, 26, c.width - 52, c.height - 52);
	const t = new CanvasTexture(c);
	t.colorSpace = SRGBColorSpace;
	t.anisotropy = 4;
	return t;
}

function buildLid(foil: Material, logo: HTMLImageElement | null) {
	const lw = W + 0.18;
	const ld = D + 0.18;
	const pts = outline(lw, ld, R + 0.09, 10);
	const shape = new Shape();
	pts.forEach(([x, z], i) => (i ? shape.lineTo(x, z) : shape.moveTo(x, z)));
	const geo = new ExtrudeGeometry(shape, {depth: 0.035, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2});
	// Extrusão ocorre em Z; giramos para que a face fique virada para cima
	geo.rotateX(Math.PI / 2);
	const tex = lidTexture(logo);
	tex.repeat.set(1 / lw, -1 / ld);
	tex.offset.set(0.5, 0.5);
	const paper = new MeshStandardMaterial({map: tex, roughness: 0.85, metalness: 0});
	// Grupo 0 = tampas (topo/baixo), grupo 1 = laterais
	const lid = new Mesh(geo, [paper, foil]);
	return lid;
}

function softDot() {
	const c = document.createElement('canvas');
	c.width = c.height = 128;
	const ctx = c.getContext('2d')!;
	const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
	g.addColorStop(0, 'rgba(255,255,255,1)');
	g.addColorStop(0.4, 'rgba(255,255,255,.45)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 128, 128);
	return new CanvasTexture(c);
}

function shadowTexture() {
	const c = document.createElement('canvas');
	c.width = c.height = 256;
	const ctx = c.getContext('2d')!;
	const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
	g.addColorStop(0, 'rgba(0,0,0,.75)');
	g.addColorStop(0.55, 'rgba(0,0,0,.35)');
	g.addColorStop(1, 'rgba(0,0,0,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 256, 256);
	return new CanvasTexture(c);
}

export async function createMarmita(container: HTMLElement, opts: MarmitaOptions): Promise<Marmita> {
	const {quality, reducedMotion} = opts;
	const high = quality === 'high';
	const r = rand(20);

	const logo = await new Promise<HTMLImageElement | null>((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = opts.logoUrl;
	});
	await document.fonts?.ready;

	const renderer = new WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'});
	let dpr = Math.min(window.devicePixelRatio || 1, high ? 2 : 1.5);
	renderer.setPixelRatio(dpr);
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;
	renderer.setClearColor(0, 0);
	container.appendChild(renderer.domElement);

	const scene = new Scene();
	const camera = new PerspectiveCamera(30, 1, 0.1, 100);
	const pmrem = new PMREMGenerator(renderer);
	const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	scene.environment = env;
	pmrem.dispose();

	const key = new DirectionalLight(new Color('#ffd7a8'), 2.6);
	key.position.set(-3, 6, 4);
	const rimLight = new DirectionalLight(new Color('#ffb36b'), 1.4);
	rimLight.position.set(4, 2, -4);
	scene.add(key, rimLight);

	const root = new Group(); // posição responsiva
	const rig = new Group(); // inclinação pelo cursor
	root.add(rig);
	scene.add(root);

	// Sombra de contato
	const shadow = new Mesh(
		new PlaneGeometry(W * 1.9, D * 2.1),
		new MeshBasicMaterial({map: shadowTexture(), transparent: true, depthWrite: false}),
	);
	shadow.rotation.x = -Math.PI / 2;
	shadow.position.y = -0.01;
	rig.add(shadow);

	const foil = new MeshStandardMaterial({color: new Color('#d7d9db'), metalness: 1, roughness: 0.34, side: DoubleSide, envMapIntensity: 1.1});
	const tray = buildTray(foil);
	rig.add(tray);

	// --- Base da comida (superfície contínua com cores por região) ---------
	const seg = high ? 150 : 90;
	const bed = new PlaneGeometry(W, D, seg, Math.round(seg * (D / W)));
	bed.rotateX(-Math.PI / 2);
	const bp = bed.attributes.position as BufferAttribute;
	const colors = new Float32Array(bp.count * 3);
	const cRice = new Color('#efe4cf');
	const cBeans = new Color('#24130d');
	const cCouve = new Color('#24461a');
	const cTorre = new Color('#24461a');
	const tmp = new Color();
	for (let i = 0; i < bp.count; i++) {
		const x0 = bp.getX(i);
		const z0 = bp.getZ(i);
		const y = surface(x0, z0) - 0.03;
		const {hw, hd, r: rr} = innerAt(y, 0.03);
		const [x, z] = clampInside(x0, z0, hw, hd, rr);
		bp.setXYZ(i, x, surface(x, z) - 0.03, z);
		tmp.setRGB(0, 0, 0);
		tmp.add(cRice.clone().multiplyScalar(riceW(x)));
		tmp.add(cBeans.clone().multiplyScalar(beansW(x, z)));
		tmp.add(cCouve.clone().multiplyScalar(couveW(x, z)));
		tmp.add(cTorre.clone().multiplyScalar(torreW(x, z)));
		const n = 0.92 + r() * 0.12;
		colors.set([tmp.r * n, tmp.g * n, tmp.b * n], i * 3);
	}
	bed.setAttribute('color', new BufferAttribute(colors, 3));
	bed.computeVertexNormals();
	rig.add(new Mesh(bed, new MeshStandardMaterial({vertexColors: true, roughness: 0.6})));

	// Caldo brilhante da feijoada
	const sauce = new PlaneGeometry(1.5, 1.1, 40, 30);
	sauce.rotateX(-Math.PI / 2);
	sauce.translate(0.72, 0, -0.5);
	const sp = sauce.attributes.position as BufferAttribute;
	for (let i = 0; i < sp.count; i++) {
		const {hw, hd, r: rr} = innerAt(0.52, 0.04);
		const [x, z] = clampInside(Math.max(0.08, sp.getX(i)), Math.min(-0.02, sp.getZ(i)), hw, hd, rr);
		sp.setXYZ(i, x, 0.515 + 0.008 * Math.sin(x * 11) * Math.cos(z * 9), z);
	}
	sauce.computeVertexNormals();
	rig.add(new Mesh(sauce, new MeshPhysicalMaterial({color: new Color('#2a1209'), roughness: 0.32, clearcoat: 0.55, clearcoatRoughness: 0.2, envMapIntensity: 0.35})));

	// --- Instâncias ---------------------------------------------------------
	const dummy = new Object3D();
	type Placer = (i: number) => {x: number; z: number} | null;
	const scatter = (mesh: InstancedMesh, count: number, region: Placer, setup: (o: Object3D, x: number, z: number) => void) => {
		let placed = 0;
		let guard = 0;
		while (placed < count && guard++ < count * 20) {
			const p = region(placed);
			if (!p) continue;
			const y = surface(p.x, p.z);
			const {hw, hd, r: rr} = innerAt(y, 0.09);
			const [x, z] = clampInside(p.x, p.z, hw, hd, rr);
			dummy.position.set(x, y, z);
			dummy.rotation.set(0, 0, 0);
			dummy.scale.set(1, 1, 1);
			setup(dummy, x, z);
			dummy.updateMatrix();
			mesh.setMatrixAt(placed++, dummy.matrix);
		}
		mesh.count = placed;
		mesh.instanceMatrix.needsUpdate = true;
		rig.add(mesh);
	};
	const inRegion = (w: (x: number, z: number) => number, x0: number, x1: number, z0: number, z1: number) => () => {
		const x = x0 + r() * (x1 - x0);
		const z = z0 + r() * (z1 - z0);
		return w(x, z) > 0.6 ? {x, z} : null;
	};

	// Arroz
	const riceCount = high ? 3200 : 1500;
	const rice = new InstancedMesh(new SphereGeometry(1, 8, 6), new MeshStandardMaterial({color: new Color('#f6eedf'), roughness: 0.5}), riceCount);
	scatter(rice, riceCount, inRegion((x) => riceW(x), -1.5, 0.1, -1.05, 1.05), (o) => {
		o.position.y += r() * 0.035;
		o.rotation.set(r() * 0.6, r() * Math.PI, r() * 0.6);
		o.scale.set(0.068, 0.025, 0.025);
	});

	// Feijão
	const beanCount = high ? 340 : 180;
	const beans = new InstancedMesh(new SphereGeometry(1, 10, 8), new MeshPhysicalMaterial({color: new Color('#1a0c07'), roughness: 0.3, clearcoat: 0.6, envMapIntensity: 0.5}), beanCount);
	scatter(beans, beanCount, inRegion(beansW, 0.05, 1.5, -1.05, 0), (o) => {
		o.position.y = 0.52 + r() * 0.02;
		o.rotation.set(r() * 3, r() * 3, r() * 3);
		o.scale.set(0.058, 0.036, 0.038);
	});

	// Calabresa em rodelas
	const sausage = new InstancedMesh(new CylinderGeometry(1, 1, 1, 24), new MeshPhysicalMaterial({color: new Color('#5e2216'), roughness: 0.4, clearcoat: 0.4}), 9);
	scatter(sausage, 9, inRegion(beansW, 0.15, 1.35, -0.95, -0.1), (o) => {
		o.position.y = 0.55;
		o.rotation.set((r() - 0.5) * 0.7, r() * 3, (r() - 0.5) * 0.7);
		o.scale.set(0.13, 0.05, 0.13);
	});

	// Carne
	const meat = new InstancedMesh(new DodecahedronGeometry(1, 1), new MeshPhysicalMaterial({color: new Color('#4b2316'), roughness: 0.45, clearcoat: 0.4}), 8);
	scatter(meat, 8, inRegion(beansW, 0.15, 1.35, -0.95, -0.1), (o) => {
		o.position.y = 0.55;
		o.rotation.set(r() * 3, r() * 3, r() * 3);
		o.scale.set(0.11 + r() * 0.04, 0.07, 0.09);
	});

	// Couve refogada
	const couveCount = high ? 260 : 140;
	const couve = new InstancedMesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial({color: new Color('#ffffff'), roughness: 0.42}), couveCount);
	const couveColor = new Color();
	scatter(couve, couveCount, inRegion(couveW, 0.05, 0.8, 0, 1.05), (o) => {
		o.position.y += r() * 0.05;
		o.rotation.set((r() - 0.5) * 0.5, r() * Math.PI, (r() - 0.5) * 0.5);
		o.scale.set(0.16 + r() * 0.1, 0.008, 0.05 + r() * 0.03);
	});
	for (let i = 0; i < couve.count; i++) {
		couveColor.set(r() > 0.5 ? '#1f4417' : '#2f5f22');
		couve.setColorAt(i, couveColor);
	}

	// Torresmo
	const torre = new InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 3, 0.25), new MeshPhysicalMaterial({color: new Color('#a8642a'), roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.5}), 12);
	scatter(torre, 12, inRegion(torreW, 0.7, 1.5, 0.02, 1.05), (o) => {
		o.position.y += 0.04;
		o.rotation.set((r() - 0.5) * 0.6, r() * 3, (r() - 0.5) * 0.6);
		const s = 0.13 + r() * 0.06;
		o.scale.set(s * (1.2 + r() * 0.5), s * (0.55 + r() * 0.3), s * (0.8 + r() * 0.3));
	});

	// --- Tampa --------------------------------------------------------------
	const lid = buildLid(foil, logo);
	const lidPivot = new Group();
	lidPivot.add(lid);
	rig.add(lidPivot);
	const lidClosed = {y: H + 0.06, rx: 0, z: 0};
	const lidOpen = {y: H + 0.95, rx: 1.02, z: -1.55}; // apoiada atrás, com o logo virado para quem olha

	// --- Vapor --------------------------------------------------------------
	const steamTex = softDot();
	const puffs: {s: Sprite; t: number; speed: number; x: number; z: number; sway: number}[] = [];
	const puffCount = high ? 22 : 12;
	for (let i = 0; i < puffCount; i++) {
		const s = new Sprite(new SpriteMaterial({map: steamTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false}));
		rig.add(s);
		puffs.push({s, t: r(), speed: 0.12 + r() * 0.1, x: (r() - 0.5) * 2.2, z: (r() - 0.5) * 1.4, sway: r() * 6});
	}

	// --- Layout ---------------------------------------------------------------
	const layout = {scale: 1, y: 0};
	const resize = () => {
		const w = container.clientWidth;
		const h = container.clientHeight;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.position.set(0, 5.6, 6.4);
		camera.lookAt(0, 0.95, -0.2);
		// Mantém a marmita (≈3.4 de largura) inteira em telas estreitas
		const fit = Math.min(1, camera.aspect / 1.15);
		layout.scale = Math.max(0.6, fit * 0.9);
		camera.updateProjectionMatrix();
		draw();
	};

	// --- Interação --------------------------------------------------------------
	const pointer = {x: 0, y: 0, cx: 0, cy: 0};
	const onMove = (e: PointerEvent) => {
		if (e.pointerType !== 'mouse') return;
		pointer.x = (e.clientX / innerWidth) * 2 - 1;
		pointer.y = (e.clientY / innerHeight) * 2 - 1;
	};
	if (!reducedMotion) addEventListener('pointermove', onMove, {passive: true});

	let scroll = 0;
	let scrollS = 0;
	let openT = reducedMotion ? 1 : 0;
	let opening = reducedMotion;
	let time = 0;

	const ease = (t: number) => 1 - Math.pow(1 - t, 4);
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

	const update = (dt: number) => {
		time += dt;
		pointer.cx += (pointer.x - pointer.cx) * Math.min(1, dt * 3);
		pointer.cy += (pointer.y - pointer.cy) * Math.min(1, dt * 3);
		scrollS += (scroll - scrollS) * Math.min(1, dt * 6);
		if (opening && openT < 1) openT = Math.min(1, openT + dt / 1.6);
		const o = ease(openT);

		root.scale.setScalar(layout.scale);
		root.position.y = scrollS * 0.8;
		rig.rotation.y = -0.38 + pointer.cx * 0.32 + (reducedMotion ? 0 : Math.sin(time * 0.35) * 0.06) + scrollS * 0.8;
		rig.rotation.x = pointer.cy * 0.1;
		rig.rotation.z = pointer.cx * -0.03;

		lidPivot.position.set(0, lerp(lidClosed.y, lidOpen.y, o) + Math.sin(o * Math.PI) * 0.25, lerp(lidClosed.z, lidOpen.z, o));
		lidPivot.rotation.x = lerp(lidClosed.rx, lidOpen.rx, o);
		lidPivot.position.y += reducedMotion ? 0 : Math.sin(time * 1.1) * 0.04 * o;

		puffs.forEach((p) => {
			p.t += dt * p.speed;
			if (p.t > 1) {
				p.t -= 1;
				p.x = (r() - 0.5) * 2.2;
				p.z = (r() - 0.5) * 1.4;
			}
			const life = p.t;
			p.s.position.set(p.x + Math.sin(time * 0.8 + p.sway) * 0.15 * life, 0.7 + life * 1.9, p.z);
			const size = 0.35 + life * 1.1;
			p.s.scale.set(size, size, 1);
			(p.s.material as SpriteMaterial).opacity = (reducedMotion ? 0 : 0.11) * o * Math.sin(life * Math.PI);
		});
	};

	const draw = () => {
		if (reducedMotion) update(0);
		renderer.render(scene, camera);
	};

	let raf = 0;
	let running = false;
	let visible = true;
	let last = performance.now();
	const samples: number[] = [];
	const tick = (now: number) => {
		raf = requestAnimationFrame(tick);
		// O timestamp do rAF pode ser anterior a `last`: nunca aceitar intervalo negativo
		const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
		last = now;
		update(dt);
		renderer.render(scene, camera);
		if (samples.length < 90) {
			samples.push(dt);
			if (samples.length === 90 && samples.slice(20).reduce((a, b) => a + b, 0) / 70 > 1 / 40 && dpr > 1) {
				dpr = 1;
				renderer.setPixelRatio(1);
				resize();
			}
		}
	};
	const start = () => {
		if (running || reducedMotion || !visible || document.hidden) return;
		running = true;
		last = performance.now();
		raf = requestAnimationFrame(tick);
	};
	const stop = () => {
		running = false;
		cancelAnimationFrame(raf);
	};
	const io = new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
		if (visible) start();
		else stop();
	});
	io.observe(container);
	const onVis = () => (document.hidden ? stop() : start());
	document.addEventListener('visibilitychange', onVis);
	const ro = new ResizeObserver(resize);
	ro.observe(container);
	resize();
	start();

	return {
		open() {
			opening = true;
			if (reducedMotion) draw();
		},
		setScroll(p) {
			scroll = p;
			if (reducedMotion) {
				scrollS = p;
				draw();
			}
		},
		destroy() {
			stop();
			io.disconnect();
			ro.disconnect();
			removeEventListener('pointermove', onMove);
			document.removeEventListener('visibilitychange', onVis);
			renderer.dispose();
			renderer.domElement.remove();
		},
	};
}
