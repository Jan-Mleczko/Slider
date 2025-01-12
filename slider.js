/* Slider z animacjami - Jan Mleczko, stycze� 2025. */
var SZER_SLAJDU = 500;           /*Szeroko�� slidera w pikselach*/
var WYS_SLAJDU = 300;            /*Wysoko�� slidera w pikselach*/
var KOLKOPUSTE = "kolko1.gif";   /*Grafika k�eczka pustego*/
var KOLKOWYPEL = "kolko2.gif";   /*Grafika k�eczka wype�nionego*/
var STRZLEWA = "lewa.gif";       /*Grafika strza�ki w lewo*/
var STRZPRAWA = "prawa.gif";     /*Grafika strza�ki w prawo*/
var STRZ_SZ = 25;                /*Szeroko�� grafik strza�ek*/
var STRZ_WYS = 50;               /*Wysoko�� grafik strza�ek*/
var Y_STRZALEK = Math.floor ((WYS_SLAJDU - STRZ_WYS) / 2);
var MARG_STRZ = 5;               /*Margines poziomy dla strza�ek*/
var Y_KOLECZEK = WYS_SLAJDU - 50;
var ROZM_KOLECZ = 15;            /*Rozmiar k�eczek*/
var Y_TYTULU = WYS_SLAJDU - 90;
var X_TYTULU = 40;
var ANIM_KROK = 20;      /*Krok animacji przesuwania w pikselach*/
var ANIM_OKRES = 40;     /*Czas jednej klatki animacji w ms*/
var AUTOM_OKRES = 4000;  /*Czas automatycznej zmiany slajdu w ms*/
var POLPRZEZR = 0.75;    /*Stopie� p�prze�roczysto�ci strza�ek i k�eczek*/
var MYSZPOLPRZEZR = 1.0; /*Stopie� p�prze�r. po najechaniu mysz�*/

/* Uzyskaj element slidera (oznaczony w kodzie HTML atrybutem ID="slider") i
nadaj mu odpowiednie style. */
var elSlider;
elSlider = document.getElementById ("slider");
elSlider.innerHTML = "";
elSlider.style.overflow = "hidden";
elSlider.style.width = SZER_SLAJDU + "px";
elSlider.style.height = WYS_SLAJDU + "px";
elSlider.style.position = "relative";

/* Mechanizm zmiany wygl�du element�w po najechaniu mysz�. */
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

/* Utw�rz strza�ki. */
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

/* Przygotuj si� do tworzenia k�eczek.
K�eczko dla ka�dego slajdu jest tworzone przy jego dodawaniu. */
var elKoleczka;  /* Kontener na wszystkie k�eczka. */
elKoleczka = document.createElement ("DIV");
elKoleczka.style.width = SZER_SLAJDU + "px";
elKoleczka.style.height = (ROZM_KOLECZ + 2) + "px";
elKoleczka.style.position = "absolute";
elKoleczka.style.left = "0px";
elKoleczka.style.top = Y_KOLECZEK + "px";
elKoleczka.style.textAlign = "center";
elKoleczka.style.zIndex = 3;
elSlider.appendChild (elKoleczka);

/* Ustaw p�prze�roczysto��. */
elStrzL.style.opacity = POLPRZEZR;
elStrzP.style.opacity = POLPRZEZR;
elKoleczka.style.opacity = POLPRZEZR;

/* Tablica obiekt�w reprezentuj�cych wszystkie slajdy. */
var tabSlajdow, ileSlajdow, ostSlajd;
tabSlajdow = new Array ();
ileSlajdow = 0;

var indSl, /* Indeks aktualnego slajdu (od zera). */
  aktSl, /* Obiekt aktualnego slajdu. */
  nowyInd, /* Indeks nowego slajdu podczas zmiany. */
  nowySl; /* Obiekt nowego slajdu. */
var animFaza, /* "Faza" animacji zmieniaj�ca si� od 0 do SZER_SLAJDU. */
  animIntv, /* Uchwyt interwa�u animacji. */
  animKierunek; /* Kierunek przesuwania:
                   - true - wsuwanie z prawej,
                   - false - wsuwanie z lewej. */
var trwaAnim = true; /* Czy trwa animacja. Podczas trwaj�cej animacji
                        zabronione jest rozpoczynanie nowej. Na pocz�tku
                        ustawione, aby zapobiec uruchomieniu si� animacji przed
                        zako�czeniem wszystkich przygotowa�. */
var wsuwany, odsuwany;  /* Elementy DOM slajd�w bior�cych udzia� w animacji. */

function odswAnim () {
  /* Od�wie�enie stanu animacji. */
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
    /* Animacja zako�czona. Wsuwany slajd jest teraz slajdem aktualnym. */
    odsuwany.style.display = "none";
    nowySl.koleczko.src = KOLKOWYPEL;
    aktSl.koleczko.src = KOLKOPUSTE;
    indSl = nowyInd;
    aktSl = nowySl;
    trwaAnim = false;  /* Zezw�l na kolejne animacje. */
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

var powstrzym = false;  /* Znacznik powstrzymania najbli�szej automatycznej
                           zmiany slajdu po zmianie slajdu na ��danie
                           u�ytkownika. */

function klikKoleczko () {
  /* Klikni�to k�eczko. Znajd� slajd, kt�remu odpowiada k�eczko i jego
  indeks. Indeks jest potrzebny do wybrania kierunku animacji tak, aby
  odpowiada� porz�dkowi slajdu bie��cego i tego, do kt�rego przechodzimy.
  Zastosowano wyszukiwanie liniowe ze wzgl�du na ma�� liczb� element�w oraz
  trudno�ci realizacji efektywniejszego wyszukiwania wska�nik�w ze wzgl�du na
  brak mo�liwo�ci ich por�wnywania w JS. */
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
  /* Dodaj slajd. Funkcja wywo�ywana raz podczas przygotowania dla ka�dego
  slajdu w sliderze. Je�li slajd nie ma by� odno�nikiem, argument odnosn
  powinien zosta� ustawiony na null.
  
  Obiekt slajdu dopisywany do tablicy ma nast�puj�ce pola:
   - karta - element slajdu zawieraj�cy zar�wno obrazek jak i tytu�,
   - koleczko - element k�eczka zwi�zanego ze slajdem.
  */
  var wpis;
  var e1, e2, e3, eTytulowy;
  wpis = new Object ();
  /* Utw�rz "kart�" slajdu. */
  e1 = document.createElement ("DIV");
  e1.style.position = "absolute";
  e1.style.top = "0px";
  e1.style.left = "0px";
  e1.style.zIndex = 1;
  e1.style.display = "none";
  /* Utw�rz element obrazka slajdu. */
  e2 = document.createElement ("IMG");
  e2.src = obrazek;
  e2.width = SZER_SLAJDU;
  e2.height = WYS_SLAJDU;
  e2.style.position = "absolute";
  e2.style.left = "0px";
  e2.style.top = "0px";
  e1.appendChild (e2);  /* Do��cz obrazek do "karty". */
  /* Utw�rz element tytu�u. */
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
  /* eTytulowy wskazuje na element zawiaraj�cy w�a�ciwy tekst tytu�u slajdu. */
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
Ka�dy slajd sk�ada si� z obrazka, tytu�u i opcjonalnie odno�nika.
B�d� one wy�wietlane w kolejno�ci dodania.
*/
dodSlajd ("krak.jpg", "Krak�w", "https://www.krakow.pl/");
dodSlajd ("waw.jpg", "Warszawa", null);
dodSlajd ("lon.jpg", "Londyn", null);
dodSlajd ("ber.jpg", "Berlin", null);

function klikLewa () {
  /* Klikni�to strza�k� w lewo. */
  powstrzym = true;
  animuj ((indSl > 0) ? (indSl - 1) : ostSlajd, false);
}
function wyswNastepny () {
  animuj ((indSl < ostSlajd) ? (indSl + 1) : 0, true);
}
function klikPrawa () {
  /* Klikni�to strza�k� w prawo. */
  powstrzym = true;
  wyswNastepny ();
}
function autoprzejscie () {
  /* Automatyczne przechodzenie do nast�pnego slajdu. */
  if (powstrzym)
    powstrzym = false;
  else
    wyswNastepny ();
}

/* Poka� pierwszy slajd. */
aktSl = tabSlajdow[indSl = 0];
aktSl.karta.style.display = "block";
aktSl.koleczko.src = KOLKOWYPEL;

trwaAnim = false;
elStrzL.onclick = klikLewa;
elStrzP.onclick = klikPrawa;
setInterval (autoprzejscie, AUTOM_OKRES);
