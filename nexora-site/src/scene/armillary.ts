import {
	ACESFilmicToneMapping,
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Color,
	CylinderGeometry,
	DirectionalLight,
	DoubleSide,
	Group,
	IcosahedronGeometry,
	Mesh,
	MeshPhysicalMaterial,
	PerspectiveCamera,
	PMREMGenerator,
	Points,
	PointsMaterial,
	Scene,
	SphereGeometry,
	SRGBColorSpace,
	TorusGeometry,
	WebGLRenderer,
} from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Peça central do hero: uma esfera armilar — núcleo de obsidiana com
 * superfície viva (shader de ruído) envolto por anéis de latão. Representa a
 * ideia de "nexo": camadas independentes, em equilíbrio, girando em torno de
 * um centro.
 */

export type ArmillaryOptions = {
	quality: 'high' | 'low';
	reducedMotion: boolean;
};

export type Armillary = {
	reveal: () => void;
	setScroll: (progress: number) => void;
	destroy: () => void;
};

const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
	const vec2 C=vec2(1.0/6.0,1.0/3.0);
	const vec4 D=vec4(0.0,0.5,1.0,2.0);
	vec3 i=floor(v+dot(v,C.yyy));
	vec3 x0=v-i+dot(i,C.xxx);
	vec3 g=step(x0.yzx,x0.xyz);
	vec3 l=1.0-g;
	vec3 i1=min(g.xyz,l.zxy);
	vec3 i2=max(g.xyz,l.zxy);
	vec3 x1=x0-i1+C.xxx;
	vec3 x2=x0-i2+C.yyy;
	vec3 x3=x0-D.yyy;
	i=mod289(i);
	vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
	float n_=0.142857142857;
	vec3 ns=n_*D.wyz-D.xzx;
	vec4 j=p-49.0*floor(p*ns.z*ns.z);
	vec4 x_=floor(j*ns.z);
	vec4 y_=floor(j-7.0*x_);
	vec4 x=x_*ns.x+ns.yyyy;
	vec4 y=y_*ns.x+ns.yyyy;
	vec4 h=1.0-abs(x)-abs(y);
	vec4 b0=vec4(x.xy,y.xy);
	vec4 b1=vec4(x.zw,y.zw);
	vec4 s0=floor(b0)*2.0+1.0;
	vec4 s1=floor(b1)*2.0+1.0;
	vec4 sh=-step(h,vec4(0.0));
	vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
	vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
	vec3 p0=vec3(a0.xy,h.x);
	vec3 p1=vec3(a0.zw,h.y);
	vec3 p2=vec3(a1.xy,h.z);
	vec3 p3=vec3(a1.zw,h.w);
	vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
	p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
	vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
	m=m*m;
	return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
uniform float uTime;
uniform float uAmp;
vec3 nxDisplace(vec3 n){
	float d=snoise(n*0.95+vec3(0.0,uTime*0.14,uTime*0.06))*uAmp;
	d+=snoise(n*2.2-vec3(uTime*0.09))*uAmp*0.22;
	return n*(1.0+d);
}
`;

export function createArmillary(container: HTMLElement, options: ArmillaryOptions): Armillary {
	const {quality, reducedMotion} = options;
	const high = quality === 'high';

	const renderer = new WebGLRenderer({
		antialias: high,
		alpha: true,
		powerPreference: 'high-performance',
	});
	let dpr = Math.min(window.devicePixelRatio || 1, high ? 2 : 1.5);
	renderer.setPixelRatio(dpr);
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;
	renderer.setClearColor(0x000000, 0);
	container.appendChild(renderer.domElement);

	const scene = new Scene();
	const camera = new PerspectiveCamera(32, 1, 0.1, 100);
	camera.position.set(0, 0, 8);

	const pmrem = new PMREMGenerator(renderer);
	const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	scene.environment = envTexture;
	pmrem.dispose();

	const key = new DirectionalLight(new Color('#ffe2b8'), 2.4);
	key.position.set(-4, 5, 6);
	const rim = new DirectionalLight(new Color('#a9bccb'), 1.6);
	rim.position.set(5, -1, -4);
	scene.add(key, rim);

	// Grupo raiz: posição/escala responsivas. Grupo interno: rotação.
	const root = new Group();
	const rig = new Group();
	root.add(rig);
	scene.add(root);

	// --- Núcleo -------------------------------------------------------------
	const uniforms = {uTime: {value: 0}, uAmp: {value: 0.06}};
	const coreMaterial = new MeshPhysicalMaterial({
		color: new Color('#16130f'),
		metalness: 0.55,
		roughness: 0.3,
		clearcoat: 1,
		clearcoatRoughness: 0.18,
		envMapIntensity: 1.1,
		sheen: 0.4,
		sheenColor: new Color('#c6a46c'),
		sheenRoughness: 0.5,
	});
	coreMaterial.onBeforeCompile = (shader) => {
		shader.uniforms.uTime = uniforms.uTime;
		shader.uniforms.uAmp = uniforms.uAmp;
		shader.vertexShader = shader.vertexShader
			.replace('#include <common>', `#include <common>\n${noiseGLSL}`)
			.replace(
				'#include <beginnormal_vertex>',
				/* glsl */ `
				vec3 nxN = normalize(position);
				vec3 nxT = normalize(cross(nxN, vec3(0.0, 1.0, 0.001)));
				vec3 nxB = cross(nxN, nxT);
				vec3 nxP0 = nxDisplace(nxN);
				vec3 nxP1 = nxDisplace(normalize(nxN + nxT * 0.01));
				vec3 nxP2 = nxDisplace(normalize(nxN + nxB * 0.01));
				vec3 objectNormal = normalize(cross(nxP1 - nxP0, nxP2 - nxP0));
				`,
			)
			.replace('#include <begin_vertex>', 'vec3 transformed = nxP0;');
	};
	const core = new Mesh(new IcosahedronGeometry(1, high ? 72 : 36), coreMaterial);
	rig.add(core);

	// --- Anéis --------------------------------------------------------------
	const brass = new MeshPhysicalMaterial({
		color: new Color('#c9a46a'),
		metalness: 1,
		roughness: 0.26,
		clearcoat: 0.6,
		clearcoatRoughness: 0.25,
		envMapIntensity: 1.25,
	});
	const brassDim = brass.clone();
	brassDim.color = new Color('#8f7346');
	brassDim.roughness = 0.38;
	const bandMaterial = brass.clone();
	bandMaterial.side = DoubleSide;
	bandMaterial.roughness = 0.32;

	const radial = high ? 24 : 12;
	const tubular = high ? 320 : 180;

	type Ring = {pivot: Group; spin: Group; speed: number; baseScale: number};
	const rings: Ring[] = [];

	const addRing = (
		mesh: Mesh,
		tilt: [number, number, number],
		speed: number,
		bead: boolean,
		radius: number,
	) => {
		const pivot = new Group();
		pivot.rotation.set(...tilt);
		const spin = new Group();
		spin.add(mesh);
		if (bead) {
			const b = new Mesh(new SphereGeometry(0.055, 24, 16), brass);
			b.position.set(radius, 0, 0);
			spin.add(b);
		}
		pivot.add(spin);
		rig.add(pivot);
		rings.push({pivot, spin, speed, baseScale: 1});
	};

	// Banda larga (eclíptica)
	const band = new Mesh(new CylinderGeometry(1.58, 1.58, 0.075, tubular, 1, true), bandMaterial);
	band.rotation.x = Math.PI / 2; // alinha o eixo do cilindro ao eixo de giro (Z)
	addRing(band, [1.28, 0.18, -0.32], 0.06, false, 1.58);
	addRing(new Mesh(new TorusGeometry(1.86, 0.014, radial, tubular), brass), [0.4, 0.9, 0.1], -0.11, true, 1.86);
	addRing(new Mesh(new TorusGeometry(2.12, 0.009, radial, tubular), brassDim), [-0.5, -0.3, 0.8], 0.08, true, 2.12);
	addRing(new Mesh(new TorusGeometry(1.36, 0.011, radial, tubular), brass), [Math.PI / 2, 0, 0.2], 0.16, false, 1.36);

	// --- Poeira -------------------------------------------------------------
	let dust: Points | null = null;
	if (high) {
		const count = 520;
		const positions = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) {
			const r = 2.5 + Math.random() * 2.2;
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
			positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
			positions[i * 3 + 2] = r * Math.cos(phi);
		}
		const g = new BufferGeometry();
		g.setAttribute('position', new BufferAttribute(positions, 3));
		dust = new Points(
			g,
			new PointsMaterial({
				color: new Color('#e9d6b2'),
				size: 0.018,
				transparent: true,
				opacity: 0.55,
				depthWrite: false,
				blending: AdditiveBlending,
			}),
		);
		root.add(dust);
	}

	// --- Layout responsivo ---------------------------------------------------
	const layout = {x: 0, y: 0, scale: 1};
	const resize = () => {
		const w = container.clientWidth || window.innerWidth;
		const h = container.clientHeight || window.innerHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
		const halfW = halfH * camera.aspect;
		if (camera.aspect < 0.95) {
			// Retrato (mobile): peça centralizada na metade superior
			layout.x = 0;
			layout.y = halfH * 0.54;
			layout.scale = Math.min(0.9, (halfW * 0.72) / 2.2);
		} else {
			layout.x = halfW * 0.53;
			layout.y = halfH * 0.08;
			layout.scale = Math.min(1.05, (halfH * 0.76) / 2.2);
		}
		renderOnce();
	};

	// --- Interação -----------------------------------------------------------
	const pointer = {x: 0, y: 0, cx: 0, cy: 0};
	const onPointer = (e: PointerEvent) => {
		if (e.pointerType !== 'mouse') return;
		pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
		pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
	};
	if (!reducedMotion) window.addEventListener('pointermove', onPointer, {passive: true});

	let scroll = 0;
	let scrollSmooth = 0;
	let revealT = reducedMotion ? 1 : 0;
	let revealing = false;

	// --- Loop ---------------------------------------------------------------
	let raf = 0;
	let running = false;
	let visible = true;
	let last = performance.now();
	let elapsed = 0;
	const frameTimes: number[] = [];

	const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

	const update = (dt: number) => {
		elapsed += dt;
		uniforms.uTime.value = elapsed;

		pointer.cx += (pointer.x - pointer.cx) * Math.min(1, dt * 2.6);
		pointer.cy += (pointer.y - pointer.cy) * Math.min(1, dt * 2.6);
		scrollSmooth += (scroll - scrollSmooth) * Math.min(1, dt * 6);

		if (revealing && revealT < 1) revealT = Math.min(1, revealT + dt / 2.2);
		const r = easeOutExpo(revealT);

		root.position.set(layout.x, layout.y + scrollSmooth * 1.1, 0);
		root.scale.setScalar(layout.scale * (0.72 + 0.28 * r) * (1 - scrollSmooth * 0.12));

		rig.rotation.y = elapsed * 0.06 + pointer.cx * 0.45 + (1 - r) * -1.2 + scrollSmooth * 0.9;
		rig.rotation.x = -0.12 + pointer.cy * 0.28 + scrollSmooth * 0.35;
		rig.rotation.z = pointer.cx * -0.06;

		const spread = 1 + scrollSmooth * 0.32 + (1 - r) * 0.5;
		rings.forEach((ring, i) => {
			ring.spin.rotation.z = elapsed * ring.speed * (reducedMotion ? 0 : 1) + i;
			ring.pivot.scale.setScalar(ring.baseScale * (spread + i * 0.02 * scrollSmooth));
		});
		uniforms.uAmp.value = 0.06 + scrollSmooth * 0.05;
		if (dust) dust.rotation.y = elapsed * 0.015;
	};

	const renderOnce = () => {
		if (reducedMotion) update(0);
		renderer.render(scene, camera);
	};

	const tick = (now: number) => {
		raf = requestAnimationFrame(tick);
		const dt = Math.min(0.05, (now - last) / 1000);
		last = now;
		update(dt);
		renderer.render(scene, camera);

		// Ajuste adaptativo: se os primeiros quadros forem lentos, reduz a densidade de pixels
		if (frameTimes.length < 90) {
			frameTimes.push(dt);
			if (frameTimes.length === 90) {
				const avg = frameTimes.slice(20).reduce((a, b) => a + b, 0) / 70;
				if (avg > 1 / 42 && dpr > 1) {
					dpr = 1;
					renderer.setPixelRatio(dpr);
					resize();
				}
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

	const io = new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		if (visible) start();
		else stop();
	});
	io.observe(container);

	const onVisibility = () => (document.hidden ? stop() : start());
	document.addEventListener('visibilitychange', onVisibility);

	const ro = new ResizeObserver(resize);
	ro.observe(container);
	resize();
	start();

	return {
		reveal() {
			revealing = true;
			if (reducedMotion) renderOnce();
		},
		setScroll(progress) {
			scroll = progress;
			if (reducedMotion) {
				scrollSmooth = progress;
				renderOnce();
			}
		},
		destroy() {
			stop();
			io.disconnect();
			ro.disconnect();
			window.removeEventListener('pointermove', onPointer);
			document.removeEventListener('visibilitychange', onVisibility);
			scene.traverse((obj) => {
				const mesh = obj as Mesh;
				mesh.geometry?.dispose();
				const mat = mesh.material;
				if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
				else mat?.dispose();
			});
			envTexture.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		},
	};
}
