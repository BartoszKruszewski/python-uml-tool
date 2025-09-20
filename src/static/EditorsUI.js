export default class EditorsUI {
  constructor(state, refs, onChange) {
    this.state = state;
    this.refs = refs; // {noSel, classEditor, packageEditor, inClsName, inAttrs, inOps, inClsPkg, btnUpdate, btnDelete, inPkgName, btnPkgUpdate, btnPkgDelete}
    this.onChange = onChange;
    // bind buttons
    refs.btnUpdate.addEventListener("click", () => this.applyClassEditor());
    refs.btnDelete.addEventListener("click", () => {
      const s = this.state.selected;
      if (s?.type === "class") {
        this.state.removeClass(s.id);
        this.state.clearSelection();
        this.onChange();
      }
    });
    refs.btnPkgUpdate.addEventListener("click", () =>
      this.applyPackageEditor()
    );
    refs.btnPkgDelete.addEventListener("click", () => {
      const s = this.state.selected;
      if (s?.type === "package") {
        this.state.removePackage(s.id);
        this.state.clearSelection();
        this.refreshPackageSelect();
        this.onChange();
      }
    });
  }
  refreshPackageSelect() {
    const { inClsPkg } = this.refs;
    const val = inClsPkg.value;
    inClsPkg.innerHTML = "";
    const optNone = document.createElement("option");
    optNone.value = "";
    optNone.textContent = "(none)";
    inClsPkg.appendChild(optNone);
    this.state.packages.forEach((p) => {
      const o = document.createElement("option");
      o.value = p.id;
      o.textContent = p.name;
      inClsPkg.appendChild(o);
    });
    if (val) inClsPkg.value = val;
  }
  applyClassEditor() {
    const sel = this.state.selected;
    if (!sel || sel.type !== "class") return;
    const c = this.state.classById(sel.id);
    const { inClsName, inAttrs, inOps, inClsPkg } = this.refs;
    c.name = inClsName.value.trim() || "Class";
    c.attributes = inAttrs.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    c.operations = inOps.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    c.packageId = inClsPkg.value || null;
    const base = 28,
      line = 18,
      sep = 12;
    const attrH = c.attributes.length ? c.attributes.length * line + sep : sep;
    const opH = c.operations.length ? c.operations.length * line + sep : sep;
    c.h = base + sep + attrH + opH + 10;
    this.onChange();
  }
  applyPackageEditor() {
    const sel = this.state.selected;
    if (!sel || sel.type !== "package") return;
    const p = this.state.packageById(sel.id);
    const { inPkgName } = this.refs;
    p.name = inPkgName.value.trim() || "Module";
    this.onChange();
    this.refreshPackageSelect();
  }
  updateEditors() {
    const {
      noSel,
      classEditor,
      packageEditor,
      inClsName,
      inAttrs,
      inOps,
      inClsPkg,
      inPkgName,
    } = this.refs;
    const sel = this.state.selected;
    if (!sel) {
      noSel.classList.remove("hidden");
      classEditor.classList.add("hidden");
      packageEditor.classList.add("hidden");
      return;
    }
    noSel.classList.add("hidden");
    if (sel.type === "class") {
      classEditor.classList.remove("hidden");
      packageEditor.classList.add("hidden");
      const c = this.state.classById(sel.id);
      inClsName.value = c.name;
      inAttrs.value = c.attributes.join("\n");
      inOps.value = c.operations.join("\n");
      this.refreshPackageSelect();
      inClsPkg.value = c.packageId || "";
    } else {
      packageEditor.classList.remove("hidden");
      classEditor.classList.add("hidden");
      const p = this.state.packageById(sel.id);
      inPkgName.value = p.name;
    }
  }
}
