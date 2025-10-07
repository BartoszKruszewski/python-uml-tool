import Geometry from "./Geometry.js";
import Coordinate from "./Coordinate.js";

export default class LinkService {
  constructor(diagramState, viewportGroupElement) {
    this.diagramState = diagramState;
    this.viewportGroupElement = viewportGroupElement;
  }

  toggle(linkButtonElement) {
    this.diagramState.isLinkModeActive = !this.diagramState.isLinkModeActive;
    if (linkButtonElement) {
      linkButtonElement.textContent = this.diagramState.isLinkModeActive ? "End Link" : "Start Link";
    }
  }

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

  cancel(linkButtonElement) {
    if (this.diagramState.temporaryEdgeElement) {
      this.diagramState.temporaryEdgeElement.remove();
      this.diagramState.temporaryEdgeElement = null;
    }
    this.diagramState.isLinkModeActive = false;
    if (linkButtonElement) linkButtonElement.textContent = "Start Link";
  }
}
