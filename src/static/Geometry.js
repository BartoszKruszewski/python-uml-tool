/**
 * Geometry helpers for layout and edge intersection.
 */
export default class Geometry {
  /**
   * Compute the center point of a rectangle-like element.
   * @param {{x:number,y:number,w:number,h:number}} element - Rectangle with position and size.
   * @returns {[number, number]} Tuple [cx, cy] center coordinates.
   */
  static center(element) {
    return [element.x + element.w / 2, element.y + element.h / 2];
  }

  /**
   * Intersect a ray from the rectangle center to a target point with the rectangle bounds.
   * @param {{x:number,y:number,w:number,h:number}} rectangle - Source rectangle.
   * @param {number} targetX - Target world X.
   * @param {number} targetY - Target world Y.
   * @returns {[number, number]} Tuple [x, y] of the intersection point on the rectangle edge.
   */
  static intersectRect(rectangle, targetX, targetY) {
    const centerX = rectangle.x + rectangle.w / 2,
      centerY = rectangle.y + rectangle.h / 2;
    const deltaX = targetX - centerX,
      deltaY = targetY - centerY;
    const absDeltaX = Math.abs(deltaX),
      absDeltaY = Math.abs(deltaY);
    let tX = rectangle.w / 2 / absDeltaX,
      tY = rectangle.h / 2 / absDeltaY;
    if (!isFinite(tX)) tX = Infinity;
    if (!isFinite(tY)) tY = Infinity;
    const t = Math.min(tX, tY);
    return [centerX + deltaX * t, centerY + deltaY * t];
  }

  /**
   * Check whether a class node is inside a package box.
   * Uses the class center against the package interior (header excluded).
   * @param {{x:number,y:number,w:number,h:number}} classElement - Class node bounds.
   * @param {{x:number,y:number,w:number,h:number}} packageElement - Package bounds.
   * @param {boolean} [includeEdge=false] - If true, treat edge as inside.
   * @returns {boolean} True if inside, otherwise false.
   */
  static isClassInsidePackage(classElement, packageElement, includeEdge = false) {
    const classCenterX = classElement.x + classElement.w / 2,
      classCenterY = classElement.y + classElement.h / 2;
    const top = packageElement.y + 16,
      left = packageElement.x,
      right = packageElement.x + packageElement.w,
      bottom = packageElement.y + packageElement.h + 16;
    const tolerance = includeEdge ? 0 : 1e-6;
    return (
      classCenterX >= left - tolerance &&
      classCenterX <= right + tolerance &&
      classCenterY >= top - tolerance &&
      classCenterY <= bottom + tolerance
    );
  }
}
