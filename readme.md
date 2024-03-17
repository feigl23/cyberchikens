
# CHICKEN FIGHT GAME

Integrált szoftverrendszerek és tesztelésük beadandó.
Websocket felhasználásával elkészített, "gépi" játékost is tartalmazó játék.

## Játékmenet

Az első játékos betölti a felületet. Jelezzük számára, hogy várjuk a 2. játékost.

Betölti a második játékos a felületet.
A játék elindul.

Az ellenfél időközönként lézert lő.

A két játékos a nyilakkal fel-le mozgathatja a csirkéjét.

A szóköz gombbal lőhet lézert.

Mindkét fél életjelzője jelzi a találatokat. Minden találat -5 életet jelent.

Az élet elfogytával vagy a játékosok, vagy a zombi nyer. Ezt jelezzük.

## Komponensek

### GUI

A felhasználók által látható felület HTML+CSS+Canvas+JavaScript segítségével készült. 

JQuery-t használtunk a DOM manipuláció egyszerűsítésére, valamint SocketIO-t a Websocket kapcsolathoz.

Canvas segítségével rajzoljuk ki a játékteret. Csak a szükséges elemek betöltését követően kezdődik meg a működés.

Az egyes mozgó elemek állapota kliens oldalon kerül tárolásra és kezelésre. A Broker által küldött üzenetekkel marad szinkronban.

### Broker

Meghatározott üzenetekre, melyeket a felület eseményeire reagálva a kliensek küldenek, az összes játékos számára továbbítódnak a változások.

Ezek az üzeneket a játékos érkezte, lövés, mozgás valamint az ellenfél mozgása.

Maga a webkiszolgálás a FLASK "/" route segítségével történik. Erre kapja meg a felületet a böngésző. A statikus részek kiszolgálását a FLASK a paraméterekben átadott statikus területről végzi.



#### Felhasznált nyelvek:

- PYTHON(FLASK,SOCKETIO)
- JS (JQUERY)
- HTML+CSS

#### Szükséges hozzá:

- python
- flask
- flask-socketio (pip install)
- gunicorn (pip install)
- eventlet

#### Futattás:

`./start.sh vagy bash start.sh`

#### A felület megtekinthető:

http://localhost:5000/
