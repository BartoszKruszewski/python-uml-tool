export default class EditorsUI {
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

  applyPackageEditor() {
    const selected = this.diagramState.selectedElement;
    if (!selected || selected.type !== "package") return;
    const packageElement = this.diagramState.getPackageById(selected.id);
    const { inputPackageName } = this.references;
    packageElement.name = inputPackageName.value.trim() || "Module";
    this.onChangeCallback();
    this.refreshPackageSelect();
  }

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
