export default class DiagramState {
  constructor() {
    this.classes = [];
    this.packages = [];
    this.relations = [];
    this.selected = null;
    this.linkMode = false;
    this.tempEdge = null; // <line> SVG during linking
    this.nextId = 1;
    this.pan = { x: 0, y: 0 };
    this.interaction = null; // {mode, pointerId, start, ...}
  }
  uid(prefix) {
    return prefix + this.nextId++;
  }
  classById(id) {
    return this.classes.find((c) => c.id === id);
  }
  packageById(id) {
    return this.packages.find((p) => p.id === id);
  }
  setSelected(type, id) {
    this.selected = { type, id };
  }
  clearSelection() {
    this.selected = null;
  }
  addClass(x, y) {
    const id = this.uid("C");
    const c = {
      id,
      name: "Class" + this.nextId,
      x,
      y,
      w: 200,
      h: 110,
      attributes: [],
      operations: [],
      packageId: null,
    };
    this.classes.push(c);
    return c;
  }
  addPackage(x, y) {
    const id = this.uid("P");
    const p = { id, name: "Module" + this.nextId, x, y, w: 360, h: 240 };
    this.packages.push(p);
    return p;
  }
  removeClass(id) {
    const i = this.classes.findIndex((c) => c.id === id);
    if (i >= 0) this.classes.splice(i, 1);
    this.relations = this.relations.filter(
      (r) => r.source !== id && r.target !== id
    );
  }
  removePackage(id) {
    const i = this.packages.findIndex((p) => p.id === id);
    if (i >= 0) this.packages.splice(i, 1);
    this.classes.forEach((c) => {
      if (c.packageId === id) c.packageId = null;
    });
  }
  addRelation(type, source, target) {
    if (!source || !target || source === target) return null;
    const id = this.uid("R");
    const r = { id, type, source, target };
    this.relations.push(r);
    return r;
  }
}
