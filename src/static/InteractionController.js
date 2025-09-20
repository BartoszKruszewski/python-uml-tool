import Coordinate from "./Coordinate.js";
import Geometry from "./Geometry.js";

export default class InteractionController {
  constructor(
    svg,
    viewport,
    state,
    renderer,
    linkService,
    gridStepProvider,
    selectCb,
    scheduleRenderCb
  ) {
    this.svg = svg;
    this.viewport = viewport;
    this.state = state;
    this.renderer = renderer;
    this.linkService = linkService;
    this.getStep = gridStepProvider;
    this.onSelect = selectCb;
    this.scheduleRender = scheduleRenderCb;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    svg.addEventListener("pointerdown", this._onPointerDown);
    svg.addEventListener("pointermove", this._onPointerMove);
    svg.addEventListener("pointerup", this._onPointerUp);

    // allow renderer to delegate resize-handle mousedown back here
    this.renderer.onResizeHandle = (e, pkgId, dirKey) =>
      this.beginResizePackage(e, pkgId, dirKey);
  }

  beginPan(e) {
    this.state.interaction = {
      mode: "pan",
      pointerId: e.pointerId,
      start: {
        x: e.clientX,
        y: e.clientY,
        panX: this.state.pan.x,
        panY: this.state.pan.y,
      },
    };
    this.svg.setPointerCapture(e.pointerId);
    document.body.classList.add("panning");
  }
  beginDragClass(e, c) {
    const pt = Coordinate.screenToWorld(
      this.svg,
      this.viewport,
      e.clientX,
      e.clientY
    );
    this.state.interaction = {
      mode: "drag-class",
      pointerId: e.pointerId,
      start: { px: pt.x, py: pt.y, x: c.x, y: c.y, id: c.id },
    };
    this.svg.setPointerCapture(e.pointerId);
  }
  beginDragPackage(e, p) {
    const pt = Coordinate.screenToWorld(
      this.svg,
      this.viewport,
      e.clientX,
      e.clientY
    );
    this.state.interaction = {
      mode: "drag-package",
      pointerId: e.pointerId,
      start: { px: pt.x, py: pt.y, x: p.x, y: p.y, id: p.id },
    };
    this.svg.setPointerCapture(e.pointerId);
  }
  beginResizePackage(e, pkgId, dirKey) {
    const p = this.state.packageById(pkgId);
    const dir = { n: false, e: false, s: false, w: false };
    if (dirKey.includes("n")) dir.n = true;
    if (dirKey.includes("e")) dir.e = true;
    if (dirKey.includes("s")) dir.s = true;
    if (dirKey.includes("w")) dir.w = true;
    const pt = Coordinate.screenToWorld(
      this.svg,
      this.viewport,
      e.clientX,
      e.clientY
    );
    this.state.interaction = {
      mode: "resize-package",
      pointerId: e.pointerId,
      start: {
        px: pt.x,
        py: pt.y,
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
        id: p.id,
        dir,
      },
    };
    e.target.setPointerCapture(e.pointerId);
  }

  _onPointerDown(e) {
    const handle = e.target.closest?.("rect.handle");
    const nodeG = e.target.closest?.("g.node");
    const pkgLbl = e.target.closest?.("text.pkg-label");
    const pkgHeader = e.target.closest?.("rect.header");
    const pkgG = e.target.closest?.("g.package");

    if (handle && pkgG) {
      this.beginResizePackage(e, pkgG.dataset.id, handle.dataset.dir);
      e.preventDefault();
      return;
    }
    if (nodeG) {
      const c = this.state.classById(nodeG.dataset.id);
      if (this.state.linkMode) {
        this.linkService.beginLinkOnClass(
          c,
          this.linkTypeSel?.value || "association",
          (t, s, d) => {
            this.state.addRelation(t, s, d);
            this.scheduleRender();
          }
        );
        e.preventDefault();
        return;
      }
      this.onSelect("class", c.id);
      this.beginDragClass(e, c);
      e.preventDefault();
      return;
    }
    if ((pkgHeader || pkgLbl) && pkgG) {
      const p = this.state.packageById(pkgG.dataset.id);
      if (this.state.linkMode) {
        e.preventDefault();
        return;
      }
      this.onSelect("package", p.id);
      this.beginDragPackage(e, p);
      e.preventDefault();
      return;
    }
    this.beginPan(e);
    e.preventDefault();
  }

  _onPointerMove(e) {
    if (!this.state.interaction) {
      if (this.state.tempEdge)
        this.linkService.updatePreview(
          this.svg,
          this.viewport,
          e.clientX,
          e.clientY
        );
      return;
    }
    const step = this.getStep();
    const mode = this.state.interaction.mode;

    if (mode === "pan") {
      const dx = e.clientX - this.state.interaction.start.x;
      const dy = e.clientY - this.state.interaction.start.y;
      this.state.pan = {
        x: this.state.interaction.start.panX + dx,
        y: this.state.interaction.start.panY + dy,
      };
      this.viewport.setAttribute(
        "transform",
        `translate(${this.state.pan.x},${this.state.pan.y})`
      );
      return;
    }

    if (mode === "drag-class") {
      const s = this.state.interaction.start;
      const pt = Coordinate.screenToWorld(
        this.svg,
        this.viewport,
        e.clientX,
        e.clientY
      );
      const c = this.state.classById(s.id);
      if (!c) return;
      c.x = Coordinate.snap(s.x + (pt.x - s.px), step);
      c.y = Coordinate.snap(s.y + (pt.y - s.py), step);
      const containing = this.state.packages.find((p) =>
        Geometry.isClassInsidePackage(c, p)
      );
      c.packageId = containing?.id || null;
      this.scheduleRender();
      return;
    }

    if (mode === "drag-package") {
      const s = this.state.interaction.start;
      const pt = Coordinate.screenToWorld(
        this.svg,
        this.viewport,
        e.clientX,
        e.clientY
      );
      const p = this.state.packageById(s.id);
      if (!p) return;
      const nx = Coordinate.snap(s.x + (pt.x - s.px), step);
      const ny = Coordinate.snap(s.y + (pt.y - s.py), step);
      const dx = nx - p.x,
        dy = ny - p.y;
      p.x = nx;
      p.y = ny;
      this.state.classes.forEach((c) => {
        if (Geometry.isClassInsidePackage(c, p, true)) {
          c.x += dx;
          c.y += dy;
        }
      });
      this.scheduleRender();
      return;
    }

    if (mode === "resize-package") {
      const s = this.state.interaction.start;
      const pt = Coordinate.screenToWorld(
        this.svg,
        this.viewport,
        e.clientX,
        e.clientY
      );
      const p = this.state.packageById(s.id);
      if (!p) return;
      const d = s.dir;
      let x = s.x,
        y = s.y,
        w = s.w,
        h = s.h;
      const dx = pt.x - s.px,
        dy = pt.y - s.py;
      if (d.w) {
        x = Coordinate.snap(s.x + dx, step);
        w = Coordinate.snap(s.w - dx, step);
      }
      if (d.e) {
        w = Coordinate.snap(s.w + dx, step);
      }
      if (d.n) {
        y = Coordinate.snap(s.y + dy, step);
        h = Coordinate.snap(s.h - dy, step);
      }
      if (d.s) {
        h = Coordinate.snap(s.h + dy, step);
      }
      w = Math.max(160, w);
      h = Math.max(120, h);
      if (d.w) x = Math.min(x, s.x + s.w - 160);
      if (d.n) y = Math.min(y, s.y + s.h - 120);
      p.x = x;
      p.y = y;
      p.w = w;
      p.h = h;
      const g = this.svg.querySelector(`g.package[data-id="${p.id}"]`);
      if (g) this.renderer.updatePackageDom(g, p);
      return;
    }
  }

  _onPointerUp(e) {
    if (
      this.state.interaction &&
      e.pointerId === this.state.interaction.pointerId
    ) {
      try {
        if (
          e.target.hasPointerCapture &&
          e.target.hasPointerCapture(e.pointerId)
        )
          e.target.releasePointerCapture(e.pointerId);
      } catch (_) {}
      try {
        this.svg.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
      this.state.interaction = null;
      document.body.classList.remove("panning");
      this.scheduleRender();
    }
  }
}
