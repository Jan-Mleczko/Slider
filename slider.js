/* Slider z animacjami - Jan Mleczko, styczeñ 2025. */
var SZER_SLAJDU = 500;           /*Szerokoœæ slidera w pikselach*/
var WYS_SLAJDU = 300;            /*Wysokoœæ slidera w pikselach*/
var KOLKOPUSTE = "kolko1.gif";   /*Grafika kó³eczka pustego*/
var KOLKOWYPEL = "kolko2.gif";   /*Grafika kó³eczka wype³nionego*/
var STRZLEWA = "lewa.gif";       /*Grafika strza³ki w lewo*/
var STRZPRAWA = "prawa.gif";     /*Grafika strza³ki w prawo*/
var STRZ_SZ = 25;                /*Szerokoœæ grafik strza³ek*/
var STRZ_WYS = 50;               /*Wysokoœæ grafik strza³ek*/
var Y_STRZALEK = Math.floor ((WYS_SLAJDU - STRZ_WYS) / 2);
var MARG_STRZ = 5;               /*Margines poziomy dla strza³ek*/
var Y_KOLECZEK = WYS_SLAJDU - 50;
var ROZM_KOLECZ = 15;            /*Rozmiar kó³eczek*/
var Y_TYTULU = WYS_SLAJDU - 90;
var X_TYTULU = 40;
var ANIM_KROK = 20;      /*Krok animacji przesuwania w pikselach*/
var ANIM_OKRES = 40;     /*Czas jednej klatki animacji w ms*/
var AUTOM_OKRES = 4000;  /*Czas automatycznej zmiany slajdu w ms*/
var POLPRZEZR = 0.75;    /*Stopieñ pó³przeŸroczystoœci strza³ek i kó³eczek*/
var MYSZPOLPRZEZR = 1.0; /*Stopieñ pó³przeŸr. po najechaniu mysz¹*/

/* Uzyskaj element slidera (oznaczony w kodzie HTML atrybutem ID="slider") i
nadaj mu odpowiednie style. */
var elSlider;
elSlider = document.getElementById ("slider");
elSlider.innerHTML = "";
elSlider.style.overflow = "hidden";
elSlider.style.width = SZER_SLAJDU + "px";
elSlider.style.height = WYS_SLAJDU + "px";
elSlider.style.position = "relative";

/* Mechanizm zmiany wygl¹du elementów po najechaniu mysz¹. */
function najazd () {
  this.style.opacity = MYSZPOLPRZEZR;
}
function zjazd () {
  this.style.opacity = POLPRZEZR;
}
function instNajazd (elem) {
  elem.onmouseover = najazd;
  elem.onmouseout = zjazd;
}

/* Utwórz strza³ki. */
var elStrzL, elStrzP;
elStrzL = document.createElement ("IMG");
elStrzL.src = STRZLEWA;
elStrzL.width = STRZ_SZ;
elStrzL.height = STRZ_WYS;
elStrzL.style.position = "absolute";
elStrzL.style.left = MARG_STRZ + "px";
elStrzL.style.top = Y_STRZALEK + "px";
elStrzL.style.zIndex = 3;
instNajazd (elStrzL);
elSlider.appendChild (elStrzL);
elStrzP = document.createElement ("IMG");
elStrzP.src = STRZPRAWA;
elStrzP.width = STRZ_SZ;
elStrzP.height = STRZ_WYS;
elStrzP.style.position = "absolute";
elStrzP.style.right = MARG_STRZ + "px";
elStrzP.style.top = Y_STRZALEK + "px";
elStrzP.style.zIndex = 3;
instNajazd (elStrzP);
elSlider.appendChild (elStrzP);

/* Przygotuj siê do tworzenia kó³eczek.
Kó³eczko dla ka¿dego slajdu jest tworzone przy jego dodawaniu. */
var elKoleczka;  /* Kontener na wszystkie kó³eczka. */
elKoleczka = document.createElement ("DIV");
elKoleczka.style.width = SZER_SLAJDU + "px";
elKoleczka.style.height = (ROZM_KOLECZ + 2) + "px";
elKoleczka.style.position = "absolute";
elKoleczka.style.left = "0px";
elKoleczka.style.top = Y_KOLECZEK + "px";
elKoleczka.style.textAlign = "center";
elKoleczka.style.zIndex = 3;
elSlider.appendChild (elKoleczka);

/* Ustaw pó³przeŸroczystoœæ. */
elStrzL.style.opacity = POLPRZEZR;
elStrzP.style.opacity = POLPRZEZR;
elKoleczka.style.opacity = POLPRZEZR;

/* Tablica obiektów reprezentuj¹cych wszystkie slajdy. */
var tabSlajdow, ileSlajdow, ostSlajd;
tabSlajdow = new Array ();
ileSlajdow = 0;

var indSl, /* Indeks aktualnego slajdu (od zera). */
  aktSl, /* Obiekt aktualnego slajdu. */
  nowyInd, /* Indeks nowego slajdu podczas zmiany. */
  nowySl; /* Obiekt nowego slajdu. */
var animFaza, /* "Faza" animacji zmieniaj¹ca siê od 0 do SZER_SLAJDU. */
  animIntv, /* Uchwyt interwa³u animacji. */
  animKierunek; /* Kierunek przesuwania:
                   - true - wsuwanie z prawej,
                   - false - wsuwanie z lewej. */
var trwaAnim = true; /* Czy trwa animacja. Podczas trwaj¹cej animacji
                        zabronione jest rozpoczynanie nowej. Na pocz¹tku
                        ustawione, aby zapobiec uruchomieniu siê animacji przed
                        zakoñczeniem wszystkich przygotowañ. */
var wsuwany, odsuwany;  /* Elementy DOM slajdów bior¹cych udzia³ w animacji. */

function odswAnim () {
  /* Odœwie¿enie stanu animacji. */
  var xWsuw, xOdsuw, af;
  af = (animFaza > SZER_SLAJDU) ? SZER_SLAJDU : animFaza;
  if (animKierunek) {
    xWsuw = SZER_SLAJDU - af;
    xOdsuw = -af;
  } else {
    xWsuw = -SZER_SLAJDU + af;
    xOdsuw = af;
  }
  wsuwany.style.left = xWsuw + "px";
  odsuwany.style.left = xOdsuw + "px";
}
function animacja () {
  animFaza += ANIM_KROK;
  odswAnim ();
  if (animFaza >= SZER_SLAJDU) {
    clearInterval (animIntv);
    /* Animacja zakoñczona. Wsuwany slajd jest teraz slajdem aktualnym. */
    odsuwany.style.display = "none";
    nowySl.koleczko.src = KOLKOWYPEL;
    aktSl.koleczko.src = KOLKOPUSTE;
    indSl = nowyInd;
    aktSl = nowySl;
    trwaAnim = false;  /* Zezwól na kolejne animacje. */
  }
}
function animuj (nowy, kier) {
  if (trwaAnim)
    return;
  trwaAnim = true;
  nowySl = tabSlajdow[nowyInd = nowy];
  animKierunek = kier;
  wsuwany = nowySl.karta;
  odsuwany = aktSl.karta;
  animFaza = 0;
  odswAnim ();
  wsuwany.style.display = "block";
  animIntv = setInterval (animacja, ANIM_OKRES);
}

var powstrzym = false;  /* Znacznik powstrzymania najbli¿szej automatycznej
                           zmiany slajdu po zmianie slajdu na ¿¹danie
                           u¿ytkownika. */

function klikKoleczko () {
  /* Klikniêto kó³eczko. ZnajdŸ slajd, któremu odpowiada kó³eczko i jego
  indeks. Indeks jest potrzebny do wybrania kierunku animacji tak, aby
  odpowiada³ porz¹dkowi slajdu bie¿¹cego i tego, do którego przechodzimy.
  Zastosowano wyszukiwanie liniowe ze wzglêdu na ma³¹ liczbê elementów oraz
  trudnoœci realizacji efektywniejszego wyszukiwania wskaŸników ze wzglêdu na
  brak mo¿liwoœci ich porównywania w JS. */
  var i = 0;
  while (i < ileSlajdow) {
    if (tabSlajdow[i].koleczko == this) {
      if (i != indSl) {
        powstrzym = true;
        animuj (i, i > indSl);
      }
      return;
    }
    ++i;
  }
}

function dodSlajd (obrazek, tytul, odnosn) {
  /* Dodaj slajd. Funkcja wywo³ywana raz podczas przygotowania dla ka¿dego
  slajdu w sliderze. Jeœli slajd nie ma byæ odnoœnikiem, argument odnosn
  powinien zostaæ ustawiony na null.
  
  Obiekt slajdu dopisywany do tablicy ma nastêpuj¹ce pola:
   - karta - element slajdu zawieraj¹cy zarówno obrazek jak i tytu³,
   - koleczko - element kó³eczka zwi¹zanego ze slajdem.
  */
  var wpis;
  var e1, e2, e3, eTytulowy;
  wpis = new Object ();
  /* Utwórz "kartê" slajdu. */
  e1 = document.createElement ("DIV");
  e1.style.position = "absolute";
  e1.style.top = "0px";
  e1.style.left = "0px";
  e1.style.zIndex = 1;
  e1.style.display = "none";
  /* Utwórz element obrazka slajdu. */
  e2 = document.createElement ("IMG");
  e2.src = obrazek;
  e2.width = SZER_SLAJDU;
  e2.height = WYS_SLAJDU;
  e2.style.position = "absolute";
  e2.style.left = "0px";
  e2.style.top = "0px";
  e1.appendChild (e2);  /* Do³¹cz obrazek do "karty". */
  /* Utwórz element tytu³u. */
  e2 = document.createElement ("DIV");
  e2.style.position = "absolute";
  e2.style.left = X_TYTULU + "px";
  e2.style.top = Y_TYTULU + "px";
  e2.style.width = (SZER_SLAJDU - X_TYTULU) + "px";
  e2.style.fontSize = "140%";
  e2.style.fontFamily = "sans-serif";
  e2.style.textAlign = "left";
  if (odnosn) {
    e3 = document.createElement ("A");
    e3.href = odnosn;
    e3.target = "_blank";
    e3.innerText = tytul;
    e2.appendChild (e3);
    eTytulowy = e3;
  } else {
    eTytulowy = e2;
  }
  /* eTytulowy wskazuje na element zawiaraj¹cy w³aœciwy tekst tytu³u slajdu. */
  eTytulowy.innerText = tytul;
  eTytulowy.style.color = "white";
  e1.appendChild (e2);
  elSlider.appendChild (e1);
  wpis.karta = e1;
  e1 = document.createElement ("IMG");
  e1.src = KOLKOPUSTE;
  e1.width = ROZM_KOLECZ;
  e1.height = ROZM_KOLECZ;
  e1.style.marginLeft = "3px";
  e1.onclick = klikKoleczko;
  instNajazd (e1);
  elKoleczka.appendChild (e1);
  wpis.koleczko = e1;
  ostSlajd = ileSlajdow;
  tabSlajdow[ileSlajdow++] = wpis;
}

/*
Tutaj definiujemy wszystkie slajdy.
Ka¿dy slajd sk³ada siê z obrazka, tytu³u i opcjonalnie odnoœnika.
Bêd¹ one wyœwietlane w kolejnoœci dodania.
*/
dodSlajd ("krak.jpg", "Kraków", "https://www.krakow.pl/");
dodSlajd ("waw.jpg", "Warszawa", null);
dodSlajd ("lon.jpg", "Londyn", null);
dodSlajd ("ber.jpg", "Berlin", null);

function klikLewa () {
  /* Klikniêto strza³kê w lewo. */
  powstrzym = true;
  animuj ((indSl > 0) ? (indSl - 1) : ostSlajd, false);
}
function wyswNastepny () {
  animuj ((indSl < ostSlajd) ? (indSl + 1) : 0, true);
}
function klikPrawa () {
  /* Klikniêto strza³kê w prawo. */
  powstrzym = true;
  wyswNastepny ();
}
function autoprzejscie () {
  /* Automatyczne przechodzenie do nastêpnego slajdu. */
  if (powstrzym)
    powstrzym = false;
  else
    wyswNastepny ();
}

/* Poka¿ pierwszy slajd. */
aktSl = tabSlajdow[indSl = 0];
aktSl.karta.style.display = "block";
aktSl.koleczko.src = KOLKOWYPEL;

trwaAnim = false;
elStrzL.onclick = klikLewa;
elStrzP.onclick = klikPrawa;
setInterval (autoprzejscie, AUTOM_OKRES);
