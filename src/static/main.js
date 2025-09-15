// Refs
const svg = document.getElementById('svg');
const viewport = document.getElementById('viewport');
const gridPattern = document.getElementById('gridPattern');
const gridRect = document.getElementById('gridRect');
const tree = document.getElementById('tree');

const btnAddClass = document.getElementById('btnAddClass');
const btnAddPackage = document.getElementById('btnAddPackage');
const btnLinkMode = document.getElementById('btnLinkMode');
const linkTypeSel = document.getElementById('linkType');
const btnGenerate = document.getElementById('btnGenerate');
const btnClear = document.getElementById('btnClear');

const noSel = document.getElementById('noSelection');
const classEditor = document.getElementById('classEditor');
const packageEditor = document.getElementById('packageEditor');
const inClsName = document.getElementById('clsName');
const inAttrs = document.getElementById('clsAttrs');
const inOps = document.getElementById('clsOps');
const inClsPkg = document.getElementById('clsPackage');
const btnUpdate = document.getElementById('btnUpdate');
const btnDelete = document.getElementById('btnDelete');
const inPkgName = document.getElementById('pkgName');
const btnPkgUpdate = document.getElementById('btnPkgUpdate');
const btnPkgDelete = document.getElementById('btnPkgDelete');
const inModelName = document.getElementById('modelName');
const inGridSize = document.getElementById('gridSize');

const state = {
    classes: [],
    packages: [],
    relations: [],
    selected: null,
    linkMode: false,
    tempEdge: null,
    nextId: 1,
    pan: { x: 0, y: 0 },
    interaction: null // {mode:'pan'|'drag-class'|'drag-package'|'resize-package'|'link-preview', pointerId, start:{...}, data:{...}}
};

// rAF
let rafId = null;
function scheduleRender() { if (rafId !== null) return; rafId = requestAnimationFrame(() => { rafId = null; render(); }); }

// Utils
function uid(prefix) { return prefix + (state.nextId++); }
function classById(id) { return state.classes.find(c => c.id === id); }
function packageById(id) { return state.packages.find(p => p.id === id); }
function center(el) { return [el.x + el.w / 2, el.y + el.h / 2]; }
function snap(v, step) { return Math.round(v / step) * step; }
function screenToWorld(cx, cy) { const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy; const m = viewport.getScreenCTM().inverse(); const loc = pt.matrixTransform(m); return { x: loc.x, y: loc.y }; }

// Adders
function addClass(x, y) { const id = uid('C'); state.classes.push({ id, name: 'Class' + state.nextId, x, y, w: 200, h: 110, attributes: [], operations: [], packageId: null }); select('class', id); scheduleRender(); }
function addPackage(x, y) { const id = uid('P'); state.packages.push({ id, name: 'Module' + state.nextId, x, y, w: 360, h: 240 }); select('package', id); refreshPackageSelect(); scheduleRender(); }

// Editors
function select(type, id) { state.selected = { type, id }; updateEditors(); scheduleRender(); }
function updateEditors() {
    const sel = state.selected;
    if (!sel) { noSel.classList.remove('hidden'); classEditor.classList.add('hidden'); packageEditor.classList.add('hidden'); return; }
    noSel.classList.add('hidden');
    if (sel.type === 'class') {
        classEditor.classList.remove('hidden'); packageEditor.classList.add('hidden');
        const c = classById(sel.id);
        inClsName.value = c.name; inAttrs.value = c.attributes.join('\n'); inOps.value = c.operations.join('\n');
        refreshPackageSelect(); inClsPkg.value = c.packageId || '';
    } else {
        packageEditor.classList.remove('hidden'); classEditor.classList.add('hidden');
        const p = packageById(sel.id); inPkgName.value = p.name;
    }
}
function refreshPackageSelect() {
    const val = inClsPkg.value; inClsPkg.innerHTML = '';
    const optNone = document.createElement('option'); optNone.value = ''; optNone.textContent = '(none)'; inClsPkg.appendChild(optNone);
    state.packages.forEach(p => { const o = document.createElement('option'); o.value = p.id; o.textContent = p.name; inClsPkg.appendChild(o); });
    if (val) inClsPkg.value = val;
}
function applyClassEditor() {
    const sel = state.selected; if (!sel || sel.type !== 'class') return;
    const c = classById(sel.id);
    c.name = inClsName.value.trim() || 'Class';
    c.attributes = inAttrs.value.split('\n').map(s => s.trim()).filter(Boolean);
    c.operations = inOps.value.split('\n').map(s => s.trim()).filter(Boolean);
    c.packageId = inClsPkg.value || null;
    const base = 28, line = 18, sep = 12; const attrH = c.attributes.length ? (c.attributes.length * line + sep) : sep; const opH = c.operations.length ? (c.operations.length * line + sep) : sep;
    c.h = base + sep + attrH + opH + 10; scheduleRender();
}
function applyPackageEditor() { const sel = state.selected; if (!sel || sel.type !== 'package') return; const p = packageById(sel.id); p.name = inPkgName.value.trim() || 'Module'; scheduleRender(); refreshPackageSelect(); }

// Tree
function renderTree() {
    const div = document.createElement('div'); div.className = 'space-y-2';
    const root = document.createElement('div'); root.innerHTML = `<div class="font-semibold">Model: ${inModelName.value || 'Diagram'}</div>`; div.appendChild(root);
    state.packages.forEach(p => {
        const wrap = document.createElement('div'); wrap.className = 'pl-2';
        const h = document.createElement('div'); h.className = 'cursor-pointer hover:text-sky-300'; h.textContent = '📦 ' + p.name; h.onclick = () => select('package', p.id); wrap.appendChild(h);
        const ul = document.createElement('ul'); ul.className = 'pl-4 list-disc';
        state.classes.filter(c => c.packageId === p.id).forEach(c => { const li = document.createElement('li'); li.className = 'cursor-pointer hover:text-sky-300'; li.textContent = '📄 ' + c.name; li.onclick = () => select('class', c.id); ul.appendChild(li); });
        wrap.appendChild(ul); div.appendChild(wrap);
    });
    const orphans = state.classes.filter(c => !c.packageId);
    if (orphans.length) {
        const wrap = document.createElement('div'); wrap.className = 'pl-2'; const h = document.createElement('div'); h.textContent = '📁 (no module)'; wrap.appendChild(h);
        const ul = document.createElement('ul'); ul.className = 'pl-4 list-disc'; orphans.forEach(c => { const li = document.createElement('li'); li.className = 'cursor-pointer hover:text-sky-300'; li.textContent = '📄 ' + c.name; li.onclick = () => select('class', c.id); ul.appendChild(li); }); wrap.appendChild(ul); div.appendChild(wrap);
    }
    if (state.relations.length) {
        const rel = document.createElement('div'); rel.className = 'pl-2'; const h = document.createElement('div'); h.textContent = '🔗 Relations'; rel.appendChild(h);
        const ul = document.createElement('ul'); ul.className = 'pl-4 list-disc'; state.relations.forEach(r => { const a = classById(r.source), b = classById(r.target); const li = document.createElement('li'); li.textContent = `${r.type}: ${(a?.name) || r.source} → ${(b?.name) || r.target}`; ul.appendChild(li); });
        rel.appendChild(ul); div.appendChild(rel);
    }
    tree.innerHTML = ''; tree.appendChild(div);
}

// Geometry
function intersectRect(c, x2, y2) { const x1 = c.x + c.w / 2, y1 = c.y + c.h / 2; const dx = x2 - x1, dy = y2 - y1; const absDX = Math.abs(dx), absDY = Math.abs(dy); let tx = c.w / 2 / absDX, ty = c.h / 2 / absDY; if (!isFinite(tx)) tx = Infinity; if (!isFinite(ty)) ty = Infinity; let t = Math.min(tx, ty); return [x1 + dx * t, y1 + dy * t]; }
function isClassInsidePackage(c, p, includeEdge = false) { const cx = c.x + c.w / 2, cy = c.y + c.h / 2; const top = p.y + 16, left = p.x, right = p.x + p.w, bottom = p.y + p.h + 16; const tol = includeEdge ? 0 : 1e-6; return (cx >= left - tol && cx <= right + tol && cy >= top - tol && cy <= bottom + tol); }
function detectContainingPackage(c) { for (const p of state.packages) if (isClassInsidePackage(c, p)) return p; return null; }

// Interaction starts
function beginPan(e) { state.interaction = { mode: 'pan', pointerId: e.pointerId, start: { x: e.clientX, y: e.clientY, panX: state.pan.x, panY: state.pan.y } }; svg.setPointerCapture(e.pointerId); document.body.classList.add('panning'); }
function beginDragClass(e, c) { const pt = screenToWorld(e.clientX, e.clientY); state.interaction = { mode: 'drag-class', pointerId: e.pointerId, start: { px: pt.x, py: pt.y, x: c.x, y: c.y, id: c.id } }; svg.setPointerCapture(e.pointerId); }
function beginDragPackage(e, p) { const pt = screenToWorld(e.clientX, e.clientY); state.interaction = { mode: 'drag-package', pointerId: e.pointerId, start: { px: pt.x, py: pt.y, x: p.x, y: p.y, id: p.id } }; svg.setPointerCapture(e.pointerId); }
function beginResizePackage(e, pkgId, dirKey) { const p = packageById(pkgId); const dir = { n: false, e: false, s: false, w: false }; if (dirKey.includes('n')) dir.n = true; if (dirKey.includes('e')) dir.e = true; if (dirKey.includes('s')) dir.s = true; if (dirKey.includes('w')) dir.w = true; const pt = screenToWorld(e.clientX, e.clientY); state.interaction = { mode: 'resize-package', pointerId: e.pointerId, start: { px: pt.x, py: pt.y, x: p.x, y: p.y, w: p.w, h: p.h, id: p.id, dir } }; e.target.setPointerCapture(e.pointerId); }
function beginLinkingOnClass(e, c) {
    if (!state.linkMode) return;
    if (!state.tempEdge) { const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); const [cx, cy] = center(c); l.setAttribute('x1', cx); l.setAttribute('y1', cy); l.setAttribute('x2', cx); l.setAttribute('y2', cy); l.setAttribute('class', 'edge association'); viewport.appendChild(l); state.tempEdge = l; state.tempEdge.dataset.source = c.id; }
    else { const src = state.tempEdge.dataset.source; addRelation(linkTypeSel.value, src, c.id); state.tempEdge.remove(); state.tempEdge = null; state.linkMode = false; btnLinkMode.textContent = 'Start Link'; }
}

// Buttons
btnAddClass.addEventListener('click', () => { const { x, y } = screenToWorld(window.innerWidth / 2, window.innerHeight / 2); addClass(x + 40, y + 40); });
btnAddPackage.addEventListener('click', () => { const { x, y } = screenToWorld(window.innerWidth / 2, window.innerHeight / 2); addPackage(x - 60, y - 60); });
btnLinkMode.addEventListener('click', () => { state.linkMode = !state.linkMode; btnLinkMode.textContent = state.linkMode ? 'End Link' : 'Start Link'; });
btnClear.addEventListener('click', () => { if (confirm('Clear the diagram?')) { state.classes = []; state.packages = []; state.relations = []; state.selected = null; refreshPackageSelect(); scheduleRender(); } });
btnUpdate.addEventListener('click', applyClassEditor);
btnPkgUpdate.addEventListener('click', applyPackageEditor);
btnDelete.addEventListener('click', () => { const s = state.selected; if (s?.type === 'class') { const i = state.classes.findIndex(c => c.id === s.id); if (i >= 0) state.classes.splice(i, 1); state.relations = state.relations.filter(r => r.source !== s.id && r.target !== s.id); state.selected = null; scheduleRender(); } });
btnPkgDelete.addEventListener('click', () => { const s = state.selected; if (s?.type === 'package') { const i = state.packages.findIndex(p => p.id === s.id); if (i >= 0) state.packages.splice(i, 1); state.classes.forEach(c => { if (c.packageId === s.id) c.packageId = null; }); state.selected = null; refreshPackageSelect(); scheduleRender(); } });
inGridSize.addEventListener('change', () => { const step = Math.max(4, parseInt(inGridSize.value || '16', 10)); gridPattern.setAttribute('width', step); gridPattern.setAttribute('height', step); scheduleRender(); });

// Pointer events (unified)
svg.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('rect.handle');
    const nodeG = e.target.closest('g.node');
    const pkgLbl = e.target.closest('text.pkg-label'); // DRAG MODULE ONLY FROM LABEL
    const pkgG = e.target.closest('g.package');

    if (handle && pkgG) { beginResizePackage(e, pkgG.dataset.id, handle.dataset.dir); e.preventDefault(); return; }
    if (nodeG) {
        const c = classById(nodeG.dataset.id);
        if (state.linkMode) { beginLinkingOnClass(e, c); e.preventDefault(); return; }
        select('class', c.id); beginDragClass(e, c); e.preventDefault(); return;
    }
    if (pkgLbl && pkgG) {
        const p = packageById(pkgG.dataset.id);
        if (state.linkMode) { e.preventDefault(); return; } // ignore linking from package
        select('package', p.id); beginDragPackage(e, p); e.preventDefault(); return;
    }
    // background -> pan
    beginPan(e); e.preventDefault();
});

svg.addEventListener('pointermove', (e) => {
    if (!state.interaction) {
        if (state.tempEdge) { const src = classById(state.tempEdge.dataset.source); if (src) { const [sx, sy] = center(src); const pt = screenToWorld(e.clientX, e.clientY); state.tempEdge.setAttribute('x1', sx); state.tempEdge.setAttribute('y1', sy); state.tempEdge.setAttribute('x2', pt.x); state.tempEdge.setAttribute('y2', pt.y); } }
        return;
    }
    const step = Math.max(4, parseInt(inGridSize.value || '16', 10));
    const mode = state.interaction.mode;
    if (mode === 'pan') { const dx = e.clientX - state.interaction.start.x; const dy = e.clientY - state.interaction.start.y; state.pan = { x: state.interaction.start.panX + dx, y: state.interaction.start.panY + dy }; viewport.setAttribute('transform', `translate(${state.pan.x},${state.pan.y})`); return; }
    if (mode === 'drag-class') { const s = state.interaction.start; const pt = screenToWorld(e.clientX, e.clientY); const c = classById(s.id); if (!c) return; c.x = snap(s.x + (pt.x - s.px), step); c.y = snap(s.y + (pt.y - s.py), step); c.packageId = detectContainingPackage(c)?.id || null; scheduleRender(); return; }
    if (mode === 'drag-package') { const s = state.interaction.start; const pt = screenToWorld(e.clientX, e.clientY); const p = packageById(s.id); if (!p) return; const nx = snap(s.x + (pt.x - s.px), step); const ny = snap(s.y + (pt.y - s.py), step); const dx = nx - p.x, dy = ny - p.y; p.x = nx; p.y = ny; state.classes.forEach(c => { if (isClassInsidePackage(c, p, true)) { c.x += dx; c.y += dy; } }); scheduleRender(); return; }
    if (mode === 'resize-package') { const s = state.interaction.start; const pt = screenToWorld(e.clientX, e.clientY); const p = packageById(s.id); if (!p) return; const d = s.dir; let x = s.x, y = s.y, w = s.w, h = s.h; const dx = pt.x - s.px, dy = pt.y - s.py; if (d.w) { x = snap(s.x + dx, step); w = snap(s.w - dx, step); } if (d.e) { w = snap(s.w + dx, step); } if (d.n) { y = snap(s.y + dy, step); h = snap(s.h - dy, step); } if (d.s) { h = snap(s.h + dy, step); } w = Math.max(160, w); h = Math.max(120, h); if (d.w) x = Math.min(x, s.x + s.w - 160); if (d.n) y = Math.min(y, s.y + s.h - 120); p.x = x; p.y = y; p.w = w; p.h = h; const g = document.querySelector(`g.package[data-id="${p.id}"]`); if (g) updatePackageDom(g, p); return; }
});

svg.addEventListener('pointerup', (e) => {
    if (state.interaction && e.pointerId === state.interaction.pointerId) {
        try { if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) e.target.releasePointerCapture(e.pointerId); } catch (_) { }
        try { svg.releasePointerCapture?.(e.pointerId); } catch (_) { }
        state.interaction = null; document.body.classList.remove('panning'); scheduleRender();
    }
});

// DOM update helpers
function updatePackageDom(g, p) {
    g.setAttribute('transform', `translate(${p.x},${p.y})`);
    const body = g.querySelector('rect.body'); body.setAttribute('width', p.w); body.setAttribute('height', p.h);
    const header = g.querySelector('rect.header'); header.setAttribute('width', Math.max(120, p.w * 0.4));
    const map = { nw: [0, 16], n: [p.w / 2, 16], ne: [p.w, 16], w: [0, 16 + p.h / 2], e: [p.w, 16 + p.h / 2], sw: [0, 16 + p.h], s: [p.w / 2, 16 + p.h], se: [p.w, 16 + p.h] };
    g.querySelectorAll('rect.handle').forEach(h => { const key = Array.from(h.classList).find(c => ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].includes(c)); if (!key) return; const [hx, hy] = map[key]; h.setAttribute('x', hx - 5); h.setAttribute('y', hy - 5); });
}

// Relations and render
function addRelation(type, source, target) { if (!source || !target || source === target) return; const id = uid('R'); state.relations.push({ id, type, source, target }); scheduleRender(); }

function render() {
    while (viewport.lastChild && viewport.lastChild !== gridRect) viewport.removeChild(viewport.lastChild);

    // Packages
    const pkgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g'); viewport.appendChild(pkgLayer);
    state.packages.forEach(p => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'package'); g.dataset.id = p.id; g.setAttribute('transform', `translate(${p.x},${p.y})`);
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); body.setAttribute('x', 0); body.setAttribute('y', 16); body.setAttribute('width', p.w); body.setAttribute('height', p.h); body.setAttribute('class', 'body'); body.setAttribute('pointer-events', 'none'); g.appendChild(body);
        const header = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); header.setAttribute('x', 0); header.setAttribute('y', 0); header.setAttribute('width', Math.max(120, p.w * 0.4)); header.setAttribute('height', 24); header.setAttribute('class', 'header'); header.setAttribute('pointer-events', 'none'); g.appendChild(header);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text'); label.setAttribute('x', 8); label.setAttribute('y', 16); label.textContent = p.name; label.setAttribute('class', 'pkg-label'); // pointer events ON for label drag
        g.appendChild(label);

        // Handles
        const defs = [{ k: 'nw', x: 0, y: 16, cls: 'handle nw' }, { k: 'n', x: p.w / 2, y: 16, cls: 'handle n' }, { k: 'ne', x: p.w, y: 16, cls: 'handle ne' }, { k: 'w', x: 0, y: 16 + p.h / 2, cls: 'handle w' }, { k: 'e', x: p.w, y: 16 + p.h / 2, cls: 'handle e' }, { k: 'sw', x: 0, y: 16 + p.h, cls: 'handle sw' }, { k: 's', x: p.w / 2, y: 16 + p.h, cls: 'handle s' }, { k: 'se', x: p.w, y: 16 + p.h, cls: 'handle se' }];
        defs.forEach(h => { const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); r.setAttribute('x', h.x - 5); r.setAttribute('y', h.y - 5); r.setAttribute('width', 10); r.setAttribute('height', 10); r.setAttribute('class', h.cls); r.dataset.dir = h.k; r.style.touchAction = 'none'; r.addEventListener('pointerdown', (e) => beginResizePackage(e, p.id, h.k)); g.appendChild(r); });

        pkgLayer.appendChild(g);
    });

    // Edges
    const edgeLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g'); viewport.appendChild(edgeLayer);
    state.relations.forEach(r => {
        const a = classById(r.source), b = classById(r.target); if (!a || !b) return; const [x1, y1] = center(a), [x2, y2] = center(b); const [sx, sy] = intersectRect(a, x2, y2); const [tx, ty] = intersectRect(b, x1, y1);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); line.setAttribute('x1', sx); line.setAttribute('y1', sy); line.setAttribute('x2', tx); line.setAttribute('y2', ty);
        let cls = 'edge '; if (r.type === 'association') cls += 'association'; if (r.type === 'generalization') cls += 'generalization'; if (r.type === 'dependency') cls += 'dependency dashed'; if (r.type === 'realization') cls += 'realization dashed'; if (r.type === 'aggregation') cls += 'aggregation'; if (r.type === 'composition') cls += 'composition';
        line.setAttribute('class', cls); edgeLayer.appendChild(line);
    });

    // Nodes
    const nodeLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g'); viewport.appendChild(nodeLayer);
    state.classes.forEach(c => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); const isSel = state.selected?.type === 'class' && state.selected.id === c.id; g.setAttribute('class', 'node' + (isSel ? ' selected' : '')); g.dataset.id = c.id; g.setAttribute('transform', `translate(${c.x},${c.y})`);
        const rect = svgRect(0, 0, c.w, c.h); g.appendChild(rect);
        let y = 10; const title = svgText(10, y + 16, c.name, 'title'); g.appendChild(title); y += 28;
        const sep1 = svgLine(0, y, c.w, y); sep1.setAttribute('class', 'compartment'); g.appendChild(sep1); y += 16;
        c.attributes.forEach(a => { g.appendChild(svgText(10, y, a)); y += 18; }); if (c.attributes.length === 0) y += 8;
        const sep2 = svgLine(0, y, c.w, y); sep2.setAttribute('class', 'compartment'); g.appendChild(sep2); y += 16;
        c.operations.forEach(o => { g.appendChild(svgText(10, y, o)); y += 18; });
        nodeLayer.appendChild(g);
    });

    viewport.setAttribute('transform', `translate(${state.pan.x},${state.pan.y})`);
    updateEditors(); renderTree();
}

function svgRect(x, y, w, h) { const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', w); r.setAttribute('height', h); return r; }
function svgLine(x1, y1, x2, y2) { const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); return l; }
function svgText(x, y, text, cls = null) { const t = document.createElementNS('http://www.w3.org/2000/svg', 'text'); t.setAttribute('x', x); t.setAttribute('y', y); if (cls) t.setAttribute('class', cls); t.textContent = text; return t; }

// Generate: POST XMI → /generate (funkcjonalność bez zmian)
btnGenerate.addEventListener('click', exportAndGenerateZip);
async function exportAndGenerateZip() {
    try {
        setGenerateBusy(true);
        const xml = buildXMI();
        const resp = await fetch('/generate', { method: 'POST', headers: { 'Content-Type': 'application/xml', 'Accept': 'application/zip' }, body: xml });
        if (!resp.ok) throw new Error('Server error: ' + resp.status);
        const suggested = getFilenameFromDisposition(resp.headers.get('Content-Disposition')) || 'generated.zip';
        const blob = await resp.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = suggested; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
    } catch (err) { alert('Generation failed: ' + err.message); }
    finally { setGenerateBusy(false); }
}
function setGenerateBusy(b) { btnGenerate.disabled = b; btnGenerate.textContent = b ? 'Generating…' : 'Generate'; }
function getFilenameFromDisposition(cd) { if (!cd) return null; const mStar = cd.match(/filename\\*=(?:UTF-8''|)([^;]+)/i); if (mStar) return decodeURIComponent(mStar[7].replace(/(^\"|\"$)/g, '')); const m = cd.match(/filename=\"?([^\";]+)\"?/i); return m ? m[7] : null; }

// XMI (bez zmian merytorycznych)
function buildXMI() {
    const xmiNS = 'http://www.omg.org/XMI', umlNS = 'http://www.eclipse.org/uml2/5.0.0/UML';
    const doc = document.implementation.createDocument('', '', null);
    const xmi = doc.createElementNS(xmiNS, 'xmi:XMI'); xmi.setAttribute('xmlns:xmi', xmiNS); xmi.setAttribute('xmlns:uml', umlNS); xmi.setAttribute('xmi:version', '2.1');
    const model = doc.createElementNS(umlNS, 'uml:Model'); model.setAttribute('xmi:id', 'model1'); model.setAttribute('name', inModelName.value || 'Diagram');
    const pkgNodeById = new Map();
    state.packages.forEach(pkg => { const pe = doc.createElementNS(umlNS, 'packagedElement'); pe.setAttribute('xmi:type', 'uml:Package'); pe.setAttribute('xmi:id', pkg.id); pe.setAttribute('name', pkg.name || 'Module'); model.appendChild(pe); pkgNodeById.set(pkg.id, pe); });
    state.classes.forEach(cls => {
        const el = doc.createElementNS(umlNS, 'packagedElement'); el.setAttribute('xmi:type', 'uml:Class'); el.setAttribute('xmi:id', cls.id); el.setAttribute('name', cls.name || 'Class');
        cls.attributes.forEach((a, i) => { const [nm, type] = (a || '').split(':').map(s => (s || '').trim()); const attr = doc.createElementNS(umlNS, 'ownedAttribute'); attr.setAttribute('xmi:id', `${cls.id}_attr_${i + 1}`); attr.setAttribute('name', nm || `attr${i + 1}`); if (type) attr.setAttribute('type', type); el.appendChild(attr); });
        cls.operations.forEach((o, i) => { const nm = (o.split('(') || o).trim() || `op${i + 1}`; const op = doc.createElementNS(umlNS, 'ownedOperation'); op.setAttribute('xmi:id', `${cls.id}_op_${i + 1}`); op.setAttribute('name', nm); el.appendChild(op); });
        state.relations.filter(r => r.type === 'generalization' && r.source === cls.id).forEach((r, i) => { const gen = doc.createElementNS(umlNS, 'generalization'); gen.setAttribute('xmi:id', `${cls.id}_gen_${i + 1}`); gen.setAttribute('general', r.target); el.appendChild(gen); });
        if (cls.packageId && pkgNodeById.has(cls.packageId)) pkgNodeById.get(cls.packageId).appendChild(el); else model.appendChild(el);
    });
    state.relations.filter(r => ['association', 'aggregation', 'composition'].includes(r.type)).forEach((r, i) => {
        const assoc = doc.createElementNS(umlNS, 'packagedElement'); assoc.setAttribute('xmi:type', 'uml:Association'); assoc.setAttribute('xmi:id', r.id); assoc.setAttribute('name', `${r.type.toUpperCase() + r.type.slice(1)}${i + 1}`);
        const endA = doc.createElementNS(umlNS, 'ownedEnd'); endA.setAttribute('xmi:id', `${r.id}_end1`); endA.setAttribute('type', r.source); if (r.type === 'aggregation') endA.setAttribute('aggregation', 'shared'); if (r.type === 'composition') endA.setAttribute('aggregation', 'composite');
        const endB = doc.createElementNS(umlNS, 'ownedEnd'); endB.setAttribute('xmi:id', `${r.id}_end2`); endB.setAttribute('type', r.target);
        assoc.appendChild(endA); assoc.appendChild(endB); model.appendChild(assoc);
    });
    state.relations.filter(r => r.type === 'dependency').forEach((r, i) => { const dep = doc.createElementNS(umlNS, 'packagedElement'); dep.setAttribute('xmi:type', 'uml:Dependency'); dep.setAttribute('xmi:id', r.id); dep.setAttribute('name', `Dependency${i + 1}`); const client = doc.createElementNS(umlNS, 'client'); client.setAttribute('xmi:idref', r.source); const supplier = doc.createElementNS(umlNS, 'supplier'); supplier.setAttribute('xmi:idref', r.target); dep.appendChild(client); dep.appendChild(supplier); model.appendChild(dep); });
    state.relations.filter(r => r.type === 'realization').forEach((r, i) => { const rea = doc.createElementNS(umlNS, 'packagedElement'); rea.setAttribute('xmi:type', 'uml:Realization'); rea.setAttribute('xmi:id', r.id); rea.setAttribute('name', `Realization${i + 1}`); const client = doc.createElementNS(umlNS, 'client'); client.setAttribute('xmi:idref', r.source); const supplier = doc.createElementNS(umlNS, 'supplier'); supplier.setAttribute('xmi:idref', r.target); rea.appendChild(client); rea.appendChild(supplier); model.appendChild(rea); });
    xmi.appendChild(model); doc.appendChild(xmi); const serializer = new XMLSerializer(); return '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(doc);
}

// Init
(function init() {
    const step = Math.max(4, parseInt(inGridSize.value || '16', 10));
    gridPattern.setAttribute('width', step); gridPattern.setAttribute('height', step);
    addPackage(80, 80); addClass(140, 160); addClass(380, 240);
    scheduleRender();
})();