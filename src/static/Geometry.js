export default class Geometry {
  static center(element) {
    return [element.x + element.w / 2, element.y + element.h / 2];
  }

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
