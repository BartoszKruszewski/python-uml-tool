# Część dla programisty

## 4.1. Wymagania systemowe

- Python 3.13 lub nowszy
- Przeglądarka internetowa z obsługą ES6 modules

## 4.2. Instalacja i konfiguracja

### 4.2.1. Instalacja zależności

Projekt składa się z dwóch pakietów Python, które należy zainstalować w trybie edytowalnym:

```bash
# Instalacja modułu generowania kodu (domain layer)
pip install -e domain

# Instalacja głównej aplikacji
pip install -e .
```

### 4.2.2. Uruchomienie aplikacji

```bash
python run.py
```

Aplikacja będzie dostępna pod adresem `http://localhost:8080`.

### 4.2.3. Struktura pakietów

Projekt używa struktury pakietów zgodnej z PEP 518/621:
- `pyproject.toml` - konfiguracja pakietu i zależności
- `src/` - kod źródłowy pakietu

## 4.3. Architektura kodu

### 4.3.1. Warstwa domeny (domain/src/project_generator/)

#### 4.3.1.1. Punkt wejścia

```python
from project_generator.main import generate_project
from pathlib import Path

generate_project(
    xmi_path=Path("input.xmi"),
    output_dir=Path("output")
)
```

#### 4.3.1.2. API modułu generowania kodu

**XmiParser**
```python
from project_generator.XmiParser import XmiParser
from pathlib import Path

project = XmiParser.parse(Path("diagram.xmi"))
```

**ProjectGenerator**
```python
from project_generator.ProjectGenerator import ProjectGenerator
from project_generator.syntax import Project
from pathlib import Path

generator = ProjectGenerator(project, Path("output"))
```

**TemplateManager**
```python
from project_generator.TemplateManager import TemplateManager
from project_generator.syntax import Class, Relation

template_manager = TemplateManager(project, root_dir)
code = template_manager.generate_class(class_syntax, relations_for_class)
```

**ImportMapping**
```python
from project_generator.ImportMapping import ImportMapping

import_mapping = ImportMapping(project, root_dir)
import_path = import_mapping.get_import_path("ClassName")
```

### 4.3.2. Warstwa aplikacji (src/uml_tool/)

#### 4.3.2.1. Endpointy API

**GET /**
Zwraca stronę HTML z interfejsem użytkownika.

**POST /generate**
Przyjmuje plik XMI i zwraca wygenerowany projekt jako archiwum ZIP.

Parametry:
- `file: UploadFile` - plik XMI

Odpowiedzi:
- `200` - sukces, zwraca plik ZIP
- `400` - błąd walidacji lub parsowania
- `500` - błąd serwera

### 4.3.3. Frontend - komponenty JavaScript

#### 4.3.3.1. DiagramState

Zarządza stanem diagramu:
```javascript
const diagramState = new DiagramState();
// Właściwości:
// - classList: Array<ClassElement>
// - packageList: Array<PackageElement>
// - relationList: Array<RelationElement>
// - selectedElement: {type, id} | null
// - panOffset: {x, y}
// - zoomLevel: number
```

#### 4.3.3.2. XmiImporter

Parsuje pliki XMI i wczytuje diagram:
```javascript
import XmiImporter from './XmiImporter.js';

const importer = new XmiImporter();
const parsed = importer.parseXMI(xmiXml);
// Zwraca: {packages: Array, classes: Array, relations: Array}
```

#### 4.3.3.3. Exporter

Eksportuje diagram do formatu XMI:
```javascript
import Exporter from './Exporter.js';

const exporter = new Exporter();
const xmiXml = exporter.buildXMI(diagramState);
```

#### 4.3.3.4. InteractionController

Obsługuje interakcje użytkownika (pan, zoom, drag, resize):
```javascript
const controller = new InteractionController(
  svgElement,
  viewportGroupElement,
  diagramState,
  svgRenderer,
  linkService,
  gridStepProvider,
  onSelectCallback,
  scheduleRenderCallback
);

// Metody:
controller.updateViewportTransform(); // Aktualizuje transformację viewportu
```

### 4.3.4. Reprezentacja składni

#### 4.3.3.1. Hierarchia klas

```
AbstractSyntax
├── Project
├── Package
├── Class
├── Property
├── Operation
├── Parameter
├── Relation
└── DataType
```

#### 4.3.4.2. Przykład tworzenia składni programowo

```python
from project_generator.syntax import (
    Project, Package, Class, Property, Operation,
    Parameter, ParameterDirection, Relation, RelationType
)

# Tworzenie projektu
project = Project(
    id="model1",
    name="MyProject",
    packages=[
        Package(
            id="pkg1",
            name="Core",
            subpackages=[],
            classes=[
                Class(
                    id="cls1",
                    name="ExampleClass",
                    properties=[
                        Property(
                            id="prop1",
                            name="name",
                            type="String"
                        )
                    ],
                    operations=[
                        Operation(
                            id="op1",
                            name="do_something",
                            parameters=[
                                Parameter(
                                    id="param1",
                                    name="value",
                                    type="Integer",
                                    direction=ParameterDirection.IN
                                )
                            ]
                        )
                    ]
                )
            ],
            dependencies=[
                Relation(
                    id="rel1",
                    name="uses",
                    type=RelationType.ASSOCIATION,
                    client="ExampleClass",
                    supplier="OtherClass"
                )
            ],
            data_types=[]
        )
    ]
)
```

## 4.4. Rozszerzanie funkcjonalności

### 4.4.1. Rozszerzanie funkcjonalności frontendu

#### 4.4.1.1. Dodawanie nowych typów relacji w frontendzie

1. Zaktualizuj `Exporter.js` - dodaj obsługę nowego typu w `buildXMI()`
2. Zaktualizuj `XmiImporter.js` - dodaj mapowanie w `getRelationType()`
3. Zaktualizuj `SvgRenderer.js` - dodaj styl dla nowego typu relacji
4. Zaktualizuj interfejs użytkownika - dodaj opcję w selektorze typów relacji

#### 4.4.1.2. Modyfikacja logiki zoomu

Zoom jest zarządzany w `InteractionController._onWheel()`:
```javascript
// Modyfikacja czułości zoomu
const zoomSensitivity = 0.02; // Zmniejsz dla mniejszej czułości

// Modyfikacja zakresu zoomu
const minZoom = 0.1;
const maxZoom = 5.0;
```

### 4.4.2. Dodawanie nowych typów relacji (backend)

1. Dodaj nowy typ do `RelationType` w `syntax.py`:
```python
class RelationType(Enum):
    # ... istniejące typy
    NEW_RELATION = "new_relation"
```

2. Zaktualizuj parser w `XmiParser._parse_package()`:
```python
for relation in [
    # ... istniejące typy
    "new_relation"
]:
    # ...
```

3. Zaktualizuj logikę generowania w `TemplateManager._generate_constructor()`:
```python
elif relation.type == RelationType.NEW_RELATION:
    # logika generowania kodu
```

**Uwaga:** `TemplateManager` automatycznie obsługuje wiele relacji tego samego typu - generuje unikalne nazwy parametrów dla każdej relacji, aby uniknąć konfliktów.

### 4.4.3. Dodawanie nowych typów danych

1. Dodaj mapowanie w `Config.standard_data_types`:
```python
standard_data_types = {
    # ... istniejące typy
    "Boolean": "bool",
    "Date": "datetime.date",
}
```

### 4.4.4. Modyfikacja szablonów generowania

Szablony są zdefiniowane w `TemplateManager` jako atrybuty klasowe. Można je zmodyfikować:

```python
class TemplateManager:
    class_body: str = """
{imports}class {class_name}{base_classes}:
{members}
"""
    # Modyfikuj szablony według potrzeb
```

### 4.4.5. Dodawanie walidacji

Można dodać walidację w metodzie `generate_project()`:

```python
def generate_project(xmi_path: Path, output_dir: Path) -> None:
    parsed_project = XmiParser.parse(xmi_path)
    
    # Dodaj walidację
    validate_project(parsed_project)
    
    ProjectGenerator(parsed_project, output_dir)
```

## 4.5. Testowanie

### 4.5.1. Uruchamianie testów

```bash
# Z katalogu głównego projektu
pytest domain/tests/
```

### 4.5.2. Struktura testów

Testy znajdują się w `domain/tests/`:
- `test_project_generator.py` - testy generowania projektu
- `test_xmi_parser.py` - testy parsowania XMI
- `test_import_mapping.py` - testy mapowania importów

### 4.5.3. Tworzenie nowych testów

Przykład testu:

```python
from pathlib import Path
from project_generator.XmiParser import XmiParser
from project_generator.ProjectGenerator import ProjectGenerator

def test_custom_scenario():
    xmi_path = Path("tests/data/custom.xmi")
    output_dir = Path("tests/output/custom")
    
    project = XmiParser.parse(xmi_path)
    ProjectGenerator(project, output_dir)
    
    # Asercje
    assert (output_dir / project.name / "Class.py").exists()
```

## 4.6. Obsługa błędów

### 4.6.1. Wyjątki domeny

Moduł definiuje następujące wyjątki:

- `CustomException` - bazowa klasa
- `XmiParserException` - błędy parsowania
  - `NoAttribute` - brakujący atrybut w XMI
  - `NoElement` - brakujący element w XMI
- `ImportMapperException` - błędy mapowania
  - `NonMappedClass` - klasa nieznaleziona w mapowaniu importów

### 4.6.2. Obsługa w aplikacji

Backend przechwytuje wyjątki i zwraca odpowiednie kody HTTP:

```python
try:
    generate_project(xmi_path, output_dir)
except CustomException:
    raise HTTPException(status_code=400, detail="Not compatible XMI format")
except Exception:
    raise HTTPException(status_code=500, detail="Unexpected error")
```

## 4.7. Konfiguracja

### 4.7.1. Konfiguracja serwera

W `uml_tool/Config.py`:
```python
class Config:
    host = "localhost"  # Zmień na "0.0.0.0" dla dostępu z sieci
    port = 8080
```

### 4.7.2. Konfiguracja generowania

W `project_generator/Config.py`:
```python
class Config:
    uml_namespace = "{http://schema.omg.org/spec/UML/2.1}"
    xmi_namespace = "{http://schema.omg.org/spec/XMI/2.1}"
    
    standard_data_types = {
        "String": "str",
        "Integer": "int",
        "Float": "float",
    }
```

## 4.8. Debugowanie

### 4.8.1. Logowanie

Dodaj logowanie w kluczowych miejscach:

```python
import logging

logger = logging.getLogger(__name__)

def generate_project(xmi_path: Path, output_dir: Path) -> None:
    logger.info(f"Parsing XMI: {xmi_path}")
    parsed_project = XmiParser.parse(xmi_path)
    logger.info(f"Generating project: {parsed_project.name}")
    ProjectGenerator(parsed_project, output_dir)
```

### 4.8.2. Debugowanie parsowania

W `main.py` można włączyć wyświetlanie parsowanego projektu:

```python
def generate_project(xmi_path: Path, output_dir: Path) -> None:
    print(xmi_path.read_text())  # Wyświetl zawartość XMI
    parsed_project = XmiParser.parse(xmi_path)
    pprint(parsed_project)  # Wyświetl strukturę projektu
    ProjectGenerator(parsed_project, output_dir)
```

## 4.9. Wydajność

### 4.9.1. Optymalizacje

- Parsowanie XMI używa `xml.etree.ElementTree` (szybkie, wbudowane)
- Generowanie kodu używa formatowania stringów (wydajne dla małych/średnich projektów)
- Frontend używa requestAnimationFrame do optymalizacji renderowania

### 4.9.2. Ograniczenia

- System nie obsługuje bardzo dużych diagramów (>1000 klas) - może wymagać optymalizacji
- Generowanie odbywa się synchronicznie - dla dużych projektów warto rozważyć asynchroniczne przetwarzanie

## 4.10. Współpraca z innymi narzędziami

### 4.10.1. Import z innych narzędzi UML

System obsługuje standardowy format XMI 2.1, więc może importować diagramy z:
- Enterprise Architect
- Visual Paradigm
- StarUML
- Innych narzędzi eksportujących XMI 2.1

### 4.10.2. Eksport do innych formatów

Można rozszerzyć `Exporter` o eksport do innych formatów:
- PlantUML
- Mermaid
- Graphviz DOT

## 4.11. Podsumowanie

Moduł generowania kodu został zaprojektowany jako niezależna biblioteka, którą można:
- Używać programowo bez interfejsu webowego
- Łatwo testować jednostkowo
- Rozszerzać o nowe funkcjonalności
- Integrować z innymi narzędziami

API jest proste i intuicyjne, a struktura kodu ułatwia utrzymanie i rozwój.

