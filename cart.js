// cart.js
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartBadge(); // чтобы в header тоже счётчик синхронизировался
});

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Найдём контейнер для товаров в твоём cart.html.
  // РЕКОМЕНДАЦИЯ: в cart.html добавь пустой <div class="cart-items"></div>
  // и оставь .cart-summary как у тебя (параграф в ней).
  const cartItemsContainer = document.querySelector(".cart-items");
  const summaryP = document.querySelector(".cart-summary p");

  if (!cartItemsContainer || !summaryP) {
    console.warn("Не найден .cart-items или .cart-summary p. Подключи соответствующую разметку.");
    return;
  }

  cartItemsContainer.innerHTML = ""; // очистка

  let total = 0;

  cart.forEach((it, idx) => {
    const itemTotal = (it.price || 0) * (it.quantity || 1);
    total += itemTotal;

    const el = document.createElement("div");
    el.className = "cart-card";
    el.innerHTML = `
      <div class="cart-info">
        <h3>${escapeHtml(it.name)}</h3>
        <p>${escapeHtml(it.description || "")}</p>
        <p>Цена: <strong>${it.price} ₽</strong></p>
        <p>Количество: <strong>${it.quantity}</strong></p>
        <p>Сумма: <strong>${itemTotal} ₽</strong></p>
      </div>
      <div class="cart-actions">
        <button class="remove-btn" data-idx="${idx}">Удалить</button>
      </div>
    `;

    cartItemsContainer.appendChild(el);
  });

  summaryP.innerHTML = `<strong>Итого:</strong> ${total} ₽`;

  // навешиваем удаление
  cartItemsContainer.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      removeFromCart(idx);
    });
  });
}

function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateCartBadge();
    showRemovalNotice();
  }
}

function showRemovalNotice() {
  // краткое уведомление при удалении
  const el = document.createElement("div");
  el.className = "notification";
  el.textContent = "Товар удалён из корзины";
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 600); }, 1700);
}

// обновление бейджа (повторяем ту же логику, что и в shop.js)
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((s, it) => s + (it.quantity || 1), 0);
  const cartLink = document.querySelector('a[href="cart.html"]') || Array.from(document.querySelectorAll("a")).find(a => /корзин/i.test(a.textContent));
  if (!cartLink) return;
  cartLink.textContent = totalItems > 0 ? `Корзина (${totalItems})` : `Корзина`;
}

// простая защита от XSS при вставке текста
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
