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
    this._onWheel = this._onWheel.bind(this);

    svgElement.addEventListener("pointerdown", this._onPointerDown);
    svgElement.addEventListener("pointermove", this._onPointerMove);
    svgElement.addEventListener("pointerup", this._onPointerUp);
    svgElement.addEventListener("wheel", this._onWheel, { passive: false });

    // allow renderer to delegate resize-handle mousedown back here
    this.svgRenderer.onResizeHandle = (event, packageId, directionKey) =>
      this.beginResizePackage(event, packageId, directionKey);
    
    // Initialize viewport transform
    this._updateViewportTransform();
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
      this._updateViewportTransform();
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
      
      // Find all packages containing the class
      const containingPackages = this.diagramState.packageList.filter((packageElement) =>
        Geometry.isClassInsidePackage(classElement, packageElement)
      );
      
      if (containingPackages.length > 0) {
        // Calculate nesting depth for each package
        const getNestingDepth = (packageId) => {
          let depth = 0;
          let currentId = packageId;
          while (currentId) {
            const pkg = this.diagramState.getPackageById(currentId);
            if (!pkg || !pkg.parentId) break;
            depth++;
            currentId = pkg.parentId;
          }
          return depth;
        };
        
        // Find the most deeply nested package
        let mostNestedPackage = containingPackages[0];
        let maxDepth = getNestingDepth(mostNestedPackage.id);
        
        for (let i = 1; i < containingPackages.length; i++) {
          const depth = getNestingDepth(containingPackages[i].id);
          if (depth > maxDepth) {
            maxDepth = depth;
            mostNestedPackage = containingPackages[i];
          }
        }
        
        classElement.packageId = mostNestedPackage.id;
      } else {
        classElement.packageId = null;
      }
      
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
      
      // Check if package is being dragged into another package (for nesting)
      const containingPackage = this.diagramState.packageList.find((pkg) => {
        if (pkg.id === packageElement.id) return false;
        // Check if package center is inside another package
        const centerX = packageElement.x + packageElement.w / 2;
        const centerY = packageElement.y + packageElement.h / 2;
        return centerX >= pkg.x && centerX <= pkg.x + pkg.w &&
               centerY >= pkg.y && centerY <= pkg.y + pkg.h;
      });
      
      // Prevent circular nesting (package cannot be parent of itself or its ancestors)
      if (containingPackage && containingPackage.id !== packageElement.id) {
        let isCircular = false;
        let currentParentId = containingPackage.parentId;
        while (currentParentId) {
          if (currentParentId === packageElement.id) {
            isCircular = true;
            break;
          }
          const parent = this.diagramState.getPackageById(currentParentId);
          currentParentId = parent?.parentId || null;
        }
        
        if (!isCircular) {
          packageElement.parentId = containingPackage.id;
        }
      } else {
        // Check if package is dragged outside any package (remove nesting)
        const stillInside = this.diagramState.packageList.find((pkg) => {
          if (pkg.id === packageElement.id) return false;
          const centerX = packageElement.x + packageElement.w / 2;
          const centerY = packageElement.y + packageElement.h / 2;
          return centerX >= pkg.x && centerX <= pkg.x + pkg.w &&
                 centerY >= pkg.y && centerY <= pkg.y + pkg.h;
        });
        if (!stillInside) {
          packageElement.parentId = null;
        }
      }
      
      // Move classes inside this package
      this.diagramState.classList.forEach((classElement) => {
        if (Geometry.isClassInsidePackage(classElement, packageElement, true)) {
          classElement.x += deltaX;
          classElement.y += deltaY;
        }
      });
      
      // Move nested packages
      this.diagramState.packageList.forEach((nestedPackage) => {
        if (nestedPackage.parentId === packageElement.id) {
          nestedPackage.x += deltaX;
          nestedPackage.y += deltaY;
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

  /**
   * Handle wheel event for zooming.
   * Uses logarithmic scaling for smooth zoom at all levels.
   * @param {WheelEvent} event
   */
  _onWheel(event) {
    event.preventDefault();
    
    // Zoom configuration
    const minZoom = 0.1;
    const maxZoom = 5.0;
    const zoomSensitivity = 0.02; // Controls how fast zoom changes (reduced for less sensitivity)
    
    // Get current zoom
    const oldZoom = this.diagramState.zoomLevel;
    
    // Convert to logarithmic scale for smooth zooming
    // Map zoom range [minZoom, maxZoom] to log scale
    const logMin = Math.log(minZoom);
    const logMax = Math.log(maxZoom);
    const logRange = logMax - logMin;
    
    // Current zoom in log scale
    const oldLogZoom = Math.log(oldZoom);
    const normalizedLogZoom = (oldLogZoom - logMin) / logRange; // 0 to 1
    
    // Calculate delta in normalized log space
    const delta = event.deltaY > 0 ? -zoomSensitivity : zoomSensitivity;
    const newNormalizedLogZoom = Math.max(0, Math.min(1, normalizedLogZoom + delta));
    
    // Convert back to linear zoom
    const newLogZoom = logMin + newNormalizedLogZoom * logRange;
    const newZoom = Math.exp(newLogZoom);
    
    if (Math.abs(newZoom - oldZoom) < 0.001) return;
    
    // Get mouse position in screen coordinates relative to SVG
    const svgRect = this.svgElement.getBoundingClientRect();
    const mouseScreenX = event.clientX - svgRect.left;
    const mouseScreenY = event.clientY - svgRect.top;
    
    // Get world coordinates of the point under the mouse (before zoom change)
    const worldPoint = Coordinate.screenToWorld(
      this.svgElement,
      this.viewportGroupElement,
      event.clientX,
      event.clientY
    );
    
    // Update zoom level
    this.diagramState.zoomLevel = newZoom;
    
    // Calculate new pan offset so the same world point stays under the mouse
    // After zoom, the transform is: translate(panX, panY) scale(zoom)
    // Screen to world: worldX = (screenX - panX) / zoom
    // We want: (mouseScreenX - newPanX) / newZoom = worldX
    // So: newPanX = mouseScreenX - worldX * newZoom
    this.diagramState.panOffset.x = mouseScreenX - worldPoint.x * newZoom;
    this.diagramState.panOffset.y = mouseScreenY - worldPoint.y * newZoom;
    
    this._updateViewportTransform();
  }

  /**
   * Update the viewport transform attribute with current pan and zoom.
   * Public method to ensure transform is preserved after rendering.
   */
  updateViewportTransform() {
    this.viewportGroupElement.setAttribute(
      "transform",
      `translate(${this.diagramState.panOffset.x},${this.diagramState.panOffset.y}) scale(${this.diagramState.zoomLevel})`
    );
  }

  /**
   * Update the viewport transform attribute with current pan and zoom.
   * @private
   */
  _updateViewportTransform() {
    this.updateViewportTransform();
  }
}
