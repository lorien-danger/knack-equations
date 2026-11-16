"""
The symbolic half of the build: for each function y = f(x), its derivative, its asymptotes and its period, worked out
by sympy and written as TeX that the app reads. build.ts calls this with the functions as sympy expressions (made from
the app's own reading of each equation) and checks every answer numerically before using it.

    python3 derive.py in.json out.json      in: [{"id", "f" or "F"}]; out: {id: {"dCandidates", "period", "vertical", "left", "right", "ends", "explicit"}}

("F": an equation F(x, y) = 0, used when it gives y as one function of x)
"""
import json
import sys

import sympy as sp
from sympy import (Abs, Add, E, Integer, Mul, Number, Pow, Rational, Symbol, acos, asin, atan, ceiling, cos, cosh,
                   cot, csc, exp, floor, log, pi, sec, sign, sin, sinh, tan, tanh)

x = Symbol('x', real=True)
NS = {'x': x, 'E': E, 'pi': pi, 'Abs': Abs, 'sign': sign, 'floor': floor, 'ceiling': ceiling, 'log': log}

FN = {sin: r'\sin', cos: r'\cos', tan: r'\tan', sec: r'\sec', csc: r'\csc', cot: r'\cot', asin: r'\arcsin',
      acos: r'\arccos', atan: r'\arctan', sinh: r'\sinh', cosh: r'\cosh', tanh: r'\tanh'}


# ---- TeX, as a person would write it and as the app reads it (engine/plane/parse.ts) ----

def tex(e) -> str:
    return _add(e) if isinstance(e, Add) else _term(e)


def _add(e: Add) -> str:
    terms = e.as_ordered_terms()
    # a polynomial in its usual order (-2x + 2); anything else with a term that isn't negative first (\cos x - \sin x)
    if _is_neg(terms[0]) and not e.is_polynomial(x):
        first = next((t for t in terms if not _is_neg(t)), None)
        if first is not None:
            terms = [first] + [t for t in terms if t is not first]
    out = _term(terms[0])
    for t in terms[1:]:
        c, rest = t.as_coeff_Mul()
        if c < 0:
            out += ' - ' + _term(-t)
        else:
            out += ' + ' + _term(t)
    return out


def _is_neg(e) -> bool:
    c, _ = e.as_coeff_Mul()
    return c < 0


def _term(e) -> str:
    """a product, quotient, power or atom, with its sign"""
    if isinstance(e, Number):
        return _num(e)
    if _is_neg(e):
        return '-' + _term(-e)
    if isinstance(e, Mul) or (isinstance(e, Pow) and e.exp.is_number and e.exp < 0):
        num, den = [], []
        c = Integer(1)
        for f in Mul.make_args(e):
            if isinstance(f, Number):
                c *= f
            elif isinstance(f, Pow) and f.exp.is_number and f.exp < 0:
                den.append(Pow(f.base, -f.exp))
            elif isinstance(f, exp) and _is_neg(f.args[0]) and False:
                den.append(exp(-f.args[0]))
            else:
                num.append(f)
        p, q = sp.fraction(c)
        if den or q != 1:
            top = _product(([] if p == 1 else [p]) + num, alone=True) or '1'
            return r'\frac{%s}{%s}' % (top, _product(([] if q == 1 else [q]) + den, alone=True))
        return _product(([] if c == 1 else [c]) + num)
    return _factor(e)


def _product(fs, alone=False) -> str:
    """factors side by side: numbers first, then letters and powers, then functions (whose argument, written without
    brackets, runs up to the next function), so that nothing is read into a function's argument"""
    fs = list(fs)
    if not fs:
        return ''
    if alone and len(fs) == 1 and isinstance(fs[0], Add):
        return tex(fs[0])
    fns = [f for f in fs if _bare_fn(f)]
    rest = [f for f in fs if not _bare_fn(f)]
    def rank(f):
        if isinstance(f, Number) or f == pi:
            return 0
        if isinstance(f, Symbol) or (isinstance(f, Pow) and isinstance(f.base, Symbol)):
            return 1
        if isinstance(f, exp) or (isinstance(f, Pow) and f.base.is_number):
            return 2
        return 3
    rest.sort(key=rank)
    out = ''
    for f in rest + fns:
        s = _factor(f, in_product=len(fs) > 1)
        if out and (s[0].isdigit() and out[-1].isdigit() or s.startswith('-')):
            out += r' \cdot ' + s
        elif out and out[-1].isdigit() and s[0].isalpha():
            out += s
        elif out:
            out += ' ' + s
        else:
            out = s
    return out


def _bare_fn(f) -> bool:
    return isinstance(f, (sp.Function, log)) and not isinstance(f, (Abs, floor, ceiling, exp)) or (
        isinstance(f, Pow) and isinstance(f.base, sp.Function) and not isinstance(f.base, (Abs, exp)) and f.exp.is_Integer and f.exp > 0)


def _num(n) -> str:
    if n < 0:
        return '-' + _num(-n)
    if isinstance(n, Rational) and n.q != 1:
        return r'\frac{%d}{%d}' % (n.p, n.q)
    if isinstance(n, sp.Float):
        return ('%g' % n)
    return str(n)


def _simple_arg(a) -> bool:
    """an argument a function can take without brackets: x, 2x, \frac{x}{2}, πx"""
    if isinstance(a, Symbol):
        return True
    if isinstance(a, Mul):
        c, r = a.as_coeff_Mul()
        return c > 0 and (isinstance(r, Symbol) or (isinstance(r, Mul) and all(isinstance(f, Symbol) or f == pi for f in r.args)))
    return False


def _arg(a) -> str:
    return ' ' + tex(a) if _simple_arg(a) else '(' + tex(a) + ')'


def _factor(e, in_product=False) -> str:
    if isinstance(e, Number):
        return _num(e)
    if e == pi:
        return r'\pi'
    if e == E:
        return 'e'
    if isinstance(e, Symbol):
        return str(e)
    if isinstance(e, Add):
        return '(' + tex(e) + ')'
    if isinstance(e, exp):
        p = tex(e.args[0])
        return 'e^{%s}' % p if len(p) > 1 else 'e^%s' % p
    if isinstance(e, Abs):
        return '|%s|' % tex(e.args[0])
    if isinstance(e, sign):
        return r'\operatorname{sgn}' + _arg(e.args[0])
    if isinstance(e, floor):
        return r'\lfloor %s \rfloor' % tex(e.args[0])
    if isinstance(e, ceiling):
        return r'\lceil %s \rceil' % tex(e.args[0])
    if isinstance(e, log):
        return r'\ln' + (' ' + tex(e.args[0]) if isinstance(e.args[0], Number) else _arg(e.args[0]))
    if type(e) in FN:
        return FN[type(e)] + _arg(e.args[0])
    if isinstance(e, Pow):
        b, p = e.base, e.exp
        if p == Rational(1, 2):
            return r'\sqrt{%s}' % tex(b)
        if isinstance(p, Rational) and p.p == 1 and p.q > 2:
            return r'\sqrt[%d]{%s}' % (p.q, tex(b))
        if isinstance(p, Rational) and p.q == 2 and p.p > 1:
            return r'\sqrt{%s}' % tex(Pow(b, p.p)) if p.p != 3 else r'%s\sqrt{%s}' % (_factor(b), tex(b))
        if type(b) in FN and p.is_Integer and p > 0:
            return FN[type(b)] + '^%s' % p + _arg(b.args[0])
        if isinstance(b, log) and p.is_Integer and p > 0:
            return '(' + _factor(b) + ')^{%s}' % p
        if b == E:
            p = tex(p)
            return 'e^{%s}' % p if len(p) > 1 else 'e^%s' % p
        bs = _factor(b)
        if isinstance(b, (Mul, Pow)) or (isinstance(b, Number) and b < 0) or isinstance(b, (sp.Function,)) and not isinstance(b, Abs):
            bs = '(' + tex(b) + ')'
        ps = tex(p)
        return '%s^{%s}' % (bs, ps) if len(ps) > 1 else '%s^%s' % (bs, ps)
    raise ValueError('cannot write %r' % e)


# ---- derivative: the shortest of a few equivalent writings ----

def derivative(f):
    d = sp.diff(f, x)
    cands, written = [], {}
    for g in (d, sp.simplify(d), sp.factor(d), sp.together(d), sp.expand(d), sp.trigsimp(d), sp.cancel(d)):
        try:
            s = tex(g)
        except Exception:
            continue
        if 'Derivative' in str(g) or g.has(sp.DiracDelta) or g.has(sp.Subs):
            continue
        if s not in cands:
            cands.append(s)
            written[s] = g
    # a writing that brings in no function f doesn't have (no \cosh in a logistic curve's derivative), then the shortest
    have = {type(a) for a in f.atoms(sp.Function)}
    def strange(g):
        return any(type(a) not in have for a in g.atoms(sp.Function))
    cands.sort(key=lambda s: (strange(written[s]), len(s)))
    return cands


# ---- asymptotes ----

def vertical(f, period):
    try:
        s = sp.singularities(f, x)
    except Exception:
        return None
    if s is sp.S.EmptySet:
        return []
    if isinstance(s, sp.FiniteSet):
        return ['x = ' + tex(v) for v in sorted(s, key=float)]
    if period is None:
        return None
    # infinitely many, repeating: those in one period, as a + nP
    inside = sorted({sp.nsimplify(v) for v in s.intersect(sp.Interval.Ropen(0, period)) if True}, key=float)
    if not inside:
        return None
    step = sp.nsimplify(period / len(inside))
    if all(sp.simplify(inside[i] - inside[0] - i * step) == 0 for i in range(len(inside))):
        a = inside[0]
        c = sp.nsimplify(step / pi)
        if not isinstance(c, Rational):
            return None
        top = ('' if c.p == 1 else str(c.p)) + r'n\pi'
        n = top if c.q == 1 else r'\frac{%s}{%d}' % (top, c.q)
        return ['x = %s + %s' % (tex(a), n) if a != 0 else 'x = ' + n]
    return None


def at_infinity(f, side):
    """y = c, or y = mx + c, that f approaches at one end; None if none (nor if f is that line far out)"""
    def approached(line):
        far = [sp.simplify((f - line).subs(x, v)) for v in ((100, 1001, 10007) if side == sp.oo else (-100, -1001, -10007))]
        return not all(v == 0 for v in far)
    try:
        m = sp.limit(f / x, x, side)
        if not isinstance(m, sp.AccumBounds) and m.is_number and m.is_finite and m.is_real and m != 0:
            c = sp.limit(f - m * x, x, side)
            if not isinstance(c, sp.AccumBounds) and c.is_number and c.is_finite and c.is_real and approached(m * x + c):
                return 'y = ' + tex(m * x + c)
            return None
        c = sp.limit(f, x, side)
        if not isinstance(c, sp.AccumBounds) and c.is_number and c.is_finite and c.is_real and approached(c):
            return 'y = ' + tex(c)
    except Exception:
        return None
    return None


def end(f, side, period):
    """what f does far out on one side: up, down, levels off, waves, growing waves, repeats; stops where its domain
    ends before that"""
    try:
        dom = sp.calculus.util.continuous_domain(f, x, sp.S.Reals)
        if (dom.sup if side == sp.oo else dom.inf).is_finite:
            return 'stops'
    except Exception:
        pass
    g0 = sp.lambdify(x, f, 'mpmath')
    import mpmath
    try:
        if any(mpmath.im(g0(v if side == sp.oo else -v)) != 0 for v in (100, 1000)):
            return 'stops'
    except (ValueError, ZeroDivisionError):
        return 'stops'
    if period is not None:
        return 'repeats'
    try:
        L = sp.limit(f, x, side)
    except Exception:
        L = None
    if L == sp.oo:
        return 'up'
    if L == -sp.oo:
        return 'down'
    if L is not None and not isinstance(L, sp.AccumBounds) and L.is_number and L.is_finite and L.is_real:
        return 'levels off'
    g = sp.lambdify(x, f, 'mpmath')
    far = [abs(float(g(v if side == sp.oo else -v))) for v in (50, 75.3, 100.7, 150.1, 200.9, 300.3, 400.1)]
    return 'waves' if max(far) < 20 else 'growing waves'


def explicit(F):
    """an equation F(x, y) = 0 that gives y as one function of x, as that function"""
    y = Symbol('y', real=True)
    try:
        sols = sp.solve(F.subs(Symbol('y'), y), y)
    except Exception:
        return None
    return sols[0] if len(sols) == 1 and not sols[0].has(y) else None


def fundamental(f, period):
    """sympy's period may be a multiple of the smallest (it gives 2π for sin² x): the smallest P/k that f repeats by"""
    g = sp.lambdify(x, f, 'mpmath')
    pts = [-2.917 + 0.6173 * i for i in range(12)]

    def repeats(p):
        for v in pts:
            try:
                a, b = complex(g(v)), complex(g(v + float(p)))
            except Exception:
                continue
            if abs(a - b) > 1e-9 * (1 + abs(a)):
                return False
        return True
    for k in (6, 5, 4, 3, 2):
        if repeats(period / k):
            return period / k
    return period


def main(src, dst):
    out = {}
    for row in json.load(open(src)):
        if 'F' in row:
            f = explicit(sp.sympify(row['F'], locals=NS))
            if f is None:
                continue
        else:
            f = sp.sympify(row['f'], locals=NS)
        try:
            period = sp.periodicity(f, x)
        except Exception:
            period = None
        if period == 0:
            period = None
        if period is not None:
            period = fundamental(f, period)
        # sympy's limits of b**x with a real x are wrong (2**x -> oo at -oo): as e**(x ln b) they are right
        f_lim = f.replace(lambda e: e.is_Pow and e.base.is_number and e.exp.has(x), lambda e: sp.exp(e.exp * sp.log(e.base)))
        r = {'dCandidates': derivative(f) if row.get('derive', True) else [],
             'period': tex(period) if period is not None else None,
             'periodValue': float(period) if period is not None else None,
             'vertical': vertical(f, period),
             'left': at_infinity(f_lim, -sp.oo), 'right': at_infinity(f_lim, sp.oo),
             'ends': [end(f_lim, -sp.oo, period), end(f_lim, sp.oo, period)],
             'explicit': 'y = ' + tex(f) if 'F' in row else None,
             'constant': not f.has(x)}
        out[row['id']] = r
        print('.', end='', flush=True, file=sys.stderr)
    print(file=sys.stderr)
    json.dump(out, open(dst, 'w'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
