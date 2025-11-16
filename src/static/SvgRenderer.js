import Geometry from "./Geometry.js";

/**
 * Renders the UML diagram to SVG: packages, classes and relations.
 */
export default class SvgRenderer {
  /**
   * @param {SVGSVGElement} svgElement - Root SVG element.
   * @param {SVGGElement} viewportGroupElement - Translated/zoomed viewport group.
   * @param {SVGRectElement} gridRectElement - Background grid rectangle to preserve when clearing.
   * @param {import("./DiagramState.js").default} diagramState - Diagram state source.
   */
  constructor(svgElement, viewportGroupElement, gridRectElement, diagramState) {
    this.svgElement = svgElement;
    this.viewportGroupElement = viewportGroupElement;
    this.gridRectElement = gridRectElement;
    this.diagramState = diagramState;
  }

  /**
   * Create a rect element.
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @returns {SVGRectElement}
   */
  svgRect(x, y, width, height) {
    const rectElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectElement.setAttribute("x", x);
    rectElement.setAttribute("y", y);
    rectElement.setAttribute("width", width);
    rectElement.setAttribute("height", height);
    return rectElement;
  }

  /**
   * Create a line element.
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @returns {SVGLineElement}
   */
  svgLine(x1, y1, x2, y2) {
    const lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineElement.setAttribute("x1", x1);
    lineElement.setAttribute("y1", y1);
    lineElement.setAttribute("x2", x2);
    lineElement.setAttribute("y2", y2);
    return lineElement;
  }

  /**
   * Create a text element.
   * @param {number} x
   * @param {number} y
   * @param {string} text
   * @param {string|null} [className=null]
   * @returns {SVGTextElement}
   */
  svgText(x, y, text, className = null) {
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("x", x);
    textElement.setAttribute("y", y);
    if (className) textElement.setAttribute("class", className);
    textElement.textContent = text;
    return textElement;
  }

  /**
   * Update an existing package group DOM node to reflect new geometry.
   * @param {SVGGElement} packageGroupElement - Group with package graphics and handles.
   * @param {{x:number,y:number,w:number,h:number,name?:string,id:string}} packageElement - Package data.
   */
  updatePackageDom(packageGroupElement, packageElement) {
    packageGroupElement.setAttribute("transform", `translate(${packageElement.x},${packageElement.y})`);
    const bodyRect = packageGroupElement.querySelector("rect.body");
    bodyRect.setAttribute("width", packageElement.w);
    bodyRect.setAttribute("height", packageElement.h);
    const headerRect = packageGroupElement.querySelector("rect.header");
    headerRect.setAttribute("width", Math.max(120, packageElement.w * 0.4));
    const handlePositionMap = {
      nw: [0, 16],
      n: [packageElement.w / 2, 16],
      ne: [packageElement.w, 16],
      w: [0, 16 + packageElement.h / 2],
      e: [packageElement.w, 16 + packageElement.h / 2],
      sw: [0, 16 + packageElement.h],
      s: [packageElement.w / 2, 16 + packageElement.h],
      se: [packageElement.w, 16 + packageElement.h],
    };
    packageGroupElement.querySelectorAll("rect.handle").forEach((handleElement) => {
      const key = Array.from(handleElement.classList).find((className) =>
        ["nw", "n", "ne", "w", "e", "sw", "s", "se"].includes(className)
      );
      if (!key) return;
      const [handleX, handleY] = handlePositionMap[key];
      handleElement.setAttribute("x", handleX - 5);
      handleElement.setAttribute("y", handleY - 5);
    });
  }

  /**
   * Render the entire diagram into the SVG viewport.
   * @param {number} gridStep - Grid step for layout decisions.
   * @returns {void}
   */
  render(gridStep) {
    // clear (keep gridRect)
    while (
      this.viewportGroupElement.lastChild &&
      this.viewportGroupElement.lastChild !== this.gridRectElement
    ) {
      this.viewportGroupElement.removeChild(this.viewportGroupElement.lastChild);
    }
    // packages
    const packageLayer = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this.viewportGroupElement.appendChild(packageLayer);
    this.diagramState.packageList.forEach((packageElement) => {
      const groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
      groupElement.setAttribute("class", "package");
      groupElement.dataset.id = packageElement.id;
      groupElement.setAttribute("transform", `translate(${packageElement.x},${packageElement.y})`);

      const bodyRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      bodyRect.setAttribute("x", 0);
      bodyRect.setAttribute("y", 16);
      bodyRect.setAttribute("width", packageElement.w);
      bodyRect.setAttribute("height", packageElement.h);
      bodyRect.setAttribute("class", "body");
      bodyRect.setAttribute("pointer-events", "none");
      groupElement.appendChild(bodyRect);

      const headerRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      headerRect.setAttribute("x", 0);
      headerRect.setAttribute("y", 0);
      headerRect.setAttribute("width", Math.max(120, packageElement.w * 0.4));
      headerRect.setAttribute("height", 24);
      headerRect.setAttribute("class", "header");
      groupElement.appendChild(headerRect);

      const labelText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      labelText.setAttribute("x", 8);
      labelText.setAttribute("y", 16);
      labelText.textContent = packageElement.name;
      labelText.setAttribute("class", "pkg-label");
      groupElement.appendChild(labelText);

      const handleDefs = [
        { k: "nw", x: 0, y: 16, cls: "handle nw" },
        { k: "n", x: packageElement.w / 2, y: 16, cls: "handle n" },
        { k: "ne", x: packageElement.w, y: 16, cls: "handle ne" },
        { k: "w", x: 0, y: 16 + packageElement.h / 2, cls: "handle w" },
        { k: "e", x: packageElement.w, y: 16 + packageElement.h / 2, cls: "handle e" },
        { k: "sw", x: 0, y: 16 + packageElement.h, cls: "handle sw" },
        { k: "s", x: packageElement.w / 2, y: 16 + packageElement.h, cls: "handle s" },
        { k: "se", x: packageElement.w, y: 16 + packageElement.h, cls: "handle se" },
      ];
      handleDefs.forEach((handleDef) => {
        const handleRect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        handleRect.setAttribute("x", handleDef.x - 5);
        handleRect.setAttribute("y", handleDef.y - 5);
        handleRect.setAttribute("width", 10);
        handleRect.setAttribute("height", 10);
        handleRect.setAttribute("class", handleDef.cls);
        handleRect.dataset.dir = handleDef.k;
        handleRect.style.touchAction = "none";
        handleRect.addEventListener("pointerdown", (event) =>
          this.onResizeHandle?.(event, packageElement.id, handleDef.k)
        );
        groupElement.appendChild(handleRect);
      });

      packageLayer.appendChild(groupElement);
    });

    // edges
    const edgeLayer = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this.viewportGroupElement.appendChild(edgeLayer);
    this.diagramState.relationList.forEach((relationElement) => {
      const sourceClass = this.diagramState.getClassById(relationElement.source),
        targetClass = this.diagramState.getClassById(relationElement.target);
      if (!sourceClass || !targetClass) return;
      const [sourceX, sourceY] = Geometry.center(sourceClass),
        [targetX, targetY] = Geometry.center(targetClass);
      const [startX, startY] = Geometry.intersectRect(sourceClass, targetX, targetY);
      let [endX, endY] = Geometry.intersectRect(targetClass, sourceX, sourceY);

      // Shorten the link by a few pixels so the marker is fully visible
      const shorten = 8; // px
      const dx = endX - startX;
      const dy = endY - startY;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > shorten) {
        endX = endX - (dx / length) * shorten;
        endY = endY - (dy / length) * shorten;
      }

      const lineElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      lineElement.setAttribute("x1", startX);
      lineElement.setAttribute("y1", startY);
      lineElement.setAttribute("x2", endX);
      lineElement.setAttribute("y2", endY);
      let className = "edge ";
      if (relationElement.type === "association") className += "association";
      if (relationElement.type === "generalization") className += "generalization";
      if (relationElement.type === "dependency") className += "dependency dashed";
      if (relationElement.type === "realization") className += "realization dashed";
      if (relationElement.type === "aggregation") className += "aggregation";
      if (relationElement.type === "composition") className += "composition";
      lineElement.setAttribute("class", className);
      edgeLayer.appendChild(lineElement);
    });

    // nodes
    const nodeLayer = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this.viewportGroupElement.appendChild(nodeLayer);
    this.diagramState.classList.forEach((classElement) => {
      const groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const isSelected =
        this.diagramState.selectedElement?.type === "class" &&
        this.diagramState.selectedElement.id === classElement.id;
      groupElement.setAttribute("class", "node" + (isSelected ? " selected" : ""));
      groupElement.dataset.id = classElement.id;
      groupElement.setAttribute("transform", `translate(${classElement.x},${classElement.y})`);

      const rect = this.svgRect(0, 0, classElement.w, classElement.h);
      groupElement.appendChild(rect);

      let y = 10;
      const title = this.svgText(10, y + 16, classElement.name, "title");
      groupElement.appendChild(title);
      y += 28;

      classElement.attributes.forEach((attribute) => {
        groupElement.appendChild(this.svgText(10, y, attribute));
        y += 18;
      });
      if (classElement.attributes.length === 0) y += 8;

      classElement.operations.forEach((operation) => {
        groupElement.appendChild(this.svgText(10, y, operation));
        y += 18;
      });
      nodeLayer.appendChild(groupElement);
    });

    this.viewportGroupElement.setAttribute(
      "transform",
      `translate(${this.diagramState.panOffset.x},${this.diagramState.panOffset.y})`
    );
  }
}
