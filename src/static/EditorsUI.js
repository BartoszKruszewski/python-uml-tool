/**
 * Side-panel editors for classes and packages.
 * @typedef {Object} EditorsReferences
 * @property {HTMLElement} noSelectionPanel
 * @property {HTMLElement} classEditorPanel
 * @property {HTMLElement} packageEditorPanel
 * @property {HTMLInputElement|HTMLTextAreaElement} inputClassName
 * @property {HTMLTextAreaElement} inputClassAttributes
 * @property {HTMLTextAreaElement} inputClassOperations
 * @property {HTMLSelectElement} inputClassPackage
 * @property {HTMLButtonElement} buttonUpdateClass
 * @property {HTMLButtonElement} buttonDeleteClass
 * @property {HTMLInputElement|HTMLTextAreaElement} inputPackageName
 * @property {HTMLButtonElement} buttonUpdatePackage
 * @property {HTMLButtonElement} buttonDeletePackage
 */
export default class EditorsUI {
  /**
   * @param {import("./DiagramState.js").default} diagramState - Shared diagram state.
   * @param {EditorsReferences} references - DOM references for editor widgets.
   * @param {() => void} onChangeCallback - Called after state changes.
   */
  constructor(diagramState, references, onChangeCallback) {
    this.diagramState = diagramState;
    this.references = references; // {noSelectionPanel, classEditorPanel, packageEditorPanel, inputClassName, inputClassAttributes, inputClassOperations, inputClassPackage, buttonUpdateClass, buttonDeleteClass, inputPackageName, buttonUpdatePackage, buttonDeletePackage}
    this.onChangeCallback = onChangeCallback;
    // bind buttons
    references.buttonUpdateClass.addEventListener("click", () => this.applyClassEditor());
    references.buttonDeleteClass.addEventListener("click", () => {
      const selected = this.diagramState.selectedElement;
      if (selected?.type === "class") {
        this.diagramState.removeClass(selected.id);
        this.diagramState.clearSelection();
        this.onChangeCallback();
      }
    });
    references.buttonUpdatePackage.addEventListener("click", () =>
      this.applyPackageEditor()
    );
    references.buttonDeletePackage.addEventListener("click", () => {
      const selected = this.diagramState.selectedElement;
      if (selected?.type === "package") {
        this.diagramState.removePackage(selected.id);
        this.diagramState.clearSelection();
        this.refreshPackageSelect();
        this.onChangeCallback();
      }
    });
  }

  /**
   * Rebuild the package select options based on current packages.
   * @returns {void}
   */
  refreshPackageSelect() {
    const { inputClassPackage } = this.references;
    const previousValue = inputClassPackage.value;
    inputClassPackage.innerHTML = "";
    const optionNone = document.createElement("option");
    optionNone.value = "";
    optionNone.textContent = "(none)";
    inputClassPackage.appendChild(optionNone);
    this.diagramState.packageList.forEach((packageElement) => {
      const option = document.createElement("option");
      option.value = packageElement.id;
      option.textContent = packageElement.name;
      inputClassPackage.appendChild(option);
    });
    if (previousValue) inputClassPackage.value = previousValue;
  }

  /**
   * Apply form inputs to the selected class and recompute its height.
   * @returns {void}
   */
  applyClassEditor() {
    const selected = this.diagramState.selectedElement;
    if (!selected || selected.type !== "class") return;
    const classElement = this.diagramState.getClassById(selected.id);
    const { inputClassName, inputClassAttributes, inputClassOperations, inputClassPackage } = this.references;
    classElement.name = inputClassName.value.trim() || "Class";
    classElement.attributes = inputClassAttributes.value
      .split("\n")
      .map((attribute) => attribute.trim())
      .filter(Boolean);
    classElement.operations = inputClassOperations.value
      .split("\n")
      .map((operation) => operation.trim())
      .filter(Boolean);
    classElement.packageId = inputClassPackage.value || null;
    const baseHeight = 28,
      lineHeight = 18,
      separator = 12;
    const attributesHeight = classElement.attributes.length ? classElement.attributes.length * lineHeight + separator : separator;
    const operationsHeight = classElement.operations.length ? classElement.operations.length * lineHeight + separator : separator;
    classElement.h = baseHeight + separator + attributesHeight + operationsHeight + 10;
    this.onChangeCallback();
  }

  /**
   * Apply form inputs to the selected package.
   * @returns {void}
   */
  applyPackageEditor() {
    const selected = this.diagramState.selectedElement;
    if (!selected || selected.type !== "package") return;
    const packageElement = this.diagramState.getPackageById(selected.id);
    const { inputPackageName } = this.references;
    packageElement.name = inputPackageName.value.trim() || "Module";
    this.onChangeCallback();
    this.refreshPackageSelect();
  }

  /**
   * Sync editor panels with the current selection and state.
   * @returns {void}
   */
  updateEditors() {
    const {
      noSelectionPanel,
      classEditorPanel,
      packageEditorPanel,
      inputClassName,
      inputClassAttributes,
      inputClassOperations,
      inputClassPackage,
      inputPackageName,
    } = this.references;
    const selected = this.diagramState.selectedElement;
    if (!selected) {
      noSelectionPanel.classList.remove("d-none");
      classEditorPanel.classList.add("d-none");
      packageEditorPanel.classList.add("d-none");
      return;
    }
    noSelectionPanel.classList.add("d-none");
    if (selected.type === "class") {
      classEditorPanel.classList.remove("d-none");
      packageEditorPanel.classList.add("d-none");
      const classElement = this.diagramState.getClassById(selected.id);
      inputClassName.value = classElement.name;
      inputClassAttributes.value = classElement.attributes.join("\n");
      inputClassOperations.value = classElement.operations.join("\n");
      this.refreshPackageSelect();
      inputClassPackage.value = classElement.packageId || "";
    } else {
      packageEditorPanel.classList.remove("d-none");
      classEditorPanel.classList.add("d-none");
      const packageElement = this.diagramState.getPackageById(selected.id);
      inputPackageName.value = packageElement.name;
    }
  }
}
