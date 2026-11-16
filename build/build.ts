/**
 * Makes the dataset (../columns.json, ../rows.jsonl) from the curves (curves.ts), and writes checks.txt.
 *
 *     npx tsx build.ts <a checkout of the Knack app>      (default ../../knack)
 *
 * Every equation is read, drawn and compared by the app's own code (src/lib/engine/plane), so what is checked here is
 * what the app will show. derive.py (sympy) gives each function's derivative, asymptotes, period and ends; every one
 * of those, and every fact worked out here, is checked numerically before it is written. A fact that fails its check
 * stops the build.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURVES, type By, type Def } from './curves';

const here = dirname(fileURLToPath(import.meta.url));
const top = resolve(here, '..');
const app = resolve(process.argv[2] ?? join(top, '..', 'knack'));
const plane = join(app, 'src/lib/engine/plane');
const { parse, letters } = await import(join(plane, 'parse.ts'));
const { compile, figureOf, drawingOf } = await import(join(plane, 'figure.ts'));
const { shapeOf, sameValue, apart } = await import(join(plane, 'shape.ts'));
type Node = import('../../knack/src/lib/engine/plane/parse').Node;
type Win = { x: [number, number]; y: [number, number]; t: [number, number] };

/** the window every graph of the dataset is drawn in */
const LO = -5, HI = 5;
const WIN: Win = { x: [LO, HI], y: [LO, HI], t: [0, 2 * Math.PI] };
const WINDOW = { x: [LO, HI], y: [LO, HI] };

const notes: string[] = [];
const failures: string[] = [];
const note = (s: string) => notes.push(s);
const fail = (id: string, s: string) => failures.push(`${id}: ${s}`);

// ---------- reading ----------

function read(src: string): Node[] {
	const p = parse(src);
	if (!p.ok) throw new Error(`can't read ${src}: ${p.message}`);
	return p.value.statements;
}

/** y = f(x) written so: the f */
function explicitF(st: Node[]): Node | null {
	if (st.length !== 1) return null;
	const s = st[0];
	if (s.k !== 'rel' || s.ops.length !== 1 || s.ops[0] !== '=') return null;
	const [l, r] = s.items;
	if (l.k === 'var' && l.v === 'y' && [...letters(r)].every((v: string) => v === 'x')) return r;
	return null;
}
/** an equation in x and y only (no r, θ, t): F = left - right */
function implicitF(st: Node[]): Node | null {
	if (st.length !== 1) return null;
	const s = st[0];
	if (s.k !== 'rel' || s.ops.length !== 1 || s.ops[0] !== '=') return null;
	if (![...letters(s)].every((v: string) => v === 'x' || v === 'y')) return null;
	return { k: 'sub', a: s.items[0], b: s.items[1] } as Node;
}

const fnOf = (n: Node) => { const g = compile(n, true), e = new Float64Array(3); return (x: number) => { e[0] = x; return g(e); }; };
const fn2Of = (n: Node) => { const g = compile(n, true), e = new Float64Array(3); return (x: number, y: number) => { e[0] = x; e[1] = y; return g(e); }; };

/** the app's tree as sympy */
function sympy(n: Node): string {
	const S = sympy;
	switch (n.k) {
		case 'num': return `Rational('${n.s}')`;
		case 'var': return n.v;
		case 'const': return n.v === 'π' ? 'pi' : 'E';
		case 'neg': return `(-(${S(n.a)}))`;
		case 'add': return `(${S(n.a)} + ${S(n.b)})`;
		case 'sub': return `(${S(n.a)} - ${S(n.b)})`;
		case 'mul': return `(${S(n.a)} * ${S(n.b)})`;
		case 'div': return `(${S(n.a)} / ${S(n.b)})`;
		case 'pow': return `(${S(n.a)})**(${S(n.b)})`;
		case 'group': return `(${S(n.a)})`;
		case 'abs': return `Abs(${S(n.a)})`;
		// an odd root of a negative number is real, as the app reads it
		case 'sqrt': return n.n ? `(sign(${S(n.a)})*Abs(${S(n.a)})**(1/(${S(n.n)})))` : `sqrt(${S(n.a)})`;
		case 'fn': {
			const name = ({ arcsin: 'asin', arccos: 'acos', arctan: 'atan', ln: 'log', sgn: 'sign', ceil: 'ceiling' } as Record<string, string>)[n.f] ?? n.f;
			let s = n.f === 'log' ? `log(${S(n.a)}, ${n.base ? S(n.base) : 10})` : `${name}(${S(n.a)})`;
			if (n.pow) s = `(${s})**(${S(n.pow)})`;
			return s;
		}
	}
	throw new Error(`no sympy for ${n.k}`);
}

// ---------- numbers ----------

const near = (a: number, b: number, tol = 1e-7) => Math.abs(a - b) <= tol * (1 + Math.abs(a) + Math.abs(b));

/** the distinct real x where f is 0, on [-L, L]: crossings found by a change of sign (not across a jump), touchings
 * by |f| coming down to 0 */
function roots(f: (x: number) => number, L: number): number[] {
	const n = Math.round(L * 1000), out: number[] = [];
	const at = (i: number) => i / 1000;
	const V = Float64Array.from({ length: 2 * n + 1 }, (_, k) => f(at(k - n)));
	const v = (i: number) => V[i + n];
	/** all but 0: tiny beside what f is nearby (x⁵ at 0.001 is not; sin πx at 1, 1e-16, is; e^{-x²} far out is not) */
	const zero = (i: number) => {
		const a = Math.abs(v(i));
		if (!Number.isFinite(a)) return false;
		let m = 0;
		for (let k = Math.max(-n, i - 50); k <= Math.min(n, i + 50); k++) if (Number.isFinite(V[k + n])) m = Math.max(m, Math.abs(V[k + n]));
		// where f has underflowed to nothing (e^{-x²} far out) nothing is a root
		return m > 1e-200 && (a === 0 || a < 1e-12 * m);
	};
	let run: number[] = [];
	// a run of such points is one root, at the smallest
	const endRun = () => { if (run.length) { let b = run[0]; for (const x of run) if (Math.abs(f(x)) < Math.abs(f(b))) b = x; out.push(b); run = []; } };
	for (let i = -n + 1; i <= n; i++) {
		if (zero(i)) { run.push(at(i)); continue; }
		endRun();
		const p = v(i - 1), c = v(i);
		if (zero(i - 1) || !Number.isFinite(p) || !Number.isFinite(c) || p === 0 || c === 0 || Math.sign(p) === Math.sign(c) || Math.max(Math.abs(p), Math.abs(c)) < 1e-200) continue;
		let a = at(i - 1), b = at(i), fa = p;
		for (let k = 0; k < 60; k++) { const m = (a + b) / 2, fm = f(m); if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm; } else b = m; }
		const m = (a + b) / 2;
		// a crossing, not a pole: f is small there, beside what it is nearby
		if (Math.abs(f(m)) < 1e-6 * Math.max(1e-300, Math.abs(p), Math.abs(c))) out.push(m);
	}
	endRun();
	// touching: a local minimum of |f| that comes down to 0
	for (let i = -n + 1; i < n; i++) {
		const a = Math.abs(v(i - 1)), b = Math.abs(v(i)), c = Math.abs(v(i + 1));
		if (!(b <= a && b <= c && b < 1e-3 * Math.max(a, c) + 1e-3 && Math.max(a, c) > 1e-200 && !zero(i))) continue;
		if (Math.sign(v(i - 1)) !== Math.sign(v(i + 1))) continue;
		let lo = at(i - 1), hi = at(i + 1);
		for (let k = 0; k < 100; k++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (Math.abs(f(m1)) < Math.abs(f(m2))) hi = m2; else lo = m1; }
		const m = (lo + hi) / 2;
		if (Math.abs(f(m)) < 1e-9 * Math.max(1e-300, a, c) && Math.abs(f(m)) < 1e-9) out.push(m);
	}
	out.sort((a, b) => a - b);
	return out.filter((x, k) => k === 0 || x - out[k - 1] > 1e-5);
}

/** where f turns (a local maximum or minimum, a corner too), on [-L, L], as [x, y] */
function turns(f: (x: number) => number, L: number): [number, number][] {
	const n = Math.round(L * 1000), out: [number, number][] = [];
	const at = (i: number) => i / 1000;
	let a = f(at(-n)), b = f(at(-n + 1));
	for (let i = -n + 1; i < n; i++) {
		const c = f(at(i + 1));
		if ([a, b, c].every(Number.isFinite) && Math.abs(b - a) < 0.5 && Math.abs(c - b) < 0.5) {
			const up = b - a, down = c - b;
			if ((up > 0 && down < 0) || (up < 0 && down > 0) || (up !== 0 && down === 0 && turnsAfter(f, i, up))) {
				out.push([at(i), b]);
			}
		}
		a = b; b = c;
	}
	return out.filter((p, k) => k === 0 || p[0] - out[k - 1][0] > 1e-2);
}
/** a level stretch after a rise or fall: a turn if what follows goes back the other way */
function turnsAfter(f: (x: number) => number, i: number, before: number) {
	for (let j = i + 1; j < i + 50000; j++) {
		const d = f((j + 1) / 1000) - f(j / 1000);
		if (!Number.isFinite(d)) return false;
		if (d !== 0) return Math.sign(d) !== Math.sign(before);
	}
	return false;
}

// ---------- symmetry ----------

function functionSymmetry(f: (x: number) => number): string[] {
	let pairs = 0, even = true, odd = true;
	for (let k = 1; k <= 4000; k++) {
		const x = k / 200 + 0.000123, a = f(x), b = f(-x);
		if (Number.isFinite(a) !== Number.isFinite(b)) return ['neither even nor odd'];
		if (!Number.isFinite(a)) continue;
		pairs++;
		if (!near(a, b, 1e-9)) even = false;
		if (!near(a, -b, 1e-9)) odd = false;
	}
	if (pairs < 100) return ['neither even nor odd'];
	return even ? ['even'] : odd ? ['odd'] : ['neither even nor odd'];
}

/** what a drawn curve is symmetric about, from its points in the window (which is symmetric itself) */
function curveSymmetry(src: string): string[] {
	const s = shapeOf(src, WIN)!;
	const pts = s.dense, tol = 1 / 150;
	const cell = tol, grid = new Map<string, number[]>();
	for (let k = 0; k < pts.length; k += 2) {
		const key = `${Math.floor(pts[k] / cell)},${Math.floor(pts[k + 1] / cell)}`;
		(grid.get(key) ?? grid.set(key, []).get(key)!).push(k);
	}
	const on = (u: number, v: number) => {
		const i = Math.floor(u / cell), j = Math.floor(v / cell);
		for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) for (const k of grid.get(`${i + di},${j + dj}`) ?? []) if (Math.hypot(pts[k] - u, pts[k + 1] - v) <= tol) return true;
		return false;
	};
	const test = (m: (u: number, v: number) => [number, number]) => {
		for (let k = 0; k < pts.length; k += 2 * 7) { const [u, v] = m(pts[k], pts[k + 1]); if (!on(u, v)) return false; }
		return true;
	};
	const out: string[] = [];
	if (test((u, v) => [1 - u, v])) out.push('mirror in the y-axis');
	if (test((u, v) => [u, 1 - v])) out.push('mirror in the x-axis');
	if (test((u, v) => [1 - u, 1 - v])) out.push('half-turn about the origin');
	if (test((u, v) => [v, u])) out.push('mirror in y = x');
	return out.length ? out : ['no symmetry'];
}

// ---------- how a row is its parent moved ----------

function movedWords(by: By, curve: boolean): string[] {
	const sx = curve ? by.sx ?? 1 : 1 / (by.b ?? 1), sy = curve ? by.sy ?? 1 : by.a ?? 1, h = by.h ?? 0, k = by.k ?? 0;
	const one = (v: number) => Math.abs(Math.abs(v) - 1) < 1e-9;
	const out: string[] = [];
	if (sy < 0) out.push('reflected in the x-axis');
	if (sx < 0) out.push('reflected in the y-axis');
	if (!one(sx) && Math.abs(Math.abs(sx) - Math.abs(sy)) < 1e-9) out.push(Math.abs(sx) > 1 ? 'enlarged' : 'shrunk');
	else {
		if (!one(sy)) out.push(Math.abs(sy) > 1 ? 'stretched vertically' : 'squashed vertically');
		if (!one(sx)) out.push(Math.abs(sx) > 1 ? 'stretched horizontally' : 'squashed horizontally');
	}
	if (h > 1e-12) out.push('shifted right');
	if (h < -1e-12) out.push('shifted left');
	if (k > 1e-12) out.push('shifted up');
	if (k < -1e-12) out.push('shifted down');
	return out.length ? out : ['nothing: the parent itself'];
}

/** check that the row is its parent moved as `by` says */
function checkMoved(d: Def, parent: Def, f: ((x: number) => number) | null, pf: ((x: number) => number) | null) {
	const by = d.by ?? {};
	if (f && pf) {
		const a = by.a ?? 1, b = by.b ?? 1, h = by.h ?? 0, k = by.k ?? 0;
		let n = 0;
		for (let i = 0; i <= 2000; i++) {
			const x = LO + ((HI - LO) * i) / 2000 + 1e-4, v = f(x), w = a * pf(b * (x - h)) + k;
			if (!Number.isFinite(v) || !Number.isFinite(w)) { if (Number.isFinite(v) !== Number.isFinite(w) && Math.abs(v) < 1e6 && Math.abs(w) < 1e6) return fail(d.id, `defined where ${parent.id} moved is not, at x = ${x}`); continue; }
			n++;
			if (!near(v, w, 1e-7)) return fail(d.id, `is not ${parent.id} moved by ${JSON.stringify(by)}: at x = ${x.toFixed(3)} it is ${v}, not ${w}`);
		}
		if (n < 200) fail(d.id, `too few points to compare with ${parent.id}`);
		return;
	}
	// a curve: every point of the parent, moved, is on the row's curve, and every point of the row, moved back, on the parent's
	const sx = by.sx ?? 1, sy = by.sy ?? 1, h = by.h ?? 0, k = by.k ?? 0;
	const big: Win = { x: [-40, 40], y: [-40, 40], t: WIN.t };
	const there = (src: string, w: Win) => { const dr = drawingOf(src, w)!; const p: number[] = []; for (const l of dr.lines) for (let i = 0; i < l.pts.length; i += 2) p.push(l.pts[i], l.pts[i + 1]); return p; };
	const dist = (p: number[], x: number, y: number) => { let m = Infinity; for (let i = 0; i < p.length; i += 2) m = Math.min(m, Math.hypot(p[i] - x, p[i + 1] - y)); return m; };
	const mine = there(d.eq, WIN), theirs = there(parent.eq, big);
	let worst = 0;
	for (let i = 0; i < theirs.length; i += 2 * 5) {
		const x = sx * theirs[i] + h, y = sy * theirs[i + 1] + k;
		if (x > LO + 0.1 && x < HI - 0.1 && y > LO + 0.1 && y < HI - 0.1) worst = Math.max(worst, dist(mine, x, y));
	}
	for (let i = 0; i < mine.length; i += 2 * 5) worst = Math.max(worst, dist(theirs, (mine[i] - h) / sx, (mine[i + 1] - k) / sy) * Math.max(Math.abs(sx), Math.abs(sy)));
	if (worst > 0.08) fail(d.id, `is not ${parent.id} moved by ${JSON.stringify(by)} (points ${worst.toFixed(3)} apart)`);
}

// ---------- a curve's asymptotes, checked far out ----------

function checkCurveAsymptote(d: Def, line: string) {
	const F = implicitF(read(d.eq));
	const st = read(line)[0] as Extract<Node, { k: 'rel' }>;
	const g = fnOf(st.items[1]);
	if (F) {
		// along the line far out, the curve is within a little of it: F changes sign across a short segment across the line
		const Ff = fn2Of(F);
		for (const X of [200, -200, 2000, -2000]) {
			const y0 = g(X), m = (g(X + 1) - g(X - 1)) / 2, nx = -m / Math.hypot(1, m), ny = 1 / Math.hypot(1, m);
			const w = 0.05;
			const a = Ff(X - w * nx, y0 - w * ny), b = Ff(X + w * nx, y0 + w * ny);
			if (Math.sign(a) !== Math.sign(b)) return;
		}
		return fail(d.id, `${line} is not an asymptote: the curve is not near it far out`);
	}
	// a polar or parametric curve: its points far out are near the line
	const big: Win = { x: [-1e4, 1e4], y: [-1e4, 1e4], t: WIN.t };
	const fig = figureOf(d.eq, big);
	if (!fig.ok || fig.figure.kind !== 'curve') return fail(d.id, `can't trace it to check ${line}`);
	const out = new Float64Array(2), [lo, hi] = fig.figure.range;
	let best = Infinity;
	for (const u of [lo + 1e-6, lo + 1e-4, lo + 1e-3, hi - 1e-6]) { fig.figure.at(u, out); if (Math.hypot(out[0], out[1]) > 30) best = Math.min(best, Math.abs(out[1] - g(out[0]))); }
	// the hyperbolic spiral's ends: take θ to 0 by extending the range below what is drawn
	const e = new Float64Array(3), rhs = compile((read(d.eq)[0] as Extract<Node, { k: 'rel' }>).items[1], false);
	for (const th of [1e-3, 1e-4]) { e[2] = th; const r = rhs(e); const x = r * Math.cos(th), y = r * Math.sin(th); best = Math.min(best, Math.abs(y - g(x))); }
	if (!(best < 0.01)) fail(d.id, `${line} is not an asymptote (${best} away far out)`);
}

// ---------- derive.py ----------

interface Derived { constant: boolean; dCandidates: string[]; period: string | null; periodValue: number | null; vertical: string[] | null; left: string | null; right: string | null; ends: [string, string]; explicit: string | null }

function derive(rows: { id: string; f?: string; F?: string }[]): Record<string, Derived> {
	mkdirSync(join(here, '.work'), { recursive: true });
	const i = join(here, '.work/derive-in.json'), o = join(here, '.work/derive-out.json');
	writeFileSync(i, JSON.stringify(rows));
	execFileSync('python3', [join(here, 'derive.py'), i, o], { stdio: ['ignore', 'inherit', 'inherit'] });
	return JSON.parse(readFileSync(o, 'utf8'));
}

// ---------- the rows ----------

const byId = new Map(CURVES.map((d) => [d.id, d]));
if (byId.size !== CURVES.length) throw new Error('two curves have one id');

interface Kind { f: Node | null; F: Node | null; st: Node[] }
const kinds = new Map<string, Kind>();
for (const d of CURVES) {
	const st = read(d.eq);
	const r = figureOf(d.eq, WIN);
	if (!r.ok) { fail(d.id, `the app can't draw it: ${r.message}`); continue; }
	const dr = drawingOf(d.eq, WIN);
	if (!dr || dr.empty) fail(d.id, 'draws nothing in the window');
	kinds.set(d.id, { st, f: explicitF(st), F: explicitF(st) ? null : implicitF(st) });
	if (d.parent && !byId.has(d.parent)) fail(d.id, `no parent ${d.parent}`);
}

const derived = derive(CURVES.filter((d) => kinds.get(d.id)?.f || kinds.get(d.id)?.F).map((d) => {
	const k = kinds.get(d.id)!;
	return k.f ? { id: d.id, f: sympy(k.f) } : { id: d.id, F: sympy(k.F!) };
}));

type Row = Record<string, unknown>;
const rows: Row[] = [];
const functions = new Map<string, (x: number) => number>();

for (const d of CURVES) {
	const k = kinds.get(d.id);
	if (!k) continue;
	const D = derived[d.id];
	let f: ((x: number) => number) | null = null;
	if (k.f) f = fnOf(k.f);
	else if (D?.explicit) {
		// an equation in x and y that is y as one function of x: check that function solves it
		const g = fnOf(explicitF(read(D.explicit))!), Ff = fn2Of(k.F!);
		for (let x = -4.93; x < 5; x += 0.37) { const y = g(x); if (Number.isFinite(y) && Math.abs(Ff(x, y)) > 1e-9) fail(d.id, `${D.explicit} doesn't solve it at x = ${x}`); }
		f = g;
	}
	if (f) functions.set(d.id, f);

	const row: Row = { id: d.id };
	if (d.name) row.name = d.name;
	row.equation = d.eq;
	row.graph = d.eq;
	row.family = d.family;
	row['general form'] = d.form;
	if (d.parent) {
		row.parent = byId.get(d.parent)!.eq;
		row['made from its parent by'] = movedWords(d.by ?? {}, !f);
	}

	if (f && D) {
		// ---- the derivative: sympy's shortest writing (or the one given) that the app reads as the slope of f ----
		const h = 1e-5;
		const slope = (x: number) => (f!(x + h) - f!(x - h)) / (2 * h);
		const fits = (tex: string) => {
			const p = parse(tex);
			if (!p.ok) return false;
			const g = explicitF(p.value.statements);
			if (!g) return false;
			const gd = fnOf(g);
			let n = 0;
			for (let i = 0; i <= 997; i++) {
				const x = LO + ((HI - LO) * i) / 997 + 1e-3, s = slope(x), v = gd(x);
				if (!Number.isFinite(s) || Math.abs(s) > 1e3 || Math.abs(f!(x + 2 * h) - 2 * f!(x) + f!(x - 2 * h)) > 1e-4) continue;
				if (!Number.isFinite(v)) return false;
				n++;
				if (Math.abs(v - s) > 1e-4 * (1 + Math.abs(s))) return false;
			}
			return n > 100;
		};
		const cands = [...(d.d ? [d.d] : []), ...D.dCandidates.map((c) => 'y = ' + c)];
		const dTex = cands.find(fits);
		if (!dTex) fail(d.id, `no derivative fits: ${cands.join(' | ')}`);
		else {
			row.derivative = dTex;
			row['derivative graph'] = dTex;
		}

		// ---- roots and turning points: counted numerically; "infinitely many" when they go on past any bound ----
		const r30 = roots(f, 30), r60 = roots(f, 60);
		const nRoots = r60.length > r30.length ? Infinity : r60.length;
		row.roots = count(nRoots, 'root');
		if (Number.isFinite(nRoots) && r60.some((x) => x < LO + 0.1 || x > HI - 0.1)) note(`${d.id}: a root outside the window, at ${r60.find((x) => x < LO + 0.1 || x > HI - 0.1)!.toFixed(3)}`);
		const t30 = turns(f, 30), t60 = turns(f, 60);
		const nTurns = t60.length > t30.length ? Infinity : t60.length;
		row['turning points'] = count(nTurns, 'turning point');
		if (Number.isFinite(nTurns)) for (const [x, y] of t60) if (x < LO || x > HI || y < LO || y > HI) note(`${d.id}: a turning point outside the window, at (${x.toFixed(2)}, ${y.toFixed(2)})`);

		// ---- asymptotes: sympy's, each checked ----
		const asym: string[] = [];
		if (D.vertical == null) fail(d.id, 'sympy could not find where it is undefined');
		for (const v of D.vertical ?? []) {
			const blows = (x0: number) => [-1, 1].some((s) => {
				// |f| grows without bound as x comes to x0 from one side (a logarithm's slowly)
				const v = [1e-4, 1e-8, 1e-16, 1e-100, 1e-300].map((e) => Math.abs(f!(x0 + s * Math.max(e, Math.abs(x0) * 1e-16))));
				return v.every((a, i) => i === 0 || a >= v[i - 1] || Number.isNaN(a)) && v.filter((a) => !Number.isNaN(a)).some((a) => a > 30);
			});
			if (v.includes('n')) {
				// x = a + nP: check a few of them
				const at = (n: number) => fnOf(explicitFx(v.replace(/n/g, `(${n})`)))(0);
				if (![-2, -1, 0, 1, 2].every((n) => blows(at(n)))) fail(d.id, `${v} are not all vertical asymptotes`);
				asym.push(v);
				continue;
			}
			const x0 = fnOf(explicitFx(v))(0);
			// sympy also gives where f is 0/0 (sin x / x at 0): not an asymptote
			if (!blows(x0)) { note(`${d.id}: undefined at ${v} but no asymptote there (a single missing point)`); continue; }
			if (x0 < LO || x0 > HI) note(`${d.id}: asymptote ${v} outside the window`);
			asym.push(v);
		}
		for (const [side, line] of [[-1, D.left], [1, D.right]] as const) {
			if (!line) continue;
			const g = fnOf(explicitF(read(line))!);
			const gap = (x: number) => Math.abs(f!(x) - g(x));
			if (!(gap(side * 1e3) < 1e-2 && gap(side * 1e4) <= gap(side * 1e3) + 1e-12)) fail(d.id, `${line} is not approached on the ${side < 0 ? 'left' : 'right'}`);
			if (!asym.includes(line)) asym.push(line);
		}
		row.asymptotes = asym.length ? asym.map(plain) : ['no asymptotes'];

		// ---- symmetry, ends, period, y-intercept ----
		row.symmetry = functionSymmetry(f);
		const [l, r] = D.ends;
		checkEnd(d.id, f, -1, l);
		checkEnd(d.id, f, 1, r);
		row['far left, far right'] = `left: ${l}, right: ${r}`;
		if (D.period) {
			const P = D.periodValue!;
			const repeats = (p: number) => { for (let i = 0; i < 400; i++) { const x = -7.3 + i * 0.0371, a = f!(x), b = f!(x + p); if (Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) < 1e3 && !near(a, b, 1e-7)) return false; } return true; };
			if (!repeats(P)) fail(d.id, `doesn't repeat every ${D.period}`);
			for (const q of [2, 3, 4, 5, 6]) if (repeats(P / q)) fail(d.id, `repeats every ${D.period}/${q}, not just ${D.period}`);
			row['repeats every'] = `repeats every ${plain(D.period)}`;
		} else if (!D.constant) {
			for (const p of [Math.PI, 2 * Math.PI, 1, 2, 4]) { let same = true; for (let i = 0; i < 200; i++) { const x = -3.1 + i * 0.031; if (!near(f(x), f(x + p), 1e-9)) { same = false; break; } } if (same) fail(d.id, `sympy found no period, but it repeats every ${p}`); }
			row['repeats every'] = 'never repeats';
		}
		const y0 = f(0);
		if (Number.isFinite(y0)) row['meets the y-axis at'] = +y0.toPrecision(4);
	} else {
		// ---- a curve that is not y as one function of x ----
		row.symmetry = curveSymmetry(d.eq);
		for (const a of d.asymptotes ?? []) checkCurveAsymptote(d, a);
		row.asymptotes = d.asymptotes?.length ? d.asymptotes.map(plain) : ['no asymptotes'];
	}
	rows.push(row);
}

function explicitFx(v: string): Node {
	// "x = 2": the 2, as a function of nothing
	const s = read(v)[0] as Extract<Node, { k: 'rel' }>;
	return s.items[1];
}
/** a little TeX as plain text, for columns of words the app doesn't typeset (a list of tags): π/2, −3x/2 */
function plain(tex: string): string {
	let s = tex.replace(/\\text\{([^}]*)\}/g, '$1');
	s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}([a-z]*)/g, (_, a, b, l) => `${a}${l}/${b}`);
	return s.replace(/\\pi/g, 'π').replace(/-/g, '−').replace(/\s+/g, ' ').replace(/ *\/ */g, '/').replace(/([0-9n]) π/g, '$1π').trim();
}
/** a count that says what it counts, so it reads alone: "no roots", "1 root", "infinitely many roots" */
function count(n: number, what: string) { return n === Infinity ? `infinitely many ${what}s` : n === 0 ? `no ${what}s` : n === 1 ? `1 ${what}` : `${n} ${what}s`; }

function checkEnd(id: string, f: (x: number) => number, side: number, what: string) {
	const at = (x: number) => f(side * x);
	const sample = (a: number, b: number) => { const v: number[] = []; for (let i = 0; i <= 2000; i++) v.push(at(a + ((b - a) * i) / 2000)); return v; };
	const ok = (() => {
		switch (what) {
			case 'stops': return [100, 1e3, 1e4].every((x) => Number.isNaN(at(x)));
			case 'repeats': return true; // checked with the period
			case 'up': return at(1e2) < at(1e3) && at(1e3) <= at(1e6) && at(1e6) <= at(1e12) && at(1e12) > 10;
			case 'down': return at(1e2) > at(1e3) && at(1e3) >= at(1e6) && at(1e6) >= at(1e12) && at(1e12) < -10;
			case 'levels off': return Math.abs(at(1e3) - at(1e4)) < 1e-2 && Math.abs(at(1e4) - at(1e5)) < 1e-3;
			case 'waves': { const v = sample(400, 500); return Math.max(...v.map(Math.abs)) < 50 && Math.max(...v) - Math.min(...v) > 0.1; }
			case 'growing waves': { const a = sample(40, 50), b = sample(400, 500); return Math.max(...b) > 3 * Math.max(...a) && Math.min(...b) < 3 * Math.min(...a); }
		}
		return false;
	})();
	if (!ok) fail(id, `does not "${what}" on the ${side < 0 ? 'left' : 'right'}`);
}

// ---------- the curves against each other, as the app compares them ----------

const shapes = rows.map((r) => shapeOf(r.equation as string, WIN));
const dense = shapes.map((s) => s!.dense);
/** how far the furthest point of one is from the other (in the window's units, its longer side 1) */
function furthest(a: Float32Array, b: Float32Array) {
	const cell = 0.02, grid = new Map<string, number[]>();
	for (let k = 0; k < b.length; k += 2) { const key = `${Math.floor(b[k] / cell)},${Math.floor(b[k + 1] / cell)}`; (grid.get(key) ?? grid.set(key, []).get(key)!).push(k); }
	let worst = 0;
	for (let k = 0; k < a.length; k += 2 * 3) {
		const i = Math.floor(a[k] / cell), j = Math.floor(a[k + 1] / cell);
		let m = Infinity;
		for (let r = 0; r < 60 && m > (r - 1) * cell; r++) {
			for (let di = -r; di <= r; di++) for (let dj = -r; dj <= r; dj++) {
				if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
				for (const q of grid.get(`${i + di},${j + dj}`) ?? []) m = Math.min(m, Math.hypot(b[q] - a[k], b[q + 1] - a[k + 1]));
			}
		}
		worst = Math.max(worst, m);
		if (worst > 0.2) return worst;
	}
	return worst;
}
const neighbours: string[] = [];
for (let i = 0; i < rows.length; i++) {
	const ds = rows.map((_, j) => ({ j, d: i === j ? Infinity : apart(shapes[i], shapes[j]) })).sort((a, b) => a.d - b.d);
	neighbours.push(`${rows[i].id}  ${rows[i].equation}\n    nearest: ${ds.slice(0, 5).map((x) => `${rows[x.j].id} (${x.d.toFixed(3)})`).join(', ')}`);
	for (let j = i + 1; j < rows.length; j++) {
		if (sameValue(rows[i].equation, rows[j].equation, WIN)) fail(`${rows[i].id}`, `draws the same as ${rows[j].id} in the window`);
		else if (apart(shapes[i], shapes[j]) < 0.05) {
			const h = Math.max(furthest(dense[i], dense[j]), furthest(dense[j], dense[i]));
			if (h < 0.03) note(`${rows[i].id} and ${rows[j].id} are hard to tell apart: at most ${(h * (HI - LO)).toFixed(2)} apart in the window`);
		}
	}
}

// ---------- the families: each a real family, of several ----------

const leaves = new Map<string, string[]>();
for (const r of rows) { const k = (r.family as string[]).join(' › '); leaves.set(k, [...(leaves.get(k) ?? []), r.id as string]); }
for (const [k, ids] of leaves) if (ids.length < 3) note(`family ${k} has only ${ids.length}: ${ids.join(', ')}`);

// ---------- write ----------

const columns = JSON.parse(readFileSync(join(here, 'columns.json'), 'utf8'));
for (const c of columns.columns) if (c.type === 'plane') c.window = WINDOW;
writeFileSync(join(top, 'columns.json'), JSON.stringify(columns, null, 1) + '\n');
writeFileSync(failures.length ? join(here, '.work/rows-failed.jsonl') : join(top, 'rows.jsonl'), rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(join(here, 'neighbours.txt'), `Each curve's five nearest, as the app measures it (how far apart the drawings are, on average)\n\n${neighbours.join('\n')}\n`);

const tally = (col: string) => { const m = new Map<string, number>(); for (const r of rows) if (r[col] != null) { const v = Array.isArray(r[col]) ? (r[col] as string[]).join(', ') : String(r[col]); m.set(v, (m.get(v) ?? 0) + 1); } return [...m].sort((a, b) => b[1] - a[1]).map(([v, n]) => `${n} × ${v}`).join('\n    '); };
const summary = [
	`${rows.length} curves; ${functions.size} of them y as a function of x. Families:`,
	...[...leaves].map(([k, ids]) => `  ${k}: ${ids.length}`),
	'',
	...['roots', 'turning points', 'symmetry', 'far left, far right', 'repeats every', 'made from its parent by'].map((c) => `${c}:\n    ${tally(c)}`)
];
writeFileSync(join(here, 'checks.txt'), [
	'What build.ts checked, and what it found. Every fact in rows.jsonl passed its check (a failure stops the build);',
	'these are notes for whoever chooses the curves.', '',
	...(notes.length ? notes : ['nothing to note']), '', ...summary, ''
].join('\n'));

if (failures.length) {
	console.error(failures.join('\n'));
	console.error(`\n${failures.length} checks failed; nothing is right until they pass`);
	process.exit(1);
}
console.log(`${rows.length} rows written; ${notes.length} notes in build/checks.txt`);
