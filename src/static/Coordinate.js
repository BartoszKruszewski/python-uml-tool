export default class Coordinate {
  static screenToWorld(svg, viewport, cx, cy) {
    const pt = svg.createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    const m = viewport.getScreenCTM().inverse();
    const loc = pt.matrixTransform(m);
    return { x: loc.x, y: loc.y };
  }
  static snap(v, step) {
    return Math.round(v / step) * step;
  }
}
