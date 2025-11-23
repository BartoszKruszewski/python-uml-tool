# Wymagania funkcjonalne i niefunkcjonalne

## 1. Wymagania funkcjonalne

### 1.1. Tworzenie i edycja diagramów klas UML

**RF-01: Tworzenie klas**
- System umożliwia użytkownikowi dodawanie klas do diagramu
- Użytkownik może nadać klasie nazwę
- Użytkownik może zdefiniować atrybuty klasy (nazwa, typ)
- Użytkownik może zdefiniować operacje klasy (nazwa, parametry, typ zwracany)
- Użytkownik może przypisać klasę do pakietu

**RF-02: Tworzenie pakietów**
- System umożliwia użytkownikowi dodawanie pakietów do diagramu
- Użytkownik może nadać pakietowi nazwę
- System obsługuje zagnieżdżone pakiety
- Użytkownik może organizować klasy w pakietach

**RF-03: Definiowanie relacji**
- System umożliwia tworzenie relacji między klasami
- System obsługuje następujące typy relacji:
  - Asocjacja
  - Agregacja
  - Kompozycja
  - Dziedziczenie (Generalization)
  - Realizacja (Realization)
  - Zależność (Dependency)
- Użytkownik może określić kierunek relacji (klient → dostawca)

**RF-04: Edycja elementów**
- Użytkownik może modyfikować właściwości klas (nazwa, atrybuty, operacje)
- Użytkownik może modyfikować właściwości pakietów (nazwa)
- Użytkownik może usuwać klasy i pakiety
- Użytkownik może usuwać relacje

**RF-05: Wizualizacja diagramu**
- System wyświetla diagram w formie graficznej
- System renderuje klasy jako prostokąty z sekcjami (nazwa, atrybuty, operacje)
- System renderuje pakiety jako kontenery
- System renderuje relacje jako linie między klasami
- System wyświetla widok drzewa struktury pakietów i klas

### 1.2. Eksport i import diagramów

**RF-06: Eksport do XMI**
- System eksportuje diagram do formatu XMI 2.1
- Wyeksportowany plik jest zgodny ze standardem OMG
- Plik XMI zawiera wszystkie elementy diagramu (klasy, pakiety, relacje)

**RF-07: Import XMI**
- System może parsować pliki XMI 2.1
- System obsługuje podstawowe elementy XMI (klasy, pakiety, relacje, typy danych)
- System waliduje poprawność formatu XMI

### 1.3. Generowanie kodu Python

**RF-08: Generowanie struktury projektu**
- System generuje strukturę katalogów odpowiadającą pakietom
- System tworzy pliki `__init__.py` dla każdego pakietu
- System generuje pliki `.py` dla każdej klasy

**RF-09: Generowanie klas**
- System generuje definicje klas Python z odpowiednią składnią
- System mapuje atrybuty UML na właściwości klasy
- System generuje konstruktory z parametrami odpowiadającymi atrybutom
- System generuje metody odpowiadające operacjom UML
- System używa type hints dla parametrów i zwracanych wartości

**RF-10: Mapowanie typów**
- System mapuje standardowe typy UML na typy Python:
  - `String` → `str`
  - `Integer` → `int`
  - `Float` → `float`
- System zachowuje nazwy niestandardowych typów (klasy użytkownika)

**RF-11: Obsługa relacji w kodzie**
- System generuje odpowiedni kod dla różnych typów relacji:
  - **Asocjacja**: opcjonalny parametr w konstruktorze
  - **Agregacja**: lista parametrów w konstruktorze
  - **Kompozycja**: automatyczne tworzenie obiektu w konstruktorze
  - **Dziedziczenie/Realizacja**: dziedziczenie w Pythonie
  - **Zależność**: import bez tworzenia instancji

**RF-12: Zarządzanie importami**
- System automatycznie generuje instrukcje `import` dla używanych klas
- System generuje poprawne ścieżki importu na podstawie struktury pakietów
- System obsługuje importy z zagnieżdżonych pakietów

**RF-13: Eksport wygenerowanego projektu**
- System pakuje wygenerowany projekt do archiwum ZIP
- Użytkownik może pobrać archiwum ZIP z wygenerowanym kodem
- Archiwum zawiera kompletną strukturę projektu gotową do użycia

### 1.4. Interfejs użytkownika

**RF-14: Interakcje użytkownika**
- Użytkownik może przeciągać elementy na diagramie (drag & drop)
- Użytkownik może zaznaczać elementy klikając na nie
- Użytkownik może edytować elementy w panelach edycji
- Użytkownik może używać widoku drzewa do nawigacji po strukturze

**RF-15: Operacje na diagramie**
- Użytkownik może czyścić cały diagram
- Użytkownik może generować kod z aktualnego diagramu
- System wyświetla odpowiednie komunikaty o błędach

## 2. Wymagania niefunkcjonalne

### 2.1. Wydajność

**RNF-01: Czas odpowiedzi**
- Generowanie kodu dla projektu z maksymalnie 100 klas powinno zakończyć się w czasie poniżej 5 sekund
- Renderowanie diagramu powinno być płynne (minimum 30 FPS)
- Interfejs powinien reagować na akcje użytkownika w czasie poniżej 100ms

**RNF-02: Skalowalność**
- System powinien obsługiwać diagramy z maksymalnie 1000 klas
- System powinien obsługiwać zagnieżdżone pakiety do 10 poziomów głębokości

### 2.2. Użyteczność

**RNF-03: Intuicyjność**
- Interfejs powinien być intuicyjny i nie wymagać szkolenia
- Operacje powinny być dostępne w maksymalnie 3 kliknięciach
- System powinien wyświetlać pomocne komunikaty i etykiety

**RNF-04: Dostępność**
- Aplikacja powinna działać w nowoczesnych przeglądarkach (Chrome, Firefox, Safari, Edge)
- Interfejs powinien być responsywny i dostosowywać się do różnych rozdzielczości ekranu

### 2.5. Niezawodność

**RNF-05: Obsługa błędów**
- System powinien walidować dane wejściowe (pliki XMI)
- System powinien wyświetlać czytelne komunikaty błędów
- System nie powinien tracić danych przy błędach parsowania

**RNF-06: Stabilność**
- System nie powinien zawieszać się podczas normalnego użytkowania
- Błędy w jednym komponencie nie powinny wpływać na cały system
- System powinien obsługiwać nieprawidłowe dane wejściowe gracefully

### 2.4. Kompatybilność

**RNF-07: Standardy**
- System powinien być zgodny ze standardem XMI 2.1
- Wygenerowany kod powinien być zgodny z Python 3.11+
- System powinien używać type hints zgodnie z PEP 484

**RNF-08: Integracja**
- System powinien być kompatybilny z innymi narzędziami UML eksportującymi XMI 2.1
- Wygenerowany kod powinien być kompatybilny z popularnymi narzędziami Python (pip, setuptools)

### 2.5. Utrzymanie i rozwój

**RNF-09: Modułowość**
- Kod powinien być podzielony na logiczne moduły
- Warstwa domeny powinna być niezależna od warstwy aplikacji
- Komponenty powinny być łatwe do testowania

**RNF-10: Dokumentacja**
- Kod powinien zawierać dokumentację docstring
- System powinien mieć dokumentację użytkownika
- System powinien mieć dokumentację techniczną dla programistów

### 2.6. Bezpieczeństwo

**RNF-11: Bezpieczeństwo danych**
- System nie przechowuje danych użytkownika po zakończeniu sesji
- Pliki tymczasowe są automatycznie usuwane
- System waliduje rozmiar przesyłanych plików (maksymalnie 10MB)

## 3. Historyjki użytkownika (User Stories)

### US-01: Tworzenie nowego diagramu
**Jako** programista Python  
**Chcę** utworzyć nowy diagram klas UML  
**Aby** zaprojektować strukturę mojego projektu przed rozpoczęciem kodowania

**Kryteria akceptacji:**
- Mogę dodać klasę do diagramu jednym kliknięciem
- Mogę nadać klasie nazwę i zdefiniować jej atrybuty oraz metody
- Widzę diagram wizualnie na ekranie

### US-02: Organizacja klas w pakietach
**Jako** programista Python  
**Chcę** organizować klasy w pakietach  
**Aby** odzwierciedlić strukturę modułów w moim projekcie

**Kryteria akceptacji:**
- Mogę utworzyć pakiet i nadać mu nazwę
- Mogę przypisać klasy do pakietów
- Mogę tworzyć zagnieżdżone pakiety
- Widzę strukturę pakietów w widoku drzewa

### US-03: Definiowanie relacji między klasami
**Jako** programista Python  
**Chcę** zdefiniować relacje między klasami  
**Aby** zaprojektować zależności i powiązania w moim systemie

**Kryteria akceptacji:**
- Mogę utworzyć relację między dwiema klasami
- Mogę wybrać typ relacji (asocjacja, agregacja, kompozycja, dziedziczenie, itp.)
- Relacja jest wizualnie wyświetlana na diagramie

### US-04: Generowanie kodu z diagramu
**Jako** programista Python  
**Chcę** wygenerować kod Python z mojego diagramu  
**Aby** szybko stworzyć szkielet projektu bez ręcznego pisania kodu

**Kryteria akceptacji:**
- Mogę wygenerować kod jednym kliknięciem
- Otrzymuję archiwum ZIP z kompletnym projektem
- Wygenerowany kod zawiera wszystkie klasy z diagramu
- Struktura katalogów odpowiada pakietom w diagramie

### US-05: Import istniejącego diagramu
**Jako** programista Python  
**Chcę** zaimportować diagram z pliku XMI  
**Aby** kontynuować pracę nad diagramem utworzonym w innym narzędziu

**Kryteria akceptacji:**
- Mogę zaimportować plik XMI 2.1
- Wszystkie elementy diagramu są poprawnie załadowane
- Mogę edytować zaimportowany diagram

### US-06: Edycja właściwości klasy
**Jako** programista Python  
**Chcę** edytować właściwości klasy (atrybuty, metody)  
**Aby** dostosować klasę do moich potrzeb

**Kryteria akceptacji:**
- Mogę zaznaczyć klasę i zobaczyć jej właściwości w panelu edycji
- Mogę modyfikować nazwę, atrybuty i operacje klasy
- Zmiany są natychmiast widoczne na diagramie

### US-07: Eksport diagramu do XMI
**Jako** programista Python  
**Chcę** wyeksportować mój diagram do formatu XMI  
**Aby** użyć go w innych narzędziach UML lub zachować jako backup

**Kryteria akceptacji:**
- Mogę wyeksportować diagram do pliku XMI
- Wyeksportowany plik jest zgodny ze standardem XMI 2.1
- Mogę zaimportować wyeksportowany plik z powrotem

### US-08: Wizualizacja struktury projektu
**Jako** programista Python  
**Chcę** zobaczyć hierarchiczną strukturę mojego projektu  
**Aby** lepiej zrozumieć organizację pakietów i klas

**Kryteria akceptacji:**
- Widzę drzewo pakietów i klas w osobnym panelu
- Mogę kliknąć element w drzewie, aby go zaznaczyć na diagramie
- Struktura jest aktualizowana w czasie rzeczywistym

### US-09: Szybkie prototypowanie
**Jako** programista Python  
**Chcę** szybko stworzyć szkielet projektu  
**Aby** rozpocząć implementację bez tracenia czasu na ręczne tworzenie plików

**Kryteria akceptacji:**
- Mogę szybko utworzyć podstawowy diagram z kilkoma klasami
- Generowanie kodu jest szybkie (poniżej 5 sekund dla małych projektów)
- Wygenerowany kod jest gotowy do użycia (można go od razu uruchomić)

### US-10: Nauka UML
**Jako** student informatyki  
**Chcę** używać narzędzia do nauki UML  
**Aby** zrozumieć koncepcje modelowania obiektowego

**Kryteria akceptacji:**
- Interfejs jest intuicyjny i nie wymaga szkolenia
- Mogę eksperymentować z różnymi typami relacji
- Widzę jak diagramy UML przekładają się na kod Python

### US-11: Współpraca w zespole
**Jako** członek zespołu programistów  
**Chcę** udostępnić mój diagram innym  
**Aby** omówić architekturę projektu przed implementacją

**Kryteria akceptacji:**
- Mogę wyeksportować diagram do standardowego formatu (XMI)
- Inni członkowie zespołu mogą zaimportować diagram w swoich narzędziach
- Diagram jest czytelny i zrozumiały dla innych

### US-12: Walidacja projektu
**Jako** programista Python  
**Chcę** sprawdzić czy mój diagram jest poprawny  
**Aby** uniknąć błędów w wygenerowanym kodzie

**Kryteria akceptacji:**
- System informuje mnie o błędach w diagramie (np. brakujące nazwy klas)
- System waliduje poprawność relacji
- Komunikaty błędów są czytelne i pomocne

