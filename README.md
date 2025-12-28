# Python UML Tool

A tool for interactive UML class diagram modeling and automatic Python code generation. A web application that enables creating diagrams in a browser, exporting to XMI format, and generating complete Python projects with package structure, classes, and relationships preserved.

## ✨ Features

- 🎨 **Interactive diagram editor** - create and edit UML class diagrams in your browser
- 📦 **Package management** - support for nested packages (modules)
- 🔗 **Multiple relation types** - association, aggregation, composition, inheritance, realization, dependency
- 💾 **XMI Export/Import** - save and load diagrams in standard XMI 2.1 format
- 🐍 **Python code generation** - automatic generation of project skeletons with:
  - Package and class structure
  - Attributes and methods with type hints
  - Constructors with parameters based on relationships
  - Automatic import management
- 🔍 **Zoom and navigation** - logarithmic zoom and view panning
- 📊 **Tree view** - hierarchical representation of project structure

## 🚀 Quick Start

### Documentation

The documentation is also an engineering thesis. It was written in LateX. To compile it to PDF, you must:

```bash
cd docs
make
```

### Installation

1. Clone the repository:
```bash
git clone --recursive <repository-url>
cd python-uml-tool
```

2. Install dependencies:
```bash
# Make virtual environment
python -m venv venv

# Activate virtual environment (Windows)
./venv/Scripts/activate

# Activate virtual environment (Linux/MacOS)
source ./venv/bin

# Install code generation module (domain layer)
pip install -e domain

# Install main application
pip install -e .
```

### Running

```bash
python run.py
```

The application will be available at `http://localhost:8080`.

### Examples

You can use the sample *.xmi* files located in the *examples* folder.

## 📖 Usage

### Creating a Diagram

1. Open the application in your browser
2. Use toolbar buttons to:
   - Add classes (`Add Class`)
   - Add packages (`Add Package`)
   - Create relationships (`Start Link`)
3. Click on an element to edit it in the side panel
4. Drag elements to change their position

### Generating Code

1. Create a diagram with classes, packages, and relationships
2. Click the `Generate` button in the toolbar
3. Download the generated project as a ZIP archive

### Saving and Loading

- **Save diagram**: Click `Save XMI` - the diagram will be downloaded as a `.xmi` file
- **Load diagram**: Click `Load XMI` - select an XMI file from disk

## 🏗️ Architecture

The project is designed with a three-layer architecture:

```
python-uml-tool/
├── src/                    # Application and presentation layer
│   ├── uml_tool/          # FastAPI backend
│   ├── static/            # JavaScript frontend
│   └── templates/         # HTML templates
├── domain/                 # Domain layer
│   └── src/
│       └── project_generator/  # Code generation module
└── docs/                   # Documentation
```

### Components

- **Frontend** - modular JavaScript application with SVG interface
- **Backend** - FastAPI server handling code generation requests
- **Domain Layer** - independent XMI parsing and code generation module

## 🧪 Testing

Run tests:

```bash
cd domain
pytest tests/ -v
```

## 🔧 Relation Types and Their Code Representation

| Relation Type | Code Representation |
|--------------|---------------------|
| **Association** | Optional parameter in constructor: `other: OtherClass \| None = None` |
| **Aggregation** | List of objects: `items: list[Item] \| None = None` |
| **Composition** | Automatically created object: `self._component = Component()` |
| **Inheritance** | Class inheritance: `class Child(Parent):` |
| **Realization** | Interface implementation: `class Implementation(Interface):` |
| **Dependency** | Import only, no constructor parameter |

## 🛠️ Technologies

- **Backend**: Python 3.13, FastAPI
- **Frontend**: Vanilla JavaScript, SVG
- **Format**: XMI 2.1 (UML 2.1)
- **Testing**: pytest
