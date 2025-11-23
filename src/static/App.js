import DiagramState from "./DiagramState.js";
import SvgRenderer from "./SvgRenderer.js";
import LinkService from "./LinkService.js";
import Exporter from "./Exporter.js";
import XmiImporter from "./XmiImporter.js";
import GenerateService from "./GenerateService.js";
import EditorsUI from "./EditorsUI.js";
import TreeUI from "./TreeUI.js";
import InteractionController from "./InteractionController.js";
import Coordinate from "./Coordinate.js";

/**
 * Top-level application wire-up: state, renderer, UI, and interactions.
 * @typedef {Object} AppReferences
 * @property {SVGSVGElement} svg
 * @property {SVGGElement} viewport
 * @property {SVGPatternElement} gridPattern
 * @property {SVGRectElement} gridRect
 * @property {HTMLElement} tree
 * @property {HTMLButtonElement} btnAddClass
 * @property {HTMLButtonElement} btnAddPackage
 * @property {HTMLButtonElement} btnLinkMode
 * @property {HTMLSelectElement} linkTypeSel
 * @property {HTMLButtonElement} btnGenerate
 * @property {HTMLButtonElement} btnSaveXMI
 * @property {HTMLButtonElement} btnLoadXMI
 * @property {HTMLInputElement} fileInputXMI
 * @property {HTMLButtonElement} btnClear
 * @property {HTMLElement} noSel
 * @property {HTMLElement} classEditor
 * @property {HTMLElement} packageEditor
 * @property {HTMLInputElement|HTMLTextAreaElement} inClsName
 * @property {HTMLTextAreaElement} inAttrs
 * @property {HTMLTextAreaElement} inOps
 * @property {HTMLSelectElement} inClsPkg
 * @property {HTMLButtonElement} btnUpdate
 * @property {HTMLButtonElement} btnDelete
 * @property {HTMLInputElement|HTMLTextAreaElement} inPkgName
 * @property {HTMLButtonElement} btnPkgUpdate
 * @property {HTMLButtonElement} btnPkgDelete
 * @property {HTMLInputElement} inGridSize
 */
export default class App {
  /**
   * @param {AppReferences} references - DOM references used across modules.
   */
  constructor(references) {
    this.references = references;
    this.diagramState = new DiagramState();
    this.svgRenderer = new SvgRenderer(
      references.svg,
      references.viewport,
      references.gridRect,
      this.diagramState
    );
    this.linkService = new LinkService(this.diagramState, references.viewport);
    this.exporter = new Exporter();
    this.importer = new XmiImporter();
    this.generateService = new GenerateService(references.btnGenerate);

    this.animationFrameId = null;

    // Editors and Tree
    this.editorsUI = new EditorsUI(
      this.diagramState,
      {
        noSelectionPanel: references.noSel,
        classEditorPanel: references.classEditor,
        packageEditorPanel: references.packageEditor,
        inputClassName: references.inClsName,
        inputClassAttributes: references.inAttrs,
        inputClassOperations: references.inOps,
        inputClassPackage: references.inClsPkg,
        buttonUpdateClass: references.btnUpdate,
        buttonDeleteClass: references.btnDelete,
        inputPackageName: references.inPkgName,
        buttonUpdatePackage: references.btnPkgUpdate,
        buttonDeletePackage: references.btnPkgDelete,
      },
      () => this.scheduleRender()
    );

    this.treeUI = new TreeUI(
      references.tree,
      this.diagramState,
      (elementType, elementId) => {
        this.diagramState.setSelected(elementType, elementId);
        this.scheduleRender();
      }
    );

    // Interaction controller
    this.interactionController = new InteractionController(
      references.svg,
      references.viewport,
      this.diagramState,
      this.svgRenderer,
      this.linkService,
      () => Math.max(4, parseInt(references.inGridSize.value || "16", 10)),
      (elementType, elementId) => {
        this.diagramState.setSelected(elementType, elementId);
        this.scheduleRender();
      },
      () => this.scheduleRender()
    );

    // Link type select exposure (used in InteractionController via property)
    this.interactionController.linkTypeSelect = references.linkTypeSel;

    // Wire UI buttons
    references.btnAddClass.addEventListener("click", () => {
      const { x: worldX, y: worldY } = Coordinate.screenToWorld(
        references.svg,
        references.viewport,
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      const newClass = this.diagramState.addClass(worldX + 40, worldY + 40);
      this.diagramState.setSelected("class", newClass.id);
      this.scheduleRender();
    });
    references.btnAddPackage.addEventListener("click", () => {
      const { x: worldX, y: worldY } = Coordinate.screenToWorld(
        references.svg,
        references.viewport,
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      const newPackage = this.diagramState.addPackage(worldX - 60, worldY - 60);
      this.diagramState.setSelected("package", newPackage.id);
      this.editorsUI.refreshPackageSelect();
      this.scheduleRender();
    });
    references.btnLinkMode.addEventListener("click", () => {
      this.linkService.toggle(references.btnLinkMode);
    });
    references.btnClear.addEventListener("click", () => {
      if (confirm("Clear the diagram?")) {
        this.diagramState.classes = [];
        this.diagramState.packages = [];
        this.diagramState.relations = [];
        this.diagramState.selected = null;
        this.editorsUI.refreshPackageSelect();
        this.scheduleRender();
      }
    });
    references.inGridSize.addEventListener("change", () => {
      const gridStep = Math.max(4, parseInt(references.inGridSize.value || "16", 10));
      references.gridPattern.setAttribute("width", gridStep);
      references.gridPattern.setAttribute("height", gridStep);
      this.scheduleRender();
    });
    references.btnGenerate.addEventListener("click", async () => {
      const xmiXml = this.exporter.buildXMI(this.diagramState);
      await this.generateService.generate(xmiXml);
    });
    references.btnSaveXMI.addEventListener("click", () => {
      const xmiXml = this.exporter.buildXMI(this.diagramState);
      const blob = new Blob([xmiXml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const anchorElement = document.createElement("a");
      anchorElement.href = url;
      anchorElement.download = "diagram.xmi";
      document.body.appendChild(anchorElement);
      anchorElement.click();
      URL.revokeObjectURL(url);
      anchorElement.remove();
    });
    references.btnLoadXMI.addEventListener("click", () => {
      references.fileInputXMI.click();
    });
    references.fileInputXMI.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const fileText = await file.text();
        const parsed = this.importer.parseXMI(fileText);
        
        // Clear current diagram
        this.diagramState.classList = [];
        this.diagramState.packageList = [];
        this.diagramState.relationList = [];
        this.diagramState.selectedElement = null;
        this.diagramState.nextElementId = 1;

        // Find max ID to set nextElementId correctly
        let maxId = 0;
        [...parsed.packages, ...parsed.classes, ...parsed.relations].forEach(item => {
          if (item.id) {
            const numMatch = item.id.match(/\d+$/);
            if (numMatch) {
              const num = parseInt(numMatch[0], 10);
              if (num > maxId) maxId = num;
            }
          }
        });
        if (maxId > 0) {
          this.diagramState.nextElementId = maxId + 1;
        }

        // Create maps for ID lookup
        const packageMap = new Map();
        const classMap = new Map();

        // Load packages directly (don't use addPackage to avoid ID conflicts)
        parsed.packages.forEach(pkg => {
          const packageElement = {
            id: pkg.id,
            name: pkg.name,
            x: pkg.x,
            y: pkg.y,
            w: pkg.w || 360,
            h: pkg.h || 240,
            parentId: pkg.parentId || null
          };
          this.diagramState.packageList.push(packageElement);
          packageMap.set(pkg.id, packageElement);
        });

        // Load classes directly (don't use addClass to avoid ID conflicts)
        parsed.classes.forEach(cls => {
          const classElement = {
            id: cls.id,
            name: cls.name,
            x: cls.x,
            y: cls.y,
            w: cls.w || 200,
            h: cls.h || 110,
            attributes: cls.attributes || [],
            operations: cls.operations || [],
            packageId: cls.packageId || null
          };
          this.diagramState.classList.push(classElement);
          classMap.set(cls.id, classElement);
        });

        // Adjust nested packages positions and package sizes
        // Process packages from deepest to shallowest (bottom-up)
        const packagesByDepth = [];
        const getPackageDepth = (pkgId) => {
          let depth = 0;
          let currentId = pkgId;
          while (currentId) {
            const pkg = this.diagramState.packageList.find(p => p.id === currentId);
            if (!pkg || !pkg.parentId) break;
            depth++;
            currentId = pkg.parentId;
          }
          return depth;
        };
        
        this.diagramState.packageList.forEach(pkg => {
          packagesByDepth.push({ pkg, depth: getPackageDepth(pkg.id) });
        });
        packagesByDepth.sort((a, b) => b.depth - a.depth); // Deepest first
        
        // Process each package (deepest first)
        packagesByDepth.forEach(({ pkg }) => {
          const classesInPackage = this.diagramState.classList.filter(c => c.packageId === pkg.id);
          const nestedPackages = this.diagramState.packageList.filter(p => p.parentId === pkg.id);
          
          // Calculate bounding box for classes
          let minX, minY, maxX, maxY;
          
          if (classesInPackage.length > 0) {
            minX = Math.min(...classesInPackage.map(c => c.x));
            minY = Math.min(...classesInPackage.map(c => c.y));
            maxX = Math.max(...classesInPackage.map(c => c.x + c.w));
            maxY = Math.max(...classesInPackage.map(c => c.y + c.h));
          } else {
            // No classes, use package position
            minX = pkg.x;
            minY = pkg.y;
            maxX = pkg.x + pkg.w;
            maxY = pkg.y + pkg.h;
          }
          
          // Position nested packages to the right of classes
          if (nestedPackages.length > 0) {
            const classesRightEdge = classesInPackage.length > 0 ? maxX : pkg.x + pkg.w;
            const startX = classesRightEdge + 50; // Space after classes
            let currentY = minY;
            
            nestedPackages.forEach((nestedPkg, index) => {
              nestedPkg.x = startX;
              nestedPkg.y = currentY;
              
              // Reposition classes inside this nested package
              const classesInNestedPackage = this.diagramState.classList.filter(c => c.packageId === nestedPkg.id);
              classesInNestedPackage.forEach((cls, clsIndex) => {
                const row = Math.floor(clsIndex / 3); // 3 classes per row
                const col = clsIndex % 3;
                cls.x = nestedPkg.x + 30 + col * (cls.w + 80);
                cls.y = nestedPkg.y + 50 + row * (cls.h + 80);
              });
              
              // Adjust nested package size to cover its classes
              if (classesInNestedPackage.length > 0) {
                const nestedMinX = Math.min(...classesInNestedPackage.map(c => c.x));
                const nestedMinY = Math.min(...classesInNestedPackage.map(c => c.y));
                const nestedMaxX = Math.max(...classesInNestedPackage.map(c => c.x + c.w));
                const nestedMaxY = Math.max(...classesInNestedPackage.map(c => c.y + c.h));
                
                const nestedPadding = 30;
                nestedPkg.x = Math.min(nestedPkg.x, nestedMinX - nestedPadding);
                nestedPkg.y = Math.min(nestedPkg.y, nestedMinY - nestedPadding - 16);
                nestedPkg.w = Math.max(360, nestedMaxX - nestedPkg.x + nestedPadding);
                nestedPkg.h = Math.max(240, nestedMaxY - nestedPkg.y + nestedPadding + 16);
              }
              
              currentY += nestedPkg.h + 50; // Stack nested packages vertically
            });
            
            // Update bounding box to include nested packages
            const nestedMaxX = Math.max(...nestedPackages.map(p => p.x + p.w));
            const nestedMaxY = Math.max(...nestedPackages.map(p => p.y + p.h));
            maxX = Math.max(maxX, nestedMaxX);
            maxY = Math.max(maxY, nestedMaxY);
          }
          
          // Add padding
          const padding = 30;
          minX -= padding;
          minY -= padding;
          maxX += padding;
          maxY += padding;
          
          // Ensure minimum size
          const minWidth = 360;
          const minHeight = 240;
          
          // Update package position and size to cover classes and nested packages
          pkg.x = Math.min(pkg.x, minX);
          pkg.y = Math.min(pkg.y, minY - 16); // Account for header
          pkg.w = Math.max(minWidth, maxX - pkg.x);
          pkg.h = Math.max(minHeight, maxY - pkg.y + 16); // Account for header
        });

        // Load relations (after classes are loaded)
        parsed.relations.forEach(rel => {
          // Verify that source and target classes exist
          if (classMap.has(rel.source) && classMap.has(rel.target)) {
            const relation = {
              id: rel.id,
              type: rel.type,
              source: rel.source,
              target: rel.target
            };
            this.diagramState.relationList.push(relation);
          }
        });

        this.editorsUI.refreshPackageSelect();
        this.scheduleRender();
        
        // Reset file input
        event.target.value = "";
      } catch (error) {
        alert("Error loading XMI file: " + error.message);
        console.error("XMI import error:", error);
        event.target.value = "";
      }
    });

    // Init grid
    const gridStep = Math.max(4, parseInt(references.inGridSize.value || "16", 10));
    references.gridPattern.setAttribute("width", gridStep);
    references.gridPattern.setAttribute("height", gridStep);

    // Seed initial content
    const initialPackage = this.diagramState.addPackage(80, 80);
    const initialClass1 = this.diagramState.addClass(140, 160);
    const initialClass2 = this.diagramState.addClass(380, 240);
    this.diagramState.setSelected("package", initialPackage.id);

    // First render
    this.scheduleRender();
  }

  /**
   * Schedule a render on the next animation frame and update UI panels.
   * @returns {void}
   */
  scheduleRender() {
    if (this.animationFrameId !== null) return;
    this.animationFrameId = requestAnimationFrame(() => {
      this.animationFrameId = null;
      const gridStep = Math.max(
        4,
        parseInt(this.references.inGridSize.value || "16", 10)
      );
      this.svgRenderer.render(gridStep);
      // Ensure viewport transform (including zoom) is preserved after rendering
      this.interactionController.updateViewportTransform();
      this.editorsUI.updateEditors();
      this.treeUI.render();
    });
  }
}
