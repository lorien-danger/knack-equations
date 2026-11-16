/**
 * The curves: what each row is, as written by hand. Only what a person must choose is here: the equation as it is
 * written, its family, its general form, its name if it has one, and (for a moved copy of a parent) how it was moved.
 * Everything else (derivative, roots, turning points, asymptotes, symmetry, ends, period, where it meets the y-axis)
 * is worked out by build.ts and derive.py, and everything written here that is a fact is checked there: the equation
 * against its general form's family and its parent moved as `by` says, a curve's asymptotes against the curve.
 *
 * All graphs are drawn in one window, x and y from -5 to 5, so every equation here is chosen to show its interesting
 * part there (build.ts checks that roots, turning points and asymptotes fall inside it).
 *
 * by: how the row is its parent moved. For a function, y = a·p(b(x − h)) + k (a, b default 1; h, k default 0). For a
 * curve in x and y, every point (u, v) of the parent goes to (sx·u + h, sy·v + k).
 */

export interface By { a?: number; b?: number; h?: number; k?: number; sx?: number; sy?: number }
export interface Def {
	id: string;
	eq: string;
	family: string[];
	form: string;
	name?: string;
	parent?: string;
	by?: By;
	/** a curve's asymptotes (a function's are worked out); checked against the curve far out */
	asymptotes?: string[];
	/** the derivative as a person would write it, where sympy's own writing is clumsy; checked like sympy's */
	d?: string;
}

const PI = Math.PI;

const P = (leaf: string) => ['polynomial', leaf];
const R = (leaf: string) => ['rational', leaf];
const A = (leaf: string) => ['root and absolute value', leaf];
const E = (leaf: string) => ['exponential and logarithm', leaf];
const T = (leaf: string) => ['trigonometric', leaf];
const C = (leaf: string) => ['combination', leaf];
const K = (leaf: string) => ['conic section', leaf];
const B = (leaf: string) => ['beyond the conics', leaf];
const Q = (leaf: string) => ['polar curve', leaf];
const M = (leaf: string) => ['parametric curve', leaf];

export const CURVES: Def[] = [
	// ---- lines: slope and intercept, one at a time; then the other ways a line is written ----
	{ id: 'line', eq: 'y = x', family: P('line'), form: 'y = mx + c', parent: 'line' },
	{ id: 'line-2x', eq: 'y = 2x', family: P('line'), form: 'y = mx + c', parent: 'line', by: { a: 2 } },
	{ id: 'line-half-x', eq: 'y = \\frac{1}{2}x', family: P('line'), form: 'y = mx + c', parent: 'line', by: { a: 0.5 } },
	{ id: 'line-minus-x', eq: 'y = -x', family: P('line'), form: 'y = mx + c', parent: 'line', by: { a: -1 } },
	{ id: 'line-up3', eq: 'y = x + 3', family: P('line'), form: 'y = mx + c', parent: 'line', by: { k: 3 } },
	{ id: 'line-down2', eq: 'y = x - 2', family: P('line'), form: 'y = mx + c', parent: 'line', by: { k: -2 } },
	{ id: 'line-minus-2x-up3', eq: 'y = -2x + 3', family: P('line'), form: 'y = mx + c', parent: 'line', by: { a: -2, k: 3 } },
	{ id: 'line-third-x-down1', eq: 'y = \\frac{1}{3}x - 1', family: P('line'), form: 'y = mx + c', parent: 'line', by: { a: 1 / 3, k: -1 } },
	{ id: 'line-horizontal', eq: 'y = 3', family: P('line'), form: 'y = c' },
	{ id: 'line-vertical', eq: 'x = 2', family: P('line'), form: 'x = c' },
	{ id: 'line-intercepts', eq: '2x + 3y = 6', family: P('line'), form: 'ax + by = c' },
	{ id: 'line-intercepts-2', eq: 'x - 2y = 4', family: P('line'), form: 'ax + by = c' },
	{ id: 'line-point-slope', eq: 'y - 1 = 2(x - 3)', family: P('line'), form: 'y - y_1 = m(x - x_1)' },
	{ id: 'line-point-slope-2', eq: 'y + 2 = -\\frac{1}{2}(x - 1)', family: P('line'), form: 'y - y_1 = m(x - x_1)' },

	// ---- quadratics: the same parabola moved, flipped, stretched; then the factored and the expanded forms ----
	{ id: 'x2', eq: 'y = x^2', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', name: 'parabola' },
	{ id: 'x2-right2', eq: 'y = (x - 2)^2', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { h: 2 } },
	{ id: 'x2-left3', eq: 'y = (x + 3)^2', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { h: -3 } },
	{ id: 'x2-down3', eq: 'y = x^2 - 3', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { k: -3 } },
	{ id: 'x2-up1', eq: 'y = x^2 + 1', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { k: 1 } },
	{ id: 'x2-right2-down3', eq: 'y = (x - 2)^2 - 3', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { h: 2, k: -3 } },
	{ id: 'x2-flip', eq: 'y = -x^2', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { a: -1 } },
	{ id: 'x2-flip-up4', eq: 'y = -x^2 + 4', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { a: -1, k: 4 } },
	{ id: 'x2-narrow', eq: 'y = 2x^2', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { a: 2 } },
	{ id: 'x2-wide', eq: 'y = \\frac{1}{2}x^2', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { a: 0.5 } },
	{ id: 'x2-wide-up1', eq: 'y = \\frac{1}{2}x^2 + 1', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { a: 0.5, k: 1 } },
	{ id: 'x2-vertex-a', eq: 'y = -\\frac{1}{2}(x + 1)^2 + 3', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { a: -0.5, h: -1, k: 3 } },
	{ id: 'x2-vertex-b', eq: 'y = 2(x - 1)^2 - 4', family: P('quadratic'), form: 'y = a(x - h)^2 + k', parent: 'x2', by: { a: 2, h: 1, k: -4 } },
	{ id: 'x2-factored-a', eq: 'y = (x - 1)(x - 4)', family: P('quadratic'), form: 'y = a(x - p)(x - q)', parent: 'x2', by: { h: 2.5, k: -2.25 } },
	{ id: 'x2-factored-b', eq: 'y = x(x - 3)', family: P('quadratic'), form: 'y = a(x - p)(x - q)', parent: 'x2', by: { h: 1.5, k: -2.25 } },
	{ id: 'x2-factored-c', eq: 'y = (x + 2)(x - 2)', family: P('quadratic'), form: 'y = a(x - p)(x - q)', parent: 'x2', by: { k: -4 } },
	{ id: 'x2-factored-d', eq: 'y = -(x + 1)(x - 3)', family: P('quadratic'), form: 'y = a(x - p)(x - q)', parent: 'x2', by: { a: -1, h: 1, k: 4 } },
	{ id: 'x2-factored-e', eq: 'y = \\frac{1}{2}(x + 4)(x - 1)', family: P('quadratic'), form: 'y = a(x - p)(x - q)', parent: 'x2', by: { a: 0.5, h: -1.5, k: -3.125 } },
	{ id: 'x2-standard-a', eq: 'y = x^2 + 2x - 3', family: P('quadratic'), form: 'y = ax^2 + bx + c', parent: 'x2', by: { h: -1, k: -4 } },
	{ id: 'x2-standard-b', eq: 'y = x^2 - 4x + 5', family: P('quadratic'), form: 'y = ax^2 + bx + c', parent: 'x2', by: { h: 2, k: 1 } },
	{ id: 'x2-standard-c', eq: 'y = -x^2 - 2x + 2', family: P('quadratic'), form: 'y = ax^2 + bx + c', parent: 'x2', by: { a: -1, h: -1, k: 3 } },
	{ id: 'x2-standard-d', eq: 'y = 2x^2 - 4x - 1', family: P('quadratic'), form: 'y = ax^2 + bx + c', parent: 'x2', by: { a: 2, h: 1, k: -3 } },
	{ id: 'x2-standard-e', eq: 'y = x^2 + x + 1', family: P('quadratic'), form: 'y = ax^2 + bx + c', parent: 'x2', by: { h: -0.5, k: 0.75 } },

	// ---- cubics: moved; then what the roots and their multiplicities do; then turning points without roots ----
	{ id: 'x3', eq: 'y = x^3', family: P('cubic'), form: 'y = a(x - h)^3 + k', parent: 'x3' },
	{ id: 'x3-right2', eq: 'y = (x - 2)^3', family: P('cubic'), form: 'y = a(x - h)^3 + k', parent: 'x3', by: { h: 2 } },
	{ id: 'x3-up2', eq: 'y = x^3 + 2', family: P('cubic'), form: 'y = a(x - h)^3 + k', parent: 'x3', by: { k: 2 } },
	{ id: 'x3-flip', eq: 'y = -x^3', family: P('cubic'), form: 'y = a(x - h)^3 + k', parent: 'x3', by: { a: -1 } },
	{ id: 'x3-quarter', eq: 'y = \\frac{1}{4}x^3', family: P('cubic'), form: 'y = a(x - h)^3 + k', parent: 'x3', by: { a: 0.25 } },
	{ id: 'x3-triple-root', eq: 'y = \\frac{1}{2}(x - 1)^3', family: P('cubic'), form: 'y = a(x - h)^3 + k', parent: 'x3', by: { a: 0.5, h: 1 } },
	{ id: 'x3-moved', eq: 'y = \\frac{1}{2}(x + 1)^3 - 2', family: P('cubic'), form: 'y = a(x - h)^3 + k', parent: 'x3', by: { a: 0.5, h: -1, k: -2 } },
	{ id: 'x3-three-roots', eq: 'y = \\frac{1}{2}x(x - 2)(x + 3)', family: P('cubic'), form: 'y = a(x - p)(x - q)(x - r)' },
	{ id: 'x3-three-roots-flip', eq: 'y = -\\frac{1}{2}(x + 2)(x - 1)(x - 3)', family: P('cubic'), form: 'y = a(x - p)(x - q)(x - r)' },
	{ id: 'x3-double-root', eq: 'y = \\frac{1}{2}(x - 1)^2(x + 3)', family: P('cubic'), form: 'y = a(x - p)(x - q)(x - r)' },
	{ id: 'x3-double-root-0', eq: 'y = x^3 - 3x^2', family: P('cubic'), form: 'y = ax^3 + bx^2 + cx + d' },
	{ id: 'x3-minus-3x', eq: 'y = x^3 - 3x', family: P('cubic'), form: 'y = ax^3 + bx^2 + cx + d' },
	{ id: 'x3-minus-3x-up3', eq: 'y = x^3 - 3x + 3', family: P('cubic'), form: 'y = ax^3 + bx^2 + cx + d' },
	{ id: 'x3-plus-x', eq: 'y = x^3 + x', family: P('cubic'), form: 'y = ax^3 + bx^2 + cx + d' },
	{ id: 'x3-like-sin', eq: 'y = x - \\frac{x^3}{6}', family: P('cubic'), form: 'y = ax^3 + bx^2 + cx + d' },

	// ---- higher powers: flatter at the bottom; more roots, more turns ----
	{ id: 'x4', eq: 'y = x^4', family: P('degree 4 and up'), form: 'y = x^n' },
	{ id: 'x5', eq: 'y = x^5', family: P('degree 4 and up'), form: 'y = x^n' },
	{ id: 'x4-w', eq: 'y = x^4 - 4x^2', family: P('degree 4 and up'), form: 'y = a_nx^n + \\cdots + a_1x + a_0' },
	{ id: 'x4-four-roots', eq: 'y = (x^2 - 1)(x^2 - 4)', family: P('degree 4 and up'), form: 'y = a(x - p)(x - q)(x - r)\\cdots' },
	{ id: 'x4-m', eq: 'y = -\\frac{1}{4}(x^2 - 1)(x^2 - 9)', family: P('degree 4 and up'), form: 'y = a(x - p)(x - q)(x - r)\\cdots' },
	{ id: 'x4-two-touches', eq: 'y = (x - 1)^2(x + 1)^2', family: P('degree 4 and up'), form: 'y = a(x - p)(x - q)(x - r)\\cdots' },
	{ id: 'x5-five-roots', eq: 'y = x(x^2 - 1)(x^2 - 4)', family: P('degree 4 and up'), form: 'y = a(x - p)(x - q)(x - r)\\cdots' },

	// ---- rational: the reciprocal moved; its square; quotients with their asymptotes ----
	{ id: 'recip', eq: 'y = \\frac{1}{x}', family: R('reciprocal'), form: 'y = \\frac{a}{x - h} + k', parent: 'recip', name: 'rectangular hyperbola' },
	{ id: 'recip-right2', eq: 'y = \\frac{1}{x - 2}', family: R('reciprocal'), form: 'y = \\frac{a}{x - h} + k', parent: 'recip', by: { h: 2 } },
	{ id: 'recip-up2', eq: 'y = \\frac{1}{x} + 2', family: R('reciprocal'), form: 'y = \\frac{a}{x - h} + k', parent: 'recip', by: { k: 2 } },
	{ id: 'recip-moved', eq: 'y = \\frac{1}{x + 1} - 2', family: R('reciprocal'), form: 'y = \\frac{a}{x - h} + k', parent: 'recip', by: { h: -1, k: -2 } },
	{ id: 'recip-flip', eq: 'y = -\\frac{1}{x}', family: R('reciprocal'), form: 'y = \\frac{a}{x - h} + k', parent: 'recip', by: { a: -1 } },
	{ id: 'recip-4', eq: 'y = \\frac{4}{x}', family: R('reciprocal'), form: 'y = \\frac{a}{x - h} + k', parent: 'recip', by: { a: 4 } },
	{ id: 'recip-linear', eq: 'y = \\frac{2x + 1}{x - 1}', family: R('reciprocal'), form: 'y = \\frac{ax + b}{cx + d}', parent: 'recip', by: { a: 3, h: 1, k: 2 } },
	{ id: 'recip-linear-2', eq: 'y = \\frac{x}{x + 2}', family: R('reciprocal'), form: 'y = \\frac{ax + b}{cx + d}', parent: 'recip', by: { a: -2, h: -2, k: 1 } },
	{ id: 'recip2', eq: 'y = \\frac{1}{x^2}', family: R('reciprocal square'), form: 'y = \\frac{a}{(x - h)^2} + k', parent: 'recip2' },
	{ id: 'recip2-right2', eq: 'y = \\frac{1}{(x - 2)^2}', family: R('reciprocal square'), form: 'y = \\frac{a}{(x - h)^2} + k', parent: 'recip2', by: { h: 2 } },
	{ id: 'recip2-down2', eq: 'y = \\frac{1}{x^2} - 2', family: R('reciprocal square'), form: 'y = \\frac{a}{(x - h)^2} + k', parent: 'recip2', by: { k: -2 } },
	{ id: 'recip2-flip', eq: 'y = -\\frac{2}{x^2}', family: R('reciprocal square'), form: 'y = \\frac{a}{(x - h)^2} + k', parent: 'recip2', by: { a: -2 } },
	{ id: 'witch', eq: 'y = \\frac{8}{x^2 + 4}', family: R('quotient of polynomials'), form: 'y = \\frac{8a^3}{x^2 + 4a^2}', name: 'witch of Agnesi' },
	{ id: 'rational-bump', eq: 'y = \\frac{4x}{x^2 + 1}', family: R('quotient of polynomials'), form: 'y = \\frac{p(x)}{q(x)}' },
	{ id: 'rational-two-walls', eq: 'y = \\frac{x^2}{x^2 - 4}', family: R('quotient of polynomials'), form: 'y = \\frac{p(x)}{q(x)}' },
	{ id: 'rational-crosses', eq: 'y = \\frac{x - 1}{(x - 3)(x + 2)}', family: R('quotient of polynomials'), form: 'y = \\frac{p(x)}{q(x)}' },
	{ id: 'rational-slant', eq: 'y = \\frac{x^2 + 1}{x}', family: R('quotient of polynomials'), form: 'y = \\frac{p(x)}{q(x)}' },
	{ id: 'rational-slant-2', eq: 'y = \\frac{x^2}{x - 1}', family: R('quotient of polynomials'), form: 'y = \\frac{p(x)}{q(x)}' },

	// ---- roots and absolute value ----
	{ id: 'sqrt', eq: 'y = \\sqrt{x}', family: A('square root'), form: 'y = a\\sqrt{b(x - h)} + k', parent: 'sqrt' },
	{ id: 'sqrt-left4', eq: 'y = \\sqrt{x + 4}', family: A('square root'), form: 'y = a\\sqrt{b(x - h)} + k', parent: 'sqrt', by: { h: -4 } },
	{ id: 'sqrt-down2', eq: 'y = \\sqrt{x} - 2', family: A('square root'), form: 'y = a\\sqrt{b(x - h)} + k', parent: 'sqrt', by: { k: -2 } },
	{ id: 'sqrt-flip', eq: 'y = -\\sqrt{x}', family: A('square root'), form: 'y = a\\sqrt{b(x - h)} + k', parent: 'sqrt', by: { a: -1 } },
	{ id: 'sqrt-mirror', eq: 'y = \\sqrt{-x}', family: A('square root'), form: 'y = a\\sqrt{b(x - h)} + k', parent: 'sqrt', by: { b: -1 }, d: 'y = -\\frac{1}{2\\sqrt{-x}}' },
	{ id: 'sqrt-moved', eq: 'y = 2\\sqrt{x - 1}', family: A('square root'), form: 'y = a\\sqrt{b(x - h)} + k', parent: 'sqrt', by: { a: 2, h: 1 } },
	{ id: 'semicircle', eq: 'y = \\sqrt{4 - x^2}', family: A('square root'), form: 'y = \\sqrt{r^2 - x^2}', name: 'semicircle' },
	{ id: 'cbrt', eq: 'y = \\sqrt[3]{x}', family: A('cube root'), form: 'y = a\\sqrt[3]{x - h} + k', parent: 'cbrt', d: 'y = \\frac{1}{3\\sqrt[3]{x^2}}' },
	{ id: 'cbrt-right2', eq: 'y = \\sqrt[3]{x - 2}', family: A('cube root'), form: 'y = a\\sqrt[3]{x - h} + k', parent: 'cbrt', by: { h: 2 }, d: 'y = \\frac{1}{3\\sqrt[3]{(x - 2)^2}}' },
	{ id: 'cbrt-2', eq: 'y = 2\\sqrt[3]{x}', family: A('cube root'), form: 'y = a\\sqrt[3]{x - h} + k', parent: 'cbrt', by: { a: 2 }, d: 'y = \\frac{2}{3\\sqrt[3]{x^2}}' },
	{ id: 'cusp', eq: 'y = \\sqrt[3]{x^2}', family: A('cube root'), form: 'y = \\sqrt[q]{x^p}', d: 'y = \\frac{2}{3\\sqrt[3]{x}}' },
	{ id: 'abs', eq: 'y = |x|', family: A('absolute value'), form: 'y = a|x - h| + k', parent: 'abs' },
	{ id: 'abs-right2', eq: 'y = |x - 2|', family: A('absolute value'), form: 'y = a|x - h| + k', parent: 'abs', by: { h: 2 } },
	{ id: 'abs-down3', eq: 'y = |x| - 3', family: A('absolute value'), form: 'y = a|x - h| + k', parent: 'abs', by: { k: -3 } },
	{ id: 'abs-moved', eq: 'y = -|x + 1| + 3', family: A('absolute value'), form: 'y = a|x - h| + k', parent: 'abs', by: { a: -1, h: -1, k: 3 } },
	{ id: 'abs-half', eq: 'y = \\frac{1}{2}|x|', family: A('absolute value'), form: 'y = a|x - h| + k', parent: 'abs', by: { a: 0.5 } },
	{ id: 'abs-moved-2', eq: 'y = 2|x - 1| - 4', family: A('absolute value'), form: 'y = a|x - h| + k', parent: 'abs', by: { a: 2, h: 1, k: -4 } },
	{ id: 'abs-of-parabola', eq: 'y = |x^2 - 4|', family: A('absolute value'), form: 'y = |f(x)|' },
	{ id: 'abs-of-sin', eq: 'y = 3|\\sin x|', family: A('absolute value'), form: 'y = |f(x)|' },

	// ---- exponentials and logarithms ----
	{ id: 'exp', eq: 'y = e^x', family: E('exponential'), form: 'y = ae^{b(x - h)} + k', parent: 'exp' },
	{ id: 'exp-decay', eq: 'y = e^{-x}', family: E('exponential'), form: 'y = ae^{b(x - h)} + k', parent: 'exp', by: { b: -1 } },
	{ id: 'exp-2', eq: 'y = 2^x', family: E('exponential'), form: 'y = b^x', parent: 'exp', by: { b: Math.LN2 } },
	{ id: 'exp-10', eq: 'y = 10^x', family: E('exponential'), form: 'y = b^x', parent: 'exp', by: { b: Math.LN10 } },
	{ id: 'exp-half', eq: 'y = \\left(\\frac{1}{2}\\right)^x', family: E('exponential'), form: 'y = b^x', parent: 'exp', by: { b: -Math.LN2 } },
	{ id: 'exp-down2', eq: 'y = e^x - 2', family: E('exponential'), form: 'y = ae^{b(x - h)} + k', parent: 'exp', by: { k: -2 } },
	{ id: 'exp-right2', eq: 'y = e^{x - 2}', family: E('exponential'), form: 'y = ae^{b(x - h)} + k', parent: 'exp', by: { h: 2 } },
	{ id: 'exp-flip', eq: 'y = -e^x', family: E('exponential'), form: 'y = ae^{b(x - h)} + k', parent: 'exp', by: { a: -1 } },
	{ id: 'exp-slow', eq: 'y = e^{\\frac{x}{2}}', family: E('exponential'), form: 'y = ae^{b(x - h)} + k', parent: 'exp', by: { b: 0.5 } },
	{ id: 'exp-charge', eq: 'y = 4 - 4e^{-x}', family: E('exponential'), form: 'y = ae^{b(x - h)} + k', parent: 'exp', by: { a: -4, b: -1, k: 4 } },
	{ id: 'logistic', eq: 'y = \\frac{1}{1 + e^{-x}}', family: E('logistic'), form: 'y = \\frac{a}{1 + e^{-b(x - h)}}', parent: 'logistic', name: 'logistic curve' },
	{ id: 'logistic-4', eq: 'y = \\frac{4}{1 + e^{-x}}', family: E('logistic'), form: 'y = \\frac{a}{1 + e^{-b(x - h)}}', parent: 'logistic', by: { a: 4 }, name: 'logistic curve' },
	{ id: 'logistic-steep', eq: 'y = \\frac{4}{1 + e^{-2x}}', family: E('logistic'), form: 'y = \\frac{a}{1 + e^{-b(x - h)}}', parent: 'logistic', by: { a: 4, b: 2 }, name: 'logistic curve' },
	{ id: 'logistic-right2', eq: 'y = \\frac{4}{1 + e^{-(x - 2)}}', family: E('logistic'), form: 'y = \\frac{a}{1 + e^{-b(x - h)}}', parent: 'logistic', by: { a: 4, h: 2 }, name: 'logistic curve', d: 'y = \\frac{4e^{x - 2}}{(e^{x - 2} + 1)^2}' },
	{ id: 'ln', eq: 'y = \\ln x', family: E('logarithm'), form: 'y = a\\ln(b(x - h)) + k', parent: 'ln' },
	{ id: 'ln-left3', eq: 'y = \\ln(x + 3)', family: E('logarithm'), form: 'y = a\\ln(b(x - h)) + k', parent: 'ln', by: { h: -3 } },
	{ id: 'ln-up2', eq: 'y = \\ln x + 2', family: E('logarithm'), form: 'y = a\\ln(b(x - h)) + k', parent: 'ln', by: { k: 2 } },
	{ id: 'ln-flip', eq: 'y = -\\ln x', family: E('logarithm'), form: 'y = a\\ln(b(x - h)) + k', parent: 'ln', by: { a: -1 } },
	{ id: 'ln-mirror', eq: 'y = \\ln(-x)', family: E('logarithm'), form: 'y = a\\ln(b(x - h)) + k', parent: 'ln', by: { b: -1 } },
	{ id: 'log10', eq: 'y = \\log_{10} x', family: E('logarithm'), form: 'y = \\log_b x', parent: 'ln', by: { a: 1 / Math.LN10 } },
	{ id: 'log2', eq: 'y = \\log_2 x', family: E('logarithm'), form: 'y = \\log_b x', parent: 'ln', by: { a: 1 / Math.LN2 } },
	{ id: 'ln-abs', eq: 'y = \\ln|x|', family: E('logarithm'), form: 'y = \\ln|x|', d: 'y = \\frac{1}{x}' },
	{ id: 'cosh', eq: 'y = \\cosh x', family: E('hyperbolic'), form: 'y = a\\cosh\\frac{x}{a}', name: 'catenary' },
	{ id: 'catenary-2', eq: 'y = 2\\cosh\\frac{x}{2}', family: E('hyperbolic'), form: 'y = a\\cosh\\frac{x}{a}', name: 'catenary', parent: 'cosh', by: { a: 2, b: 0.5 } },
	{ id: 'sinh', eq: 'y = \\sinh x', family: E('hyperbolic'), form: 'y = \\frac{e^x - e^{-x}}{2}' },
	{ id: 'tanh', eq: 'y = \\tanh x', family: E('hyperbolic'), form: 'y = \\frac{e^x - e^{-x}}{e^x + e^{-x}}' },
	{ id: 'sech', eq: 'y = \\frac{3}{\\cosh x}', family: E('hyperbolic'), form: 'y = \\frac{2a}{e^x + e^{-x}}' },

	// ---- trigonometric: amplitude, period, phase and shift, one at a time ----
	{ id: 'sin', eq: 'y = \\sin x', family: T('sine and cosine'), form: 'y = a\\sin(b(x - h)) + k', parent: 'sin', name: 'sine wave' },
	{ id: 'cos', eq: 'y = \\cos x', family: T('sine and cosine'), form: 'y = a\\cos(b(x - h)) + k', parent: 'sin', by: { h: -PI / 2 }, name: 'sine wave' },
	{ id: 'sin-tall', eq: 'y = 2\\sin x', family: T('sine and cosine'), form: 'y = a\\sin(b(x - h)) + k', parent: 'sin', by: { a: 2 } },
	{ id: 'sin-flip', eq: 'y = -\\sin x', family: T('sine and cosine'), form: 'y = a\\sin(b(x - h)) + k', parent: 'sin', by: { a: -1 } },
	{ id: 'sin-fast', eq: 'y = \\sin 2x', family: T('sine and cosine'), form: 'y = a\\sin(b(x - h)) + k', parent: 'sin', by: { b: 2 } },
	{ id: 'sin-slow', eq: 'y = \\sin\\frac{x}{2}', family: T('sine and cosine'), form: 'y = a\\sin(b(x - h)) + k', parent: 'sin', by: { b: 0.5 } },
	{ id: 'sin-up2', eq: 'y = \\sin x + 2', family: T('sine and cosine'), form: 'y = a\\sin(b(x - h)) + k', parent: 'sin', by: { k: 2 } },
	{ id: 'sin-right1', eq: 'y = \\sin(x - 1)', family: T('sine and cosine'), form: 'y = a\\sin(b(x - h)) + k', parent: 'sin', by: { h: 1 } },
	{ id: 'sin-pi', eq: 'y = \\sin \\pi x', family: T('sine and cosine'), form: 'y = a\\sin(b(x - h)) + k', parent: 'sin', by: { b: PI } },
	{ id: 'cos-3-fast', eq: 'y = 3\\cos 2x', family: T('sine and cosine'), form: 'y = a\\cos(b(x - h)) + k', parent: 'cos', by: { a: 3, b: 2 } },
	{ id: 'cos-moved', eq: 'y = 2\\cos(x + 1) + 1', family: T('sine and cosine'), form: 'y = a\\cos(b(x - h)) + k', parent: 'cos', by: { a: 2, h: -1, k: 1 } },
	{ id: 'sin-squared', eq: 'y = \\sin^2 x', family: T('sine and cosine'), form: 'y = \\frac{1 - \\cos 2x}{2}', parent: 'cos', by: { a: -0.5, b: 2, k: 0.5 } },
	{ id: 'sin-plus-cos', eq: 'y = \\sin x + \\cos x', family: T('sine and cosine'), form: 'y = a\\sin x + b\\cos x', parent: 'sin', by: { a: Math.SQRT2, h: -PI / 4 } },
	{ id: 'tan', eq: 'y = \\tan x', family: T('tangent, secant and kin'), form: 'y = a\\tan(b(x - h)) + k', parent: 'tan', d: 'y = \\sec^2 x' },
	{ id: 'tan-slow', eq: 'y = \\tan\\frac{x}{2}', family: T('tangent, secant and kin'), form: 'y = a\\tan(b(x - h)) + k', parent: 'tan', by: { b: 0.5 } },
	{ id: 'cot', eq: 'y = \\cot x', family: T('tangent, secant and kin'), form: 'y = \\frac{\\cos x}{\\sin x}', parent: 'tan', by: { a: -1, h: PI / 2 }, d: 'y = -\\csc^2 x' },
	{ id: 'sec', eq: 'y = \\sec x', family: T('tangent, secant and kin'), form: 'y = \\frac{1}{\\cos x}' },
	{ id: 'csc', eq: 'y = \\csc x', family: T('tangent, secant and kin'), form: 'y = \\frac{1}{\\sin x}' },
	{ id: 'arctan', eq: 'y = \\arctan x', family: T('inverse'), form: 'y = \\arctan x' },
	{ id: 'arcsin', eq: 'y = \\arcsin x', family: T('inverse'), form: 'y = \\arcsin x' },
	{ id: 'arccos', eq: 'y = \\arccos x', family: T('inverse'), form: 'y = \\arccos x' },

	// ---- made of others: products, bells, compositions, sums ----
	{ id: 'x-sin-x', eq: 'y = x\\sin x', family: C('product'), form: 'y = f(x)\\,g(x)' },
	{ id: 'damped', eq: 'y = 2e^{-\\frac{x}{4}}\\sin 3x', family: C('product'), form: 'y = ae^{-kx}\\sin bx', name: 'damped oscillation' },
	{ id: 'wave-packet', eq: 'y = 4e^{-\\frac{x^2}{8}}\\cos 3x', family: C('product'), form: 'y = ae^{-\\frac{x^2}{2s^2}}\\cos bx', name: 'wave packet' },
	{ id: 'sinc', eq: 'y = \\frac{4\\sin x}{x}', family: C('product'), form: 'y = \\frac{a\\sin x}{x}', name: 'sinc function' },
	{ id: 'x-exp', eq: 'y = 4xe^{-x}', family: C('product'), form: 'y = axe^{-bx}' },
	{ id: 'bell', eq: 'y = e^{-x^2}', family: C('bell curve'), form: 'y = ae^{-\\frac{(x - h)^2}{2s^2}}', parent: 'bell', name: 'bell curve' },
	{ id: 'bell-3', eq: 'y = 3e^{-\\frac{x^2}{2}}', family: C('bell curve'), form: 'y = ae^{-\\frac{(x - h)^2}{2s^2}}', parent: 'bell', by: { a: 3, b: Math.SQRT1_2 }, name: 'bell curve' },
	{ id: 'bell-3-right2', eq: 'y = 3e^{-\\frac{(x - 2)^2}{2}}', family: C('bell curve'), form: 'y = ae^{-\\frac{(x - h)^2}{2s^2}}', parent: 'bell', by: { a: 3, b: Math.SQRT1_2, h: 2 }, name: 'bell curve' },
	{ id: 'bell-3-wide', eq: 'y = 3e^{-\\frac{x^2}{8}}', family: C('bell curve'), form: 'y = ae^{-\\frac{(x - h)^2}{2s^2}}', parent: 'bell', by: { a: 3, b: Math.SQRT1_2 / 2 }, name: 'bell curve' },
	{ id: 'chirp', eq: 'y = \\sin(x^2)', family: C('composition'), form: 'y = f(g(x))', name: 'chirp' },
	{ id: 'exp-sin', eq: 'y = e^{\\sin x}', family: C('composition'), form: 'y = f(g(x))' },
	{ id: 'ln-x2', eq: 'y = \\ln(x^2 + 1)', family: C('composition'), form: 'y = f(g(x))' },
	{ id: 'x-plus-sin', eq: 'y = x + \\sin x', family: C('sum'), form: 'y = f(x) + g(x)' },
	{ id: 'x-plus-2sin', eq: 'y = x + 2\\sin x', family: C('sum'), form: 'y = f(x) + g(x)' },
	{ id: 'square-wave-2', eq: 'y = 2\\sin x + \\frac{2}{3}\\sin 3x', family: C('sum'), form: 'y = \\sin x + \\frac{\\sin 3x}{3} + \\frac{\\sin 5x}{5} + \\cdots', name: 'towards a square wave' },
	{ id: 'square-wave-3', eq: 'y = 2\\sin x + \\frac{2}{3}\\sin 3x + \\frac{2}{5}\\sin 5x', family: C('sum'), form: 'y = \\sin x + \\frac{\\sin 3x}{3} + \\frac{\\sin 5x}{5} + \\cdots', name: 'towards a square wave' },

	// ---- conic sections: circles, ellipses, parabolas on their side, hyperbolas ----
	{ id: 'circle', eq: 'x^2 + y^2 = 1', family: K('circle'), form: '(x - h)^2 + (y - k)^2 = r^2', parent: 'circle', name: 'unit circle' },
	{ id: 'circle-3', eq: 'x^2 + y^2 = 9', family: K('circle'), form: '(x - h)^2 + (y - k)^2 = r^2', parent: 'circle', by: { sx: 3, sy: 3 }, name: 'circle' },
	{ id: 'circle-right2', eq: '(x - 2)^2 + y^2 = 4', family: K('circle'), form: '(x - h)^2 + (y - k)^2 = r^2', parent: 'circle', by: { sx: 2, sy: 2, h: 2 }, name: 'circle' },
	{ id: 'circle-moved', eq: '(x + 1)^2 + (y - 2)^2 = 9', family: K('circle'), form: '(x - h)^2 + (y - k)^2 = r^2', parent: 'circle', by: { sx: 3, sy: 3, h: -1, k: 2 }, name: 'circle' },
	{ id: 'circle-expanded', eq: 'x^2 + y^2 - 4x + 2y = 4', family: K('circle'), form: 'x^2 + y^2 + Dx + Ey + F = 0', parent: 'circle', by: { sx: 3, sy: 3, h: 2, k: -1 }, name: 'circle' },
	{ id: 'ellipse-wide', eq: '\\frac{x^2}{16} + \\frac{y^2}{4} = 1', family: K('ellipse'), form: '\\frac{(x - h)^2}{a^2} + \\frac{(y - k)^2}{b^2} = 1', parent: 'circle', by: { sx: 4, sy: 2 }, name: 'ellipse' },
	{ id: 'ellipse-tall', eq: '\\frac{x^2}{4} + \\frac{y^2}{16} = 1', family: K('ellipse'), form: '\\frac{(x - h)^2}{a^2} + \\frac{(y - k)^2}{b^2} = 1', parent: 'circle', by: { sx: 2, sy: 4 }, name: 'ellipse' },
	{ id: 'ellipse-moved', eq: '\\frac{(x - 1)^2}{9} + \\frac{(y + 1)^2}{4} = 1', family: K('ellipse'), form: '\\frac{(x - h)^2}{a^2} + \\frac{(y - k)^2}{b^2} = 1', parent: 'circle', by: { sx: 3, sy: 2, h: 1, k: -1 }, name: 'ellipse' },
	{ id: 'ellipse-expanded', eq: '9x^2 + 4y^2 = 36', family: K('ellipse'), form: 'Ax^2 + By^2 = C', parent: 'circle', by: { sx: 2, sy: 3 }, name: 'ellipse' },
	{ id: 'sideways', eq: 'x = y^2', family: K('parabola on its side'), form: 'x = a(y - k)^2 + h', parent: 'sideways' },
	{ id: 'sideways-flip', eq: 'x = -y^2', family: K('parabola on its side'), form: 'x = a(y - k)^2 + h', parent: 'sideways', by: { sx: -1 } },
	{ id: 'sideways-left3', eq: 'x = y^2 - 3', family: K('parabola on its side'), form: 'x = a(y - k)^2 + h', parent: 'sideways', by: { h: -3 } },
	{ id: 'sideways-wide', eq: 'x = \\frac{1}{4}y^2', family: K('parabola on its side'), form: 'x = a(y - k)^2 + h', parent: 'sideways', by: { sx: 0.25 } },
	{ id: 'sideways-moved', eq: 'x = -(y - 2)^2 + 1', family: K('parabola on its side'), form: 'x = a(y - k)^2 + h', parent: 'sideways', by: { sx: -1, h: 1, k: 2 } },
	{ id: 'hyperbola', eq: 'x^2 - y^2 = 1', family: K('hyperbola'), form: '\\frac{(x - h)^2}{a^2} - \\frac{(y - k)^2}{b^2} = 1', parent: 'hyperbola', asymptotes: ['y = x', 'y = -x'], name: 'hyperbola' },
	{ id: 'hyperbola-2', eq: 'x^2 - y^2 = 4', family: K('hyperbola'), form: '\\frac{(x - h)^2}{a^2} - \\frac{(y - k)^2}{b^2} = 1', parent: 'hyperbola', by: { sx: 2, sy: 2 }, asymptotes: ['y = x', 'y = -x'], name: 'hyperbola' },
	{ id: 'hyperbola-up', eq: 'y^2 - x^2 = 4', family: K('hyperbola'), form: '\\frac{(y - k)^2}{b^2} - \\frac{(x - h)^2}{a^2} = 1', asymptotes: ['y = x', 'y = -x'], name: 'hyperbola' },
	{ id: 'hyperbola-steep', eq: '\\frac{x^2}{4} - \\frac{y^2}{9} = 1', family: K('hyperbola'), form: '\\frac{(x - h)^2}{a^2} - \\frac{(y - k)^2}{b^2} = 1', parent: 'hyperbola', by: { sx: 2, sy: 3 }, asymptotes: ['y = \\frac{3}{2}x', 'y = -\\frac{3}{2}x'], name: 'hyperbola' },
	{ id: 'hyperbola-xy', eq: 'xy = 2', family: K('hyperbola'), form: 'xy = c', name: 'rectangular hyperbola' },

	// ---- beyond the conics ----
	{ id: 'diamond', eq: '|x| + |y| = 3', family: B('superellipse'), form: '|x|^n + |y|^n = r^n' },
	{ id: 'squircle', eq: 'x^4 + y^4 = 81', family: B('superellipse'), form: '|x|^n + |y|^n = r^n', name: 'squircle' },
	{ id: 'astroid-implicit', eq: '\\sqrt{|x|} + \\sqrt{|y|} = \\sqrt{3}', family: B('superellipse'), form: '|x|^n + |y|^n = r^n' },
	{ id: 'folium', eq: 'x^3 + y^3 = 6xy', family: B('cubic curve'), form: 'x^3 + y^3 = 3axy', name: 'folium of Descartes', asymptotes: ['y = -x - 2'] },
	{ id: 'elliptic-two', eq: 'y^2 = x^3 - 4x', family: B('cubic curve'), form: 'y^2 = x^3 + ax^2 + bx + c', name: 'elliptic curve' },
	{ id: 'elliptic-one', eq: 'y^2 = x^3 - 3x + 3', family: B('cubic curve'), form: 'y^2 = x^3 + ax^2 + bx + c', name: 'elliptic curve' },
	{ id: 'cusp-curve', eq: 'y^2 = x^3', family: B('cubic curve'), form: 'y^2 = x^3 + ax^2 + bx + c', name: 'semicubical parabola' },
	{ id: 'nodal', eq: 'y^2 = x^3 + 2x^2', family: B('cubic curve'), form: 'y^2 = x^3 + ax^2 + bx + c', name: 'nodal cubic' },

	// ---- polar curves ----
	{ id: 'rose-2', eq: 'r = 4\\cos 2\\theta', family: Q('rose'), form: 'r = a\\cos n\\theta', name: 'rose' },
	{ id: 'rose-3', eq: 'r = 4\\cos 3\\theta', family: Q('rose'), form: 'r = a\\cos n\\theta', name: 'rose' },
	{ id: 'rose-4', eq: 'r = 4\\cos 4\\theta', family: Q('rose'), form: 'r = a\\cos n\\theta', name: 'rose' },
	{ id: 'rose-sin-2', eq: 'r = 4\\sin 2\\theta', family: Q('rose'), form: 'r = a\\sin n\\theta', name: 'rose' },
	{ id: 'rose-sin-3', eq: 'r = 4\\sin 3\\theta', family: Q('rose'), form: 'r = a\\sin n\\theta', name: 'rose' },
	{ id: 'cardioid', eq: 'r = 2 + 2\\cos\\theta', family: Q('limaçon'), form: 'r = a + b\\cos\\theta', name: 'cardioid' },
	{ id: 'cardioid-up', eq: 'r = 2 + 2\\sin\\theta', family: Q('limaçon'), form: 'r = a + b\\sin\\theta', name: 'cardioid' },
	{ id: 'limacon-loop', eq: 'r = 1 + 2\\cos\\theta', family: Q('limaçon'), form: 'r = a + b\\cos\\theta', name: 'limaçon' },
	{ id: 'limacon-dimple', eq: 'r = 3 + 2\\cos\\theta', family: Q('limaçon'), form: 'r = a + b\\cos\\theta', name: 'limaçon' },
	{ id: 'polar-circle', eq: 'r = 4\\sin\\theta', family: Q('limaçon'), form: 'r = a + b\\sin\\theta', name: 'circle' },
	{ id: 'spiral-archimedes', eq: 'r = 0.4\\theta, 0 \\le \\theta \\le 4\\pi', family: Q('spiral'), form: 'r = a\\theta', name: 'Archimedean spiral' },
	{ id: 'spiral-log', eq: 'r = e^{\\frac{\\theta}{4}}, -2\\pi \\le \\theta \\le 2\\pi', family: Q('spiral'), form: 'r = ae^{b\\theta}', name: 'logarithmic spiral' },
	{ id: 'spiral-fermat', eq: 'r = \\sqrt{2\\theta}, 0 \\le \\theta \\le 4\\pi', family: Q('spiral'), form: 'r = a\\sqrt{\\theta}', name: "Fermat's spiral" },
	{ id: 'spiral-hyperbolic', eq: 'r = \\frac{4}{\\theta}', family: Q('spiral'), form: 'r = \\frac{a}{\\theta}', name: 'hyperbolic spiral', asymptotes: ['y = 4'] },
	{ id: 'lemniscate', eq: 'r^2 = 16\\cos 2\\theta', family: Q('lemniscate'), form: 'r^2 = a^2\\cos 2\\theta', name: 'lemniscate of Bernoulli' },
	{ id: 'lemniscate-small', eq: 'r^2 = 9\\cos 2\\theta', family: Q('lemniscate'), form: 'r^2 = a^2\\cos 2\\theta', name: 'lemniscate of Bernoulli' },
	{ id: 'lemniscate-tilted', eq: 'r^2 = 16\\sin 2\\theta', family: Q('lemniscate'), form: 'r^2 = a^2\\sin 2\\theta', name: 'lemniscate of Bernoulli' },

	// ---- parametric curves ----
	{ id: 'lissajous-1-2', eq: '(4\\sin t, 4\\sin 2t)', family: M('Lissajous figure'), form: '(A\\sin(at + \\delta), B\\sin bt)', name: 'Lissajous figure' },
	{ id: 'lissajous-2-1', eq: '(4\\sin 2t, 4\\sin t)', family: M('Lissajous figure'), form: '(A\\sin(at + \\delta), B\\sin bt)', name: 'Lissajous figure' },
	{ id: 'lissajous-3-2', eq: '(4\\sin 3t, 4\\sin 2t)', family: M('Lissajous figure'), form: '(A\\sin(at + \\delta), B\\sin bt)', name: 'Lissajous figure' },
	{ id: 'lissajous-3-4', eq: '(4\\sin 3t, 4\\sin 4t)', family: M('Lissajous figure'), form: '(A\\sin(at + \\delta), B\\sin bt)', name: 'Lissajous figure' },
	{ id: 'lissajous-phase', eq: '(4\\sin(t + \\frac{\\pi}{4}), 4\\sin t)', family: M('Lissajous figure'), form: '(A\\sin(at + \\delta), B\\sin bt)', name: 'Lissajous figure' },
	{ id: 'cycloid', eq: '(t - \\sin t, 1 - \\cos t), -2\\pi \\le t \\le 2\\pi', family: M('cycloid'), form: '(t - d\\sin t, 1 - d\\cos t)', name: 'cycloid' },
	{ id: 'cycloid-prolate', eq: '(t - 2\\sin t, 1 - 2\\cos t), -2\\pi \\le t \\le 2\\pi', family: M('cycloid'), form: '(t - d\\sin t, 1 - d\\cos t)', name: 'prolate cycloid' },
	{ id: 'cycloid-curtate', eq: '(t - \\frac{1}{2}\\sin t, 1 - \\frac{1}{2}\\cos t), -2\\pi \\le t \\le 2\\pi', family: M('cycloid'), form: '(t - d\\sin t, 1 - d\\cos t)', name: 'curtate cycloid' },
	{ id: 'astroid', eq: '(4\\cos^3 t, 4\\sin^3 t)', family: M('rolling circle'), form: '(a\\cos^3 t, a\\sin^3 t)', name: 'astroid' },
	{ id: 'deltoid', eq: '(2\\cos t + \\cos 2t, 2\\sin t - \\sin 2t)', family: M('rolling circle'), form: '(2a\\cos t + a\\cos 2t, 2a\\sin t - a\\sin 2t)', name: 'deltoid' },
	{ id: 'nephroid', eq: '(3\\cos t - \\cos 3t, 3\\sin t - \\sin 3t)', family: M('rolling circle'), form: '(3a\\cos t - a\\cos 3t, 3a\\sin t - a\\sin 3t)', name: 'nephroid' }
];
