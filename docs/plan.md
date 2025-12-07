## Wstęp

### Wprowadzenie do tematyki

Współczesna inżynieria oprogramowania coraz bardziej koncentruje się na automatyzacji procesów wytwórczych, obejmującej zarządzanie infrastrukturą oraz generowanie kodu źródłowego. Wraz ze wzrostem złożoności systemów informatycznych, kluczowym elementem procesu deweloperskiego stało się modelowanie, a standardem w tej dziedzinie jest język UML (Unified Modeling Language). UML umożliwia wizualne przedstawienie architektury systemu przed rozpoczęciem implementacji.

W klasycznym podejściu często występuje rozdźwięk między modelem projektowym a finalnym kodem. Ręczne odwzorowanie diagramów klas na strukturę plików i definicje obiektów jest czasochłonne, powtarzalne i podatne na błędy. Format XMI (XML Metadata Interchange) odgrywa kluczową rolę w interoperacyjności narzędzi modelujących, umożliwiając wymianę metadanych modeli UML między różnymi środowiskami.

### Uzasadnienie wyboru tematu.

Wybór tematu wynika z obserwacji powszechnego problemu w procesie wytwarzania oprogramowania — braku spójności między fazą projektowania a fazą implementacji. Diagramy UML, traktowane jako fundament architektury, szybko stają się nieaktualne wobec rzeczywistego kodu. Ręczna translacja modeli na kod jest żmudna, mechaniczna i obarczona ryzykiem błędów, co prowadzi do powstawania długu technologicznego już na starcie projektu.

Decyzja o stworzeniu narzędzia automatyzującego ten proces wynika z chęci rozwiązania tego problemu poprzez praktyczne zastosowanie podejścia Model-Driven Development (MDD). Komercyjne środowiska CASE (Computer-Aided Software Engineering), takie jak Enterprise Architect czy Visual Paradigm, są często drogie, „ciężkie” oraz oparte na zamkniętym ekosystemie. Istnieje zatem nisza na lekkie, dostępne przez przeglądarkę rozwiązania typu open source, które obniżają próg wejścia do profesjonalnego modelowania systemów.

Projekt odpowiada na rosnącą popularność języka Python w budowaniu złożonych systemów backendowych. W przeciwieństwie do języków silnie typowanych, takich jak Java czy C#, gdzie generowanie kodu z UML jest standardem, w ekosystemie Pythona brakuje nowoczesnych narzędzi łączących elastyczność języka ze sztywnymi regułami architektonicznymi UML. Stworzenie dedykowanego parsera formatu XMI dla Pythona pozwala na wypełnienie tej luki.

Z perspektywy inżynierskiej, realizacja projektu pozwala pogłębić wiedzę na styku inżynierii oprogramowania, modelowania UML, implementacji parserów struktur danych (XML/XMI) oraz projektowania interfejsów API i aplikacji webowych. Praca umożliwia praktyczne wykorzystanie nowoczesnych rozwiązań full-stack, łącząc teoretyczne aspekty kompilacji i generowania kodu z wyzwaniami współczesnego programowania.

### Cel pracy

Celem pracy jest opracowanie kompleksowego narzędzia wspomagającego proces wytwarzania oprogramowania, umożliwiającego automatyczne generowanie struktury aplikacji w języku Python na podstawie diagramów klas UML. Realizacja celu obejmuje opracowanie dwóch kluczowych komponentów:

- Biblioteki Pythonowej służącej do parsowania plików XMI, reprezentujących modele UML, oraz generowania fizycznej struktury projektu: katalogów, plików modułów, definicji klas, atrybutów, metod i relacji. Biblioteka ma zapewniać elastyczność i łatwość integracji z różnymi środowiskami deweloperskimi.

- Aplikacji webowej stanowiącej interaktywny edytor diagramów UML, umożliwiający użytkownikowi tworzenie, modyfikowanie i eksportowanie modeli bezpośrednio w przeglądarce. Aplikacja zapewnia wygodny interfejs graficzny oraz komunikację z backendem, który odpowiada za przetworzenie modelu i wygenerowanie kodu źródłowego.

Ostatecznym efektem pracy ma być system umożliwiający szybkie prototypowanie aplikacji, zapewniający zgodność między modelem architektonicznym a kodem źródłowym oraz wspierający standaryzację i automatyzację początkowych etapów tworzenia oprogramowania.

### Zakres pracy

Zakres pracy obejmuje projektowanie, implementację oraz testowanie poszczególnych komponentów systemu:

- Analizę standardu XMI oraz sposób reprezentacji diagramów klas UML w formacie XML.

- Implementację parsera plików XMI w języku Python, wykorzystującego wyłącznie standardowe biblioteki.

- Projekt i implementację logiki generowania szkieletu projektu w języku Python, obejmującą tworzenie katalogów, plików modułów, definicji klas, atrybutów, metod oraz relacji dziedziczenia i asocjacji.

- Implementację backendu aplikacji webowej w oparciu o framework FastAPI, zapewniającego interfejs API do obsługi żądań generowania kodu oraz eksportu projektu.

- Implementację frontendu aplikacji, umożliwiającego interaktywne tworzenie i edycję diagramów klas UML.

- Integrację frontendu z backendem poprzez REST API oraz zapewnienie możliwości eksportu modelu w formacie XMI.

- Testowanie funkcjonalności generatora kodu oraz aplikacji webowej na wybranych przykładach diagramów UML.

- Dokumentację rozwiązania oraz przygotowanie przykładowych przypadków użycia.

Praca nie obejmuje implementacji generowania pełnej logiki biznesowej metod (ciała funkcji), a jedynie ich sygnatur oraz struktury architektonicznej wynikającej z modelu UML.

### Krótki opis struktury pracy

TODO

## Analiza dziedziny i przegląd dostępnych rozwiązań

### Opis problemu (biznesowo)

W procesie wytwarzania oprogramowania programiści często poświęcają dużo czasu na ręczne przygotowanie struktury projektu: tworzenie katalogów, plików, klas i ich zależności. W przypadku dużych systemów, zwłaszcza modelowanych za pomocą UML, ten etap wiąże się z ryzykiem błędów, niespójności między modelem a kodem oraz wydłużeniem czasu rozpoczęcia właściwej implementacji.

W praktyce, wiele zespołów napotyka trudności z utrzymaniem zgodności architektury (UML) z rzeczywistym kodem. Ręczne tworzenie struktury prowadzi do powstawania „długów technologicznych” – model szybko staje się nieaktualny, a zmiany wymagają wielokrotnego ręcznego aktualizowania kodu. Brak standaryzacji utrudnia pracę zespołową oraz automatyzację testów i integracji ciągłej.

Istniejące narzędzia CASE generują kod z UML, ale są często kosztowne, wymagają instalacji ciężkich aplikacji desktopowych i nie są elastyczne. Brakuje lekkich, otwartych rozwiązań umożliwiających szybkie prototypowanie, automatyzację tworzenia struktury projektu oraz ciągłą synchronizację modelu z kodem.

Celem projektu jest eliminacja tych problemów poprzez stworzenie lekkiego, webowego narzędzia do szybkiego i spójnego generowania szkieletu aplikacji Pythonowej na podstawie diagramów UML, co przekłada się na większą efektywność, mniejszą liczbę błędów i lepszą standaryzację architektury projektów.

### Przegląd istniejących, konkurencyjnych rozwiązań

Rynek narzędzi wspierających modelowanie w języku UML jest silnie spolaryzowany. Z jednej strony dominują rozbudowane, komercyjne systemy CASE, z drugiej – proste edytory graficzne dostępne przez przeglądarkę. Analiza dostępnych rozwiązań pozwala wyodrębnić cztery główne grupy narzędzi, z których każda posiada istotne ograniczenia w kontekście szybkiego prototypowania aplikacji Pythonowych.

Pierwszą grupę stanowią zaawansowane środowiska CASE, takie jak Enterprise Architect czy Visual Paradigm. Są to kompletne platformy inżynierskie oferujące pełną obsługę standardu XMI, inżynierię zwrotną oraz wbudowane generatory kodu. Ich główną wadą jest jednak "ciężkość" (wymóg instalacji desktopowej), wysoki koszt licencji oraz wysoki próg wejścia wynikający ze skomplikowanego interfejsu. Są to narzędzia dedykowane dla architektów korporacyjnych, a nie dla zwinnych zespołów deweloperskich.

Drugą kategorię tworzą lekkie narzędzia desktopowe, reprezentowane przez StarUML. Oferują one znacznie lepszy UX niż systemy korporacyjne, jednak ich funkcjonalność w zakresie generowania kodu (szczególnie dla Pythona) opiera się na wtyczkach tworzonych przez społeczność, które często są nieaktualne lub porzucane. Ponadto, wciąż wymagają one instalacji lokalnej, co utrudnia pracę w chmurze.

Trzecią grupą są webowe edytory graficzne, takie jak draw.io (diagrams.net). Cieszą się one ogromną popularnością ze względu na darmowy dostęp i brak konieczności instalacji. Są to jednak narzędzia stricte do rysowania – nie posiadają semantycznego rozumienia obiektów UML. Traktują diagram jako zbiór kształtów, a nie strukturę klas, co w połączeniu z brakiem obsługi formatu XMI całkowicie wyklucza je z procesów automatycznego generowania kodu.

Czwartą grupę stanowią narzędzia typu "Code-as-Diagram", np. PlantUML. Choć są one standardem w dokumentowaniu kodu (model Open Source), nie służą do modelowania architektury w rozumieniu MDD. Nie przechowują one modelu w uniwersalnym formacie metadanych, lecz jedynie renderują obraz na podstawie tekstu, co uniemożliwia dwukierunkową synchronizację z kodem.

### Analiza ich wad i zalet

| Narzędzie            | Kategoria          | Platforma      | Licencja          | Obsługa XMI | Generowanie kodu (Python) | Próg wejścia / UX      |
| -------------------- | ------------------ | -------------- | ----------------- | ----------- | ------------------------- | ---------------------- |
| Enterprise Architect | Zaawansowane CASE  | Desktop        | Komercyjna        | Pełna       | Tak (Wbudowane)           | Wysoki                 |
| Visual Paradigm      | Zaawansowane CASE  | Desktop        | Subskrypcja       | Pełna       | Tak (Wbudowane)           | Średni/Wysoki          |
| StarUML              | Lekkie Desktopowe  | Desktop        | Komercyjna / Eval | Częściowa   | Ograniczone (Wtyczki)     | Niski                  |
| PlantUML             | Code-as-Diagram    | IDE / CLI      | Open Source       | Brak        | Brak (Tylko wizualizacja) | Średni                 |
| draw.io              | Edytor graficzny   | Web            | Darmowa           | Brak        | Brak                      | Bardzo niski           |
| ArgoUML              | Legacy Open Source | Desktop (Java) | Open Source       | Pełna       | Częściowe (Przestarzałe)  | Wysoki (Archaiczny UI) |

Analiza wykazuje wyraźną lukę rynkową. Brakuje narzędzia, które łączyłoby zalety edytorów webowych (dostępność, brak instalacji) z inżynierską precyzją systemów CASE (obsługa XMI, generowanie kodu), będąc jednocześnie rozwiązaniem Open Source dedykowanym specyfice języka Python. Projektowane rozwiązanie ma na celu wypełnienie tej niszy.

## Analiza wymagań i projekt systemu

### Wymagania funkcjonalne

#### Tworzenie i edycja diagramów klas UML

**Tworzenie klas**
- System umożliwia użytkownikowi dodawanie klas do diagramu
- Użytkownik może nadać klasie nazwę
- Użytkownik może zdefiniować atrybuty klasy (nazwa, typ)
- Użytkownik może zdefiniować operacje klasy (nazwa, parametry, typ zwracany)
- Użytkownik może przypisać klasę do pakietu

**Tworzenie pakietów**
- System umożliwia użytkownikowi dodawanie pakietów do diagramu
- Użytkownik może nadać pakietowi nazwę
- System obsługuje zagnieżdżone pakiety
- Użytkownik może organizować klasy w pakietach

**Definiowanie relacji**
- System umożliwia tworzenie relacji między klasami
- System obsługuje następujące typy relacji:
  - Asocjacja
  - Agregacja
  - Kompozycja
  - Dziedziczenie
  - Realizacja
  - Zależność
- Użytkownik może określić kierunek relacji

**Edycja elementów**
- Użytkownik może modyfikować właściwości klas (nazwa, atrybuty, operacje)
- Użytkownik może modyfikować właściwości pakietów (nazwa)
- Użytkownik może usuwać klasy i pakiety
- Użytkownik może usuwać relacje

**Wizualizacja diagramu**
- System wyświetla diagram w formie graficznej
- System renderuje klasy jako prostokąty z sekcjami (nazwa, atrybuty, operacje)
- System renderuje pakiety jako kontenery
- System renderuje relacje jako linie między klasami
- System wyświetla widok drzewa struktury pakietów i klas

#### Eksport i import diagramów

**Eksport do XMI**
- System eksportuje diagram do formatu XMI 2.1
- Wyeksportowany plik jest zgodny ze standardem OMG
- Plik XMI zawiera wszystkie elementy diagramu (klasy, pakiety, relacje)

**Import XMI**
- System może parsować pliki XMI 2.1
- System obsługuje podstawowe elementy XMI (klasy, pakiety, relacje, typy danych)
- System waliduje poprawność formatu XMI

#### Generowanie kodu Python

**Generowanie struktury projektu**
- System generuje strukturę katalogów odpowiadającą pakietom
- System tworzy pliki `__init__.py` dla każdego pakietu
- System generuje pliki `.py` dla każdej klasy

**Generowanie klas**
- System generuje definicje klas Python z odpowiednią składnią
- System mapuje atrybuty UML na właściwości klasy
- System generuje konstruktory z parametrami odpowiadającymi atrybutom
- System generuje metody odpowiadające operacjom UML
- System używa type hints dla parametrów i zwracanych wartości

**Mapowanie typów**
- System mapuje standardowe typy UML na typy Python:
  - `String` → `str`
  - `Integer` → `int`
  - `Float` → `float`
- System zachowuje nazwy niestandardowych typów (klasy użytkownika)

**Obsługa relacji w kodzie**
- System generuje odpowiedni kod dla różnych typów relacji:
  - **Asocjacja**: opcjonalny parametr w konstruktorze
  - **Agregacja**: lista parametrów w konstruktorze
  - **Kompozycja**: automatyczne tworzenie obiektu w konstruktorze
  - **Dziedziczenie/Realizacja**: dziedziczenie w Pythonie
  - **Zależność**: import bez tworzenia instancji

**Zarządzanie importami**
- System automatycznie generuje instrukcje `import` dla używanych klas
- System generuje poprawne ścieżki importu na podstawie struktury pakietów
- System obsługuje importy z zagnieżdżonych pakietów

**Eksport wygenerowanego projektu**
- System pakuje wygenerowany projekt do archiwum ZIP
- Użytkownik może pobrać archiwum ZIP z wygenerowanym kodem
- Archiwum zawiera kompletną strukturę projektu gotową do użycia

#### Interfejs użytkownika

**Interakcje użytkownika**
- Użytkownik może przeciągać elementy na diagramie
- Użytkownik może zaznaczać elementy klikając na nie
- Użytkownik może edytować elementy w panelach edycji
- Użytkownik może używać widoku drzewa do nawigacji po strukturze

**Operacje na diagramie**
- Użytkownik może czyścić cały diagram
- Użytkownik może generować kod z aktualnego diagramu

### Wymagania niefunkcjonalne

#### Wydajność

**Czas odpowiedzi**
- Generowanie kodu dla projektu z maksymalnie 100 klas powinno zakończyć się w czasie poniżej 5 sekund
- Renderowanie diagramu powinno być płynne (minimum 30 FPS)
- Interfejs powinien reagować na akcje użytkownika w czasie poniżej 100ms

**Skalowalność**
- System powinien obsługiwać diagramy z maksymalnie 1000 klas
- System powinien obsługiwać zagnieżdżone pakiety do 10 poziomów głębokości

#### Użyteczność

**Intuicyjność**
- Interfejs powinien być intuicyjny i nie wymagać szkolenia
- Operacje powinny być dostępne w maksymalnie 3 kliknięciach
- System powinien wyświetlać pomocne etykiety

**Dostępność**
- Aplikacja powinna działać w nowoczesnych przeglądarkach (Chrome, Firefox, Safari, Edge)
- Interfejs powinien być responsywny i dostosowywać się do różnych rozdzielczości ekranu

#### Niezawodność

**Obsługa błędów**
- System powinien walidować dane wejściowe (pliki XMI)
- System nie powinien tracić danych przy błędach parsowania

**Stabilność**
- System nie powinien zawieszać się podczas normalnego użytkowania
- Błędy w jednym komponencie nie powinny wpływać na cały system

#### Kompatybilność

**Standardy**
- System powinien być zgodny ze standardem XMI 2.1
- Wygenerowany kod powinien być zgodny z Python 3.11+
- System powinien używać type hints zgodnie z PEP 484

**Integracja**
- System powinien być kompatybilny z innymi narzędziami UML eksportującymi XMI 2.1
- Wygenerowany kod powinien być kompatybilny z popularnymi narzędziami Python (pip, setuptools)

#### Utrzymanie i rozwój

**Modułowość**
- Kod powinien być podzielony na logiczne moduły
- Warstwa domeny powinna być niezależna od warstwy aplikacji
- Komponenty powinny być łatwe do testowania

**Dokumentacja**
- Kod powinien zawierać dokumentację docstring
- System powinien mieć dokumentację użytkownika
- System powinien mieć dokumentację techniczną dla programistów

#### Bezpieczeństwo

**Bezpieczeństwo danych**
- System nie przechowuje danych użytkownika po zakończeniu sesji
- Pliki tymczasowe są automatycznie usuwane

### Historyjki użytkownika

#### Tworzenie nowego diagramu
**Jako** programista Python
**Chcę** utworzyć nowy diagram klas UML
**Aby** zaprojektować strukturę mojego projektu przed rozpoczęciem kodowania

**Kryteria akceptacji:**
- Mogę dodać klasę do diagramu jednym kliknięciem
- Mogę nadać klasie nazwę i zdefiniować jej atrybuty oraz metody
- Widzę diagram wizualnie na ekranie

#### Organizacja klas w pakietach
**Jako** programista Python
**Chcę** organizować klasy w pakietach
**Aby** odzwierciedlić strukturę modułów w moim projekcie

**Kryteria akceptacji:**
- Mogę utworzyć pakiet i nadać mu nazwę
- Mogę przypisać klasy do pakietów
- Mogę tworzyć zagnieżdżone pakiety
- Widzę strukturę pakietów w widoku drzewa

#### Definiowanie relacji między klasami
**Jako** programista Python
**Chcę** zdefiniować relacje między klasami
**Aby** zaprojektować zależności i powiązania w moim systemie

**Kryteria akceptacji:**
- Mogę utworzyć relację między dwiema klasami
- Mogę wybrać typ relacji
- Relacja jest wizualnie wyświetlana na diagramie

#### Generowanie kodu z diagramu
**Jako** programista Python
**Chcę** wygenerować kod Python z mojego diagramu
**Aby** szybko stworzyć szkielet projektu bez ręcznego pisania kodu

**Kryteria akceptacji:**
- Mogę wygenerować kod jednym kliknięciem
- Otrzymuję archiwum ZIP z kompletnym projektem
- Wygenerowany kod zawiera wszystkie klasy z diagramu
- Struktura katalogów odpowiada pakietom w diagramie

#### Import istniejącego diagramu
**Jako** programista Python
**Chcę** zaimportować diagram z pliku XMI
**Aby** kontynuować pracę nad diagramem

**Kryteria akceptacji:**
- Mogę zaimportować plik XMI 2.1
- Wszystkie elementy diagramu są poprawnie załadowane
- Mogę edytować zaimportowany diagram

#### Edycja właściwości klasy
**Jako** programista Python
**Chcę** edytować właściwości klasy (atrybuty, metody)
**Aby** dostosować klasę do moich potrzeb

**Kryteria akceptacji:**
- Mogę zaznaczyć klasę i zobaczyć jej właściwości w panelu edycji
- Mogę modyfikować nazwę, atrybuty i operacje klasy
- Zmiany są natychmiast widoczne na diagramie

#### Eksport diagramu do XMI
**Jako** programista Python
**Chcę** wyeksportować mój diagram do formatu XMI
**Aby** użyć go w innych narzędziach UML lub zachować jako backup

**Kryteria akceptacji:**
- Mogę wyeksportować diagram do pliku XMI
- Wyeksportowany plik jest zgodny ze standardem XMI 2.1
- Mogę zaimportować wyeksportowany plik z powrotem

#### Wizualizacja struktury projektu
**Jako** programista Python  
**Chcę** zobaczyć hierarchiczną strukturę mojego projektu  
**Aby** lepiej zrozumieć organizację pakietów i klas

**Kryteria akceptacji:**
- Widzę drzewo pakietów i klas w osobnym panelu
- Mogę kliknąć element w drzewie, aby go zaznaczyć na diagramie
- Struktura jest aktualizowana w czasie rzeczywistym

#### Szybkie prototypowanie
**Jako** programista Python  
**Chcę** szybko stworzyć szkielet projektu  
**Aby** rozpocząć implementację bez tracenia czasu na ręczne tworzenie plików

**Kryteria akceptacji:**
- Mogę szybko utworzyć podstawowy diagram z kilkoma klasami
- Generowanie kodu jest szybkie (poniżej 5 sekund dla małych projektów)
- Wygenerowany kod jest gotowy do użycia (można go od razu uruchomić)

#### Nauka UML
**Jako** student informatyki
**Chcę** używać narzędzia do nauki UML
**Aby** zrozumieć koncepcje modelowania obiektowego

**Kryteria akceptacji:**
- Interfejs jest intuicyjny i nie wymaga szkolenia
- Mogę eksperymentować z różnymi typami relacji
- Widzę jak diagramy UML przekładają się na kod Python

#### Współpraca w zespole
**Jako** członek zespołu programistów
**Chcę** udostępnić mój diagram innym
**Aby** omówić architekturę projektu przed implementacją

**Kryteria akceptacji:**
- Mogę wyeksportować diagram do standardowego formatu (XMI)
- Inni członkowie zespołu mogą zaimportować diagram w swoich narzędziach
- Diagram jest czytelny i zrozumiały dla innych

### Architektura systemu

Architektura systemu jest oparta na wzorcu trójwarstwowym, co gwarantuje modułowość rozwiązania oraz wyraźną separację odpowiedzialności poszczególnych komponentów.

W strukturze projektu wyróżnia się trzy współpracujące ze sobą warstwy:

- Warstwa prezentacji – stanowi interaktywny frontend zaimplementowany w języku JavaScript. Odpowiada ona za dynamiczne renderowanie diagramów w technologii SVG, zarządzanie złożonym stanem wizualnym oraz obsługę dwukierunkowej konwersji danych do standardu XMI 2.1.

- Warstwa aplikacji – funkcjonuje jako backend oparty na frameworku FastAPI (Python). Pełni rolę serwera REST API, który obsługuje komunikację HTTP i koordynuje przepływ danych między interfejsem użytkownika a silnikiem generującym kod.

- Warstwa domeny – realizuje kluczową logikę biznesową w izolacji od warstwy sieciowej. Moduł ten odpowiada za parsowanie struktur UML, mapowanie relacji między obiektami oraz automatyczną generację wynikowych plików i katalogów w języku Python.

## Charakterystyka narzędzi i środowiska wytwarzania

### Języki programowania i framework

Aplikacja jest przeznaczona do generowania kodu Python, co naturalnie wpłynęło na wybór języka dla warstwy domenowej. W celu minimalizacji zależności zewnętrznych w tej warstwie wykorzystane zostały wyłącznie biblioteki standardowe.

Warstwa aplikacji została zbudowana w oparciu o Python i framework FastAPI. FastAPI wyróżnia się swoją lekkością i prostotą architektoniczną, co czyni go idealnym rozwiązaniem dla małych serwisów udostępniających REST API. W porównaniu z popularnymi alternatywami takimi jak Flask czy Django, oferuje on znacznie bardziej minimalistyczne podejście przy jednoczesnie wyższej wydajności, choć kosztem mniejszej liczby wbudowanych funkcjonalności. Biorąc pod uwagę relatywnie prostą strukturę warstwy aplikacji, FastAPI okazał się wyborem optymalnym.

Warstwa prezentacji została oparta na HTML, CSS, JavaScript i Bootstrap, bez wykorzystania dedykowanego frameworka. Ta decyzja architektoniczna wynika z faktu, że interfejs użytkownika nie wymaga złożonej logiki – użycie frameworka frontendowego mogłoby zaciemnić strukturę kodu zamiast ją uprościć. Ponieważ rozmiar kodu odpowiada przede wszystkim za efekt wizualny a nie funkcjonalny aplikacji, wprowadzenie rozwiązań takich jak React nie przyniosłoby żadnych rzeczywistych korzyści.

### Narzędzia (np. Git).

Projekt wykorzystuje Git jako narzędzie do kontroli wersji. Ze względu na modularność warstwy domenowej, która może być autonomicznie wykorzystywana w innych projektach, repozytorium podzielone zostało na dwie części – główne repozytorium aplikacji oraz submoduł zawierający warstwę domenową, oba udostępnione na platformie GitHub.

Zarządzanie zależnościami zewnętrznymi realizowane jest za pośrednictwem venv (służącego do utworzenia izolowanych środowisk Python) oraz pip (odpowiedzialnego za pobieranie i instalację pakietów). Wszystkie wymagane biblioteki zostały dokładnie zdefiniowane w plikach pyproject.toml, zapewniając pełną reprodukowalność środowiska.

Testowanie aplikacji prowadzone jest przy użyciu frameworka pytest, stanowiącego standard w ekosystemie Python.

## Implementacja rozwiązania

### Opis struktury projektu

Aplikacja opiera się na trójwarstwowej architekturze, gdzie każda warstwa odpowiada za określone aspekty funkcjonalności.

#### Warstwa domeny

Warstwa domeny odpowiada za przetwarzanie diagramów UML i generowanie kodu Python. Jej zadaniem jest konwersja modelu UML z formatu XMI na gotową do użytku strukturę projektu.

- syntax.py - definiuje wewnętrzną reprezentację modelu UML
- XmiParser.py - parsuje pliki XMI zgodnie ze standardem XMI 2.1
- ProjectGenerator.py - generuje strukturę katalogów i pliki projektu Python
- TemplateManager.py - renderuje kod Python na podstawie obiektów modelu, obsługuje mapowanie typów i relacji
- ImportMapping.py - zarządza mapowaniem klas na ścieżki importu w wygenerowanym projekcie

System w pełni obsługuje wszystkie podstawowe relacje UML (asocjacja, agregacja, kompozycja, dziedziczenie, realizacja, zależność) i mapuje je semantycznie na idiomatyczny kod Python.

#### Warstwa aplikacji

Backend udostępnia interfejs API do komunikacji między frontendem a logiką generowania kodu.

Główne endpointy:

- GET / – serwuje interfejs użytkownika
- POST /generate – przyjmuje plik XMI i zwraca wygenerowany projekt jako archiwum ZIP

Proces generowania obejmuje:
- Walidację przesłanego pliku
- Parsowanie struktury XMI
- Generowanie kodu Python
- Pakowanie wyników w archiwum ZIP
- Obsługę błędów na każdym etapie

#### Warstwa prezentacji

Frontend jest aplikacją modułową, gdzie każdy komponent odpowiada za określoną funkcjonalność.

Zarządzanie stanem i renderowaniem:
- DiagramState.js – przechowuje modelowe dane (klasy, pakiety, relacje, zoom, pan)
- SvgRenderer.js – renderuje diagram w formacie SVG na podstawie stanu

Interakcja użytkownika:
- InteractionController.js – obsługuje gesty (przeciąganie, pan, zoom, resize)
- LinkService.js – umożliwia tworzenie i zarządzanie relacjami między klasami

Wymiana danych:
- Exporter.js – eksportuje diagram do standardu XMI 2.1 z obsługą pakietów zagnieżdżonych
- XmiImporter.js – importuje pliki XMI i automatycznie pozycjonuje elementy na diagramie
- GenerateService.js – komunikuje się z API backendu w celu generowania kodu

Interfejs użytkownika:
- EditorsUI.js – panele do edycji właściwości klas i pakietów
- TreeUI.js – hierarchiczny widok drzewa z wskazaniem zagnieżdzenia i relacji
- Coordinate.js – funkcje transformacji i konwersji współrzędnych
- Geometry.js – obliczenia geometryczne dla renderowania i interakcji

### Przepływ danych

1. Użytkownik tworzy diagram (Frontend)
2. Export do XMI (Exporter.js)
3. Wysłanie na backend (GenerateService.js)
4. Parsowanie XMI (XmiParser.py)
5. Generowanie kodu Python (ProjectGenerator.py + TemplateManager.py)
6. Zwrócenie archiwum ZIP
7. Pobranie przez użytkownika

### Prezentacja interfejsu użytkownika (zrzuty ekranu najważniejszych widoków z opisem działania).

TODO

## Testowanie i weryfikacja

### Zakres Testowania

Testowanie obejmowało kluczowe aspekty funkcjonalne aplikacji, w szczególności przetwarzanie danych XMI, generowanie kodu oraz mapowanie struktury projektów. Weryfikacji poddano następujące elementy: parsowanie pakietów, klas i relacji z plików XMI, generowanie kodu Python z zachowaniem hierarchii pakietów, prawidłowe mapowanie importów dla zagnieżdżonych struktur pakietów oraz obsługę wszystkich typów relacji UML. Dodatkowo przeprowadzono weryfikację poprawności generowania plików projektu i inicjalizacji pakietów w wygenerowanym kodzie.

### Testy Jednostkowe

Zestaw testów jednostkowych implementowanych z wykorzystaniem frameworka pytest obejmował cztery główne komponenty aplikacji:

- ImportMapping – Weryfikacja mechanizmu mapowania ścieżek importów dla klas w zagnieżdżonych pakietach, w tym obsługę scenariuszy z wieloma klasami w jednym pakiecie, klasami rozproszonymi w różnych pakietach oraz przypadkami zawierającymi brakujące klasy.

- ProjectGenerator – Testowanie procesu tworzenia struktury katalogów dla projektów o różnym stopniu złożoności: pakiety puste, struktury płaskie oraz zagnieżdżone hierarchie pakietów, z weryfikacją obecności plików __init__.py i prawidłowego generowania plików klas ze skeletami kodu.

- TemplateManager – Walidacja poprawności generowania definicji klas z właściwościami i operacjami, a także obsługa wszystkich typów relacji UML (asocjacja, agregacja, kompozycja, dziedziczenie, realizacja, zależność) w generowanym kodzie.

- XmiParser – Testowanie parsowania plików XMI o różnych strukturach, w tym pakiety puste i zagnieżdżone, klasy bez pól i metod, wszystkie typy relacji, właściwości i operacje bez jawnie zdefiniowanych typów oraz walidacja obsługi błędnego lub niekompletnego XMI.

### Testy Manualne

Testowanie manualne przeprowadzono w celu weryfikacji aspektów interfejsu użytkownika i wizualizacji, które nie mogą być w pełni ocenione przez testy automatyczne. Obejmowało to: sprawdzenie poprawności eksportu i importu plików XMI poprzez interfejs graficzny oraz weryfikację wizualizacji diagramu UML w formacie SVG, w szczególności poprawne renderowanie relacji między komponentami.

### Wnioski z Testowania

Testy jednostkowe wykonane z użyciem pytest przebiegły pomyślnie i wykazały, że implementacja pokrywa główne scenariusze użycia aplikacji: import i przetwarzanie plików XMI, mapowanie struktur pakietów i klas, generowanie hierarchii projektów oraz prawidłową obsługę wszystkich typów relacji UML. Testy manualne potwierdziły intuicyjność interfejsu użytkownika oraz poprawne działanie podstawowych operacji na diagramach.

Przeprowadzone testowanie wykazało, że wszystkie wymagania funkcjonalne zdefiniowane w sekcji historyjek użytkownika zostały spełnione. Aplikacja poprawnie obsługuje eksport i import danych w formacie XMI, zapewnia logiczną organizację pakietów oraz umożliwia definiowanie złożonych relacji między komponentami modelu. Dodatkowo system generuje kod Python zachowujący strukturę diagramu UML, co stanowi zasadniczy cel aplikacji.

## Podsumowanie i wnioski końcowe

### Ocena stopnia realizacji projektu

Opracowane narzędzie w pełni spełnia założone cele projektu i realizuje wszystkie wymagania funkcjonalne zdefiniowane w początkowych etapach pracy. Przeprowadzona implementacja obejmuje zarówno bibliotekę Pythonową do przetwarzania modeli UML, jak i kompletną aplikację webową umożliwiającą interaktywne tworzenie diagramów klas oraz automatyczne generowanie kodu źródłowego.

W aspekcie funkcjonalnym zrealizowano wszystkie zaplanowane komponenty: parser XMI obsługujący standard 2.1 z pełną obsługą pakietów zagnieżdżonych, relacji międzyklasowych oraz typów danych; generator  koduPython z właściwą mapą typów, wsparciem dla wszystkich sześciu typów relacji UML (asocjacja, agregacja, kompozycja, dziedziczenie, realizacja, zależność) oraz automatycznym zarządzaniem importami; oraz interfejs webowy umożliwiający intuicyjne tworzenie i edycję diagramów w przeglądarce.

Zbudowana architektura oparta na wzorcu trójwarstwowym zapewnia czytelność kodu, łatwość testowania oraz możliwość niezależnego wykorzystywania warstwy domenowej w innych projektach. Szczególnie wartościowym aspektem implementacji jest decyzja o udostępnieniu warstwy logiki biznesowej jako osobnego submodułu Git, co umożliwia jej ponowne wykorzystanie w innych aplikacjach bez konieczności stosowania całego systemu.

Testowanie metodą kombinacji testów jednostkowych (pytest) oraz weryfikacji manualnych potwierdziło poprawność działania wszystkich istotnych scenariuszy użycia. Testy jednostkowe obejmujące parsowanie XMI, generowanie struktury projektu, mapowanie importów oraz obsługę relacji przebiegły pomyślnie, wykazując, że implementacja pokrywa główne przypadki użycia aplikacji. Weryfikacja manualna potwierdziła intuicyjność interfejsu użytkownika oraz poprawne renderowanie diagramów UML w formacie SVG.

### Ocena realizacji projektu z perspektywy komercyjnej i naukowej

Z perspektywy komercyjnej i naukowej opracowane narzędzie zapełnia istotną lukę rynkową. W porównaniu do istniejących rozwiązań narzędzie łączy zalety webowych edytorów graficznych (dostępność, brak instalacji, interfejs przyjazny użytkownikowi) z precyzją inżynierską systemów CASE (obsługa standardu XMI, generowanie kodu z semantycznym rozumieniem UML), będąc jednocześnie rozwiązaniem open source dedykowanym ekosystemowi Pythona. Brakujący wcześniej segment narzędzi wspierających Model-Driven Development w Pythonie został wypełniony gotowym do użycia rozwiązaniem.

Wygenerowany kod Python spełnia standardy współczesnego programowania: zawiera type hints zgodne z PEP 484, wykorzystuje idiomatyczne konstrukty Pythona, zachowuje hierarchię pakietów odpowiadającą strukturze UML oraz jest gotowy do bezpośredniego użycia w projektach. Pozwala to na szybkie prototypowanie aplikacji oraz zmniejszenie czasu początkowych etapów wytwarzania oprogramowania.

### Możliwości dalszego rozwoju aplikacji

Opracowane narzędzie stanowi solidną podstawę do dalszego rozszerzania funkcjonalności.
Kierunkami dalszego rozwoju mogą być zarówno rozszerzenia funkcjonalne, jak i usprawnienia techniczne.

#### Rozszerzenia funkcjonalne

- Obsługa dodatkowych typów diagramów UML – Aktualnie aplikacja obsługuje wyłącznie diagramy klas. Naturalne rozszerzenie stanowiłoby dodanie obsługi diagramów sekwencji, aktywności, stanów czy przypadków użycia. Implementacja tych typów diagramów pozwoliłaby na pełną obsługę całego standardu UML i byłaby szczególnie wartościowa dla modelowania zaawansowanych systemów.

- Generowanie kodu dla innych języków programowania – Warstwa domenowa została zaprojektowana z myślą o rozszerzalności. Logika parsowania i transformacji modelu jest niezależna od docelowego języka programowania. Dodanie obsługi dla Java, C#, TypeScript czy Go wymagałoby jedynie implementacji nowych szablonów kodu oraz mapowania typów. Takie podejście znacznie rozszerzyłoby grono potencjalnych użytkowników.

- Generowanie logiki biznesowej – Aktualnie system generuje jedynie szkielety metod. Zaawansowaną funkcjonalnością byłoby generowanie pełnej logiki biznesowej na podstawie semantyki definiowanej w diagramach, na przykład automatyczne generowanie getterów/setterów, implementacji interfejsów czy obsługi walidacji. Mogłoby to być wspomagane przez integrację z modelami LLM (Large Language Models), które na podstawie opisu biznesowego w komentarzach mogłyby generować działający kod.

- Reverse engineering – generowanie diagramów z kodu – Implementacja analizy istniejącego kodu Python i konwersji go na diagramy UML stanowiłaby pełny cykl Model-Driven Development. Funkcjonalność ta wymagałaby zaawansowanej analizy kodu źródłowego oraz ekstrahowania informacji o klasach, atrybutach, metodach i relacjach.

- Walidacja i weryfikacja diagramów – System mógłby sprawdzać poprawność modelu w kontekście najlepszych praktyk projektowania: detekcja cykli w hierarchii dziedziczenia, wskazanie naruszeń zasad SOLID, analiza kompleksowości struktury czy sugestie dotyczące refaktoryzacji.

- Wspólne edycje i kontrola wersji – Integracja z systemami kontroli wersji (Git) w celu obsługi wieloosobowych sesji edycji, automatycznego śledzenia zmian modelu i możliwości cofania operacji. Wspólne edycje wymagałyby implementacji mechanizmu konfliktów rozstrzygania zmian oraz synchronizacji stanów między klientami.

- Analityka i metryki modelu – System mógłby przygotowywać raporty na temat modelu: liczba klas, głębokość hierarchii dziedziczenia, stopień sprzężenia, złożoność struktury. Metryki te mogłyby być wizualizowane i służyć do identyfikacji potencjalnych problemów architektonicznych.

- Integracja z IDE – Rozszerzenie wtyczek dla popularnych edytorów (Visual Studio Code, JetBrains IDE) umożliwiłoby użytkownikom pracę z diagramami bez opuszczania ich głównego środowiska programistycznego.

- Generacja dokumentacji – Automatyczne tworzenie dokumentacji technicznej na podstawie modelu UML: diagramy, opisy architektoniczne, słowniki konceptów, mapy zależności modułów.

#### Prace badawcze

- Empiryczna ocena efektywności MDD w Pythonie – Przeprowadzenie badań z udziałem programistów w celu zmierzenia rzeczywistego przyspieszenia wytwarzania oprogramowania przy zastosowaniu narzędzia oraz jakości wygenerowanego kodu.

- Porównanie z innymi podejściami – Analiza różnic między generowaniem kodu z modeli a organicznym rozwojem kodu bez fazy modelowania pod kątem długoterminowej utrzymywalności i elastyczności systemów.

- Optymalizacja dla systemów szkieletowych – Badania nad adaptacją narzędzia do specjalnych dziedzin, takich jak generowanie serwisów mikro, aplikacji mobilnych czy systemów rozproszonychczystością całej pracy.
