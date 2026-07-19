/* album.js – "Mein Zoo": Sammelalbum der freigeschalteten Tier-Sticker. */
(() => {
  "use strict";
  const kids = window.LernappKids;
  if (!kids || document.body.dataset.page !== "album") return;

  const grid = document.getElementById("zoo-grid");
  const countLabel = document.getElementById("zoo-count");
  const nextLabel = document.getElementById("zoo-next");
  const progressFill = document.getElementById("zoo-progress-fill");

  function renderProgress() {
    const owned = kids.collectedStickers();
    const total = kids.STICKERS.length;
    countLabel.textContent = `${owned.length} von ${total} Tieren`;
    if (owned.length >= total) {
      nextLabel.textContent = "Alle Tiere gesammelt! 🎉";
    } else {
      const remaining = kids.pointsToNextSticker();
      nextLabel.textContent = `Noch ${remaining} ${remaining === 1 ? "Stern" : "Sterne"} bis zum nächsten Tier`;
    }
    const pct = Math.round((owned.length / total) * 100);
    if (progressFill) progressFill.style.width = `${pct}%`;
  }

  function animateSticker(button) {
    button.classList.remove("wiggle");
    // Reflow, damit die Animation erneut startet.
    void button.offsetWidth;
    button.classList.add("wiggle");
  }

  function renderGrid() {
    const owned = new Set(kids.collectedStickers());
    grid.innerHTML = "";
    kids.STICKERS.forEach((sticker) => {
      const has = owned.has(sticker.id);
      const cell = document.createElement(has ? "button" : "div");
      cell.className = `zoo-card ${sticker.rarity}${has ? " owned" : " locked"}`;
      if (has) {
        cell.type = "button";
        cell.setAttribute("aria-label", `${sticker.name}. Antippen zum Anhören.`);
        cell.innerHTML = `<span class="zoo-emoji" aria-hidden="true">${sticker.emoji}</span><span class="zoo-name">${sticker.name}</span>`;
        cell.addEventListener("click", () => {
          animateSticker(cell);
          kids.playStarSound(0);
          kids.speak(`${sticker.name}. ${sticker.sound}`, { force: true });
        });
      } else {
        cell.setAttribute("aria-label", "Noch nicht gesammelt");
        cell.innerHTML = `<span class="zoo-emoji locked" aria-hidden="true">❓</span><span class="zoo-name">???</span>`;
      }
      grid.append(cell);
    });
  }

  // Truhe öffnen für neu freigeschaltete Tiere.
  function showChest(stickerIds) {
    const stickers = stickerIds.map((id) => kids.STICKER_BY_ID[id]).filter(Boolean);
    if (!stickers.length) return;
    const overlay = document.createElement("section");
    overlay.className = "kids-modal-overlay chest-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Neues Tier");
    overlay.innerHTML = `
      <div class="kids-modal chest-modal">
        <h2>Überraschung!</h2>
        <button type="button" class="chest-box" aria-label="Truhe öffnen">🎁</button>
        <p class="chest-hint">Tippe auf das Geschenk!</p>
        <div class="chest-reveal" hidden></div>
        <div class="kids-modal-actions" hidden>
          <button type="button" class="kids-modal-primary" data-done>Juhu! 🎉</button>
        </div>
      </div>`;
    document.body.append(overlay);
    const box = overlay.querySelector(".chest-box");
    const hint = overlay.querySelector(".chest-hint");
    const reveal = overlay.querySelector(".chest-reveal");
    const actions = overlay.querySelector(".kids-modal-actions");
    const done = overlay.querySelector("[data-done]");
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      box.classList.add("opening");
      hint.hidden = true;
      kids.playChime();
      kids.vibrate([40, 40, 90]);
      const modal = overlay.querySelector(".chest-modal");
      kids.burstConfetti(modal);
      window.setTimeout(() => {
        box.hidden = true;
        reveal.hidden = false;
        stickers.forEach((sticker, index) => {
          const item = document.createElement("div");
          item.className = "chest-sticker";
          item.style.setProperty("--i", index);
          item.innerHTML = `<span class="chest-sticker-emoji" aria-hidden="true">${sticker.emoji}</span><span class="chest-sticker-name">${sticker.name}</span>`;
          reveal.append(item);
          window.setTimeout(() => kids.playStarSound(index), 200 + index * 220);
        });
        kids.speak(stickers.length === 1
          ? `Du hast ein neues Tier: ${stickers[0].name}!`
          : `Du hast neue Tiere: ${stickers.map((s) => s.name).join(", ")}!`);
        actions.hidden = false;
      }, 600);
    };
    box.addEventListener("click", open);
    done.addEventListener("click", () => { overlay.remove(); renderProgress(); renderGrid(); });
    overlay.addEventListener("click", (event) => { if (event.target === overlay && opened) { overlay.remove(); renderProgress(); renderGrid(); } });
  }

  renderProgress();
  renderGrid();
  const pending = kids.takeNewStickers();
  if (pending.length) showChest(pending);
})();
