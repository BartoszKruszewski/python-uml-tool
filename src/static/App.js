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
 * @property {HTMLElement} attrsContainer
 * @property {HTMLElement} opsContainer
 * @property {HTMLButtonElement} btnAddAttr
 * @property {HTMLButtonElement} btnAddOp
 * @property {HTMLSelectElement} inClsPkg
 * @property {HTMLButtonElement} btnDelete
 * @property {HTMLInputElement|HTMLTextAreaElement} inPkgName
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
        attrsContainer: references.attrsContainer,
        opsContainer: references.opsContainer,
        buttonAddAttr: references.btnAddAttr,
        buttonAddOp: references.btnAddOp,
        inputClassPackage: references.inClsPkg,
        buttonDeleteClass: references.btnDelete,
        inputPackageName: references.inPkgName,
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
    // Clear modal setup
    const clearModal = new bootstrap.Modal(document.getElementById("clearModal"));
    const confirmClearBtn = document.getElementById("btnConfirmClear");
    
    references.btnClear.addEventListener("click", () => {
      clearModal.show();
    });
    
    confirmClearBtn.addEventListener("click", () => {
      this.diagramState.classList = [];
      this.diagramState.packageList = [];
      this.diagramState.relationList = [];
      this.diagramState.selectedElement = null;
      this.editorsUI.refreshPackageSelect();
      this.scheduleRender();
      clearModal.hide();
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
        this.fitClassesToContent();
        this.autoLayoutImportedDiagram();

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
   * Resize classes so their labels, attributes, and operations fit inside after import.
   */
  fitClassesToContent() {
    const MIN_W = 200;
    const MIN_H = 110;
    const PADDING_X = 20; // 10px left + 10px right
    const PADDING_BOTTOM = 10;
    const TITLE_FONT = "16px Inter, system-ui, sans-serif";
    const BODY_FONT = "14px Inter, system-ui, sans-serif";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const formatAttribute = (attribute) => {
      if (typeof attribute === "object" && attribute !== null) {
        const visibility = attribute.isPrivate ? "- " : "+ ";
        const typeStr = attribute.type ? `: ${attribute.type}` : "";
        return `${visibility}${attribute.name}${typeStr}`;
      }
      return String(attribute || "");
    };

    const formatOperation = (operation) => {
      if (typeof operation === "object" && operation !== null) {
        const visibility = operation.isPrivate ? "- " : "+ ";
        const params = operation.params || [];
        const paramStrs = params.map((p) => (p.type ? `${p.name}: ${p.type}` : p.name));
        const paramStr = `(${paramStrs.join(", ")})`;
        const returnStr = operation.returnType ? `: ${operation.returnType}` : "";
        return `${visibility}${operation.name}${paramStr}${returnStr}`;
      }
      return String(operation || "");
    };

    const measureTextWidth = (text, font) => {
      ctx.font = font;
      return ctx.measureText(text || "").width;
    };

    this.diagramState.classList.forEach((cls) => {
      const titleText = cls.name || "Class";
      const attrLines = (cls.attributes || []).map(formatAttribute);
      const opLines = (cls.operations || []).map(formatOperation);

      let maxTextWidth = measureTextWidth(titleText, TITLE_FONT);
      attrLines.forEach((line) => {
        maxTextWidth = Math.max(maxTextWidth, measureTextWidth(line, BODY_FONT));
      });
      opLines.forEach((line) => {
        maxTextWidth = Math.max(maxTextWidth, measureTextWidth(line, BODY_FONT));
      });

      let y = 10; // top padding before title
      y += 28; // title block height

      if (attrLines.length > 0) {
        y += attrLines.length * 18;
      } else {
        y += 8; // small spacer when no attributes
      }

      if (opLines.length > 0) {
        y += opLines.length * 18;
      }

      const requiredWidth = Math.max(MIN_W, Math.ceil(maxTextWidth + PADDING_X));
      const requiredHeight = Math.max(MIN_H, Math.ceil(y + PADDING_BOTTOM));

      cls.w = requiredWidth;
      cls.h = requiredHeight;
    });
  }

  /**
   * Auto-layout imported diagrams to avoid overlapping nodes.
   * Positions packages in a coarse grid, stacks nested packages, and grids classes.
   */
  autoLayoutImportedDiagram() {
    const CLASS_W = 200;
    const CLASS_H = 110;
    const CLASS_GAP = 80;
    const PACKAGE_MIN_W = 360;
    const PACKAGE_MIN_H = 240;
    const PACKAGE_PADDING = 30;
    const PACKAGE_HEADER = 24;
    const STACK_GAP = 70;
    const ROOT_GAP_X = 180;
    const ROOT_GAP_Y = 220;
    const START_X = 80;
    const START_Y = 80;

    const packageMap = new Map(
      this.diagramState.packageList.map((pkg) => [pkg.id, pkg])
    );

    const classesByPackage = new Map();
    const childPackagesByParent = new Map();

    const ensureBucket = (map, key) => {
      if (!map.has(key)) map.set(key, []);
      return map.get(key);
    };

    this.diagramState.classList.forEach((cls) => {
      ensureBucket(classesByPackage, cls.packageId || null).push(cls);
      cls.w = cls.w || CLASS_W;
      cls.h = cls.h || CLASS_H;
    });

    this.diagramState.packageList.forEach((pkg) => {
      ensureBucket(childPackagesByParent, pkg.parentId || null).push(pkg);
    });

    // Store measured sizes to reuse in placement phase
    const layoutInfo = new Map();

    // Bottom-up measurement pass
    const measurePackage = (pkgId) => {
      const pkg = packageMap.get(pkgId);
      const nestedPackages = childPackagesByParent.get(pkgId) || [];
      nestedPackages.forEach((child) => measurePackage(child.id));

      const classesInPackage = classesByPackage.get(pkgId) || [];
      const classCols = classesInPackage.length > 0 ? Math.ceil(Math.sqrt(classesInPackage.length)) : 0;
      const classRows = classCols > 0 ? Math.ceil(classesInPackage.length / classCols) : 0;
      const maxClassW = classesInPackage.length > 0 ? Math.max(...classesInPackage.map((c) => c.w || CLASS_W)) : CLASS_W;
      const maxClassH = classesInPackage.length > 0 ? Math.max(...classesInPackage.map((c) => c.h || CLASS_H)) : CLASS_H;
      const classAreaW = classCols > 0 ? classCols * maxClassW + (classCols - 1) * CLASS_GAP : 0;
      const classAreaH = classRows > 0 ? classRows * maxClassH + (classRows - 1) * CLASS_GAP : 0;

      const nestedWidths = nestedPackages.map((p) => layoutInfo.get(p.id).width);
      const nestedHeights = nestedPackages.map((p) => layoutInfo.get(p.id).height);
      const nestedAreaW = nestedWidths.length > 0 ? Math.max(...nestedWidths) : 0;
      const nestedAreaH = nestedHeights.length > 0
        ? nestedHeights.reduce((sum, h) => sum + h, 0) + (nestedPackages.length - 1) * STACK_GAP
        : 0;

      const innerWidth = Math.max(classAreaW, nestedAreaW);
      const gapBetweenBlocks = classAreaH > 0 && nestedAreaH > 0 ? STACK_GAP : 0;
      const innerHeight = classAreaH + gapBetweenBlocks + nestedAreaH;

      const width = Math.max(PACKAGE_MIN_W, innerWidth + PACKAGE_PADDING * 2);
      const height = Math.max(
        PACKAGE_MIN_H,
        PACKAGE_HEADER + PACKAGE_PADDING * 2 + innerHeight
      );

      layoutInfo.set(pkgId, {
        width,
        height,
        classCols,
        classAreaH,
        nestedAreaH,
        maxClassW,
        maxClassH,
      });

      pkg.w = width;
      pkg.h = height;
    };

    // Measure every package starting from roots
    const rootPackages = childPackagesByParent.get(null) || [];
    rootPackages.forEach((pkg) => measurePackage(pkg.id));

    // Top-down placement pass
    const placePackage = (pkgId, originX, originY) => {
      const info = layoutInfo.get(pkgId);
      const pkg = packageMap.get(pkgId);
      pkg.x = originX;
      pkg.y = originY;
      pkg.w = info.width;
      pkg.h = info.height;

      const classesInPackage = classesByPackage.get(pkgId) || [];
      classesInPackage.forEach((cls, index) => {
        const row = Math.floor(index / Math.max(1, info.classCols));
        const col = info.classCols > 0 ? index % info.classCols : 0;
        cls.x = originX + PACKAGE_PADDING + col * (info.maxClassW + CLASS_GAP);
        cls.y = originY + PACKAGE_HEADER + PACKAGE_PADDING + row * (info.maxClassH + CLASS_GAP);
      });

      const nestedPackages = childPackagesByParent.get(pkgId) || [];
      let currentY = originY + PACKAGE_HEADER + PACKAGE_PADDING + info.classAreaH;
      if (info.classAreaH > 0 && nestedPackages.length > 0) {
        currentY += STACK_GAP;
      }
      nestedPackages.forEach((childPkg) => {
        const childInfo = layoutInfo.get(childPkg.id);
        placePackage(childPkg.id, originX + PACKAGE_PADDING, currentY);
        currentY += childInfo.height + STACK_GAP;
      });
    };

    if (rootPackages.length > 0) {
      const rootCols = Math.max(1, Math.ceil(Math.sqrt(rootPackages.length)));
      const maxRootWidth = Math.max(...rootPackages.map((pkg) => layoutInfo.get(pkg.id).width));
      const maxRootHeight = Math.max(...rootPackages.map((pkg) => layoutInfo.get(pkg.id).height));

      rootPackages.forEach((pkg, index) => {
        const col = index % rootCols;
        const row = Math.floor(index / rootCols);
        const x = START_X + col * (maxRootWidth + ROOT_GAP_X);
        const y = START_Y + row * (maxRootHeight + ROOT_GAP_Y);
        placePackage(pkg.id, x, y);
      });
    }

    // Layout classes not assigned to any package under the last row of packages
    const rootClasses = classesByPackage.get(null) || [];
    if (rootClasses.length > 0) {
      const rootPackageRows = rootPackages.length
        ? Math.ceil(rootPackages.length / Math.max(1, Math.ceil(Math.sqrt(rootPackages.length))))
        : 0;
      const maxRootHeight = rootPackages.length
        ? Math.max(...rootPackages.map((pkg) => layoutInfo.get(pkg.id).height))
        : 0;
      const baseY = rootPackageRows > 0
        ? START_Y + rootPackageRows * (maxRootHeight + ROOT_GAP_Y)
        : START_Y;

      const cols = Math.max(1, Math.ceil(Math.sqrt(rootClasses.length)));
      const maxRootClassW = Math.max(...rootClasses.map((c) => c.w || CLASS_W));
      const maxRootClassH = Math.max(...rootClasses.map((c) => c.h || CLASS_H));
      rootClasses.forEach((cls, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        cls.x = START_X + col * (maxRootClassW + CLASS_GAP);
        cls.y = baseY + row * (maxRootClassH + CLASS_GAP);
      });
    }
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
