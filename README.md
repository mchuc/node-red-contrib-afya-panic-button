# node-red-contrib-afya-panic-button

[![npm](https://img.shields.io/npm/v/node-red-contrib-afya-panic-button)](https://www.npmjs.com/package/node-red-contrib-afya-panic-button)
[![license: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Node-RED panic button: reports **panic** (or any value you set) when it receives **Y messages within X seconds**. No extra plugins needed.

**[English](#english) · [Polski](#polski)**

---

## English

Best used with a remote (Hue / Tradfri): press one button e.g. 5× within 10 s to arm the alarm, lock the
flat and switch all lights off.

### Install

```bash
cd ~/.node-red
npm install node-red-contrib-afya-panic-button
```

Requires Node-RED ≥ 3.0 and Node.js ≥ 18. The node appears in the **AFYA** palette group as **panic button**.

### Configuration

| Field | Description |
|---|---|
| **Clicks** | How many messages trigger panic (Y). |
| **Within** | Time window in seconds (X), counted from the first click of a series. |
| **Panic** / **No panic** | Values sent in `msg.payload.state`. |
| **Variable** | Context variable with the click counter – `global` (readable from any flow) or `flow`. Every new node gets a unique name; give several nodes the same name only if they should share one counter. |
| **Name** | Optional label. |

### Output

```json
{ "state": "dont_panic", "count": 3, "timestamp": 1764057600000 }
{ "state": "panic", "count": 5, "timestamp": 1764057604000 }
```

Other message properties are passed through – route the panic with a *switch* node on `msg.payload.state`.

### Upgrading to 0.1.0

The default variable name used to be the same for all nodes added in one editor session – now every node
gets its own. Nodes created with older versions keep using **flow** context until you change it.
See [change.log](change.log).

---

## Polski

Zgłasza **panic** (lub dowolną ustaloną wartość), gdy w ciągu **X sekund** przyjdzie **Y wiadomości**.
Najlepiej z pilotem (Hue / Tradfri): 5× ten sam przycisk w 10 s uzbraja alarm, zamyka mieszkanie i gasi światła.

### Instalacja

```bash
cd ~/.node-red
npm install node-red-contrib-afya-panic-button
```

Wymaga Node-RED ≥ 3.0 i Node.js ≥ 18. Węzeł **panic button** jest w grupie palety **AFYA**.

### Konfiguracja

* **Clicks** – ile wiadomości (Y), **Within** – w ilu sekundach (X),
* **Panic / No panic** – wartości w `msg.payload.state`,
* **Variable** – zmienna **global** lub **flow** z licznikiem; każdy nowy węzeł dostaje unikalną nazwę
  (tę samą nazwę daj kilku węzłom tylko wtedy, gdy mają dzielić jeden licznik).

Węzły z wcześniejszych wersji używają nadal **flow**, dopóki nie zmienisz tego w formularzu.

---

Marcin Chuć · [MIT](LICENSE)
