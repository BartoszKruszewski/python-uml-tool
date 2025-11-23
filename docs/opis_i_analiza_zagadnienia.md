# Opis i analiza zagadnienia

## 2.1. Unified Modeling Language (UML)

UML (Unified Modeling Language) jest standardowym językiem modelowania obiektowego, opracowanym przez Object Management Group (OMG). UML umożliwia wizualizację, specyfikację, konstrukcję i dokumentację artefaktów systemów programistycznych.

### 2.1.1. Diagram klas UML

Diagram klas jest jednym z najważniejszych diagramów w UML, przedstawiającym statyczną strukturę systemu. Składa się z następujących elementów:

- **Klasy** - reprezentują encje w systemie, zawierające:
  - Atrybuty (właściwości)
  - Operacje (metody)
  - Modyfikatory dostępu
- **Relacje** - określają związki między klasami:
  - **Asocjacja** - ogólny związek między klasami
  - **Agregacja** - relacja części-całość, gdzie część może istnieć niezależnie
  - **Kompozycja** - silna relacja części-całość, gdzie część nie może istnieć bez całości
  - **Dziedziczenie (Generalization)** - relacja typu "jest" między klasami
  - **Realizacja (Realization)** - implementacja interfejsu
  - **Zależność (Dependency)** - słaba relacja, gdzie zmiana w jednej klasie wpływa na drugą
- **Pakiety** - organizują klasy w logiczne grupy, odpowiadające modułom w Pythonie

### 2.1.2. Reprezentacja klas w Pythonie

W języku Python klasa jest definiowana za pomocą słowa kluczowego `class`. Klasy mogą:

- Dziedziczyć po innych klasach (wielokrotne dziedziczenie)
- Zawierać atrybuty instancji (właściwości)
- Zawierać metody (operacje)
- Używać type hints do określenia typów parametrów i zwracanych wartości

Przykład klasy Python:

```python
class ExampleService:
    def __init__(self, id: str, name: str):
        self._id = id
        self._name = name
    
    def save(self, data: str) -> None:
        pass
```

## 2.2. XML Metadata Interchange (XMI)

XMI (XML Metadata Interchange) jest standardem OMG służącym do wymiany metadanych modeli UML między różnymi narzędziami. Format XMI opiera się na XML i umożliwia serializację diagramów UML do postaci tekstowej.

### 2.2.1. Struktura pliku XMI

Plik XMI składa się z:

- **Element główny** `<xmi:XMI>` - zawiera informacje o wersji i przestrzeniach nazw
- **Model UML** `<uml:Model>` - reprezentuje główny model projektu
- **Elementy pakietowane** `<packagedElement>` - mogą reprezentować pakiety, klasy, relacje, typy danych

Przykładowa struktura XMI:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xmi:XMI xmlns:xmi="http://schema.omg.org/spec/XMI/2.1" 
         xmlns:uml="http://schema.omg.org/spec/UML/2.1"
         xmi:version="2.1">
    <uml:Model xmi:id="model1" name="Project">
        <packagedElement xmi:type="uml:Package" xmi:id="P1" name="Core">
            <packagedElement xmi:type="uml:Class" xmi:id="C1" name="ExampleService">
                <ownedAttribute xmi:type="uml:Property" 
                                xmi:id="C1_attr1" 
                                name="id" 
                                type="String"/>
            </packagedElement>
        </packagedElement>
    </uml:Model>
</xmi:XMI>
```

### 2.2.2. Parsowanie XMI

Parsowanie plików XMI wymaga:

- Obsługi przestrzeni nazw XML (namespace handling)
- Rekursywnego przetwarzania zagnieżdżonych elementów
- Mapowania elementów XMI na wewnętrzną reprezentację modelu
- Walidacji struktury i wykrywania błędów formatu

## 2.3. Generowanie kodu z modeli

Generowanie kodu z modeli (Model-Driven Development, MDD) to podejście polegające na automatycznym tworzeniu kodu źródłowego na podstawie modeli wysokiego poziomu.

### 2.3.1. Proces generowania kodu

Proces generowania kodu z diagramu UML obejmuje:

1. **Parsowanie modelu** - konwersja diagramu (XMI) na wewnętrzną reprezentację
2. **Analiza zależności** - określenie relacji między klasami i pakietami
3. **Mapowanie typów** - konwersja typów UML na typy Python (np. `String` → `str`, `Integer` → `int`)
4. **Generowanie struktury** - tworzenie katalogów odpowiadających pakietom
5. **Generowanie klas** - tworzenie plików `.py` z definicjami klas
6. **Zarządzanie importami** - automatyczne dodawanie instrukcji `import` dla używanych klas

### 2.3.2. Mapowanie relacji UML na kod Python

Różne typy relacji UML wymagają różnych reprezentacji w kodzie:

- **Dziedziczenie/Realizacja**: użycie dziedziczenia w Pythonie
  ```python
  class Child(Parent):
      pass
  ```

- **Asocjacja**: atrybut opcjonalny w konstruktorze
  ```python
  def __init__(self, other: OtherClass | None = None):
      self._other = other
  ```

- **Agregacja**: lista obiektów w konstruktorze
  ```python
  def __init__(self, items: list[Item] | None = None):
      self._items = items or []
  ```

- **Kompozycja**: automatyczne tworzenie obiektu w konstruktorze
  ```python
  def __init__(self):
      self._component = Component()
  ```

- **Zależność**: na tyle luźna i ogóla, że nie da się przewidzieć jej przedstawienia w kodzie

### 2.3.3. Zarządzanie importami

Kluczowym aspektem generowania kodu jest prawidłowe zarządzanie importami. System musi:

- Identyfikować wszystkie klasy używane w danej klasie
- Określać ścieżki importu na podstawie struktury pakietów
- Obsługiwać importy z zagnieżdżonych pakietów

Przykład:
```python
from Core.ExampleService import ExampleService
from Data.UserRepository import UserRepository
```

## 2.4. Architektura aplikacji webowej

Narzędzie zostało zaimplementowane jako aplikacja webowa, składająca się z:

### 2.4.1. Frontend (JavaScript)

Frontend odpowiada za:
- Interaktywny edytor diagramów UML
- Renderowanie diagramów w SVG
- Obsługę interakcji użytkownika (przeciąganie, edycja, usuwanie)
- Eksport diagramów do formatu XMI
- Komunikację z backendem przez API REST

### 2.4.2. Backend (Python/FastAPI)

Backend realizuje:
- Serwowanie interfejsu użytkownika
- Obsługę żądań HTTP
- Przyjmowanie plików XMI
- Generowanie kodu Python
- Zwracanie wygenerowanego projektu jako archiwum ZIP

### 2.4.3. Moduł generowania kodu

Moduł generowania kodu (domain layer) zawiera:
- Parser XMI
- Reprezentację wewnętrzną modelu (syntax objects)
- Generator kodu Python
- Zarządzanie importami
- Szablony generowania kodu

## 2.5. Podsumowanie

Zagadnienie generowania kodu z diagramów UML wymaga integracji wielu technologii i podejść:

- Zrozumienia standardów UML i XMI
- Parsowania złożonych struktur XML
- Mapowania koncepcyjnych modeli na konkretny kod
- Zarządzania zależnościami i importami
- Tworzenia przyjaznego interfejsu użytkownika

Zaproponowane rozwiązanie łączy te elementy w spójne narzędzie, umożliwiające efektywne przejście od modelu do kodu.
