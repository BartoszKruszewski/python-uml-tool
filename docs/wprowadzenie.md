# Wprowadzenie

## 1.1. Motywacja

Współczesne projektowanie oprogramowania wymaga efektywnych narzędzi wspomagających proces tworzenia aplikacji. Modelowanie UML (Unified Modeling Language) stanowi standard w dziedzinie wizualizacji i dokumentacji architektury systemów informatycznych. Jednakże, przejście od diagramów UML do rzeczywistego kodu źródłowego często wymaga ręcznej implementacji, co jest czasochłonne i podatne na błędy.

Niniejsza praca prezentuje narzędzie, które automatyzuje proces generowania kodu Python na podstawie diagramów klas UML. Rozwiązanie to łączy w sobie interaktywny edytor diagramów UML z silnikiem generującym kod, umożliwiając programistom szybkie prototypowanie i tworzenie szkieletów projektów.

## 1.2. Cel pracy

Głównym celem pracy jest stworzenie kompleksowego narzędzia do modelowania diagramów klas UML oraz automatycznego generowania kodu Python na podstawie tych diagramów. Narzędzie powinno:

- Umożliwiać interaktywne tworzenie i edycję diagramów klas UML w przeglądarce internetowej
- Eksportować diagramy do standardowego formatu XMI (XML Metadata Interchange)
- Parsować pliki XMI i konwertować je na wewnętrzną reprezentację projektu
- Generować kompletny kod Python z zachowaniem struktury pakietów, klas, atrybutów i metod
- Obsługiwać różne typy relacji UML (asocjacja, agregacja, kompozycja, dziedziczenie, realizacja, zależność)
- Automatycznie zarządzać importami między modułami

## 1.3. Zakres pracy

Praca obejmuje:

1. **Analizę wymagań** - określenie funkcjonalności narzędzia oraz wymagań technicznych
2. **Projekt architektury** - zaprojektowanie systemu składającego się z:
   - Frontendu w JavaScript do edycji diagramów
   - Backendu w Pythonie (FastAPI) do obsługi żądań HTTP
   - Modułu parsowania XMI
   - Modułu generowania kodu Python
3. **Implementację** - stworzenie działającego prototypu narzędzia
4. **Testowanie** - weryfikacja poprawności działania poszczególnych komponentów
5. **Dokumentację** - przygotowanie dokumentacji użytkownika i programisty
