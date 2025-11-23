# Instrukcja użytkownika

## 5.1. Wprowadzenie

Narzędzie UML to aplikacja webowa umożliwiająca tworzenie diagramów klas UML i automatyczne generowanie kodu Python na ich podstawie. Interfejs użytkownika został zaprojektowany tak, aby był intuicyjny i łatwy w użyciu.

## 5.2. Uruchomienie aplikacji

### 5.2.1. Instalacja

Przed pierwszym użyciem należy zainstalować zależności:

```bash
pip install -e domain
pip install -e .
```

### 5.2.2. Uruchomienie serwera

```bash
python run.py
```

Aplikacja będzie dostępna pod adresem `http://localhost:8080`.

### 5.2.3. Otwarcie w przeglądarce

Otwórz przeglądarkę internetową i przejdź do adresu `http://localhost:8080`.

## 5.3. Interfejs użytkownika

### 5.3.1. Główne elementy interfejsu

Interfejs składa się z następujących sekcji:

1. **Canvas (Obszar rysowania)** - główny obszar, na którym tworzysz diagram
2. **Sidebar (Panel boczny)** - przyciski do dodawania elementów
3. **Tree View (Widok drzewa)** - hierarchiczna lista pakietów i klas
4. **Editors (Edytory)** - panele do edycji właściwości klas i pakietów
5. **Toolbar (Pasek narzędzi)** - dodatkowe opcje i ustawienia

### 5.3.2. Obszar rysowania (Canvas)

Canvas to główny obszar roboczy, na którym:
- Wyświetlane są wszystkie elementy diagramu
- Możesz przeciągać elementy, aby zmienić ich pozycję
- Możesz zaznaczać elementy, aby je edytować
- Renderowane są relacje między klasami

**Operacje na canvas:**
- **Przeciąganie elementów** - kliknij i przytrzymaj element, następnie przeciągnij
- **Zaznaczanie** - kliknij na element, aby go zaznaczyć
- **Przesuwanie widoku** - przeciągnij pusty obszar canvas (lub przytrzymaj spację i przeciągnij)
- **Zoom** - użyj kółka myszy do przybliżania i oddalania (logarytmiczny zoom)
  - Scroll w górę = przybliżanie
  - Scroll w dół = oddalanie
  - Zoom działa względem pozycji kursora myszy

### 5.3.3. Toolbar (Pasek narzędzi)

Toolbar znajduje się na dole ekranu i zawiera przyciski do operacji na diagramie:

- **Add Class** - dodaje nową klasę do diagramu
- **Add Package** - dodaje nowy pakiet
- **Link Mode** - włącza tryb łączenia elementów
- **Save XMI** - zapisuje diagram do pliku XMI
- **Load XMI** - wczytuje diagram z pliku XMI
- **Generate** - generuje kod Python z diagramu
- **Clear** - czyści cały diagram

### 5.3.4. Widok drzewa (Tree View)

Widok drzewa wyświetla hierarchiczną strukturę pakietów, klas i relacji:
- Pakiety są wyświetlane jako węzły nadrzędne (obsługuje zagnieżdżone pakiety)
- Klasy są wyświetlane jako węzły podrzędne w odpowiednich pakietach
- Relacje są wyświetlane w osobnej sekcji na dole drzewa
- Kliknięcie na element w drzewie zaznacza go na diagramie
- Podwójne kliknięcie na pakiet umożliwia edycję nazwy bezpośrednio w drzewie

### 5.3.5. Panele edycji (Editors)

#### 5.3.5.1. Panel edycji klasy

Gdy klasa jest zaznaczona, pojawia się panel edycji z polami:

- **Class Name** - nazwa klasy
- **Attributes** - lista atrybutów (każdy w osobnej linii, format: `nazwa: typ`)
- **Operations** - lista operacji (każda w osobnej linii, format: `nazwa(parametr: typ) -> typ_zwracany`)
- **Package** - wybór pakietu, do którego należy klasa
- **Update** - przycisk zapisujący zmiany
- **Delete** - przycisk usuwający klasę

**Przykład atrybutów:**
```
id: String
name: String
count: Integer
```

**Przykład operacji:**
```
save(data: String) -> None
findById(id: String) -> ExampleService
```

#### 5.3.5.2. Panel edycji pakietu

Gdy pakiet jest zaznaczony, pojawia się panel edycji z polami:

- **Package Name** - nazwa pakietu
- **Update** - przycisk zapisujący zmiany
- **Delete** - przycisk usuwający pakiet

## 5.4. Tworzenie diagramu

### 5.4.1. Dodawanie klasy

1. Kliknij przycisk **Add Class** w panelu bocznym
2. Klasa pojawi się na canvas
3. Przeciągnij klasę w wybrane miejsce
4. Kliknij na klasę, aby ją zaznaczyć
5. W panelu edycji wprowadź:
   - Nazwę klasy
   - Atrybuty (opcjonalnie)
   - Operacje (opcjonalnie)
   - Wybierz pakiet (opcjonalnie)
6. Kliknij **Update**, aby zapisać zmiany

### 5.4.2. Dodawanie pakietu

1. Kliknij przycisk **Add Package** w toolbarze
2. Pakiet pojawi się na canvas jako kontener
3. Przeciągnij pakiet w wybrane miejsce
4. Przeciągnij klasy do pakietu, aby je do niego przypisać
5. **Zagnieżdżanie pakietów**: Przeciągnij pakiet do innego pakietu, aby go zagnieździć
6. Kliknij na pakiet, aby go zaznaczyć
7. W panelu edycji wprowadź nazwę pakietu
8. Kliknij **Update**, aby zapisać zmiany

**Uwaga:** Klasy są automatycznie przypisywane do najbardziej zagnieżdżonego pakietu, w którym się znajdują.

### 5.4.3. Tworzenie relacji

1. Kliknij przycisk **Link Mode** w panelu bocznym
2. Wybierz typ relacji z listy rozwijanej:
   - Association (Asocjacja)
   - Aggregation (Agregacja)
   - Composition (Kompozycja)
   - Dependency (Zależność)
   - Generalization (Dziedziczenie)
   - Realization (Realizacja)
3. Kliknij na klasę źródłową (klient)
4. Kliknij na klasę docelową (dostawca)
5. Relacja zostanie utworzona i wyświetlona jako linia między klasami

**Uwaga:** Niektóre typy relacji mają kierunek - upewnij się, że klikasz w odpowiedniej kolejności.

### 5.4.4. Edycja elementów

1. Kliknij na element (klasę lub pakiet), aby go zaznaczyć
2. W odpowiednim panelu edycji wprowadź zmiany
3. Kliknij **Update**, aby zapisać zmiany

### 5.4.5. Usuwanie elementów

1. Zaznacz element, który chcesz usunąć
2. Kliknij przycisk **Delete** w panelu edycji
3. Element zostanie usunięty z diagramu

**Uwaga:** Usunięcie klasy automatycznie usuwa wszystkie relacje, w których uczestniczy.

## 5.5. Zapisywanie i wczytywanie diagramów

### 5.5.1. Zapisywanie diagramu do pliku XMI

1. Kliknij przycisk **Save XMI** w toolbarze
2. Plik XMI zostanie automatycznie pobrany do folderu pobierania
3. Plik zawiera pełną strukturę diagramu (pakiety, klasy, relacje, zagnieżdżenia)

### 5.5.2. Wczytywanie diagramu z pliku XMI

1. Kliknij przycisk **Load XMI** w toolbarze
2. Wybierz plik XMI z dysku
3. Diagram zostanie wczytany i wyświetlony na canvas
4. Wszystkie elementy są automatycznie pozycjonowane, aby nie nachodziły na siebie
5. Zagnieżdżone pakiety i klasy są poprawnie przypisane

**Uwaga:** Wczytanie nowego diagramu usuwa obecny diagram. Jeśli chcesz zachować obecny diagram, najpierw go zapisz.

## 5.6. Generowanie kodu

### 5.6.1. Przygotowanie diagramu

Przed wygenerowaniem kodu upewnij się, że:
- Wszystkie klasy mają nazwy
- Atrybuty i operacje są poprawnie zdefiniowane
- Relacje są poprawnie utworzone
- Klasy są przypisane do pakietów (opcjonalnie, ale zalecane)

### 5.6.2. Generowanie projektu

1. Kliknij przycisk **Generate** w panelu bocznym
2. System:
   - Eksportuje diagram do formatu XMI
   - Wysyła plik XMI do serwera
   - Generuje kod Python
   - Tworzy archiwum ZIP z projektem
3. Archiwum ZIP zostanie automatycznie pobrane do folderu pobierania

### 5.6.3. Struktura wygenerowanego projektu

Wygenerowany projekt ma następującą strukturę:

```
ProjectName/
├── Package1/
│   ├── __init__.py
│   └── Class1.py
├── Package2/
│   ├── SubPackage/
│   │   ├── __init__.py
│   │   └── Class2.py
│   └── Class3.py
└── ...
```

### 5.6.4. Przykładowy wygenerowany kod

**Klasa z atrybutami i metodami:**
```python
from typing import Optional

class ExampleService:
    def __init__(self, id: str, name: str):
        self._id = id
        self._name = name
    
    def save(self, data: str) -> None:
        pass
```

**Klasa z relacją asocjacji:**
```python
from Data.UserRepository import UserRepository

class ExampleService:
    def __init__(self, userRepository: UserRepository | None = None):
        self._userRepository = userRepository
```

**Klasa z relacją dziedziczenia:**
```python
from Core.BaseService import BaseService

class ExampleService(BaseService):
    def __init__(self):
        pass
```

## 5.7. Typy relacji i ich wpływ na kod

### 5.7.1. Association (Asocjacja)

Tworzy opcjonalny parametr w konstruktorze:
```python
def __init__(self, other: OtherClass | None = None):
    self._other = other
```

### 5.7.2. Aggregation (Agregacja)

Tworzy listę obiektów w konstruktorze:
```python
def __init__(self, items: list[Item] | None = None):
    self._items = items or []
```

### 5.7.3. Composition (Kompozycja)

Automatycznie tworzy obiekt w konstruktorze:
```python
def __init__(self):
    self._component = Component()
```

### 5.7.4. Generalization (Dziedziczenie)

Klasa dziedziczy po klasie bazowej:
```python
class Child(Parent):
    pass
```

### 5.7.5. Realization (Realizacja)

Klasa implementuje interfejs (podobnie jak dziedziczenie):
```python
class Implementation(Interface):
    pass
```

### 5.7.6. Dependency (Zależność)

Wpływa tylko na importy - klasa importuje zależną klasę, ale nie tworzy jej instancji w konstruktorze.

## 5.8. Typy danych

System obsługuje następujące standardowe typy UML, które są automatycznie mapowane na typy Python:

- `String` → `str`
- `Integer` → `int`
- `Float` → `float`

Inne typy (np. nazwy klas) pozostają bez zmian i są traktowane jako klasy użytkownika.

## 5.9. Wskazówki i najlepsze praktyki

### 5.9.1. Organizacja projektu

- Używaj pakietów do organizacji klas w logiczne moduły
- Nadawaj klasom, pakietom i relacjom znaczące nazwy
- Unikaj cyklicznych zależności między pakietami

### 5.9.2. Definiowanie klas

- Zawsze nadawaj klasom nazwy przed generowaniem kodu
- Używaj konwencji nazewnictwa Python (PascalCase dla klas)
- Definiuj typy dla wszystkich atrybutów i parametrów

### 5.9.3. Relacje

- Używaj odpowiednich typów relacji zgodnie z semantyką UML
- Pamiętaj o kierunku relacji (klient → dostawca)
- Unikaj zbyt wielu relacji między klasami (może prowadzić do złożonych zależności)

### 5.9.4. Generowanie kodu

- Przed generowaniem sprawdź diagram pod kątem poprawności
- Po wygenerowaniu sprawdź wygenerowany kod
- Możesz modyfikować wygenerowany kod ręcznie, jeśli potrzebujesz dodatkowej logiki

## 5.10. Rozwiązywanie problemów

### 5.10.1. Kod nie został wygenerowany

- Sprawdź, czy wszystkie klasy mają nazwy
- Sprawdź konsolę przeglądarki pod kątem błędów JavaScript
- Sprawdź logi serwera pod kątem błędów parsowania XMI

### 5.10.2. Błędy importów w wygenerowanym kodzie

- Upewnij się, że wszystkie klasy używane w relacjach istnieją
- Sprawdź, czy nazwy klas są poprawne (bez błędów pisowni)
- Upewnij się, że klasy są przypisane do pakietów

### 5.10.3. Elementy nie są widoczne na canvas

- Sprawdź, czy elementy nie są przesunięte poza widoczny obszar
- Spróbuj użyć przycisku Clear i zacząć od nowa
- Odśwież stronę w przeglądarce

### 5.10.4. Relacje nie są wyświetlane

- Upewnij się, że obie klasy istnieją
- Sprawdź, czy relacja została poprawnie utworzona (spróbuj utworzyć ją ponownie)

## 5.11. Podsumowanie

Narzędzie UML oferuje prosty i intuicyjny sposób tworzenia diagramów klas UML i generowania kodu Python. Dzięki interaktywnemu interfejsowi możesz szybko stworzyć diagram, a następnie wygenerować kompletny szkielet projektu Python z zachowaniem struktury pakietów, klas i relacji.

Pamiętaj, że wygenerowany kod to szkielet - możesz i powinieneś dodać do niego logikę biznesową zgodnie z wymaganiami projektu.

