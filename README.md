# Equations

Equations and what they draw, a dataset for [Knack](https://github.com/lorien-danger/knack): add it by this repo's
link, or by the path of its folder.

It is for building a perception: to look at an equation and see its curve, and to look at a curve and feel which
equation draws it. So it is chosen, not generated. There are 215 equations in 34 families, from straight lines to
cycloids. Within a family the examples change **one thing at a time** (the same parabola moved, flipped, stretched),
because Knack offers the nearest wrong answers and those near neighbours are what teach the difference. Across
families, some are chosen because they **look alike but are not**: a parabola and a catenary, the bell curve, the
witch of Agnesi and 3/cosh x; tanh, arctan and the logistic curve; sin x and its cubic x − x³/6; the Archimedean,
Fermat and logarithmic spirals.

Needs the maths columns of Knack (`"type": "plane"`, knack#25, pull request knack#26).

## Suggested decks

| deck | columns | what it teaches |
| --- | --- | --- |
| **Equation and graph** | equation, graph | the core of it: see the curve in the formula, the formula in the curve |
| **Families and their general forms** | graph, family, general form | which kind of thing a curve is, and the form its equation takes |
| **Moving the parent** | graph, parent, made from its parent by | every curve here as its parent shifted, stretched and reflected |
| **Roots, turning points and repeats from the formula** | equation, roots, turning points, repeats | what to predict before drawing |
| **Ends, asymptotes and symmetry from the formula** | equation, far left & far right, asymptotes, symmetry | the same, for the shape far out and the symmetry |
| **A graph and its derivative** | graph, graph of the derivative, derivative | "which of these is its derivative"; often shown as three curves that share one derivative |

That is six rather than three or four: on a phone, Knack shows every other column of a deck under each row it
shows, without labels, and with five or more columns that was a stack too long to read (see "What the app can't do
yet").

## The families

| family | rows | what changes from row to row |
| --- | --- | --- |
| polynomial › line | 14 | slope, intercept; horizontal and vertical; the forms y = mx + c, ax + by = c, y − y₁ = m(x − x₁) |
| polynomial › quadratic | 23 | the same parabola moved, flipped, stretched; then factored and expanded forms, with 0, 1 or 2 roots |
| polynomial › cubic | 15 | moved; three roots, a double root (touches), a triple root (flattens through); turns with one root |
| polynomial › degree 4 and up | 7 | x⁴ and x⁵ against x² and x³; W and M shapes; two touching roots; five roots |
| rational › reciprocal, reciprocal square, quotient | 8, 4, 6 | 1/x moved; 1/x²; asymptotes vertical, horizontal and slanted; a curve that crosses its asymptote |
| root and absolute value | 7, 4, 8 | √x moved and mirrored; the semicircle; ∛x and its cusp ∛x²; \|x\| moved; \|x² − 4\| and 3\|sin x\| folded up |
| exponential and logarithm | 10, 4, 8, 5 | eˣ, 2ˣ, 10ˣ, (½)ˣ; a shift that is a stretch (e^{x−2}); logistic curves; ln, log₂, log₁₀; cosh, sinh, tanh |
| trigonometric | 13, 5, 3 | amplitude, period, phase and shift one at a time; sin²x; sin x + cos x; tan, cot, sec, csc; inverse functions |
| combination | 5, 4, 3, 4 | x sin x, a damped oscillation, a wave packet, sinc; bell curves; sin(x²), e^{sin x}; x + sin x; towards a square wave |
| conic section | 5, 4, 5, 5 | circles, ellipses, parabolas on their side, hyperbolas, each moved and in an expanded form |
| beyond the conics | 3, 5 | diamond, circle, squircle as one family (\|x\|ⁿ + \|y\|ⁿ = rⁿ); folium of Descartes; elliptic, cusped and nodal cubics |
| polar curve | 5, 5, 4, 3 | roses (n odd: n petals; n even: 2n); cardioids and limaçons; four spirals; lemniscates |
| parametric curve | 5, 3, 3 | Lissajous figures by ratio and phase; cycloid, curtate and prolate; astroid, deltoid, nephroid |

Every graph is drawn in the same window, x and y from −5 to 5, so any two can be compared at a glance, and each
equation was chosen so that its interesting part (its roots, turns and asymptotes) is inside it; the build checks
that.

## Columns

| column | label | type | what it is, and how it was worked out |
| --- | --- | --- | --- |
| equation | Equation | plane (written) | the equation as written: chosen by hand (`build/curves.ts`), read and drawn by the app's own code |
| graph | Graph | plane (drawn) | the same equation, drawn: tap the graph |
| name | Name | plain | the curve's own name where it has one (cardioid, catenary, witch of Agnesi…): 70 rows |
| family | Family | tree | e.g. trigonometric › sine and cosine. "The same family" is a pattern the app asks through |
| general form | General form | plain, TeX | the form its equation takes: y = a(x − h)² + k, y = a(x − p)(x − q), r = a cos nθ… |
| parent | Parent | plane (written) | the simplest member it is made from (y = x², x² + y² = 1): 124 rows |
| made from its parent by | Made from its parent by | parts | shifted right/left/up/down, stretched or squashed vertically/horizontally, enlarged, shrunk, reflected in an axis |
| roots | Roots | plain | "no roots", "2 roots", "infinitely many roots": where y = 0, over all real x |
| turning points | Turning points | plain | local maxima and minima (a corner counts), over all real x |
| repeats every | Repeats | plain | "repeats every 2π", "never repeats" |
| far left, far right | Far left, far right | plain | what y does as x → −∞ and +∞: up, down, levels off, waves, growing waves, repeats, or stops (the domain ends) |
| asymptotes | Asymptotes | parts | x = 2, y = 0, y = x + 1, x = π/2 + nπ, or "no asymptotes" |
| symmetry | Symmetry | parts | for a function: even, odd, or neither even nor odd; for a curve: about the y-axis, the x-axis, the origin, y = x, or none |
| meets the y-axis at | Meets the y-axis at | number | y at x = 0 |
| derivative | Derivative | plane (written) | dy/dx |
| derivative graph | Graph of the derivative | plane (drawn) | the same, drawn in the same window as the graph |

Roots, turning points, repeats, far left and right, the y-intercept and the derivative are for the 160 rows that are
y as one function of x (which includes 2x + 3y = 6 and xy = 2, solved for y). Symmetry and asymptotes are for all.

### How each column was worked out and checked

`build/build.ts` reads every equation with the app's own reader (`src/lib/engine/plane` of a Knack checkout), so what
is checked is what the app draws. It asks `build/derive.py` (sympy) for the symbolic parts. Then it checks every fact
numerically before writing it, and a fact that fails stops the build:

- **derivative**: sympy differentiates. Of its writings, the one used is the shortest that brings in no function the
  equation doesn't have (so no cosh in a logistic curve's derivative). Nine are written by hand for clarity
  (sec²x, ∛ forms), and are checked the same way. Each must match the slope of the equation, as the app evaluates
  it, at a thousand points across the window.
- **roots and turning points**: counted numerically on a grid of 0.001 from −60 to 60, with crossings found by a
  change of sign that isn't a jump, and touchings found by |y| coming down to 0. A count that grows between ±30 and
  ±60 is "infinitely many". Every finite root and turning point must lie in the window (none falls outside).
- **asymptotes**: sympy gives where the function is undefined and its limits at ±∞ (y = c, or y = mx + c). Each is
  checked: |y| must grow without bound next to a vertical one (sin x / x at 0 is not one, and is left out), and the
  curve must close in on a horizontal or slanted one far out. A curve's asymptotes (the hyperbolas, the folium, the
  hyperbolic spiral) are written in `curves.ts`, and the build checks that the curve comes within 0.05 of them far out.
- **period**: sympy's period, cut down to the smallest that works (sympy says 2π for sin²x). It is checked to repeat,
  and checked not to repeat at a half, third, …, sixth of it.
- **far left, far right**: from sympy's limits and domain, checked on values out to 10¹².
- **symmetry**: f(−x) against ±f(x) at 4000 points for a function. For a curve, the drawn points are reflected and
  must land back on the drawing.
- **made from its parent by**: written in `curves.ts` as numbers (y = a·p(b(x − h)) + k, or a scale and shift of
  the plane for a curve), checked against the parent moved that way, and turned into words by rule. Sympy's limits
  of 2ˣ are wrong, so exponentials are rewritten as e^{x ln b} first.
- **the curves against each other**: no two rows draw the same thing (the app's own test), and no two lie closer
  than 0.3 of a unit everywhere, which looks like the same curve at phone size (x⁴ and x⁶ were taken out for this).
  `build/neighbours.txt` lists each curve's five nearest as the app measures it, which are the wrong answers it will
  offer first.

What the build found is in [`build/checks.txt`](build/checks.txt), with counts of every value.

## Building it

Needs Node, Python 3 with sympy, and a checkout of the Knack app (with knack#26) next to this folder:

    pip install sympy mpmath
    cd build
    npm install
    npx tsx build.ts ../../knack      # the app's folder; writes ../columns.json, ../rows.jsonl, checks.txt, neighbours.txt

`build/columns.json` holds the column definitions and the suggested decks, and the build copies it to the top with
the window added to every plane column. To add a curve, add a line to `build/curves.ts` and build. The build says
what is wrong with it, if anything.

## What the app can't do yet (as of knack#26)

- **TeX in a list column.** `"tex": true` on a `parts` column shows the TeX source (`\frac{\pi}{2}`) in the Columns
  screen and in practice. So asymptotes are written in plain text (x = π/2 + nπ).
- **Several rows, several columns.** When a question shows several rows that share something, each row's other
  columns are stacked under it without labels. With many columns the stack runs under the answer bar, and graphs
  of different heights overlap their neighbours. Long typeset forms overlap too. That is why the decks are small
  and the values say what they are ("2 roots", not "2").
- **Holes.** A removable gap (a hole in (x² − 1)/(x − 1)) is drawn as a whole line, so there are no examples of holes.
- **The title.** Only 70 rows have a name, and the app shows "–" for a row's title where it has none (on the
  Columns screen, and in a deck marked by the learner). It never showed in the practice runs here.
- **One window per column.** Every graph shares x, y ∈ [−5, 5]. It suits comparison, but sin(x/2) shows less than
  a period and tan's derivative leaves the window.

## Licence

[CC0 1.0](LICENSE): public domain. Nothing here is anyone else's: every equation was chosen for this dataset and
everything about it is computed.
