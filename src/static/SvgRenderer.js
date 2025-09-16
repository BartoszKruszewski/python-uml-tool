import Geometry from "./Geometry.js";


export default class SvgRenderer {
  constructor(svg, viewport, gridRect, state) {
    this.svg = svg;
    this.viewport = viewport;
    this.gridRect = gridRect;
    this.state = state;
  }
  svgRect(x, y, w, h) {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('x', x); r.setAttribute('y', y);
    r.setAttribute('width', w); r.setAttribute('height', h);
    return r;
  }
  svgLine(x1, y1, x2, y2) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    return l;
  }
  svgText(x, y, text, cls = null) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    if (cls) t.setAttribute('class', cls);
    t.textContent = text;
    return t;
  }
  updatePackageDom(g, p) {
    g.setAttribute('transform', `translate(${p.x},${p.y})`);
    const body = g.querySelector('rect.body');
    body.setAttribute('width', p.w);
    body.setAttribute('height', p.h);
    const header = g.querySelector('rect.header');
    header.setAttribute('width', Math.max(120, p.w * 0.4));
    const map = {
      nw: [0, 16], n: [p.w / 2, 16], ne: [p.w, 16],
      w: [0, 16 + p.h / 2], e: [p.w, 16 + p.h / 2],
      sw: [0, 16 + p.h], s: [p.w / 2, 16 + p.h], se: [p.w, 16 + p.h]
    };
    g.querySelectorAll('rect.handle').forEach(h => {
      const key = Array.from(h.classList).find(c => ['nw','n','ne','w','e','sw','s','se'].includes(c));
      if (!key) return;
      const [hx, hy] = map[key];
      h.setAttribute('x', hx - 5);
      h.setAttribute('y', hy - 5);
    });
  }
  render(step) {
    // clear (keep gridRect)
    while (this.viewport.lastChild && this.viewport.lastChild !== this.gridRect) {
      this.viewport.removeChild(this.viewport.lastChild);
    }
    // packages
    const pkgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.viewport.appendChild(pkgLayer);
    this.state.packages.forEach(p => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'package');
      g.dataset.id = p.id;
      g.setAttribute('transform', `translate(${p.x},${p.y})`);

      const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      body.setAttribute('x', 0); body.setAttribute('y', 16);
      body.setAttribute('width', p.w); body.setAttribute('height', p.h);
      body.setAttribute('class', 'body');
      body.setAttribute('pointer-events', 'none');
      g.appendChild(body);

      const header = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      header.setAttribute('x', 0); header.setAttribute('y', 0);
      header.setAttribute('width', Math.max(120, p.w * 0.4));
      header.setAttribute('height', 24);
      header.setAttribute('class', 'header');
      header.setAttribute('pointer-events', 'none');
      g.appendChild(header);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', 8); label.setAttribute('y', 16);
      label.textContent = p.name;
      label.setAttribute('class', 'pkg-label');
      g.appendChild(label);

      const defs = [
        { k: 'nw', x: 0, y: 16, cls: 'handle nw' },
        { k: 'n', x: p.w / 2, y: 16, cls: 'handle n' },
        { k: 'ne', x: p.w, y: 16, cls: 'handle ne' },
        { k: 'w', x: 0, y: 16 + p.h / 2, cls: 'handle w' },
        { k: 'e', x: p.w, y: 16 + p.h / 2, cls: 'handle e' },
        { k: 'sw', x: 0, y: 16 + p.h, cls: 'handle sw' },
        { k: 's', x: p.w / 2, y: 16 + p.h, cls: 'handle s' },
        { k: 'se', x: p.w, y: 16 + p.h, cls: 'handle se' },
      ];
      defs.forEach(h => {
        const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('x', h.x - 5); r.setAttribute('y', h.y - 5);
        r.setAttribute('width', 10); r.setAttribute('height', 10);
        r.setAttribute('class', h.cls);
        r.dataset.dir = h.k;
        r.style.touchAction = 'none';
        r.addEventListener('pointerdown', (e) => this.onResizeHandle?.(e, p.id, h.k));
        g.appendChild(r);
      });

      pkgLayer.appendChild(g);
    });

    // edges
    const edgeLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.viewport.appendChild(edgeLayer);
    this.state.relations.forEach(r => {
      const a = this.state.classById(r.source), b = this.state.classById(r.target);
      if (!a || !b) return;
      const [x1, y1] = Geometry.center(a), [x2, y2] = Geometry.center(b);
      const [sx, sy] = Geometry.intersectRect(a, x2, y2);
      const [tx, ty] = Geometry.intersectRect(b, x1, y1);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', sx); line.setAttribute('y1', sy);
      line.setAttribute('x2', tx); line.setAttribute('y2', ty);
      let cls = 'edge ';
      if (r.type === 'association') cls += 'association';
      if (r.type === 'generalization') cls += 'generalization';
      if (r.type === 'dependency') cls += 'dependency dashed';
      if (r.type === 'realization') cls += 'realization dashed';
      if (r.type === 'aggregation') cls += 'aggregation';
      if (r.type === 'composition') cls += 'composition';
      line.setAttribute('class', cls);
      edgeLayer.appendChild(line);
    });

    // nodes
    const nodeLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.viewport.appendChild(nodeLayer);
    this.state.classes.forEach(c => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const isSel = this.state.selected?.type === 'class' && this.state.selected.id === c.id;
      g.setAttribute('class', 'node' + (isSel ? ' selected' : ''));
      g.dataset.id = c.id;
      g.setAttribute('transform', `translate(${c.x},${c.y})`);

      const rect = this.svgRect(0, 0, c.w, c.h);
      g.appendChild(rect);

      let y = 10;
      const title = this.svgText(10, y + 16, c.name, 'title');
      g.appendChild(title); y += 28;

      const sep1 = this.svgLine(0, y, c.w, y);
      sep1.setAttribute('class', 'compartment');
      g.appendChild(sep1); y += 16;

      c.attributes.forEach(a => { g.appendChild(this.svgText(10, y, a)); y += 18; });
      if (c.attributes.length === 0) y += 8;

      const sep2 = this.svgLine(0, y, c.w, y);
      sep2.setAttribute('class', 'compartment');
      g.appendChild(sep2); y += 16;

      c.operations.forEach(o => { g.appendChild(this.svgText(10, y, o)); y += 18; });
      nodeLayer.appendChild(g);
    });

    this.viewport.setAttribute('transform', `translate(${this.state.pan.x},${this.state.pan.y})`);
  }
}