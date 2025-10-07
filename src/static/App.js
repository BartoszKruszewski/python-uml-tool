import DiagramState from "./DiagramState.js";
import SvgRenderer from "./SvgRenderer.js";
import LinkService from "./LinkService.js";
import Exporter from "./Exporter.js";
import GenerateService from "./GenerateService.js";
import EditorsUI from "./EditorsUI.js";
import TreeUI from "./TreeUI.js";
import InteractionController from "./InteractionController.js";
import Coordinate from "./Coordinate.js";

export default class App {
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

  scheduleRender() {
    if (this.animationFrameId !== null) return;
    this.animationFrameId = requestAnimationFrame(() => {
      this.animationFrameId = null;
      const gridStep = Math.max(
        4,
        parseInt(this.references.inGridSize.value || "16", 10)
      );
      this.svgRenderer.render(gridStep);
      this.editorsUI.updateEditors();
      this.treeUI.render();
    });
  }
}
