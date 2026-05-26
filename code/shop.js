function formatEUR(value) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function sum(items, mapper) {
  return items.reduce((acc, item) => acc + mapper(item), 0);
}

function getProductBySlug(slug) {
  return PRODUCTS.find((product) => product.slug === slug);
}

function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id);
}

function createPlaceholderDataUri(title, index) {
  const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f7f4ed"/>
          <stop offset="100%" stop-color="#d8dee7"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)"/>
      <circle cx="940" cy="180" r="140" fill="#c41e3a" opacity="0.12"/>
      <circle cx="250" cy="700" r="180" fill="#0f1419" opacity="0.08"/>
      <rect x="170" y="170" width="860" height="560" rx="36" fill="#ffffff" opacity="0.92"/>
      <text x="600" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" fill="#c41e3a">Produktfoto ${index}</text>
      <text x="600" y="425" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#0f1419">${safeTitle}</text>
      <text x="600" y="500" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#5b6470">Hier kann euer eigenes Produktbild platziert werden</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function applyImageFallback(image, productName, index) {
  image.onerror = null;
  image.src = createPlaceholderDataUri(productName, index + 1);
  const figure = image.closest("figure");
  if (figure) {
    figure.classList.add("is-placeholder");
  }
}

function buildGallery(product, modifierClass = "") {
  return `
    <div class="product-gallery ${modifierClass}">
      ${product.images.map((image, index) => `
        <figure class="product-shot">
          <img
            src="${image.src}"
            alt="${image.alt}"
            loading="lazy"
            data-product-name="${product.name}"
            data-image-index="${index}"
          >
          <figcaption>Foto ${index + 1}</figcaption>
        </figure>
      `).join("")}
    </div>
  `;
}

function buildProductOptions(product) {
  const groupOptions = Object.keys(product.sizes)
    .map((group) => `<option value="${group}">${group}</option>`)
    .join("");

  const colorOptions = product.colors
    .map((color) => `<option value="${color}">${color}</option>`)
    .join("");

  return `
    <div class="controls" data-product-id="${product.id}">
      <label>Größen-Gruppe</label>
      <select class="groupSel">${groupOptions}</select>

      <label>Größe</label>
      <select class="sizeSel"></select>

      <label>Farbe</label>
      <select class="colorSel">${colorOptions}</select>

      <label>Menge</label>
      <input class="qtySel" type="number" min="1" value="1">

      ${product.initialsPossible ? `
        <div class="switch">
          <input type="checkbox" class="withInitials" id="initials-${product.id}">
          <label for="initials-${product.id}">Mit Initialen oder Nummer (+1,50 €)</label>
        </div>
      ` : ""}

      <div class="product-actions">
        <div class="price-block">
          <span class="muted price-label">Aktueller Preis</span>
          <strong class="price">${formatEUR(product.priceByGroup[Object.keys(product.sizes)[0]])}</strong>
          <span class="muted price-detail"></span>
        </div>
        <button type="button" class="button-primary addToCartBtn">In den Warenkorb</button>
      </div>
    </div>
  `;
}

function setUpProductControl(container, product) {
  const groupSel = container.querySelector(".groupSel");
  const sizeSel = container.querySelector(".sizeSel");
  const priceEl = container.querySelector(".price");
  const priceDetailEl = container.querySelector(".price-detail");
  const qtySel = container.querySelector(".qtySel");
  const colorSel = container.querySelector(".colorSel");
  const initialsChk = container.querySelector(".withInitials");
  const addBtn = container.querySelector(".addToCartBtn");
  const goToCartLink = container.parentElement?.querySelector(".go-to-cart-link");

  function getSelectionState() {
    const unitPrice = product.priceByGroup[groupSel.value];
    const qty = Math.max(1, parseInt(qtySel.value || "1", 10) || 1);
    const withInitials = initialsChk ? initialsChk.checked : false;
    const initialsCost = withInitials ? INITIALS_PRICE * qty : 0;
    const total = unitPrice * qty + initialsCost;

    return {
      unitPrice,
      qty,
      withInitials,
      initialsCost,
      total
    };
  }

  function buildSelectedItem() {
    const selection = getSelectionState();

    return {
      id: product.id,
      name: product.name,
      group: groupSel.value,
      size: sizeSel.value,
      color: colorSel.value,
      unitPrice: selection.unitPrice,
      qty: selection.qty,
      withInitials: selection.withInitials
    };
  }

  function updateDisplayedPrice() {
    const selection = getSelectionState();
    priceEl.textContent = formatEUR(selection.total);

    const details = [
      `${formatEUR(selection.unitPrice)} pro Stück`,
      `x ${selection.qty}`
    ];

    if (selection.withInitials) {
      details.push(`inkl. ${formatEUR(selection.initialsCost)} Initialen`);
    }

    if (priceDetailEl) {
      priceDetailEl.textContent = details.join(" ");
    }
  }

  function fillSizes() {
    sizeSel.innerHTML = product.sizes[groupSel.value]
      .map((size) => `<option value="${size}">${size}</option>`)
      .join("");
    updateDisplayedPrice();
  }

  groupSel.addEventListener("change", fillSizes);
  qtySel.addEventListener("input", () => {
    qtySel.value = String(Math.max(1, parseInt(qtySel.value || "1", 10) || 1));
    updateDisplayedPrice();
  });
  initialsChk?.addEventListener("change", updateDisplayedPrice);
  fillSizes();

  addBtn.addEventListener("click", () => {
    const item = buildSelectedItem();

    addToCart(item);
    flashAddToCartButton(addBtn);
    showAddToCartToast(item);
  });

  goToCartLink?.addEventListener("click", (event) => {
    event.preventDefault();
    addToCart(buildSelectedItem());
    window.location.href = goToCartLink.href;
  });
}

let cart = loadCart();

function canUseStorage() {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch (error) {
    return false;
  }
}

function loadCart() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function saveCart() {
  if (!canUseStorage()) {
    return;
  }

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error(error);
  }
}

function wireImageFallbacks(scope = document) {
  scope.querySelectorAll("img[data-product-name]").forEach((image) => {
    image.addEventListener("error", () => {
      applyImageFallback(
        image,
        image.dataset.productName || "Produkt",
        Number(image.dataset.imageIndex || 0)
      );
    }, { once: true });
  });
}

let cartFeedbackTimer = null;
let addToastTimer = null;
let addButtonTimer = null;

function ensureCartToast() {
  let toast = document.getElementById("cartToast");

  if (toast) {
    return toast;
  }

  toast = document.createElement("div");
  toast.id = "cartToast";
  toast.className = "cart-toast";
  toast.setAttribute("aria-live", "polite");
  toast.setAttribute("aria-atomic", "true");
  document.body.appendChild(toast);
  return toast;
}

function showAddToCartToast(item) {
  const toast = ensureCartToast();
  const qtyLabel = item.qty === 1 ? "1 Artikel" : `${item.qty} Artikel`;

  toast.textContent = `+ ${qtyLabel} im Warenkorb`;
  toast.classList.remove("is-visible");

  void toast.offsetWidth;

  toast.classList.add("is-visible");

  window.clearTimeout(addToastTimer);
  addToastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function flashAddToCartButton(button) {
  const originalText = button.dataset.originalLabel || button.textContent;
  button.dataset.originalLabel = originalText;
  button.textContent = "Hinzugefügt";
  button.classList.add("is-added");
  button.disabled = true;

  window.clearTimeout(addButtonTimer);
  addButtonTimer = window.setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("is-added");
    button.disabled = false;
  }, 1200);
}

function triggerCartFeedback() {
  const cartLink = document.querySelector(".cart-nav-link");
  const cartCount = document.getElementById("cartCountNav");

  if (!cartLink || !cartCount) {
    return;
  }

  cartLink.classList.remove("cart-nav-link-added");
  cartCount.classList.remove("cart-nav-count-bump");

  // Force a reflow so the animation can replay on repeated clicks.
  void cartLink.offsetWidth;

  cartLink.classList.add("cart-nav-link-added");
  cartCount.classList.add("cart-nav-count-bump");

  window.clearTimeout(cartFeedbackTimer);
  cartFeedbackTimer = window.setTimeout(() => {
    cartLink.classList.remove("cart-nav-link-added");
    cartCount.classList.remove("cart-nav-count-bump");
  }, 850);
}

function addToCart(item) {
  cart.push(item);
  saveCart();
  renderCart();
  triggerCartFeedback();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function renderCart() {
  const cartTable = document.getElementById("cartTable");
  const subtotalEl = document.getElementById("subtotal");
  const initialsCostEl = document.getElementById("initialsCost");
  const totalEl = document.getElementById("total");
  const cartCountEl = document.getElementById("cartCount");
  const cartCountNavEl = document.getElementById("cartCountNav");
  const itemCount = sum(cart, (item) => item.qty);

  if (cartCountNavEl) {
    cartCountNavEl.textContent = String(itemCount);
  }

  if (!cartTable || !subtotalEl || !initialsCostEl || !totalEl) {
    return;
  }

  const cartBody = cartTable.querySelector("tbody");

  cartBody.innerHTML = cart.length
    ? cart.map((item, index) => `
        <tr>
          <td>${item.name}${item.withInitials ? ` <span class="pill">Init.</span>` : ""}</td>
          <td>${item.size} <span class="muted">(${item.group})</span></td>
          <td>${item.color}</td>
          <td>${item.qty}</td>
          <td>${formatEUR(item.unitPrice * item.qty)}</td>
          <td><button class="remove-btn" type="button" data-remove-index="${index}" aria-label="Artikel entfernen">×</button></td>
        </tr>
      `).join("")
    : `<tr><td colspan="6" class="empty-cell">Noch keine Artikel im Warenkorb.</td></tr>`;

  const subtotal = sum(cart, (item) => item.unitPrice * item.qty);
  const initialsItems = sum(cart, (item) => (item.withInitials ? item.qty : 0));
  const initialsCost = INITIALS_PRICE * initialsItems;

  subtotalEl.textContent = formatEUR(subtotal);
  initialsCostEl.textContent = formatEUR(initialsCost);
  totalEl.textContent = formatEUR(subtotal + initialsCost);
  if (cartCountEl) {
    cartCountEl.textContent = `${itemCount} ${itemCount === 1 ? "Artikel" : "Artikel"}`;
  }

  cartBody.querySelectorAll("[data-remove-index]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(Number(button.dataset.removeIndex)));
  });
}

function setStatus(message, isError = false, isSuccess = false) {
  const statusEl = document.getElementById("status");
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.className = `status-line ${isError ? "danger" : isSuccess ? "ok" : "muted"}`;
}

function buildPayload() {
  const buyerName = document.getElementById("buyerName")?.value.trim() || "";
  const buyerEmail = document.getElementById("buyerEmail")?.value.trim() || "";
  const orderId = `SSV-${Date.now().toString(36).toUpperCase()}`;

  return {
    orderId,
    buyerName,
    buyerEmail,
    buyerTeam: document.getElementById("buyerTeam")?.value.trim() || "",
    initials: document.getElementById("initials")?.value.trim() || "",
    notes: document.getElementById("notes")?.value.trim() || "",
    totals: {
      subtotal: sum(cart, (item) => item.unitPrice * item.qty),
      initialsCostPerItem: INITIALS_PRICE,
      initialsCost: sum(cart, (item) => (item.withInitials ? item.qty : 0)) * INITIALS_PRICE,
      total: sum(cart, (item) => item.unitPrice * item.qty) + (sum(cart, (item) => (item.withInitials ? item.qty : 0)) * INITIALS_PRICE)
    },
    items: cart
  };
}

function wireCheckoutForm() {
  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) {
    return;
  }

  submitBtn.addEventListener("click", async () => {
    const payload = buildPayload();

    if (!payload.buyerName || !payload.buyerEmail) {
      setStatus("Bitte Name und E-Mail angeben.", true);
      return;
    }

    if (cart.length === 0) {
      setStatus("Der Warenkorb ist noch leer.", true);
      return;
    }

    try {
      setStatus("Sende Bestellung …");
      await fetch(APPS_SCRIPT_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          ...payload
        })
      });
      setStatus(`Bestellung ${payload.orderId} wurde übermittelt. Du bekommst eine Bestätigungs-E-Mail.`, false, true);
      cart = [];
      saveCart();
      renderCart();
      submitBtn.closest(".form-box")?.querySelectorAll("input").forEach((input) => {
        input.value = "";
      });
    } catch (error) {
      console.error(error);
      setStatus("Fehler beim Senden. Bitte später erneut versuchen.", true);
    }
  });
}

function renderProductGrid() {
  const grid = document.getElementById("productGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = PRODUCTS.map((product) => `
    <article
      class="product-card product-card-compact"
      data-product-link="product.html?product=${product.slug}"
      tabindex="0"
      role="link"
      aria-label="${product.name} öffnen"
    >
      <div class="product-card-tap">
        ${buildGallery(product, "product-gallery-card")}
        <div class="product-card-body">
          <div class="card-copy">
            <span class="eyebrow">${product.category}</span>
            <h3>${product.name}</h3>
          </div>
          <div class="card-open-hint">
            <span>Produkt ansehen</span>
            <span class="card-open-arrow" aria-hidden="true">→</span>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-product-link]").forEach((card) => {
    const goToProduct = () => {
      window.location.href = card.dataset.productLink;
    };

    card.addEventListener("click", (event) => {
      goToProduct();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToProduct();
      }
    });
  });

  wireImageFallbacks(grid);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProductGrid();
  renderCart();
  wireCheckoutForm();
});
