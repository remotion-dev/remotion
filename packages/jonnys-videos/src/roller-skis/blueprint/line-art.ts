import {
	BufferGeometry,
	Camera,
	Color,
	DoubleSide,
	InstancedInterleavedBuffer,
	InterleavedBufferAttribute,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	Vector2,
	Vector3,
} from 'three';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';
import {LineSegments2} from 'three/examples/jsm/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/examples/jsm/lines/LineSegmentsGeometry.js';

// Edges between faces bending more than this are always drawn.
const CREASE_COS = Math.cos(0.55);
const COPLANAR_COS = 0.999999;

type EdgeData = {
	readonly count: number;
	// Per edge: endpoints a, b (6 floats) and the normals of both faces (6 floats).
	readonly positions: Float32Array;
	readonly normals: Float32Array;
	readonly crease: Uint8Array;
};

type EdgeModel = {
	readonly mesh: Mesh;
	readonly data: EdgeData;
	readonly geometry: LineSegmentsGeometry;
	readonly buffer: InstancedInterleavedBuffer;
	readonly out: Float32Array;
};

const extractEdges = (geometry: BufferGeometry): EdgeData => {
	const position = geometry.attributes.position;
	const index = geometry.index;
	const vertexCount = position.count;
	const ids = new Int32Array(vertexCount);
	const welded = new Map<string, number>();
	const verts: number[] = [];
	for (let i = 0; i < vertexCount; i++) {
		const x = position.getX(i);
		const y = position.getY(i);
		const z = position.getZ(i);
		const key = `${Math.round(x * 1000)},${Math.round(y * 1000)},${Math.round(z * 1000)}`;
		let id = welded.get(key);
		if (id === undefined) {
			id = verts.length / 3;
			welded.set(key, id);
			verts.push(x, y, z);
		}
		ids[i] = id;
	}

	const unique = verts.length / 3;
	const edgeIndex = new Map<number, number>();
	const ends: number[] = [];
	const normals: number[] = [];
	const faces: number[] = [];
	const triangles = (index ? index.count : vertexCount) / 3;
	for (let t = 0; t < triangles; t++) {
		const tri = [0, 1, 2].map(
			(j) => ids[index ? index.getX(t * 3 + j) : t * 3 + j],
		);
		const [a, b, c] = tri;
		const ux = verts[b * 3] - verts[a * 3];
		const uy = verts[b * 3 + 1] - verts[a * 3 + 1];
		const uz = verts[b * 3 + 2] - verts[a * 3 + 2];
		const vx = verts[c * 3] - verts[a * 3];
		const vy = verts[c * 3 + 1] - verts[a * 3 + 1];
		const vz = verts[c * 3 + 2] - verts[a * 3 + 2];
		let nx = uy * vz - uz * vy;
		let ny = uz * vx - ux * vz;
		let nz = ux * vy - uy * vx;
		const length = Math.hypot(nx, ny, nz);
		if (length < 1e-9) continue;
		nx /= length;
		ny /= length;
		nz /= length;
		for (let j = 0; j < 3; j++) {
			const p = tri[j];
			const q = tri[(j + 1) % 3];
			if (p === q) continue;
			const key = Math.min(p, q) * unique + Math.max(p, q);
			const existing = edgeIndex.get(key);
			if (existing === undefined) {
				edgeIndex.set(key, faces.length);
				ends.push(p, q);
				normals.push(nx, ny, nz, nx, ny, nz);
				faces.push(1);
			} else {
				if (faces[existing] === 1) {
					normals[existing * 6 + 3] = nx;
					normals[existing * 6 + 4] = ny;
					normals[existing * 6 + 5] = nz;
				}
				faces[existing]++;
			}
		}
	}

	const keep: number[] = [];
	for (let e = 0; e < faces.length; e++) {
		const dot =
			normals[e * 6] * normals[e * 6 + 3] +
			normals[e * 6 + 1] * normals[e * 6 + 4] +
			normals[e * 6 + 2] * normals[e * 6 + 5];
		if (faces[e] !== 2 || dot < COPLANAR_COS) keep.push(e);
	}
	const count = keep.length;
	const outPositions = new Float32Array(count * 6);
	const outNormals = new Float32Array(count * 6);
	const crease = new Uint8Array(count);
	keep.forEach((e, k) => {
		const p = ends[e * 2];
		const q = ends[e * 2 + 1];
		outPositions.set(
			[
				verts[p * 3],
				verts[p * 3 + 1],
				verts[p * 3 + 2],
				verts[q * 3],
				verts[q * 3 + 1],
				verts[q * 3 + 2],
			],
			k * 6,
		);
		outNormals.set(normals.slice(e * 6, e * 6 + 6), k * 6);
		const dot =
			normals[e * 6] * normals[e * 6 + 3] +
			normals[e * 6 + 1] * normals[e * 6 + 4] +
			normals[e * 6 + 2] * normals[e * 6 + 5];
		crease[k] = faces[e] !== 2 || dot < CREASE_COS ? 1 : 0;
	});
	return {count, positions: outPositions, normals: outNormals, crease};
};

const isShown = (object: Object3D) => {
	let current: Object3D | null = object;
	while (current) {
		if (!current.visible) return false;
		current = current.parent;
	}
	return true;
};

/**
 * Hidden-line drawing kit. Every mesh is a white, depth-writing occluder; its
 * lines are the crease edges plus whichever edges sit on the silhouette from
 * the current viewpoint, so perspective, occlusion and parallax always come
 * from the geometry itself.
 */
export class LineArt {
	readonly faces = new MeshBasicMaterial({
		color: 0xffffff,
		side: DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});

	readonly lines: LineMaterial;

	private readonly models: EdgeModel[] = [];
	private readonly cache = new WeakMap<BufferGeometry, EdgeData>();
	private readonly inverse = new Matrix4();
	private readonly cameraPosition = new Vector3();
	private readonly cameraDirection = new Vector3();
	private readonly local = new Vector3();

	constructor(width: number, height: number) {
		this.lines = new LineMaterial({
			color: 0x1f4fd8,
			linewidth: 1.6,
			worldUnits: false,
			resolution: new Vector2(width, height),
		});
		this.lines.side = DoubleSide;
	}

	setStyle(color: string, width: number, occluderColor = '#FFFFFF') {
		this.lines.color = new Color(color);
		this.lines.linewidth = width;
		this.faces.color = new Color(occluderColor);
	}

	add(
		parent: Object3D,
		geometry: BufferGeometry,
		name: string,
		x = 0,
		y = 0,
		z = 0,
	) {
		const mesh = new Mesh(geometry, this.faces);
		mesh.name = name;
		mesh.position.set(x, y, z);
		parent.add(mesh);

		let data = this.cache.get(geometry);
		if (!data) {
			data = extractEdges(geometry);
			this.cache.set(geometry, data);
		}
		const out = new Float32Array(Math.max(6, data.count * 6));
		const lineGeometry = new LineSegmentsGeometry();
		lineGeometry.setPositions(out);
		lineGeometry.instanceCount = 0;
		const buffer = (
			lineGeometry.attributes.instanceStart as InterleavedBufferAttribute
		).data as InstancedInterleavedBuffer;
		const line = new LineSegments2(lineGeometry, this.lines);
		line.frustumCulled = false;
		line.renderOrder = 2;
		mesh.add(line);
		this.models.push({mesh, data, geometry: lineGeometry, buffer, out});
		return mesh;
	}

	/** Re-pick the silhouette edges of every visible mesh for `camera`. */
	update(camera: Camera) {
		camera.updateMatrixWorld();
		this.cameraPosition.setFromMatrixPosition(camera.matrixWorld);
		camera.getWorldDirection(this.cameraDirection);
		const ortho =
			(camera as {isOrthographicCamera?: boolean}).isOrthographicCamera ===
			true;

		for (const model of this.models) {
			if (!isShown(model.mesh)) continue;
			this.inverse.copy(model.mesh.matrixWorld).invert();
			let vx: number;
			let vy: number;
			let vz: number;
			if (ortho) {
				this.local
					.copy(this.cameraDirection)
					.transformDirection(this.inverse)
					.negate();
			} else {
				this.local.copy(this.cameraPosition).applyMatrix4(this.inverse);
			}
			const {count, positions, normals, crease} = model.data;
			const out = model.out;
			let k = 0;
			for (let e = 0; e < count; e++) {
				const o = e * 6;
				let show = crease[e] === 1;
				if (!show) {
					if (ortho) {
						vx = this.local.x;
						vy = this.local.y;
						vz = this.local.z;
					} else {
						vx = this.local.x - positions[o];
						vy = this.local.y - positions[o + 1];
						vz = this.local.z - positions[o + 2];
					}
					const s0 =
						normals[o] * vx + normals[o + 1] * vy + normals[o + 2] * vz;
					const s1 =
						normals[o + 3] * vx + normals[o + 4] * vy + normals[o + 5] * vz;
					show = s0 >= 0 !== s1 >= 0;
				}
				if (show) {
					out[k] = positions[o];
					out[k + 1] = positions[o + 1];
					out[k + 2] = positions[o + 2];
					out[k + 3] = positions[o + 3];
					out[k + 4] = positions[o + 4];
					out[k + 5] = positions[o + 5];
					k += 6;
				}
			}
			model.buffer.clearUpdateRanges();
			model.buffer.addUpdateRange(0, Math.max(6, k));
			model.buffer.needsUpdate = true;
			model.geometry.instanceCount = k / 6;
		}
	}

	dispose() {
		const geometries = new Set<BufferGeometry>();
		for (const model of this.models) {
			geometries.add(model.mesh.geometry);
			model.geometry.dispose();
		}
		geometries.forEach((g) => g.dispose());
		this.faces.dispose();
		this.lines.dispose();
	}
}
