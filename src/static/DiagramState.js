/**
 * Central mutable diagram state: packages, classes, relations, selection and interaction.
 * @typedef {{name:string,type:string,isPrivate:boolean}} AttributeElement
 * @typedef {{name:string,params:{name:string,type:string}[],returnType:string,isPrivate:boolean}} OperationElement
 * @typedef {{id:string,name:string,x:number,y:number,w:number,h:number,attributes:AttributeElement[],operations:OperationElement[],packageId:(string|null)}} ClassElement
 * @typedef {{id:string,name:string,x:number,y:number,w:number,h:number,parentId:(string|null)}} PackageElement
 * @typedef {{id:string,type:string,source:string,target:string}} RelationElement
 */
export default class DiagramState {
  /**
   * Create an empty diagram state.
   */
  constructor() {
    this.classList = [];
    this.packageList = [];
    this.relationList = [];
    this.selectedElement = null;
    this.isLinkModeActive = false;
    this.temporaryEdgeElement = null; // <line> SVG during linking
    this.nextElementId = 1;
    this.panOffset = { x: 0, y: 0 };
    this.zoomLevel = 1.0; // Zoom level (1.0 = 100%)
    this.interactionState = null; // {mode, pointerId, start, ...}
  }

  /**
   * Generate a unique ID with the provided prefix.
   * @param {string} prefix - ID prefix, e.g. "C" | "P" | "R".
   * @returns {string} Unique identifier.
   */
  generateUniqueId(prefix) {
    return prefix + this.nextElementId++;
  }

  /**
   * Find class by identifier.
   * @param {string} classId - Class ID.
   * @returns {ClassElement|undefined} Matching class or undefined.
   */
  getClassById(classId) {
    return this.classList.find((classElement) => classElement.id === classId);
  }

  /**
   * Find package by identifier.
   * @param {string} packageId - Package ID.
   * @returns {PackageElement|undefined} Matching package or undefined.
   */
  getPackageById(packageId) {
    return this.packageList.find((packageElement) => packageElement.id === packageId);
  }

  /**
   * Set the current selection.
   * @param {"class"|"package"|"relation"} elementType - Selected element type.
   * @param {string} elementId - Selected element ID.
   * @returns {void}
   */
  setSelected(elementType, elementId) {
    this.selectedElement = { type: elementType, id: elementId };
  }

  /**
   * Clear selection.
   */
  clearSelection() {
    this.selectedElement = null;
  }

  /**
   * Create and add a new class node.
   * @param {number} x - World X.
   * @param {number} y - World Y.
   * @returns {ClassElement} The created class element.
   */
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

  /**
   * Create and add a new package box.
   * @param {number} x - World X.
   * @param {number} y - World Y.
   * @param {string|null} parentId - Parent package ID (for nesting).
   * @returns {PackageElement} The created package element.
   */
  addPackage(x, y, parentId = null) {
    const packageId = this.generateUniqueId("P");
    const packageElement = { id: packageId, name: "Module" + this.nextElementId, x, y, w: 360, h: 240, parentId };
    this.packageList.push(packageElement);
    return packageElement;
  }

  /**
   * Remove a class and its incident relations.
   * @param {string} classId - Class ID to remove.
   * @returns {void}
   */
  removeClass(classId) {
    const classIndex = this.classList.findIndex((classElement) => classElement.id === classId);
    if (classIndex >= 0) this.classList.splice(classIndex, 1);
    this.relationList = this.relationList.filter(
      (relation) => relation.source !== classId && relation.target !== classId
    );
  }

  /**
   * Remove a package and detach classes assigned to it.
   * @param {string} packageId - Package ID to remove.
   */
  removePackage(packageId) {
    const packageIndex = this.packageList.findIndex((packageElement) => packageElement.id === packageId);
    if (packageIndex >= 0) this.packageList.splice(packageIndex, 1);
    this.classList.forEach((classElement) => {
      if (classElement.packageId === packageId) classElement.packageId = null;
    });
    // Detach child packages
    this.packageList.forEach((packageElement) => {
      if (packageElement.parentId === packageId) packageElement.parentId = null;
    });
  }

  /**
   * Add a relation between two classes.
   * @param {"association"|"aggregation"|"composition"|"dependency"|"realization"|"generalization"} relationType - Relation type.
   * @param {string} sourceId - Source class ID.
   * @param {string} targetId - Target class ID.
   * @returns {RelationElement|null} The created relation or null if invalid.
   */
  addRelation(relationType, sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return null;
    const relationId = this.generateUniqueId("R");
    const relationElement = { id: relationId, type: relationType, source: sourceId, target: targetId };
    this.relationList.push(relationElement);
    return relationElement;
  }
}
