/**
 * Utility helpers for coordinate transforms and snapping.
 */
export default class Coordinate {
  /**
   * Convert screen/client coordinates to the SVG world space of the given viewport group.
   * @param {SVGSVGElement} svg - Root SVG element.
   * @param {SVGGraphicsElement} viewport - The translated/zoomed viewport group inside the SVG.
   * @param {number} cx - Client X coordinate (e.g., PointerEvent.clientX).
   * @param {number} cy - Client Y coordinate (e.g., PointerEvent.clientY).
   * @returns {{x:number,y:number}} World coordinates within the viewport group.
   */
  static screenToWorld(svg, viewport, cx, cy) {
    const pt = svg.createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    const m = viewport.getScreenCTM().inverse();
    const loc = pt.matrixTransform(m);
    return { x: loc.x, y: loc.y };
  }
  /**
   * Snap a numeric value to the nearest grid step.
   * @param {number} v - Value to snap.
   * @param {number} step - Grid step in world units.
   * @returns {number} Snapped value.
   */
  static snap(v, step) {
    return Math.round(v / step) * step;
  }
}
