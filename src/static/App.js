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
  constructor(refs) {
    this.refs = refs;
    this.state = new DiagramState();
    this.renderer = new SvgRenderer(refs.svg, refs.viewport, refs.gridRect, this.state);
    this.linkService = new LinkService(this.state, refs.viewport);
    this.exporter = new Exporter();
    this.generator = new GenerateService(refs.btnGenerate);

    this._rafId = null;

    // Editors and Tree
    this.editors = new EditorsUI(this.state, {
      noSel: refs.noSel, classEditor: refs.classEditor, packageEditor: refs.packageEditor,
      inClsName: refs.inClsName, inAttrs: refs.inAttrs, inOps: refs.inOps, inClsPkg: refs.inClsPkg,
      btnUpdate: refs.btnUpdate, btnDelete: refs.btnDelete,
      inPkgName: refs.inPkgName, btnPkgUpdate: refs.btnPkgUpdate, btnPkgDelete: refs.btnPkgDelete
    }, () => this.scheduleRender());

    this.tree = new TreeUI(refs.tree, this.state, (type, id) => { this.state.setSelected(type, id); this.scheduleRender(); });

    // Interaction controller
    this.interaction = new InteractionController(
      refs.svg, refs.viewport, this.state, this.renderer, this.linkService,
      () => Math.max(4, parseInt(refs.inGridSize.value || '16', 10)),
      (type, id) => { this.state.setSelected(type, id); this.scheduleRender(); },
      () => this.scheduleRender()
    );

    // Link type select exposure (used in InteractionController via property)
    this.interaction.linkTypeSel = refs.linkTypeSel;

    // Wire UI buttons
    refs.btnAddClass.addEventListener('click', () => {
      const { x, y } = Coordinate.screenToWorld(refs.svg, refs.viewport, window.innerWidth / 2, window.innerHeight / 2);
      const c = this.state.addClass(x + 40, y + 40);
      this.state.setSelected('class', c.id);
      this.scheduleRender();
    });
    refs.btnAddPackage.addEventListener('click', () => {
      const { x, y } = Coordinate.screenToWorld(refs.svg, refs.viewport, window.innerWidth / 2, window.innerHeight / 2);
      const p = this.state.addPackage(x - 60, y - 60);
      this.state.setSelected('package', p.id);
      this.editors.refreshPackageSelect();
      this.scheduleRender();
    });
    refs.btnLinkMode.addEventListener('click', () => {
      this.linkService.toggle(refs.btnLinkMode);
    });
    refs.btnClear.addEventListener('click', () => {
      if (confirm('Clear the diagram?')) {
        this.state.classes = []; this.state.packages = []; this.state.relations = [];
        this.state.selected = null; this.editors.refreshPackageSelect(); this.scheduleRender();
      }
    });
    refs.inGridSize.addEventListener('change', () => {
      const step = Math.max(4, parseInt(refs.inGridSize.value || '16', 10));
      refs.gridPattern.setAttribute('width', step);
      refs.gridPattern.setAttribute('height', step);
      this.scheduleRender();
    });
    refs.btnGenerate.addEventListener('click', async () => {
      const xml = this.exporter.buildXMI(this.state, refs.inModelName.value);
      await this.generator.generate(xml);
    });

    // Init grid
    const step = Math.max(4, parseInt(refs.inGridSize.value || '16', 10));
    refs.gridPattern.setAttribute('width', step);
    refs.gridPattern.setAttribute('height', step);

    // Seed initial content
    const p = this.state.addPackage(80, 80);
    const c1 = this.state.addClass(140, 160);
    const c2 = this.state.addClass(380, 240);
    this.state.setSelected('package', p.id);

    // First render
    this.scheduleRender();
  }

  scheduleRender() {
    if (this._rafId !== null) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      const step = Math.max(4, parseInt(this.refs.inGridSize.value || '16', 10));
      this.renderer.render(step);
      this.editors.updateEditors();
      this.tree.render(this.refs.inModelName.value);
    });
  }
}