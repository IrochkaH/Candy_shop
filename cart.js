// cart.js (заменить полностью содержимое этим кодом)

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartBadge();
  initCheckoutModal(); // инициализируем обработчики модалки (без ошибок, даже если элементы отсутствуют)
});

/* ----------------- РЕНДЕР КОРЗИНЫ ----------------- */
function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.querySelector(".cart-items");
  const summaryP = document.querySelector(".cart-summary p");

  if (!cartItemsContainer || !summaryP) return;

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((it, idx) => {
    if (!it.quantity || it.quantity < 1) it.quantity = 1;
    const itemTotal = (it.price || 0) * it.quantity;
    total += itemTotal;

    const el = document.createElement("div");
    el.className = "cart-card";
    el.innerHTML = `
      <div class="cart-info">
        <h3>${escapeHtml(it.name)}</h3>
        <p>${escapeHtml(it.description || "")}</p>
        <p>Цена: <strong>${it.price} ₽</strong></p>

        <div class="quantity-control">
          <button class="qty-btn minus" data-idx="${idx}">−</button>
          <span class="qty">${it.quantity}</span>
          <button class="qty-btn plus" data-idx="${idx}">+</button>
        </div>

        <p>Сумма: <strong>${itemTotal} ₽</strong></p>
      </div>
      <div class="cart-actions">
        <button class="remove-btn" data-idx="${idx}">Удалить</button>
      </div>
    `;
    cartItemsContainer.appendChild(el);
  });

  summaryP.innerHTML = `<strong>Итого:</strong> ${total} ₽`;

  // навешиваем обработчики ПОСЛЕ вставки в DOM
  cartItemsContainer.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(parseInt(btn.dataset.idx, 10)));
  });

  cartItemsContainer.querySelectorAll(".qty-btn.plus").forEach(btn => {
    btn.addEventListener("click", () => changeQuantity(parseInt(btn.dataset.idx, 10), +1));
  });
  cartItemsContainer.querySelectorAll(".qty-btn.minus").forEach(btn => {
    btn.addEventListener("click", () => changeQuantity(parseInt(btn.dataset.idx, 10), -1));
  });
}

/* ----------------- ИЗМЕНЕНИЕ КОЛИЧЕСТВА ----------------- */
function changeQuantity(index, delta) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (index >= 0 && index < cart.length) {
    cart[index].quantity = (cart[index].quantity || 1) + delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
      showRemovalNotice();
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateCartBadge();
  }
}

/* ----------------- УДАЛЕНИЕ ----------------- */
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

/* ----------------- УВЕДОМЛЕНИЯ ----------------- */
function showNotification(text, ms = 2200) {
  const el = document.createElement("div");
  el.className = "notification";
  el.textContent = text;
  document.body.appendChild(el);
  // плавно показать
  requestAnimationFrame(() => el.classList.add("show"));
  // скрыть и удалить
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 650);
  }, ms);
}
function showRemovalNotice() {
  showNotification("Товар удалён из корзины", 1500);
}

/* ----------------- БЕЙДЖ (счётчик) ----------------- */
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((s, it) => s + (it.quantity || 1), 0);
  const cartLink =
    document.querySelector('a[href="cart.html"]') ||
    Array.from(document.querySelectorAll("a")).find(a => /корзин/i.test(a.textContent));
  if (!cartLink) return;
  cartLink.textContent = totalItems > 0 ? `Корзина (${totalItems})` : `Корзина`;
}

function initCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  const closeModal = document.getElementById("closeModal");
  const orderForm = document.getElementById("orderForm");
  const checkoutBtn = document.querySelector(".checkout-btn");

  if (checkoutBtn && modal) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "block";
    });
  }

  if (closeModal && modal) {
    closeModal.addEventListener("click", () => modal.style.display = "none");
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }

  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(orderForm);
      const order = Object.fromEntries(formData.entries());
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      if (cart.length === 0) {
        showNotification("Корзина пуста — добавьте товары", 2000);
        modal.style.display = "none";
        return;
      }

      console.log("Заказ:", { order, cart });
      showNotification(`Спасибо, ${order.fio || "клиент"}! Заказ принят.`, 2800);

      localStorage.removeItem("cart");
      renderCart();
      updateCartBadge();

      modal.style.display = "none";
      orderForm.reset();
    });
  }
}


/* ----------------- Вспомогалки ----------------- */
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Находим элементы
const modal = document.getElementById("orderModal");
const closeBtn = document.querySelector(".close");
const confirmBtn = document.getElementById("confirmOrderBtn");

// Закрытие окна при клике на "×"
closeBtn.onclick = function() {
  modal.style.display = "none";
};

// Закрытие при клике вне окна
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Подтверждение заказа
confirmBtn.addEventListener("click", function (e) {
  e.preventDefault(); // чтобы форма не перезагружала страницу

  // Закрываем окно
  modal.style.display = "none";

  // Показываем уведомление
  alert("Ваш заказ в обработке!");
});
