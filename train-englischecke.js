/*
 * train-englischecke.js – Der Englischwagen von innen.
 *
 * Eine Ansicht der Bühne wie der Rechenwagen (train-rechenecke.js):
 * train-home.js gibt ihr einen Platz (mount), und alles Weitere geschieht
 * hier drin – ohne eigene Spielseiten. So darf die Stimme sofort sprechen
 * (die Seite ist schon angetippt), und der Knopf DE ist überall derselbe.
 *
 *   Zimmer       Rocco im Schaukelstuhl, seine Karte (was er vorschlägt), der
 *                Aussichtsturm (Entdecken), das Regal (Geschichten), die
 *                Spielzeugkiste (Hear & find), das Wörterbuch, das Brett mit
 *                den Aufnähern, die Tür in den Rechenwagen; dazu die
 *                Einrichtung in 15 Schritten – jedes Ding ein englisches Wort.
 *   Entdecken    ein Wimmelbild: erster Tipp das Wort, zweiter ein Satz.
 *   Hear & find  Rocco fragt «Where is the cow?», das Kind tippt.
 *   Geschichte   vier Bilder, ein Tipp erzählt eines, «Whole story» alle.
 *   Wörterbuch   jedes gefundene Wort ein Sticker; rechts die Aufnäher.
 *
 * Sprechen (Entscheid vom 4. November 2026): Alles, was Rocco sagt, ist ein
 * Paar [Englisch, Deutsch]. Gesprochen wird Englisch. Jeder Text lässt sich
 * antippen und wird noch einmal auf Englisch gesagt; der Knopf DE ist immer
 * da und sagt genau das zuletzt Gesagte auf Deutsch und danach noch einmal
 * auf Englisch. Englisch spricht Puck (englisch-stimme.js), Deutsch Sulafat
 * wie die ganze App (app-stimme.js); kids.js spielt beides.
 *
 * Fortschritt schreibt englisch-stand.js; gezeichnet wird in englisch-art.js,
 * gesagt wird, was in englisch-inhalt.js steht.
 */
(() => {
  "use strict";

  const art = () => window.LernappEnglischArt || null;
  const stand = () => window.LernappEnglischStand || null;
  const inhalt = () => window.LernappEnglischInhalt || null;
  const kids = () => window.LernappKids || null;
  const schranke = () => window.LernappEntitlement || null;
  const reduziert = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const GESEHEN_KEY = "lernapp.englisch.gesehen";

  // Die Spiele für die Schranke (entitlement.js, ENGLISCHECKE): Der Bauernhof
  // und die erste Geschichte sind immer frei, sonst je eine Runde.
  const SPIEL = { entdecken: "en-entdecken", hearfind: "en-hearfind", geschichte: "en-geschichten" };
  const IMMER_FREI = { entdecken: ["farm"], geschichte: ["ball"] };

  let offen = null;

  function el(tag, klasse, text) {
    const node = document.createElement(tag);
    if (klasse) node.className = klasse;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function svgAus(text) {
    const tpl = document.createElement("template");
    tpl.innerHTML = text.trim();
    return tpl.content.firstElementChild;
  }
  function antippbar(node, fn) {
    node.addEventListener("click", (e) => { e.stopPropagation(); fn(e); });
    node.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); fn(e); } });
  }
  function animiere(node, klasse, ms = 800) {
    if (!node || reduziert()) return;
    node.classList.remove(klasse);
    void node.getBoundingClientRect();
    node.classList.add(klasse);
    window.setTimeout(() => node.classList.remove(klasse), ms);
  }
  const lies = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; } };
  const merke = (key, wert) => { try { localStorage.setItem(key, JSON.stringify(wert)); } catch { /* privater Modus */ } };

  // ---------------------------------------------------------------------------
  // Sprechen: Englisch zuerst, Deutsch auf Wunsch, dann noch einmal Englisch
  // ---------------------------------------------------------------------------
  let lauf = 0;
  let zuletzt = null;
  const tonAn = () => (kids()?.ttsEnabled ? kids().ttsEnabled() : true) && (kids()?.audioEnabled ? kids().audioEnabled() : true);
  function sprich(text, sprache) {
    return new Promise((fertig) => {
      if (!text || !kids()?.speak || !tonAn()) { window.setTimeout(fertig, Math.min(1800, 300 + String(text || "").length * 30)); return; }
      let vorbei = false;
      const ende = () => { if (!vorbei) { vorbei = true; fertig(); } };
      window.setTimeout(ende, 2500 + String(text).length * 140);
      try { kids().speak(text, sprache === "en" ? { sprache: "en", onEnd: ende } : { onEnd: ende }); } catch { ende(); }
    });
  }
  // Spricht eine Folge [{ text, sprache }]; eine neue Folge bricht die alte ab.
  async function folge(teile, beiJedem = null) {
    const meins = ++lauf;
    for (let i = 0; i < teile.length; i += 1) {
      if (meins !== lauf) return false;
      beiJedem?.(teile[i], i);
      await sprich(teile[i].text, teile[i].sprache);
    }
    return meins === lauf;
  }
  // Was nach dem zuletzt Gesagten kommt (die nächste Frage, das Weiterzählen).
  // Unterbricht DE oder «noch einmal» das Gesagte, kommt es nach der
  // Wiederholung – so bleibt kein Spiel stehen, wenn das Kind dazwischen
  // DE tippt. Erst etwas Neues (sage) oder eine andere Ansicht verwirft es.
  let fortsetzung = null;
  function weiter(ok) {
    if (ok && fortsetzung) { const f = fortsetzung; fortsetzung = null; f(); }
    return ok;
  }
  function still() { lauf += 1; fortsetzung = null; kids()?.stopSpeaking?.(); }
  // paare: [en, de] oder eine Liste davon. Zeigt und sagt Englisch.
  //   danach  was kommt, wenn es fertig gesagt ist (auch nach DE)
  function sage(paare, { beiJedem = null, danach = null } = {}) {
    const liste = Array.isArray(paare?.[0]) ? paare : [paare];
    zuletzt = liste;
    fortsetzung = danach;
    zeigeText(liste, false);
    return folge(liste.map(([en]) => ({ text: en, sprache: "en" })), beiJedem).then(weiter);
  }
  function nochmal() {
    if (!zuletzt) zuletzt = [inhalt().SAETZE.hallo];
    zeigeText(zuletzt, false);
    return folge(zuletzt.map(([en]) => ({ text: en, sprache: "en" }))).then(weiter);
  }
  function aufDeutsch() {
    if (!zuletzt) zuletzt = [inhalt().SAETZE.hallo];
    zeigeText(zuletzt, true);
    animiere(offen?.deKnopf, "en-gedrueckt", 400);
    return folge([...zuletzt.map(([, de]) => ({ text: de, sprache: "de" })), ...zuletzt.map(([en]) => ({ text: en, sprache: "en" }))]).then(weiter);
  }
  const schrift = () => Boolean(stand()?.schriftZeigen?.()) || !tonAn();
  function zeigeText(liste, mitDeutsch) {
    if (!offen?.blase) return;
    const en = liste.map(([e]) => e).join(" ");
    const de = liste.map(([, d]) => d).join(" ");
    offen.enText.textContent = schrift() ? en : "";
    offen.enText.classList.toggle("ist-leer", !schrift());
    offen.deText.textContent = mitDeutsch ? de : "";
    offen.deText.hidden = !mitDeutsch;
    offen.blase.setAttribute("aria-label", `${en}${mitDeutsch ? ` – ${de}` : ""}. Antippen: noch einmal auf Englisch.`);
  }
  // Die Hilfe der App (Lautsprecher oben links), auf Deutsch.
  const hilfe = (welche) => kids()?.setHelp?.(inhalt()?.HILFE?.[welche] || "");

  // ---------------------------------------------------------------------------
  // Aufbau: Bühne für das Bild, darunter Roccos Leiste
  // ---------------------------------------------------------------------------
  const ROCCO_KOPF = () => `<svg viewBox="-36 -42 72 72" aria-hidden="true" class="en-blase-rocco">${art().roccoKopf("froh")}</svg>`;
  function baueGeruest(host) {
    host.innerHTML = "";
    host.classList.add("englischecke");
    const buehne = el("div", "en-buehne");
    const bild = el("div", "en-bild");
    buehne.append(bild);
    const leiste = el("div", "en-leiste");
    const blase = el("button", "en-blase");
    blase.type = "button";
    blase.innerHTML = ROCCO_KOPF();
    const texte = el("span", "en-blase-texte");
    const enText = el("span", "en-text");
    enText.lang = "en";
    const deText = el("span", "en-de");
    deText.lang = "de";
    deText.hidden = true;
    texte.append(enText, deText);
    blase.append(texte);
    const laut = el("button", "en-laut");
    laut.type = "button";
    laut.setAttribute("aria-label", "Noch einmal auf Englisch");
    laut.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
    const deKnopf = el("button", "en-de-knopf", "DE");
    deKnopf.type = "button";
    deKnopf.setAttribute("aria-label", "Auf Deutsch, dann noch einmal auf Englisch");
    const extra = el("div", "en-extra");
    leiste.append(blase, laut, deKnopf, extra);
    host.append(buehne, leiste);
    antippbar(blase, nochmal);
    antippbar(laut, nochmal);
    antippbar(deKnopf, aufDeutsch);
    Object.assign(offen, { buehne, bild, blase, enText, deText, deKnopf, extra });
  }
  function setzeBild(svgText, { klasse = "" } = {}) {
    const svg = svgAus(svgText);
    if (klasse) svg.classList.add(klasse);
    offen.buehne.dataset.ansicht = offen.ansicht || "";
    fortsetzung = null;
    offen.bild.innerHTML = "";
    offen.bild.append(svg);
    offen.buehne.querySelector(".en-wahl")?.remove();
    offen.extra.innerHTML = "";
    window.clearTimeout(offen.hinweisUhr);
    return svg;
  }

  // ---------------------------------------------------------------------------
  // Die Schranke
  // ---------------------------------------------------------------------------
  function frei(was, wo = null) {
    if (wo && IMMER_FREI[was]?.includes(wo)) return true;
    const s = schranke();
    return s?.gameFree ? s.gameFree(SPIEL[was]) : true;
  }
  function tor() {
    schranke()?.showGate?.({ onBack: () => zeigeZimmer({ huepfen: false }) });
  }
  function rundeZaehlt(was, wo = null) {
    if (wo && IMMER_FREI[was]?.includes(wo)) return;
    schranke()?.rundeBeendet?.(SPIEL[was]);
  }

  // ---------------------------------------------------------------------------
  // Das Zimmer
  // ---------------------------------------------------------------------------
  function kartenBild(v) {
    const a = art();
    if (v.art === "geschichte") return `<g transform="scale(0.5)">${a.roccoKopf("froh")}</g>`;
    const id = v.art === "hearfind" ? "cow" : a.AUFNAEHER_BILD[v.welt] || "barn";
    const m = (a.STICKER[id]?.[0] || 0.3) * 0.62;
    return `<g transform="translate(0 ${(a.STICKER[id]?.[1] || 0) * m}) scale(${m})">${a.DING[id]()}</g>`;
  }
  function vorschlagTitel(v) {
    const I = inhalt();
    if (v.art === "hearfind") return I.SAETZE.hearfindTitel;
    if (v.art === "geschichte") return I.GESCHICHTEN.find((g) => g.id === v.geschichte)?.titel || I.SAETZE.geschichtenTitel;
    return I.WELTEN.find((w) => w.id === v.welt)?.titel || I.WELTEN[0].titel;
  }
  function zustandZimmer() {
    const s = stand();
    const jetzt = s.stand();
    return JSON.stringify([s.wagenStufe(jetzt), s.aufnaeher(jetzt).map((w) => [w.erkannt, w.voll, w.gold]), s.vorschlag(jetzt)]);
  }
  function zeigeZimmer({ huepfen = true, gruss = false } = {}) {
    offen.ansicht = "zimmer";
    offen.zustand = zustandZimmer();
    const s = stand();
    const I = inhalt();
    const jetzt = s.stand();
    const ausbau = s.wagenStufe(jetzt);
    const gesehen = lies(GESEHEN_KEY, {});
    const neuAb = Number.isFinite(gesehen.ausbau) ? gesehen.ausbau : ausbau;
    const flicken = s.aufnaeher(jetzt);
    const neueFlicken = flicken.filter((f) => f.voll && !(gesehen.aufnaeher || []).includes(f.id));
    const v = s.vorschlag(jetzt);
    offen.vorschlag = v;
    const svg = setzeBild(art().zimmer({ ausbau, neuAb, karte: { titel: vorschlagTitel(v)[0], bild: kartenBild(v) }, aufnaeher: flicken }), { klasse: huepfen && !reduziert() ? "is-huepfen" : "" });
    merke(GESEHEN_KEY, { ausbau: Math.max(ausbau, Number(gesehen.ausbau) || 0), aufnaeher: [...new Set([...(gesehen.aufnaeher || []), ...flicken.filter((f) => f.voll).map((f) => f.id)])] });
    hilfe("zimmer");
    const REIHE = ["tuer", "regal", "buch", "rocco", "karte", "kiste", "ausguck", "aufnaeher"];
    svg.querySelectorAll("[data-ort]").forEach((knoten) => {
      const ort = knoten.dataset.ort;
      knoten.style.setProperty("--ort-verzug", `${(0.3 + Math.max(0, REIHE.indexOf(ort)) * 0.16).toFixed(2)}s`);
      antippbar(knoten, () => tippOrt(ort, knoten));
    });
    svg.querySelectorAll("[data-ausbau]").forEach((knoten) => {
      antippbar(knoten, () => {
        const ding = I.EINRICHTUNG.find((d) => d.id === knoten.dataset.ausbau);
        if (ding) { animiere(knoten, "en-wackel"); sage([ding.en, ding.de]); }
      });
    });
    // Was zu sagen ist: Neues zuerst, sonst beim Hereinkommen der Gruss.
    const neu = I.EINRICHTUNG.slice(neuAb, ausbau).map((d) => [d.en, d.de]);
    if (neueFlicken.length) neu.unshift(I.SAETZE.neuerAufnaeher);
    if (neu.length) { sage(neu); return; }
    if (gruss) sage(I.SAETZE.hallo);
    else zeigeText([I.SAETZE.hallo], false);
  }
  function tippOrt(ort, knoten) {
    const I = inhalt();
    animiere(knoten, "en-wackel");
    if (ort === "rocco") { sage(I.SAETZE.hallo); return; }
    if (ort === "tuer") {
      still();
      folge([{ text: I.SAETZE.tuer[0], sprache: "en" }]);
      if (offen.onRechnen) window.setTimeout(() => offen?.onRechnen?.(), 350);
      return;
    }
    if (ort === "ausguck") { zeigeWahl("entdecken"); return; }
    if (ort === "kiste") { zeigeWahl("hearfind"); return; }
    if (ort === "regal") { zeigeWahl("geschichte"); return; }
    if (ort === "buch") { zeigeWoerterbuch(); return; }
    if (ort === "aufnaeher") { zeigeWoerterbuch({ aufnaeher: true }); return; }
    if (ort === "karte") {
      const v = offen.vorschlag || stand().vorschlag();
      if (v.art === "hearfind") starteHearfind(v.welt);
      else if (v.art === "geschichte") zeigeGeschichte(v.geschichte);
      else zeigeEntdecken(v.welt);
    }
  }

  // ---------------------------------------------------------------------------
  // Die Auswahl: wohin (Welten) oder welche Geschichte
  // ---------------------------------------------------------------------------
  function zeigeWahl(was) {
    const I = inhalt();
    const a = art();
    offen.buehne.querySelector(".en-wahl")?.remove();
    const huelle = el("div", "en-wahl");
    huelle.setAttribute("role", "dialog");
    const karte = el("div", "en-wahl-karte");
    const titelPaar = was === "geschichte" ? I.SAETZE.geschichtenTitel : was === "hearfind" ? I.SAETZE.hearfindTitel : I.SAETZE.ausguck;
    const kopf = el("button", "en-wahl-titel", was === "entdecken" ? "LOOKOUT" : titelPaar[0]);
    kopf.type = "button";
    kopf.lang = "en";
    antippbar(kopf, () => sage(titelPaar));
    const zu = el("button", "en-wahl-zu");
    zu.type = "button";
    zu.setAttribute("aria-label", "Schliessen");
    zu.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>`;
    const kacheln = el("div", "en-wahl-kacheln");
    const eintraege = was === "geschichte"
      ? I.GESCHICHTEN.map((g) => ({ id: g.id, titel: g.titel, bild: a.geschichtsTitelbild(g.id), frei: frei("geschichte", g.id), los: () => zeigeGeschichte(g.id) }))
      : I.WELTEN.map((w) => ({ id: w.id, titel: w.titel, bild: a.weltBild(w.id), frei: frei(was, was === "entdecken" ? w.id : null), los: () => (was === "hearfind" ? starteHearfind(w.id) : zeigeEntdecken(w.id)) }));
    eintraege.forEach((e) => {
      const k = el("button", `en-wahl-kachel${e.frei ? "" : " ist-zu"}`);
      k.type = "button";
      k.dataset.wahl = e.id;
      k.innerHTML = `${e.bild}<span lang="en"></span>`;
      k.querySelector("span").textContent = e.titel[0].replace(/\.$/, "");
      k.setAttribute("aria-label", `${e.titel[0]} – ${e.titel[1]}`);
      if (!e.frei) k.insertAdjacentHTML("beforeend", `<i class="en-schloss" aria-hidden="true"></i>`);
      antippbar(k, () => {
        if (!e.frei) { tor(); return; }
        huelle.remove();
        e.los();
      });
      kacheln.append(k);
    });
    karte.append(zu, kopf, kacheln);
    huelle.append(karte);
    huelle.addEventListener("click", (e) => { if (e.target === huelle) schliesseWahl(); });
    antippbar(zu, schliesseWahl);
    offen.buehne.append(huelle);
    hilfe("wahl");
    sage(was === "geschichte" ? I.SAETZE.regal : was === "hearfind" ? I.SAETZE.kiste : I.SAETZE.ausguck);
  }
  function schliesseWahl() {
    const w = offen?.buehne.querySelector(".en-wahl");
    if (!w) return false;
    w.remove();
    hilfe(offen.ansicht);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Entdecken: das Wimmelbild
  // ---------------------------------------------------------------------------
  function zaehler(weltId, modus) {
    const s = stand();
    const w = inhalt().WELTEN.find((x) => x.id === weltId);
    const z = el("span", "en-zaehler");
    const n = w.woerter.filter((x) => (modus === "hearfind" ? ["erkannt", "sicher"] : ["gehoert", "erkannt", "sicher"]).includes(s.wortStand(x.id))).length;
    z.innerHTML = `${w.woerter.map((x) => `<i class="${["gehoert", "erkannt", "sicher"].includes(s.wortStand(x.id)) ? (modus === "hearfind" && s.wortStand(x.id) === "gehoert" ? "" : "an") : ""}"></i>`).join("")}<b>${n} / ${w.woerter.length}</b>`;
    z.setAttribute("aria-label", `${n} von ${w.woerter.length}`);
    return z;
  }
  function zeigeEntdecken(weltId) {
    if (!frei("entdecken", weltId)) { tor(); return; }
    const I = inhalt();
    const s = stand();
    const welt = I.WELTEN.find((w) => w.id === weltId);
    if (!welt) return;
    offen.ansicht = "entdecken";
    offen.welt = weltId;
    const getippt = new Map();
    let rundeFertig = false;
    const svg = setzeBild(art().szene(weltId, { markiert: (id) => s.wortStand(id) !== "zu" }));
    offen.extra.append(zaehler(weltId, "entdecken"));
    hilfe("entdecken");
    sage(welt.intro);
    const hinweis = () => {
      window.clearTimeout(offen.hinweisUhr);
      svg.querySelectorAll(".en-hinweis").forEach((h) => h.setAttribute("opacity", "0"));
      offen.hinweisUhr = window.setTimeout(() => {
        if (offen?.ansicht !== "entdecken") return;
        const zu = welt.woerter.filter((x) => !getippt.has(x.id) && stand().wortStand(x.id) === "zu");
        const liste = zu.length ? zu : welt.woerter.filter((x) => !getippt.has(x.id));
        if (!liste.length) return;
        svg.querySelector(`[data-ding="${liste[Math.floor(Math.random() * liste.length)].id}"] .en-hinweis`)?.setAttribute("opacity", "1");
      }, 9000);
    };
    hinweis();
    svg.querySelectorAll("[data-ding]").forEach((knoten) => {
      const id = knoten.dataset.ding;
      const w = welt.woerter.find((x) => x.id === id);
      if (!w) return;
      knoten.setAttribute("aria-label", `${w.en} – ${w.de}`);
      antippbar(knoten, () => {
        const mal = (getippt.get(id) || 0) + 1;
        getippt.set(id, mal);
        animiere(knoten, "en-wackel");
        sage(mal % 2 ? [w.en, w.de] : [w.satz, w.deSatz]);
        if (stand().gehoert(id)) {
          const m = art().markeAn(weltId, id);
          const marke = knoten.querySelector(".en-marke");
          if (m && marke) marke.innerHTML = art().stern(m.x, m.y, 12, "en-blitz");
          kids()?.playStarSound?.(getippt.size % 3);
          offen.extra.innerHTML = "";
          offen.extra.append(zaehler(weltId, "entdecken"));
        }
        if (!rundeFertig && welt.woerter.every((x) => getippt.has(x.id))) {
          rundeFertig = true;
          stand().runde("entdecken");
          rundeZaehlt("entdecken", weltId);
          window.setTimeout(() => {
            if (offen?.ansicht !== "entdecken") return;
            kids()?.playJingle?.("unlock");
            sage(I.SAETZE.allesGefunden);
          }, 1800);
        }
        hinweis();
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Hear & find
  // ---------------------------------------------------------------------------
  function starteHearfind(weltId) {
    if (!frei("hearfind")) { tor(); return; }
    const I = inhalt();
    const welt = I.WELTEN.find((w) => w.id === weltId);
    if (!welt) return;
    offen.ansicht = "hearfind";
    offen.welt = weltId;
    const s = stand();
    const svg = setzeBild(art().szene(weltId, { markiert: (id) => ["erkannt", "sicher"].includes(s.wortStand(id)) }), { klasse: "en-suchen" });
    hilfe("hearfind");
    const liste = s.hearfindWoerter(weltId, 5);
    const runde = { i: 0, ersterVersuch: true, richtig: 0, vorbei: false };
    offen.runde = runde;
    const punkte = el("span", "en-zaehler en-runde");
    const zeichnePunkte = () => { punkte.innerHTML = `${liste.map((_, i) => `<i class="${i < runde.i ? "an" : ""}"></i>`).join("")}<b>${Math.min(runde.i, liste.length)} / ${liste.length}</b>`; };
    zeichnePunkte();
    offen.extra.append(punkte);
    const frage = () => {
      if (offen?.runde !== runde) return;
      const w = s.wortVon(liste[runde.i]);
      runde.ersterVersuch = true;
      sage([w.frage, w.deFrage]);
    };
    sage(I.SAETZE.hearfind, { danach: frage });
    svg.querySelectorAll("[data-ding]").forEach((knoten) => {
      const id = knoten.dataset.ding;
      const w = welt.woerter.find((x) => x.id === id);
      if (!w) return;
      knoten.setAttribute("aria-label", `${w.en} – ${w.de}`);
      antippbar(knoten, () => {
        if (runde.vorbei || offen?.runde !== runde) { animiere(knoten, "en-wackel"); sage([w.en, w.de]); return; }
        const ziel = liste[runde.i];
        if (id === ziel) {
          animiere(knoten, "en-huepf");
          stand().erkannt(id, runde.ersterVersuch);
          if (runde.ersterVersuch) {
            runde.richtig += 1;
            const m = art().markeAn(weltId, id);
            const marke = knoten.querySelector(".en-marke");
            if (m && marke) marke.innerHTML = art().stern(m.x, m.y, 12, "en-blitz");
          }
          runde.i += 1;
          zeichnePunkte();
          kids()?.playJingle?.("correct");
          const lob = I.LOB[Math.floor(Math.random() * I.LOB.length)];
          sage([lob, [w.en, w.de]], { danach: () => {
            if (offen?.runde !== runde) return;
            if (runde.i < liste.length) { frage(); return; }
            runde.vorbei = true;
            stand().runde("hearfind");
            rundeZaehlt("hearfind");
            kids()?.playJingle?.("unlock");
            sage(I.SAETZE.rundeFertig);
            const wieder = el("button", "en-knopf en-go", I.SAETZE.nochmal[0]);
            wieder.type = "button";
            wieder.lang = "en";
            antippbar(wieder, () => { if (!frei("hearfind")) { tor(); return; } starteHearfind(weltId); });
            offen.extra.append(wieder);
          } });
        } else {
          animiere(knoten, "en-schuettel", 500);
          if (runde.ersterVersuch) stand().erkannt(ziel, false);
          runde.ersterVersuch = false;
          kids()?.playJingle?.("retry");
          const z = s.wortVon(ziel);
          sage([[w.en, w.de], [z.frage, z.deFrage]]);
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Die Bildgeschichten
  // ---------------------------------------------------------------------------
  const PANELS = [[14, 12], [514, 12], [14, 290], [514, 290]];
  function zeigeGeschichte(id) {
    if (!frei("geschichte", id)) { tor(); return; }
    const I = inhalt();
    const g = I.GESCHICHTEN.find((x) => x.id === id);
    if (!g) return;
    offen.ansicht = "geschichte";
    offen.geschichte = id;
    const gehoert = new Set();
    let gezaehlt = false;
    const zaehleWennFertig = () => {
      if (gezaehlt || gehoert.size < g.bilder.length) return;
      gezaehlt = true;
      stand().geschichteGehoert(id);
      rundeZaehlt("geschichte", id);
    };
    const zeigeSchrift = schrift();
    let s = `<rect width="1000" height="560" fill="#fff6e6"/>`;
    g.bilder.forEach((b, i) => {
      const [px, py] = PANELS[i];
      s += `<g transform="translate(${px} ${py})" data-panel="${i}" class="en-panel" tabindex="0" role="button">
        <clipPath id="en-pc${i}"><rect width="472" height="258" rx="18"/></clipPath>
        <g clip-path="url(#en-pc${i})">${art().geschichtsBild(id, i)}
          <rect y="204" width="472" height="54" fill="#ffffff"/>
          <text x="236" y="236" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="${b.en.length > 40 ? 18 : 22}" fill="${zeigeSchrift ? "#243047" : "#9aa0ab"}">${zeigeSchrift ? b.en.replace(/[&<>]/g, "") : "♪ ♪ ♪"}</text>
        </g>
        <rect class="en-rahmen" width="472" height="258" rx="18" fill="none" stroke="#e1d9c6" stroke-width="3"/>
        <circle cx="30" cy="30" r="17" fill="#ffffff"/><text x="30" y="37" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="20" fill="#6c5ce7">${i + 1}</text>
      </g>`;
    });
    const svg = setzeBild(`<svg viewBox="0 0 1000 560" class="en-geschichte-svg" role="img" aria-label="${g.titel[0]}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`);
    hilfe("geschichte");
    const markiere = (i) => svg.querySelectorAll("[data-panel]").forEach((p) => p.classList.toggle("ist-aktiv", Number(p.dataset.panel) === i));
    svg.querySelectorAll("[data-panel]").forEach((knoten) => {
      const i = Number(knoten.dataset.panel);
      const b = g.bilder[i];
      knoten.setAttribute("aria-label", `${i + 1}: ${b.en}`);
      antippbar(knoten, () => {
        markiere(i);
        sage([b.en, b.de], { danach: () => { gehoert.add(i); zaehleWennFertig(); } });
      });
    });
    // Die Dinge, die im Satz vorkommen – aber nicht, während erzählt wird.
    svg.querySelectorAll("[data-wort]").forEach((knoten) => {
      const wort = knoten.dataset.wort;
      const w = stand().wortVon(wort);
      if (!w) return;
      antippbar(knoten, () => {
        if (offen.erzaehlt) return;
        animiere(knoten, "en-wackel");
        stand().gehoert(wort);
        sage([w.en, w.de]);
      });
    });
    const ganz = el("button", "en-knopf en-go", "Whole story");
    ganz.type = "button";
    ganz.lang = "en";
    ganz.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l12 7-12 7z" fill="currentColor"/></svg><span>Whole story</span>`;
    antippbar(ganz, () => {
      const paare = [g.titel, ...g.bilder.map((b) => [b.en, b.de]), I.SAETZE.ende];
      offen.erzaehlt = true;
      sage(paare, {
        beiJedem: (_, k) => { if (k >= 1 && k <= g.bilder.length) { markiere(k - 1); zeigeText([paare[k]], false); } },
        danach: () => { g.bilder.forEach((_, i) => gehoert.add(i)); zaehleWennFertig(); markiere(-1); },
      }).then(() => {
        if (offen) offen.erzaehlt = false;
        zuletzt = paare;
      });
    });
    offen.extra.append(ganz);
    sage(g.titel);
  }

  // ---------------------------------------------------------------------------
  // Roccos Wörterbuch
  // ---------------------------------------------------------------------------
  function zeigeWoerterbuch({ aufnaeher: flickenZuerst = false, welt: weltWahl = null } = {}) {
    const I = inhalt();
    const a = art();
    const s = stand();
    offen.ansicht = "woerterbuch";
    const weltId = weltWahl || offen.buchWelt || offen.welt || "farm";
    offen.buchWelt = weltId;
    const welt = I.WELTEN.find((w) => w.id === weltId) || I.WELTEN[0];
    const extra = I.EXTRA_WOERTER.filter((w) => I.GESCHICHTEN.some((g) => g.welt === welt.id && g.bilder.some((b) => b.woerter.includes(w.id))));
    const woerter = [...welt.woerter, ...extra];
    const n = woerter.filter((w) => s.wortStand(w.id) !== "zu").length;
    let x = `<defs><filter id="en-grau"><feColorMatrix type="saturate" values="0"/></filter>${window.LernappBauTiere?.defs?.() || ""}</defs>
      <rect width="1000" height="560" fill="#7a4b2f"/><rect x="22" y="18" width="956" height="524" rx="22" fill="#5b3a29"/>
      <path d="M40 34 L496 44 L496 530 L40 524 Z" fill="#fffaf0"/><path d="M504 44 L960 34 L960 524 L504 530 Z" fill="#fffaf0"/>
      <rect x="494" y="40" width="12" height="492" fill="#e9dcc4"/>`;
    // Reiter oben: eine Welt je Reiter
    I.WELTEN.forEach((w, i) => {
      const an = w.id === welt.id;
      x += `<g class="en-reiter" data-reiter="${w.id}" tabindex="0" role="button" aria-label="${w.titel[0]}"><rect x="${70 + i * 140}" y="${an ? 52 : 58}" width="128" height="40" rx="12" fill="${an ? "#3a7bd5" : "#e9dcc4"}"/>
        <text x="${134 + i * 140}" y="${an ? 79 : 84}" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="17" fill="${an ? "#ffffff" : "#5d6882"}">${w.titel[0]}</text></g>`;
    });
    x += `<text x="268" y="122" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="16" fill="#5d6882">${n} / ${woerter.length}</text>`;
    woerter.forEach((w, i) => {
      const sp = i % 5;
      const ze = Math.floor(i / 5);
      const cx = 96 + sp * 86;
      const cy = 168 + ze * 92;
      x += `<g class="en-sticker" data-sticker="${w.id}" tabindex="0" role="button">${a.sticker(w.id, cx, cy, 36, s.wortStand(w.id))}</g>`;
    });
    // Rechte Seite: die Aufnäher
    x += `<g class="en-reiter" data-titel="aufnaeher" tabindex="0" role="button"><text x="732" y="96" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="30" fill="#243047">My Patches</text></g>`;
    s.aufnaeher().forEach((f, i) => {
      const cy = 190 + i * 112;
      x += `<g class="en-flicken" data-flicken="${f.id}" tabindex="0" role="button">${a.aufnaeher(f.id, 620, cy, 40, f)}
        <text x="680" y="${cy - 4}" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="22" fill="#243047">${f.titel[0]}</text>
        <text x="680" y="${cy + 22}" font-family="Nunito, sans-serif" font-weight="700" font-size="15" fill="#5d6882">${f.erkannt} / ${f.von} ★${f.gold ? " · gold" : ""}</text></g>`;
    });
    const svg = setzeBild(`<svg viewBox="0 0 1000 560" class="en-buch-svg" role="img" aria-label="${I.SAETZE.wortbuchTitel[0]}" xmlns="http://www.w3.org/2000/svg">${x}</svg>`);
    hilfe("woerterbuch");
    svg.querySelectorAll("[data-reiter]").forEach((r) => antippbar(r, () => {
      const w = I.WELTEN.find((y) => y.id === r.dataset.reiter);
      zeigeWoerterbuch({ welt: r.dataset.reiter });
      if (w) sage(w.titel);
    }));
    svg.querySelectorAll("[data-sticker]").forEach((k) => {
      const w = s.wortVon(k.dataset.sticker);
      k.setAttribute("aria-label", s.wortStand(k.dataset.sticker) === "zu" ? "?" : `${w?.en} – ${w?.de}`);
      antippbar(k, () => {
        animiere(k, "en-huepf");
        if (s.wortStand(k.dataset.sticker) === "zu") sage(I.SAETZE.stickerZu);
        else if (w) sage([w.en, w.de]);
      });
    });
    svg.querySelectorAll("[data-flicken]").forEach((k) => antippbar(k, () => {
      const w = I.WELTEN.find((y) => y.id === k.dataset.flicken);
      animiere(k, "en-huepf");
      if (w) sage(w.titel);
    }));
    svg.querySelector('[data-titel="aufnaeher"]')?.addEventListener("click", () => sage(I.SAETZE.aufnaeher));
    if (!weltWahl) sage(flickenZuerst ? I.SAETZE.aufnaeher : I.SAETZE.woerterbuch);
  }

  // ---------------------------------------------------------------------------
  // Was train-home.js aufruft
  // ---------------------------------------------------------------------------
  //   host       wohin das Zimmer kommt
  //   onRechnen  () => …, geht durch die Tür in den Rechenwagen
  function mount({ host, onRechnen = null } = {}) {
    if (!art() || !stand() || !inhalt() || !host) return;
    still();
    offen = { host, onRechnen, ansicht: "zimmer" };
    baueGeruest(host);
    const ersterBesuch = !window.__englischGegruesst;
    window.__englischGegruesst = true;
    zeigeZimmer({ huepfen: true, gruss: ersterBesuch });
  }
  // Zurück (der Pfeil oben links): erst die Auswahl zu, dann ins Zimmer, und
  // erst aus dem Zimmer hinaus an den Zug.
  function zurueck() {
    if (!offen?.host?.isConnected) return false;
    if (schliesseWahl()) return true;
    if (offen.ansicht !== "zimmer") { still(); offen.runde = null; zeigeZimmer({ huepfen: false }); return true; }
    still();
    return false;
  }
  // Neues aus der Cloud: Nur das Zimmer zeichnet sich neu, und nur, wenn sich
  // darin etwas ändert.
  function auffrischen() {
    if (!offen?.host?.isConnected || offen.ansicht !== "zimmer" || offen.buehne.querySelector(".en-wahl")) return false;
    if (zustandZimmer() === offen.zustand) return false;
    zeigeZimmer({ huepfen: false });
    return true;
  }
  function unmount() { still(); window.clearTimeout(offen?.hinweisUhr); offen = null; }

  window.LernappEnglischecke = { mount, zurueck, auffrischen, unmount, ansicht: () => offen?.ansicht || null, zuletzt: () => zuletzt };
})();
