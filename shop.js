// shop.js

document.addEventListener("DOMContentLoaded", () => {
  // Инициализация: навешиваем обработчики на кнопки
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card"); // <-- важно: используем именно .product-card
      if (!card) return;

      // Парсим данные из карточки (подстрой под свою верстку, если нужно)
      const nameEl = card.querySelector("h3");
      const descEl  = card.querySelector("p");
      const priceEl = card.querySelector(".price");
      const imgEl   = card.querySelector("img");

      const name = nameEl ? nameEl.textContent.trim() : "Без названия";
      const description = descEl ? descEl.textContent.trim() : "";
      // Парсинг цены: берем цифры из текста, например "1 200 ₽" -> 1200
      const price = priceEl ? parseInt(priceEl.textContent.replace(/[^\d]/g, "")) || 0 : 0;
      const img = imgEl ? imgEl.src : "";

      // Уникальный id — используем имя+цену (можно переделать при наличии data-id)
      const id = (name + "|" + price).trim();

      // Загружаем корзину
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      // Проверка: есть ли уже такой товар (по id)
      const exist = cart.find(it => it.id === id);
      if (exist) {
        exist.quantity = (exist.quantity || 1) + 1;
      } else {
        cart.push({ id, name, price, description, img, quantity: 1 });
      }

      // Сохраняем
      localStorage.setItem("cart", JSON.stringify(cart));

      // Обновляем счетчик в хедере (если хочешь виджета)
      updateCartBadge();

      // Показываем уведомление
      showNotification(`${name} добавлен в корзину`);
    });
  });

  // При загрузке обновить счётчик (если есть)
  updateCartBadge();
});


/* ---------- уведомление ---------- */
function showNotification(text, ms = 2200) {
  // создаём элемент (динамически), чтобы не зависеть от разметки
  const el = document.createElement("div");
  el.className = "notification";
  el.textContent = text;
  document.body.appendChild(el);

  // принудительно вызвать перерисовку, затем добавить класс show
  // (чтобы сработал transition)
  requestAnimationFrame(() => {
    el.classList.add("show");
  });

  // скрыть и удалить
  setTimeout(() => {
    el.classList.remove("show");
    // дождёмся окончания transition и удалим
    setTimeout(() => el.remove(), 600);
  }, ms);
}

/* ---------- обновление бейджа(счётчика) рядом с "Корзина" в header ---------- */
function updateCartBadge() {
  // Сумма кол-ва товаров (по количеству позиций)
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((s, it) => s + (it.quantity || 1), 0);

  // Попробуем найти ссылку на корзину: a[href="cart.html"]
  const cartLink = document.querySelector('a[href="cart.html"]') || Array.from(document.querySelectorAll("a")).find(a => /корзин/i.test(a.textContent));
  if (!cartLink) return;

  // Добавляем/обновляем текст в круглой скобке
  if (totalItems > 0) {
    cartLink.textContent = `Корзина (${totalItems})`;
  } else {
    cartLink.textContent = `Корзина`;
  }
}
