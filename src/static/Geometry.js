export default class Geometry {
  static center(el) {
    return [el.x + el.w / 2, el.y + el.h / 2];
  }
  static intersectRect(c, x2, y2) {
    const x1 = c.x + c.w / 2,
      y1 = c.y + c.h / 2;
    const dx = x2 - x1,
      dy = y2 - y1;
    const absDX = Math.abs(dx),
      absDY = Math.abs(dy);
    let tx = c.w / 2 / absDX,
      ty = c.h / 2 / absDY;
    if (!isFinite(tx)) tx = Infinity;
    if (!isFinite(ty)) ty = Infinity;
    const t = Math.min(tx, ty);
    return [x1 + dx * t, y1 + dy * t];
  }
  static isClassInsidePackage(c, p, includeEdge = false) {
    const cx = c.x + c.w / 2,
      cy = c.y + c.h / 2;
    const top = p.y + 16,
      left = p.x,
      right = p.x + p.w,
      bottom = p.y + p.h + 16;
    const tol = includeEdge ? 0 : 1e-6;
    return (
      cx >= left - tol &&
      cx <= right + tol &&
      cy >= top - tol &&
      cy <= bottom + tol
    );
  }
}
