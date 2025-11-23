# Implementacja

## 3.1. Architektura systemu

System został zaprojektowany w architekturze trójwarstwowej:

1. **Warstwa prezentacji** - frontend w JavaScript z interfejsem użytkownika
2. **Warstwa aplikacji** - backend w Pythonie (FastAPI) obsługujący żądania HTTP
3. **Warstwa domeny** - moduł generowania kodu niezależny od warstwy aplikacji

### 3.1.1. Struktura projektu

```
python-uml-tool/
├── src/                    # Warstwa aplikacji i prezentacji
│   ├── uml_tool/          # Backend FastAPI
│   ├── static/            # Frontend JavaScript
│   └── templates/         # Szablony HTML
├── domain/                 # Warstwa domeny
│   └── src/
│       └── project_generator/  # Moduł generowania kodu
└── docs/                   # Dokumentacja
```

## 3.2. Warstwa domeny

Warstwa domeny (`project_generator`) odpowiada za parsowanie plików XMI i generowanie kodu Python. Składa się z następujących modułów:

- **`syntax.py`** - definiuje wewnętrzną reprezentację modelu UML (Project, Package, Class, Relation, itp.)
- **`XmiParser.py`** - parsuje pliki XMI zgodnie ze standardem XMI 2.1
- **`ProjectGenerator.py`** - generuje strukturę katalogów i plików Python
- **`TemplateManager.py`** - generuje kod Python z obiektów składni, obsługuje mapowanie typów i relacji
- **`ImportMapping.py`** - zarządza mapowaniem klas na ścieżki importu

System obsługuje wszystkie podstawowe typy relacji UML (asocjacja, agregacja, kompozycja, dziedziczenie, realizacja, zależność) i mapuje je odpowiednio na kod Python.

## 3.3. Warstwa aplikacji

Backend FastAPI udostępnia dwa główne endpointy:
- `GET /` - serwuje interfejs użytkownika
- `POST /generate` - przyjmuje plik XMI i zwraca wygenerowany projekt jako archiwum ZIP

Proces generowania obejmuje walidację pliku, parsowanie XMI, generowanie kodu i tworzenie archiwum ZIP z odpowiednią obsługą błędów.

## 3.4. Warstwa prezentacji

Frontend został zaimplementowany jako modułowa aplikacja JavaScript składająca się z komponentów odpowiedzialnych za:
- Zarządzanie stanem diagramu (`DiagramState.js`) - przechowuje klasy, pakiety, relacje, stan zoomu i pan
- Renderowanie diagramu w SVG (`SvgRenderer.js`) - renderuje elementy diagramu w SVG
- Obsługę interakcji użytkownika (`InteractionController.js`) - obsługuje przeciąganie, pan, zoom, resize
- Eksport do formatu XMI (`Exporter.js`) - eksportuje diagram do formatu XMI 2.1 z obsługą zagnieżdżonych pakietów
- Import z formatu XMI (`XmiImporter.js`) - parsuje pliki XMI i wczytuje diagram z automatycznym pozycjonowaniem
- Komunikację z backendem (`GenerateService.js`) - wysyła żądania do API generowania kodu
- Interfejs użytkownika:
  - `EditorsUI.js` - panele edycji klas i pakietów
  - `TreeUI.js` - hierarchiczny widok drzewa z obsługą zagnieżdżonych pakietów i relacji
  - `LinkService.js` - obsługa tworzenia relacji między klasami
  - `Coordinate.js` - pomocnicze funkcje do transformacji współrzędnych
  - `Geometry.js` - pomocnicze funkcje geometryczne

## 3.5. Integracja komponentów

Przepływ danych w systemie:
1. Użytkownik tworzy diagram w interfejsie → stan diagramu jest aktualizowany i renderowany
2. Przy generowaniu kodu: diagram jest eksportowany do XMI → wysyłany do backendu → parsowany i generowany kod → zwracany jako archiwum ZIP
3. Przy zapisywaniu: diagram jest eksportowany do XMI → pobierany jako plik
4. Przy wczytywaniu: plik XMI jest parsowany → diagram jest wczytywany z automatycznym pozycjonowaniem

Komunikacja między frontendem a backendem odbywa się przez REST API.

### 3.5.1. Zarządzanie stanem zoomu i pan

System zarządza stanem widoku (zoom i pan) w `DiagramState`:
- `zoomLevel` - poziom przybliżenia (domyślnie 1.0)
- `panOffset` - przesunięcie widoku w pikselach
- Transformacja viewportu: `translate(panX, panY) scale(zoom)`
- Zoom jest logarytmiczny dla płynnej zmiany na wszystkich poziomach

### 3.5.2. Zagnieżdżanie pakietów

System obsługuje zagnieżdżone pakiety:
- Pakiety mogą być zagnieżdżone w innych pakietach (pole `parentId`)
- Klasy są automatycznie przypisywane do najbardziej zagnieżdżonego pakietu
- Eksport i import XMI obsługują pełną hierarchię zagnieżdżeń
- Widok drzewa rekurencyjnie wyświetla zagnieżdżone pakiety

## 3.6. Testy

System zawiera testy jednostkowe weryfikujące poprawność parsowania XMI, generowania projektu i mapowania importów. Testy porównują wygenerowany kod z oczekiwanym wynikiem.

## 3.7. Podsumowanie

Zaimplementowany system zapewnia kompleksowe rozwiązanie do modelowania diagramów klas UML i automatycznego generowania kodu Python. Architektura modułowa ułatwia utrzymanie i rozszerzanie funkcjonalności.

