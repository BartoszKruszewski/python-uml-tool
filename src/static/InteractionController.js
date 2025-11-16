import Coordinate from "./Coordinate.js";
import Geometry from "./Geometry.js";

/**
 * Handles pointer interactions: panning, dragging classes/packages, and resizing packages.
 */
export default class InteractionController {
  /**
   * @param {SVGSVGElement} svgElement - Root SVG element.
   * @param {SVGGElement} viewportGroupElement - Viewport group for world transforms.
   * @param {import("./DiagramState.js").default} diagramState - Shared diagram state.
   * @param {import("./SvgRenderer.js").default} svgRenderer - SVG renderer instance.
   * @param {import("./LinkService.js").default} linkService - Link service for edge creation.
   * @param {() => number} gridStepProvider - Returns current grid step.
   * @param {(type:"class"|"package", id:string) => void} onSelectCallback - Selection handler.
   * @param {() => void} scheduleRenderCallback - Schedule a render on state changes.
   */
  constructor(
    svgElement,
    viewportGroupElement,
    diagramState,
    svgRenderer,
    linkService,
    gridStepProvider,
    onSelectCallback,
    scheduleRenderCallback
  ) {
    this.svgElement = svgElement;
    this.viewportGroupElement = viewportGroupElement;
    this.diagramState = diagramState;
    this.svgRenderer = svgRenderer;
    this.linkService = linkService;
    this.getGridStep = gridStepProvider;
    this.onSelect = onSelectCallback;
    this.scheduleRender = scheduleRenderCallback;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    svgElement.addEventListener("pointerdown", this._onPointerDown);
    svgElement.addEventListener("pointermove", this._onPointerMove);
    svgElement.addEventListener("pointerup", this._onPointerUp);

    // allow renderer to delegate resize-handle mousedown back here
    this.svgRenderer.onResizeHandle = (event, packageId, directionKey) =>
      this.beginResizePackage(event, packageId, directionKey);
  }

  /**
   * Begin viewport panning.
   * @param {PointerEvent} event
   */
  beginPan(event) {
    this.diagramState.interactionState = {
      mode: "pan",
      pointerId: event.pointerId,
      start: {
        x: event.clientX,
        y: event.clientY,
        panX: this.diagramState.panOffset.x,
        panY: this.diagramState.panOffset.y,
      },
    };
    this.svgElement.setPointerCapture(event.pointerId);
    document.body.classList.add("panning");
  }

  /**
   * Begin dragging a class node.
   * @param {PointerEvent} event
   * @param {{id:string,x:number,y:number,w:number,h:number}} classElement
   */
  beginDragClass(event, classElement) {
    const worldPoint = Coordinate.screenToWorld(
      this.svgElement,
      this.viewportGroupElement,
      event.clientX,
      event.clientY
    );
    this.diagramState.interactionState = {
      mode: "drag-class",
      pointerId: event.pointerId,
      start: { px: worldPoint.x, py: worldPoint.y, x: classElement.x, y: classElement.y, id: classElement.id },
    };
    this.svgElement.setPointerCapture(event.pointerId);
  }

  /**
   * Begin dragging a package box.
   * @param {PointerEvent} event
   * @param {{id:string,x:number,y:number,w:number,h:number}} packageElement
   */
  beginDragPackage(event, packageElement) {
    const worldPoint = Coordinate.screenToWorld(
      this.svgElement,
      this.viewportGroupElement,
      event.clientX,
      event.clientY
    );
    this.diagramState.interactionState = {
      mode: "drag-package",
      pointerId: event.pointerId,
      start: { px: worldPoint.x, py: worldPoint.y, x: packageElement.x, y: packageElement.y, id: packageElement.id },
    };
    this.svgElement.setPointerCapture(event.pointerId);
  }

  /**
   * Begin resizing a package via a handle direction key (n,e,s,w, combinations like "ne").
   * @param {PointerEvent} event
   * @param {string} packageId
   * @param {string} directionKey
   */
  beginResizePackage(event, packageId, directionKey) {
    const packageElement = this.diagramState.getPackageById(packageId);
    const direction = { n: false, e: false, s: false, w: false };
    if (directionKey.includes("n")) direction.n = true;
    if (directionKey.includes("e")) direction.e = true;
    if (directionKey.includes("s")) direction.s = true;
    if (directionKey.includes("w")) direction.w = true;
    const worldPoint = Coordinate.screenToWorld(
      this.svgElement,
      this.viewportGroupElement,
      event.clientX,
      event.clientY
    );
    this.diagramState.interactionState = {
      mode: "resize-package",
      pointerId: event.pointerId,
      start: {
        px: worldPoint.x,
        py: worldPoint.y,
        x: packageElement.x,
        y: packageElement.y,
        w: packageElement.w,
        h: packageElement.h,
        id: packageElement.id,
        dir: direction,
      },
    };
    event.target.setPointerCapture(event.pointerId);
  }

  /**
   * Pointer down dispatcher for selection, dragging, resizing and panning.
   * @param {PointerEvent} event
   */
  _onPointerDown(event) {
    const handleElement = event.target.closest?.("rect.handle");
    const nodeGroupElement = event.target.closest?.("g.node");
    const packageLabelElement = event.target.closest?.("text.pkg-label");
    const packageHeaderElement = event.target.closest?.("rect.header");
    const packageGroupElement = event.target.closest?.("g.package");

    if (handleElement && packageGroupElement) {
      this.beginResizePackage(event, packageGroupElement.dataset.id, handleElement.dataset.dir);
      event.preventDefault();
      return;
    }
    if (nodeGroupElement) {
      const classElement = this.diagramState.getClassById(nodeGroupElement.dataset.id);
      if (this.diagramState.isLinkModeActive || this.diagramState.temporaryEdgeElement) {
        this.linkService.beginLinkOnClass(
          classElement,
          this.linkTypeSelect?.value || "association",
          (relationType, sourceId, targetId) => {
            this.diagramState.addRelation(relationType, sourceId, targetId);
            this.scheduleRender();
          },
          document.getElementById("btnLinkMode")
        );
        this.onSelect?.("class", classElement.id);
        event.preventDefault();
        return;
      }
      this.onSelect("class", classElement.id);
      this.beginDragClass(event, classElement);
      event.preventDefault();
      return;
    }
    if ((packageHeaderElement || packageLabelElement) && packageGroupElement) {
      const packageElement = this.diagramState.getPackageById(packageGroupElement.dataset.id);
      if (this.diagramState.isLinkModeActive) {
        event.preventDefault();
        return;
      }
      this.onSelect("package", packageElement.id);
      this.beginDragPackage(event, packageElement);
      event.preventDefault();
      return;
    }
    this.beginPan(event);
    event.preventDefault();
  }

  /**
   * Pointer move handler for live interactions.
   * @param {PointerEvent} event
   */
  _onPointerMove(event) {
    if (!this.diagramState.interactionState) {
      if (this.diagramState.temporaryEdgeElement)
        this.linkService.updatePreview(
          this.svgElement,
          this.viewportGroupElement,
          event.clientX,
          event.clientY
        );
      return;
    }
    const gridStep = this.getGridStep();
    const mode = this.diagramState.interactionState.mode;

    if (mode === "pan") {
      const deltaX = event.clientX - this.diagramState.interactionState.start.x;
      const deltaY = event.clientY - this.diagramState.interactionState.start.y;
      this.diagramState.panOffset = {
        x: this.diagramState.interactionState.start.panX + deltaX,
        y: this.diagramState.interactionState.start.panY + deltaY,
      };
      this.viewportGroupElement.setAttribute(
        "transform",
        `translate(${this.diagramState.panOffset.x},${this.diagramState.panOffset.y})`
      );
      return;
    }

    if (mode === "drag-class") {
      const start = this.diagramState.interactionState.start;
      const worldPoint = Coordinate.screenToWorld(
        this.svgElement,
        this.viewportGroupElement,
        event.clientX,
        event.clientY
      );
      const classElement = this.diagramState.getClassById(start.id);
      if (!classElement) return;
      classElement.x = Coordinate.snap(start.x + (worldPoint.x - start.px), gridStep);
      classElement.y = Coordinate.snap(start.y + (worldPoint.y - start.py), gridStep);
      const containingPackage = this.diagramState.packageList.find((packageElement) =>
        Geometry.isClassInsidePackage(classElement, packageElement)
      );
      classElement.packageId = containingPackage?.id || null;
      this.scheduleRender();
      return;
    }

    if (mode === "drag-package") {
      const start = this.diagramState.interactionState.start;
      const worldPoint = Coordinate.screenToWorld(
        this.svgElement,
        this.viewportGroupElement,
        event.clientX,
        event.clientY
      );
      const packageElement = this.diagramState.getPackageById(start.id);
      if (!packageElement) return;
      const newX = Coordinate.snap(start.x + (worldPoint.x - start.px), gridStep);
      const newY = Coordinate.snap(start.y + (worldPoint.y - start.py), gridStep);
      const deltaX = newX - packageElement.x,
        deltaY = newY - packageElement.y;
      packageElement.x = newX;
      packageElement.y = newY;
      this.diagramState.classList.forEach((classElement) => {
        if (Geometry.isClassInsidePackage(classElement, packageElement, true)) {
          classElement.x += deltaX;
          classElement.y += deltaY;
        }
      });
      this.scheduleRender();
      return;
    }

    if (mode === "resize-package") {
      const start = this.diagramState.interactionState.start;
      const worldPoint = Coordinate.screenToWorld(
        this.svgElement,
        this.viewportGroupElement,
        event.clientX,
        event.clientY
      );
      const packageElement = this.diagramState.getPackageById(start.id);
      if (!packageElement) return;
      const direction = start.dir;
      let x = start.x,
        y = start.y,
        w = start.w,
        h = start.h;
      const deltaX = worldPoint.x - start.px,
        deltaY = worldPoint.y - start.py;
      if (direction.w) {
        x = Coordinate.snap(start.x + deltaX, gridStep);
        w = Coordinate.snap(start.w - deltaX, gridStep);
      }
      if (direction.e) {
        w = Coordinate.snap(start.w + deltaX, gridStep);
      }
      if (direction.n) {
        y = Coordinate.snap(start.y + deltaY, gridStep);
        h = Coordinate.snap(start.h - deltaY, gridStep);
      }
      if (direction.s) {
        h = Coordinate.snap(start.h + deltaY, gridStep);
      }
      w = Math.max(160, w);
      h = Math.max(120, h);
      if (direction.w) x = Math.min(x, start.x + start.w - 160);
      if (direction.n) y = Math.min(y, start.y + start.h - 120);
      packageElement.x = x;
      packageElement.y = y;
      packageElement.w = w;
      packageElement.h = h;
      const groupElement = this.svgElement.querySelector(`g.package[data-id="${packageElement.id}"]`);
      if (groupElement) this.svgRenderer.updatePackageDom(groupElement, packageElement);
      return;
    }
  }

  /**
   * Finish the current interaction if matching pointerId.
   * @param {PointerEvent} event
   */
  _onPointerUp(event) {
    if (
      this.diagramState.interactionState &&
      event.pointerId === this.diagramState.interactionState.pointerId
    ) {
      try {
        if (
          event.target.hasPointerCapture &&
          event.target.hasPointerCapture(event.pointerId)
        )
          event.target.releasePointerCapture(event.pointerId);
      } catch (_) {}
      try {
        this.svgElement.releasePointerCapture?.(event.pointerId);
      } catch (_) {}
      this.diagramState.interactionState = null;
      document.body.classList.remove("panning");
      this.scheduleRender();
    }
  }
}
