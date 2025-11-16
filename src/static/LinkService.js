import Geometry from "./Geometry.js";
import Coordinate from "./Coordinate.js";

/**
 * Handles interactive creation of links between classes, including preview edges.
 */
export default class LinkService {
  /**
   * @param {import("./DiagramState.js").default} diagramState - Diagram state to mutate.
   * @param {SVGGElement} viewportGroupElement - The SVG viewport group for adding preview edges.
   */
  constructor(diagramState, viewportGroupElement) {
    this.diagramState = diagramState;
    this.viewportGroupElement = viewportGroupElement;
  }

  /**
   * Toggle link mode and update button label.
   * @param {HTMLButtonElement} [linkButtonElement] - Optional UI button to update.
   * @returns {void}
   */
  toggle(linkButtonElement) {
    this.diagramState.isLinkModeActive = !this.diagramState.isLinkModeActive;
    if (linkButtonElement) {
      linkButtonElement.textContent = this.diagramState.isLinkModeActive ? "End Link" : "Start Link";
    }
  }

  /**
   * Start or finish linking on a class node; on first click starts preview, on second creates relation.
   * @param {{id:string,x:number,y:number,w:number,h:number}} classElement - Target class element.
   * @param {string} linkType - Relation type to create.
   * @param {(type:string, sourceId:string, targetId:string) => void} onAddRelationCallback - Invoked to add relation.
   * @param {HTMLButtonElement} [linkButtonElement] - Optional button to update label when finishing.
   */
  beginLinkOnClass(classElement, linkType, onAddRelationCallback, linkButtonElement) {
    if (!this.diagramState.isLinkModeActive) return;
    if (!this.diagramState.temporaryEdgeElement) {
      const lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const [classCenterX, classCenterY] = Geometry.center(classElement);
      lineElement.setAttribute("x1", classCenterX);
      lineElement.setAttribute("y1", classCenterY);
      lineElement.setAttribute("x2", classCenterX);
      lineElement.setAttribute("y2", classCenterY);
      lineElement.setAttribute("class", "edge association");
      this.viewportGroupElement.appendChild(lineElement);
      this.diagramState.temporaryEdgeElement = lineElement;
      this.diagramState.temporaryEdgeElement.dataset.source = classElement.id;
    } else {
      const sourceId = this.diagramState.temporaryEdgeElement.dataset.source;
      onAddRelationCallback(linkType, sourceId, classElement.id);
      this.diagramState.temporaryEdgeElement.remove();
      this.diagramState.temporaryEdgeElement = null;
      this.diagramState.isLinkModeActive = false;
      if (linkButtonElement) linkButtonElement.textContent = "Start Link";
    }
  }

  /**
   * Update the live preview edge while the pointer moves.
   * @param {SVGSVGElement} svgElement - Root SVG element.
   * @param {SVGGElement} viewportGroupElement - Viewport group for transform reference.
   * @param {number} clientX - Pointer clientX.
   * @param {number} clientY - Pointer clientY.
   * @returns {void}
   */
  updatePreview(svgElement, viewportGroupElement, clientX, clientY) {
    if (!this.diagramState.temporaryEdgeElement) return;
    const sourceClassElement = this.diagramState.temporaryEdgeElement.dataset?.source
      ? this.diagramState.getClassById?.(this.diagramState.temporaryEdgeElement.dataset.source)
      : null;
    if (!sourceClassElement) return;
    const [sourceX, sourceY] = Geometry.center(sourceClassElement);
    const worldPoint = Coordinate.screenToWorld(svgElement, viewportGroupElement, clientX, clientY);
    this.diagramState.temporaryEdgeElement.setAttribute("x1", sourceX);
    this.diagramState.temporaryEdgeElement.setAttribute("y1", sourceY);
    this.diagramState.temporaryEdgeElement.setAttribute("x2", worldPoint.x);
    this.diagramState.temporaryEdgeElement.setAttribute("y2", worldPoint.y);
  }

  /**
   * Cancel link mode and remove any preview edge.
   * @param {HTMLButtonElement} [linkButtonElement] - Optional button to reset label.
   */
  cancel(linkButtonElement) {
    if (this.diagramState.temporaryEdgeElement) {
      this.diagramState.temporaryEdgeElement.remove();
      this.diagramState.temporaryEdgeElement = null;
    }
    this.diagramState.isLinkModeActive = false;
    if (linkButtonElement) linkButtonElement.textContent = "Start Link";
  }
}
