function renderProductPage() {
  const page = document.getElementById("productPage");
  if (!page) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("product");
  const product = getProductBySlug(slug);

  if (!product) {
    page.innerHTML = `
      <section class="box product-not-found">
        <span class="eyebrow">Produkt nicht gefunden</span>
        <h1>Diese Produktseite konnte nicht geladen werden.</h1>
        <p>Bitte gehe zurück zur Übersicht und wähle einen Artikel aus.</p>
        <a class="button-primary" href="index.html#produkte">Zur Produktübersicht</a>
      </section>
    `;
    return;
  }

  document.title = `${product.name} – SSV Vogelstang Volleyball`;

  page.innerHTML = `
    <section class="product-detail-layout">
      <div class="product-detail-main">
        ${buildGallery(product, "product-gallery-detail")}
      </div>
      <aside class="product-detail-side">
        <span class="eyebrow">${product.category}</span>
        <h1>${product.name}</h1>
        <p class="detail-tagline">${product.tagline}</p>
        <p class="detail-description">${product.description}</p>

        <div class="detail-meta">
          <div class="meta-card">
            <span class="meta-label">Farben</span>
            <strong>${product.colors.join(", ")}</strong>
          </div>
          <div class="meta-card">
            <span class="meta-label">Passform</span>
            <strong>${product.fit}</strong>
          </div>
          <div class="meta-card">
            <span class="meta-label">Material</span>
            <strong>${product.materials}</strong>
          </div>
          <div class="meta-card">
            <span class="meta-label">Preis ab</span>
            <strong>${formatEUR(Math.min(...Object.values(product.priceByGroup)))}</strong>
          </div>
        </div>

        <div class="detail-list">
          <h2>Wichtige Infos</h2>
          <ul>
            ${product.details.map((detail) => `<li>${detail}</li>`).join("")}
          </ul>
        </div>

        <div class="box detail-order-box">
          <h2>Artikel direkt auswählen</h2>
          <p class="muted">Lege den Artikel hier direkt in den gemeinsamen Warenkorb.</p>
          ${buildProductOptions(product, false)}
          <a class="text-link go-to-cart-link" href="cart.html">Zum Warenkorb und zur Bestellung</a>
        </div>
      </aside>
    </section>
  `;

  const controls = page.querySelector(".controls");
  if (controls) {
    setUpProductControl(controls, product);
  }

  wireImageFallbacks(page);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProductPage();
  renderCart();
});
