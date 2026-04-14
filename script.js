const WHATSAPP_NUMBER = "6285801611630";

const menuData = [
  ["Black Coffee", "Americano", 17000],
  ["mocktail coffee", "Berrycanoo", 25000],
  ["mocktail coffee", "Black Peachano", 25000],
  ["signature coffee", "Buttersoul Sea Salt", 25000],
  ["white coffee", "Cafe Latte Original Hot", 18000],
  ["white coffee", "Cafe Latte Original Ice", 18000],
  ["white coffee", "Caramel Machiato Hot", 20000],
  ["white coffee", "Caramel Machiato Ice", 20000],
  ["non coffee", "Chocolate", 18000],
  ["white coffee", "Depresso Ice", 18000],
  ["signature coffee", "Es Kopi Susu Nu Kamari", 20000],
  ["Black Coffee", "Espresso Double", 17000],
  ["mocktail coffee", "Espresso Lemon (Tonic)", 22000],
  ["Black Coffee", "Espresso Single", 10000],
  ["non coffee", "Extra Joss Huhu", 10000],
  ["non coffee", "Freshmilk Original", 16000],
  ["white coffee", "Hot Magic", 20000],
  ["non coffee", "Ice Oreo", 18000],
  ["non coffee", "Intel", 12000],
  ["non coffee", "Japanese", 18000],
  ["non coffee", "Japanese Sweet Lemon", 20000],
  ["food", "Kentang", 15000],
  ["signature coffee", "Kopi Susu Cream Cheese", 22000],
  ["manual brew", "Kopi Tubruk", 13000],
  ["non coffee", "Lemon Tea", 15000],
  ["Black Coffee", "Longblack", 20000],
  ["Black Coffee", "Lychee Tea", 18000],
  ["non coffee", "Matcha", 18000],
  ["food", "Mie Bangladesh (+Add)", 17000],
  ["food", "Mie Nyemek (+Add)", 17000],
  ["non coffee", "Mineral Water", 5000],
  ["food", "Mix Plate", 15000],
  ["white coffee", "Moccacino Hot", 20000],
  ["white coffee", "Moccacino Ice", 20000],
  ["mocktail coffee", "Mont Blanc", 25000],
  ["food", "Otak-otak", 10000],
  ["non coffee", "Red Velvet", 18000],
  ["food", "Tempe Goreng", 10000],
  ["manual brew", "V60", 16000],
  ["manual brew", "Vietnam Drip", 15000]
];

const qtyState = {};
const menuContainer = document.getElementById("menuContainer");
const totalItemsEl = document.getElementById("totalItems");
const totalPriceEl = document.getElementById("totalPrice");
const qrisSection = document.getElementById("qrisSection");
const orderBtn = document.getElementById("orderBtn");

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

function groupByCategory(data) {
  return data.reduce((acc, [category, menu, price]) => {
    if (!acc[category]) acc[category] = [];
    acc[category].push({ menu, price });
    return acc;
  }, {});
}

function renderMenu() {
  const grouped = groupByCategory(menuData);
  menuContainer.innerHTML = "";

  Object.entries(grouped).forEach(([category, items]) => {
    const cat = document.createElement("div");
    cat.className = "category";

    const title = document.createElement("div");
    title.className = "category-title";
    title.textContent = category;

    const list = document.createElement("div");
    list.className = "menu-list";

    items.forEach((item) => {
      const key = `${category}__${item.menu}`;
      qtyState[key] = 0;

      const row = document.createElement("div");
      row.className = "menu-item";

      row.innerHTML = `
        <div class="item-name">${item.menu}</div>
        <div class="item-price">${rupiah.format(item.price)}</div>
        <div class="qty-box">
          <button type="button" class="qty-btn minus" data-key="${key}">-</button>
          <span class="qty-value" id="qty-${cssSafe(key)}">0</span>
          <button type="button" class="qty-btn plus" data-key="${key}">+</button>
        </div>
      `;

      list.appendChild(row);
    });

    cat.append(title, list);
    menuContainer.appendChild(cat);
  });
}

function cssSafe(text) {
  return text.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function updateTotals() {
  let totalItems = 0;
  let totalPrice = 0;

  menuData.forEach(([category, menu, price]) => {
    const key = `${category}__${menu}`;
    const qty = qtyState[key] || 0;
    totalItems += qty;
    totalPrice += qty * price;
  });

  totalItemsEl.textContent = totalItems;
  totalPriceEl.textContent = rupiah.format(totalPrice);
}

menuContainer.addEventListener("click", (e) => {
  if (!(e.target instanceof HTMLElement)) return;
  const key = e.target.dataset.key;
  if (!key) return;

  if (e.target.classList.contains("plus")) {
    qtyState[key] += 1;
  }

  if (e.target.classList.contains("minus")) {
    qtyState[key] = Math.max(0, qtyState[key] - 1);
  }

  const qtyEl = document.getElementById(`qty-${cssSafe(key)}`);
  if (qtyEl) qtyEl.textContent = qtyState[key];
  updateTotals();
});

document.querySelectorAll("input[name='payment']").forEach((radio) => {
  radio.addEventListener("change", () => {
    qrisSection.classList.toggle("hidden", radio.value !== "QRIS" || !radio.checked);
  });
});

orderBtn.addEventListener("click", () => {
  const customerName = document.getElementById("customerName").value.trim();
  const paymentMethod = document.querySelector("input[name='payment']:checked").value;

  if (!customerName) {
    alert("Silakan isi nama pemesan terlebih dahulu.");
    return;
  }

  const orderedItems = menuData
    .map(([category, menu, price]) => {
      const key = `${category}__${menu}`;
      const qty = qtyState[key] || 0;
      return qty > 0 ? { menu, qty, price } : null;
    })
    .filter(Boolean);

  if (orderedItems.length === 0) {
    alert("Pilih minimal 1 menu terlebih dahulu.");
    return;
  }

  const total = orderedItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const lines = orderedItems.map(
    (item) => `- ${item.menu} x${item.qty} = ${rupiah.format(item.qty * item.price)}`
  );

  const message = `Halo Coffee New Cammary,%0A%0ASaya ingin konfirmasi pesanan:%0A` +
    `Nama: ${encodeURIComponent(customerName)}%0A` +
    `Metode Pembayaran: ${encodeURIComponent(paymentMethod)}%0A%0A` +
    `${encodeURIComponent(lines.join("\n"))}%0A%0ATotal: ${encodeURIComponent(rupiah.format(total))}%0A` +
    `${encodeURIComponent(
      paymentMethod === "QRIS"
        ? "Saya sudah melakukan pembayaran QRIS."
        : "Saya akan melakukan pembayaran cash."
    )}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
});

renderMenu();
updateTotals();
