export default class DiagramState {
  constructor() {
    this.classList = [];
    this.packageList = [];
    this.relationList = [];
    this.selectedElement = null;
    this.isLinkModeActive = false;
    this.temporaryEdgeElement = null; // <line> SVG during linking
    this.nextElementId = 1;
    this.panOffset = { x: 0, y: 0 };
    this.interactionState = null; // {mode, pointerId, start, ...}
  }

  generateUniqueId(prefix) {
    return prefix + this.nextElementId++;
  }

  getClassById(classId) {
    return this.classList.find((classElement) => classElement.id === classId);
  }

  getPackageById(packageId) {
    return this.packageList.find((packageElement) => packageElement.id === packageId);
  }

  setSelected(elementType, elementId) {
    this.selectedElement = { type: elementType, id: elementId };
  }

  clearSelection() {
    this.selectedElement = null;
  }

  addClass(x, y) {
    const classId = this.generateUniqueId("C");
    const classElement = {
      id: classId,
      name: "Class" + this.nextElementId,
      x,
      y,
      w: 200,
      h: 110,
      attributes: [],
      operations: [],
      packageId: null,
    };
    this.classList.push(classElement);
    return classElement;
  }

  addPackage(x, y) {
    const packageId = this.generateUniqueId("P");
    const packageElement = { id: packageId, name: "Module" + this.nextElementId, x, y, w: 360, h: 240 };
    this.packageList.push(packageElement);
    return packageElement;
  }

  removeClass(classId) {
    const classIndex = this.classList.findIndex((classElement) => classElement.id === classId);
    if (classIndex >= 0) this.classList.splice(classIndex, 1);
    this.relationList = this.relationList.filter(
      (relation) => relation.source !== classId && relation.target !== classId
    );
  }

  removePackage(packageId) {
    const packageIndex = this.packageList.findIndex((packageElement) => packageElement.id === packageId);
    if (packageIndex >= 0) this.packageList.splice(packageIndex, 1);
    this.classList.forEach((classElement) => {
      if (classElement.packageId === packageId) classElement.packageId = null;
    });
  }

  addRelation(relationType, sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return null;
    const relationId = this.generateUniqueId("R");
    const relationElement = { id: relationId, type: relationType, source: sourceId, target: targetId };
    this.relationList.push(relationElement);
    return relationElement;
  }
}
