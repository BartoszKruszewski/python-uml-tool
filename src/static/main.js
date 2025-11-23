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
const inputClassAttributes = document.getElementById("clsAttrs");
const inputClassOperations = document.getElementById("clsOps");
const inputClassPackage = document.getElementById("clsPackage");
const buttonUpdateClass = document.getElementById("btnUpdate");
const buttonDeleteClass = document.getElementById("btnDelete");
const inputPackageName = document.getElementById("pkgName");
const buttonUpdatePackage = document.getElementById("btnPkgUpdate");
const buttonDeletePackage = document.getElementById("btnPkgDelete");
const inputGridSize = document.getElementById("gridSize");

// Position toolbar within middle column
function positionToolbar() {
  const toolbar = document.getElementById("toolbar");
  const mainGrid = document.querySelector(".main-grid");
  const canvas = document.getElementById("canvas");
  
  if (!toolbar || !mainGrid || !canvas) return;

  // Use actual canvas element position and width (middle column)
  const canvasRect = canvas.getBoundingClientRect();
  const mainGridRect = mainGrid.getBoundingClientRect();
  
  // Calculate position relative to viewport
  const leftOffset = canvasRect.left;
  const middleWidth = canvasRect.width;
  
  // Add some padding to avoid edges (1rem = 16px typically)
  const padding = 16;
  
  toolbar.style.left = `${leftOffset + padding}px`;
  toolbar.style.width = `${middleWidth - (padding * 2)}px`;
  toolbar.style.maxWidth = `${middleWidth - (padding * 2)}px`;
}

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
  inAttrs: inputClassAttributes,
  inOps: inputClassOperations,
  inClsPkg: inputClassPackage,
  btnUpdate: buttonUpdateClass,
  btnDelete: buttonDeleteClass,
  inPkgName: inputPackageName,
  btnPkgUpdate: buttonUpdatePackage,
  btnPkgDelete: buttonDeletePackage,
  inGridSize: inputGridSize,
});
