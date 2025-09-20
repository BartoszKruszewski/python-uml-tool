import Geometry from "./Geometry.js";
import Coordinate from "./Coordinate.js";

export default class LinkService {
  constructor(state, viewport) {
    this.state = state;
    this.viewport = viewport;
  }
  toggle(button) {
    this.state.linkMode = !this.state.linkMode;
    if (button)
      button.textContent = this.state.linkMode ? "End Link" : "Start Link";
  }
  beginLinkOnClass(c, linkType, onAddRelation) {
    if (!this.state.linkMode) return;
    if (!this.state.tempEdge) {
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const [cx, cy] = Geometry.center(c);
      l.setAttribute("x1", cx);
      l.setAttribute("y1", cy);
      l.setAttribute("x2", cx);
      l.setAttribute("y2", cy);
      l.setAttribute("class", "edge association");
      this.viewport.appendChild(l);
      this.state.tempEdge = l;
      this.state.tempEdge.dataset.source = c.id;
    } else {
      const src = this.state.tempEdge.dataset.source;
      onAddRelation(linkType, src, c.id);
      this.state.tempEdge.remove();
      this.state.tempEdge = null;
      this.state.linkMode = false;
    }
  }
  updatePreview(svg, viewport, clientX, clientY) {
    if (!this.state.tempEdge) return;
    const src = this.state.tempEdge.dataset?.source
      ? this.state.classById?.(this.state.tempEdge.dataset.source)
      : null;
    if (!src) return;
    const [sx, sy] = Geometry.center(src);
    const pt = Coordinate.screenToWorld(svg, viewport, clientX, clientY);
    this.state.tempEdge.setAttribute("x1", sx);
    this.state.tempEdge.setAttribute("y1", sy);
    this.state.tempEdge.setAttribute("x2", pt.x);
    this.state.tempEdge.setAttribute("y2", pt.y);
  }
  cancel(button) {
    if (this.state.tempEdge) {
      this.state.tempEdge.remove();
      this.state.tempEdge = null;
    }
    this.state.linkMode = false;
    if (button) button.textContent = "Start Link";
  }
}
