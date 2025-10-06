## Uzasadnienie wyboru tematu

- Automatyzacja skraca czas tworzenia aplikacji i redukuje błędy.
- UML i XMI to otwarte standardy, zapewniające interoperacyjność.
- W ekosystemie Pythona brakuje lekkich, otwartych narzędzi do generowania kodu z UML.
- Projekt łączy modelowanie, przetwarzanie danych, projektowanie API i tworzenie interfejsów webowych.
- Modułowa architektura ułatwia rozszerzanie funkcjonalności.

## Cel i zakres pracy

Celem pracy jest stworzenie narzędzia do automatycznego generowania struktury aplikacji w Pythonie na podstawie diagramów klas UML w formacie XMI. Projekt obejmuje również budowę webowego edytora do projektowania tych diagramów i generowania kodu.

### Zakres pracy

#### Biblioteka w pythonie do generowania struktury projektu

- Utworzenie szkieletu biblioteki, zdefiniowanie interfejsu użytkowania
- Parser plików XMI do składni abstrakcyjnej
- Silnik szablonów do generowania zawartości klas
- Generator struktury plików projektu
- Połączenie wszystkiego w całość

#### Edytor webowy

- Utworzenie szkieletu serwisu, zdefiniowanie endpointów, podłączenie systemu szablonów
- Napisanie endpointów odpowiadających za przyjmowanie plików XMI i zwracanie wygenerowanego projektu
- Przygotowanie graficznego edytora diagramów klas UML
- Napisanie eksportera diagramu do formatu XMI
- Połączenie części frontendowej z endpointami

Po wykonaniu MVP obu części, projekt będzie rozszerzany o obsługę kolejnych elementów diagramów UML wspieranych przez XMI.

### MVP

- Możliwość wygenerowania projektu na podstawie pliku XMI za pomocą głównej funkcji biblioteki
- Możliwość zaprojektowanie własnego diagramu UML w edytorze webowym a następnie pobranie wygenerowanego projektu jako .zip
- Obsługa modułów wraz z zagnieżdżeniami (moduł może zawierać inne moduły)
- Obsługa klas, wraz z ich atrybuami i metodami
- Obłsuga relacji między klasami
- Obsługa importów klas potrzebnych do zdefiniowania innych
- Obługa podstawowych typów danych

### Technologie

- Czysty Python bez zewnętrznych bibliotek do stworzenia biblioteki do generowania projektu
- Serwis FastAPI wraz z system szablonów Jinja2
- React okazał się być overkillem do tego zadania
