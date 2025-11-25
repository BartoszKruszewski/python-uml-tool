/**
 * Entry point: wires DOM elements to the App and starts the UI.
 */
import App from "./App.js";

const svgElement = document.getElementById("svg");
const viewportGroupElement = document.getElementById("viewport");
const gridPatternElement = document.getElementById("gridPattern");
const gridRectElement = document.getElementById("gridRect");
const treeElement = document.getElementById("tree");

const addClassButton = document.getElementById("btnAddClass");
const addPackageButton = document.getElementById("btnAddPackage");
const linkModeButton = document.getElementById("btnLinkMode");
const linkTypeSelect = document.getElementById("linkType");
const generateButton = document.getElementById("btnGenerate");
const saveXMIButton = document.getElementById("btnSaveXMI");
const loadXMIButton = document.getElementById("btnLoadXMI");
const fileInputXMI = document.getElementById("fileInputXMI");
const clearButton = document.getElementById("btnClear");

const noSelectionPanel = document.getElementById("noSelection");
const classEditorPanel = document.getElementById("classEditor");
const packageEditorPanel = document.getElementById("packageEditor");
const inputClassName = document.getElementById("clsName");
const attrsContainer = document.getElementById("clsAttrsContainer");
const opsContainer = document.getElementById("clsOpsContainer");
const buttonAddAttr = document.getElementById("btnAddAttr");
const buttonAddOp = document.getElementById("btnAddOp");
const inputClassPackage = document.getElementById("clsPackage");
const buttonDeleteClass = document.getElementById("btnDelete");
const inputPackageName = document.getElementById("pkgName");
const buttonDeletePackage = document.getElementById("btnPkgDelete");
const inputGridSize = document.getElementById("gridSize");

// Position toolbar within middle column (responsive)
// Toolbar has fixed position - doesn't move when panels collapse
function positionToolbar() {
  const toolbar = document.getElementById("toolbar");
  
  if (!toolbar) return;

  // Check if we're on mobile (viewport <= 768px)
  if (window.innerWidth <= 768) {
    // On mobile, toolbar is centered via CSS
    toolbar.style.left = '';
    toolbar.style.width = '';
    toolbar.style.maxWidth = '';
    toolbar.style.transform = '';
    return;
  }

  // Fixed panel widths (always calculate as if panels are visible)
  // This ensures toolbar doesn't move when panels are collapsed
  const leftPanelWidth = 350;
  const rightPanelWidth = 300;
  const availableWidth = window.innerWidth - leftPanelWidth - rightPanelWidth;
  
  // Toolbar should be smaller than available width (80% max, with min/max constraints)
  const toolbarWidth = Math.min(
    Math.max(availableWidth * 0.8, 400), // 80% of available, min 400px
    1200 // max 1200px
  );
  
  // Center toolbar in middle section (always at same position regardless of panel state)
  const leftOffset = leftPanelWidth + (availableWidth - toolbarWidth) / 2;
  
  toolbar.style.left = `${leftOffset}px`;
  toolbar.style.width = `${toolbarWidth}px`;
  toolbar.style.maxWidth = `${toolbarWidth}px`;
  toolbar.style.transform = 'translateX(0)'; // Override CSS centering
}

// Make positionToolbar available globally for sidebar toggle handlers
window.positionToolbar = positionToolbar;

// Position toolbar on load and resize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', positionToolbar);
} else {
  positionToolbar();
}
window.addEventListener("resize", positionToolbar);

const app = new App({
  svg: svgElement,
  viewport: viewportGroupElement,
  gridPattern: gridPatternElement,
  gridRect: gridRectElement,
  tree: treeElement,
  btnAddClass: addClassButton,
  btnAddPackage: addPackageButton,
  btnLinkMode: linkModeButton,
  linkTypeSel: linkTypeSelect,
  btnGenerate: generateButton,
  btnSaveXMI: saveXMIButton,
  btnLoadXMI: loadXMIButton,
  fileInputXMI: fileInputXMI,
  btnClear: clearButton,
  noSel: noSelectionPanel,
  classEditor: classEditorPanel,
  packageEditor: packageEditorPanel,
  inClsName: inputClassName,
  attrsContainer: attrsContainer,
  opsContainer: opsContainer,
  btnAddAttr: buttonAddAttr,
  btnAddOp: buttonAddOp,
  inClsPkg: inputClassPackage,
  btnDelete: buttonDeleteClass,
  inPkgName: inputPackageName,
  btnPkgDelete: buttonDeletePackage,
  inGridSize: inputGridSize,
});
