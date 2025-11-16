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
