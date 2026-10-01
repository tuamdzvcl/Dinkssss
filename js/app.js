/**
 * ============================================
 * OVERNIGHT COFFEE - APPLICATION LOGIC
 * ============================================
 * Toàn bộ logic: render menu, giỏ hàng,
 * form đặt hàng, gửi API Google Sheets.
 * ============================================
 */

// ===== CẤU HÌNH =====
// ⚠️ THAY URL NÀY BẰNG Google Apps Script Web App URL CỦA BẠN
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXpMcy7uUeAVSyA2KiXDAz-0-7BV1tiA8__2pWGd3NiFCoNnfks0p0yG-qvk8RSSet/exec';

// ===== STATE =====
let cart = [];                    // Mảng các item trong giỏ
let currentReceiveType = 'pickup'; // pickup | delivery
let isSubmitting = false;          // Chống bấm gửi nhiều lần
let scrollY = 0;                   // Lưu vị trí scroll khi mở modal

// ===== KHỞI TẠO =====
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  renderCategoryNav();
  renderMenu();
  updateFloatingCart();
  setupScrollSpy();
});

// ═══════════════════════════════════════════
// RENDER MENU
// ═══════════════════════════════════════════

/**
 * Render toàn bộ menu từ dữ liệu MENU (menu.js)
 * @param {string} searchQuery - Từ khóa tìm kiếm (tùy chọn)
 */
function renderMenu(searchQuery = '') {
  const container = document.getElementById('menu-container');
  const query = searchQuery.trim().toLowerCase();
  let html = '';
  let hasResults = false;

  MENU.forEach(cat => {
    // Lọc items theo từ khóa tìm kiếm
    const filteredItems = query
      ? cat.items.filter(item => item.name.toLowerCase().includes(query))
      : cat.items;

    if (filteredItems.length === 0) return;
    hasResults = true;

    html += `
      <section id="${cat.id}" class="mb-6">
        <div class="section-title mb-3">
          <span>${cat.icon}</span>
          <span>${cat.category}</span>
        </div>
        <div class="flex flex-col gap-3">
          ${filteredItems.map(item => renderItemCard(item, cat.category)).join('')}
        </div>
      </section>
    `;
  });

  // Không tìm thấy kết quả
  if (!hasResults) {
    html = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p class="font-semibold text-gray-500 mb-1">Không tìm thấy món</p>
        <p class="text-sm text-gray-400">Thử tìm với từ khóa khác</p>
      </div>
    `;
  }

  container.innerHTML = html;
}

/**
 * Render card cho 1 item
 */
function renderItemCard(item, categoryName) {
  const cartItem = getCartItem(item.id);
  const isSelected = !!cartItem;
  const sizes = Object.keys(item.prices);
  const isDefaultPrice = sizes.length === 1 && sizes[0] === 'default';
  const defaultSize = isDefaultPrice ? 'default' : sizes[0];
  const currentSize = cartItem ? cartItem.size : defaultSize;
  const currentQty = cartItem ? cartItem.quantity : 1;
  const currentToppings = cartItem ? cartItem.toppings : [];

  // Tính giá hiện tại
  const currentPrice = item.prices[currentSize] || item.prices[defaultSize];

  // Badge HTML
  let badgeHtml = '';
  if (item.isNew) {
    badgeHtml = '<span class="badge-new">MỚI</span>';
  }
  if (item.isPopular) {
    badgeHtml += '<span class="badge-popular">❤️</span>';
  }

  // Hiển thị giá cho tất cả size (khi chưa chọn)
  let pricePreview = '';
  if (isDefaultPrice) {
    pricePreview = `<span class="price-tag text-sm">${formatPrice(item.prices.default)}</span>`;
  } else {
    pricePreview = sizes.map(s =>
      `<span class="text-xs text-gray-500">${s}: <span class="font-semibold text-primary-700">${formatPrice(item.prices[s])}</span></span>`
    ).join('<span class="text-gray-300 mx-1">|</span>');
  }

  // Size selector HTML (khi đã chọn)
  let sizeHtml = '';
  if (!isDefaultPrice && sizes.length > 0) {
    sizeHtml = `
      <div class="mb-3">
        <p class="text-xs font-semibold text-gray-500 mb-2">SIZE</p>
        <div class="flex flex-wrap gap-2">
          ${sizes.map(s => `
            <label class="size-chip ${currentSize === s ? 'active' : ''}" onclick="event.preventDefault(); updateItemSize('${item.id}', '${s}')">
              <input type="radio" name="size-${item.id}" value="${s}" ${currentSize === s ? 'checked' : ''}>
              <span class="font-bold">${s}</span>
              <span class="text-xs">${formatPrice(item.prices[s])}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Quantity HTML
  const qtyHtml = `
    <div class="mb-3">
      <p class="text-xs font-semibold text-gray-500 mb-2">SỐ LƯỢNG</p>
      <div class="flex items-center gap-3">
        <button class="qty-btn ${currentQty <= 1 ? 'disabled' : ''}"
                onclick="updateItemQuantity('${item.id}', -1)" ${currentQty <= 1 ? 'disabled' : ''}>−</button>
        <span class="text-lg font-bold w-8 text-center">${currentQty}</span>
        <button class="qty-btn" onclick="updateItemQuantity('${item.id}', 1)">+</button>
      </div>
    </div>
  `;

  // Topping HTML
  let toppingHtml = '';
  if (item.hasTopping) {
    toppingHtml = `
      <div>
        <p class="text-xs font-semibold text-gray-500 mb-2">TOPPING</p>
        <div class="flex flex-col gap-2">
          ${TOPPINGS.map(tp => {
      const isChecked = currentToppings.some(t => t.id === tp.id);
      return `
              <label class="topping-chip ${isChecked ? 'active' : ''}" onclick="event.preventDefault(); toggleItemTopping('${item.id}', '${tp.id}')">
                <input type="checkbox" ${isChecked ? 'checked' : ''}>
                <span class="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                       ${isChecked ? 'bg-primary-700 border-primary-700' : 'border-gray-300 bg-white'}">
                  ${isChecked ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
                </span>
                <span class="flex-1">${tp.name}</span>
                <span class="text-primary-700 font-semibold text-xs">+${formatPrice(tp.price)}</span>
              </label>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="item-card ${isSelected ? 'selected' : ''}" id="card-${item.id}">
      <!-- Header: Checkbox + Tên + Giá -->
      <label class="custom-checkbox" onclick="event.preventDefault(); toggleItem('${item.id}', '${categoryName}')">
        <input type="checkbox" ${isSelected ? 'checked' : ''}>
        <span class="checkmark"></span>
        <div class="ml-3 flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-[15px] text-gray-800">${item.name}</span>
            ${badgeHtml}
          </div>
          ${!isSelected ? `<div class="mt-1 flex items-center flex-wrap gap-1">${pricePreview}</div>` : ''}
        </div>
      </label>

      <!-- Chi tiết (ẩn khi chưa chọn) -->
      <div class="item-details ${isSelected ? 'expanded' : ''}" id="details-${item.id}">
        <div class="ml-[34px] border-t border-gray-100 pt-3">
          ${sizeHtml}
          ${qtyHtml}
          ${toppingHtml}

          <!-- Thành tiền -->
          <div class="mt-3 pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
            <span class="text-sm text-gray-500">Thành tiền:</span>
            <span class="text-lg font-bold text-primary-700" id="total-${item.id}">
              ${formatPrice(calculateItemTotalFromMenu(item, currentSize, currentQty, currentToppings))}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render category navigation bar
 */
function renderCategoryNav() {
  const nav = document.getElementById('category-nav');
  nav.innerHTML = MENU.map(cat => `
    <button class="category-chip" data-cat="${cat.id}" onclick="scrollToCategory('${cat.id}')">
      ${cat.icon} ${cat.category}
    </button>
  `).join('');
}

// ═══════════════════════════════════════════
// GIỎ HÀNG - CART OPERATIONS
// ═══════════════════════════════════════════

/**
 * Toggle chọn/bỏ chọn một item
 */
function toggleItem(itemId, categoryName) {
  const existing = getCartItem(itemId);
  if (existing) {
    // Bỏ chọn → xóa khỏi giỏ
    cart = cart.filter(c => c.id !== itemId);
  } else {
    // Chọn → thêm vào giỏ với giá trị mặc định
    const menuItem = findMenuItem(itemId);
    if (!menuItem) return;

    const sizes = Object.keys(menuItem.prices);
    const defaultSize = sizes.length === 1 && sizes[0] === 'default' ? 'default' : sizes[0];

    cart.push({
      id: menuItem.id,
      name: menuItem.name,
      category: categoryName,
      size: defaultSize,
      quantity: 1,
      basePrice: menuItem.prices[defaultSize],
      toppings: [],
    });
  }

  saveCartToStorage();
  renderMenu(document.getElementById('search-input').value);
  updateFloatingCart();
}

/**
 * Cập nhật size của item trong giỏ
 */
function updateItemSize(itemId, newSize) {
  const cartItem = getCartItem(itemId);
  if (!cartItem) return;

  const menuItem = findMenuItem(itemId);
  if (!menuItem || !menuItem.prices[newSize]) return;

  cartItem.size = newSize;
  cartItem.basePrice = menuItem.prices[newSize];

  saveCartToStorage();
  renderMenu(document.getElementById('search-input').value);
  updateFloatingCart();
}

/**
 * Cập nhật số lượng (+1 hoặc -1)
 */
function updateItemQuantity(itemId, delta) {
  const cartItem = getCartItem(itemId);
  if (!cartItem) return;

  const newQty = cartItem.quantity + delta;
  if (newQty < 1) return;

  cartItem.quantity = newQty;

  saveCartToStorage();
  renderMenu(document.getElementById('search-input').value);
  updateFloatingCart();
}

/**
 * Toggle topping cho item
 */
function toggleItemTopping(itemId, toppingId) {
  const cartItem = getCartItem(itemId);
  if (!cartItem) return;

  const toppingData = TOPPINGS.find(t => t.id === toppingId);
  if (!toppingData) return;

  const idx = cartItem.toppings.findIndex(t => t.id === toppingId);
  if (idx >= 0) {
    cartItem.toppings.splice(idx, 1);
  } else {
    cartItem.toppings.push({ id: toppingData.id, name: toppingData.name, price: toppingData.price });
  }

  saveCartToStorage();
  renderMenu(document.getElementById('search-input').value);
  updateFloatingCart();
}

/**
 * Xóa item khỏi giỏ
 */
function removeFromCart(itemId) {
  cart = cart.filter(c => c.id !== itemId);
  saveCartToStorage();
  renderMenu(document.getElementById('search-input').value);
  updateFloatingCart();
  renderCartItems();
}

/**
 * Cập nhật số lượng item trong giỏ hàng modal
 */
function updateCartItemQty(itemId, delta) {
  const cartItem = getCartItem(itemId);
  if (!cartItem) return;

  const newQty = cartItem.quantity + delta;
  if (newQty < 1) {
    removeFromCart(itemId);
    return;
  }

  cartItem.quantity = newQty;
  saveCartToStorage();
  updateFloatingCart();
  renderCartItems();
}

/**
 * Cập nhật size từ giỏ hàng modal
 */
function updateCartItemSize(itemId, newSize) {
  const cartItem = getCartItem(itemId);
  if (!cartItem) return;

  const menuItem = findMenuItem(itemId);
  if (!menuItem || !menuItem.prices[newSize]) return;

  cartItem.size = newSize;
  cartItem.basePrice = menuItem.prices[newSize];

  saveCartToStorage();
  updateFloatingCart();
  renderCartItems();
}

/**
 * Toggle topping từ giỏ hàng modal
 */
function toggleCartItemTopping(itemId, toppingId) {
  const cartItem = getCartItem(itemId);
  if (!cartItem) return;

  const toppingData = TOPPINGS.find(t => t.id === toppingId);
  if (!toppingData) return;

  const idx = cartItem.toppings.findIndex(t => t.id === toppingId);
  if (idx >= 0) {
    cartItem.toppings.splice(idx, 1);
  } else {
    cartItem.toppings.push({ id: toppingData.id, name: toppingData.name, price: toppingData.price });
  }

  saveCartToStorage();
  updateFloatingCart();
  renderCartItems();
}

/**
 * Lấy item từ giỏ theo ID
 */
function getCartItem(itemId) {
  return cart.find(c => c.id === itemId) || null;
}

/**
 * Tìm item trong MENU data theo ID
 */
function findMenuItem(itemId) {
  for (const cat of MENU) {
    const found = cat.items.find(i => i.id === itemId);
    if (found) return found;
  }
  return null;
}

/**
 * Tính tổng tiền 1 item (basePrice * quantity + toppings * quantity)
 */
function calculateItemTotal(cartItem) {
  const toppingTotal = cartItem.toppings.reduce((sum, t) => sum + t.price, 0);
  return (cartItem.basePrice + toppingTotal) * cartItem.quantity;
}

/**
 * Tính tổng tiền 1 item từ menu data (dùng khi render)
 */
function calculateItemTotalFromMenu(menuItem, size, qty, toppings) {
  const basePrice = menuItem.prices[size] || 0;
  const toppingTotal = toppings.reduce((sum, t) => sum + t.price, 0);
  return (basePrice + toppingTotal) * qty;
}

/**
 * Lấy tổng giỏ hàng
 */
function getCartSummary() {
  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce((sum, c) => sum + calculateItemTotal(c), 0);
  return { totalItems, totalPrice };
}

// ═══════════════════════════════════════════
// CẬP NHẬT UI
// ═══════════════════════════════════════════

/**
 * Cập nhật floating cart bar
 */
function updateFloatingCart() {
  const floatingCart = document.getElementById('floating-cart');
  const { totalItems, totalPrice } = getCartSummary();

  document.getElementById('cart-badge').textContent = totalItems;
  document.getElementById('cart-count-text').textContent = `${totalItems} món`;
  document.getElementById('cart-total-text').textContent = formatPrice(totalPrice);

  if (totalItems > 0) {
    floatingCart.classList.add('visible');
  } else {
    floatingCart.classList.remove('visible');
  }
}

/**
 * Render danh sách items trong cart modal
 */
function renderCartItems() {
  const container = document.getElementById('cart-items-container');
  const footer = document.getElementById('cart-footer');
  const { totalItems, totalPrice } = getCartSummary();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <p class="font-semibold text-gray-500 mb-1">Giỏ hàng trống</p>
        <p class="text-sm text-gray-400">Hãy chọn món bạn muốn đặt</p>
      </div>
    `;
    footer.classList.add('hidden');
    return;
  }

  footer.classList.remove('hidden');
  document.getElementById('cart-modal-total').textContent = formatPrice(totalPrice);

  container.innerHTML = cart.map(cartItem => {
    const menuItem = findMenuItem(cartItem.id);
    const sizes = menuItem ? Object.keys(menuItem.prices) : [];
    const isDefaultPrice = sizes.length === 1 && sizes[0] === 'default';
    const itemTotal = calculateItemTotal(cartItem);

    // Size selector cho cart modal
    let cartSizeHtml = '';
    if (!isDefaultPrice && sizes.length > 1) {
      cartSizeHtml = `
        <div class="flex gap-1.5 mt-2">
          ${sizes.map(s => `
            <button class="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all
                           ${cartItem.size === s ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}"
                    onclick="updateCartItemSize('${cartItem.id}', '${s}')">
              ${s}
            </button>
          `).join('')}
        </div>
      `;
    }

    // Topping hiển thị và toggle
    let cartToppingHtml = '';
    if (menuItem && menuItem.hasTopping && cartItem.toppings.length > 0) {
      cartToppingHtml = `
        <div class="mt-1.5 flex flex-wrap gap-1">
          ${cartItem.toppings.map(tp => `
            <span class="text-[11px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md flex items-center gap-1">
              ${tp.name}
              <button class="hover:text-red-500 ml-0.5" onclick="toggleCartItemTopping('${cartItem.id}', '${tp.id}')">✕</button>
            </span>
          `).join('')}
        </div>
      `;
    }

    // Nút thêm topping từ cart modal
    let addToppingBtn = '';
    if (menuItem && menuItem.hasTopping) {
      const availableToppings = TOPPINGS.filter(tp => !cartItem.toppings.some(t => t.id === tp.id));
      if (availableToppings.length > 0) {
        addToppingBtn = `
          <div class="mt-2">
            <details class="text-xs">
              <summary class="text-primary-700 font-semibold cursor-pointer hover:underline">+ Thêm topping</summary>
              <div class="mt-2 flex flex-col gap-1.5">
                ${availableToppings.map(tp => `
                  <button class="text-left text-xs px-3 py-2 rounded-lg bg-gray-50 hover:bg-primary-50
                                 flex justify-between items-center transition-colors"
                          onclick="toggleCartItemTopping('${cartItem.id}', '${tp.id}')">
                    <span>${tp.name}</span>
                    <span class="text-primary-700 font-semibold">+${formatPrice(tp.price)}</span>
                  </button>
                `).join('')}
              </div>
            </details>
          </div>
        `;
      }
    }

    return `
      <div class="cart-item">
        <div class="flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-gray-800">${cartItem.name}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              ${!isDefaultPrice ? `Size ${cartItem.size} · ` : ''}${formatPrice(cartItem.basePrice)}
            </p>
            ${cartSizeHtml}
            ${cartToppingHtml}
            ${addToppingBtn}
          </div>

          <div class="flex flex-col items-end gap-2">
            <button class="btn-delete" onclick="removeFromCart('${cartItem.id}')" title="Xóa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/>
              </svg>
            </button>
            <div class="flex items-center gap-2">
              <button class="qty-btn !w-7 !h-7 !text-sm" onclick="updateCartItemQty('${cartItem.id}', -1)">−</button>
              <span class="text-sm font-bold w-5 text-center">${cartItem.quantity}</span>
              <button class="qty-btn !w-7 !h-7 !text-sm" onclick="updateCartItemQty('${cartItem.id}', 1)">+</button>
            </div>
            <p class="text-sm font-bold text-primary-700">${formatPrice(itemTotal)}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ═══════════════════════════════════════════
// MODAL MANAGEMENT
// ═══════════════════════════════════════════

function lockBody() {
  scrollY = window.scrollY;
  document.body.classList.add('modal-open');
  document.body.style.top = `-${scrollY}px`;
}

function unlockBody() {
  document.body.classList.remove('modal-open');
  document.body.style.top = '';
  window.scrollTo(0, scrollY);
}

function showBackdrop() {
  document.getElementById('modal-backdrop').classList.add('active');
}

function hideBackdrop() {
  document.getElementById('modal-backdrop').classList.remove('active');
}

function closeAllModals() {
  document.getElementById('cart-modal').classList.remove('active');
  document.getElementById('checkout-modal').classList.remove('active');
  document.getElementById('summary-modal').classList.remove('active');
  hideBackdrop();
  unlockBody();
  // Re-render menu khi đóng modal (để sync state)
  renderMenu(document.getElementById('search-input').value);
}

// --- Cart Modal ---
function openCartModal() {
  renderCartItems();
  lockBody();
  showBackdrop();
  document.getElementById('cart-modal').classList.add('active');
}

function closeCartModal() {
  document.getElementById('cart-modal').classList.remove('active');
  hideBackdrop();
  unlockBody();
  renderMenu(document.getElementById('search-input').value);
}

// --- Checkout Modal ---
function openCheckoutForm() {
  if (cart.length === 0) {
    showToast('Giỏ hàng trống!', 'error');
    return;
  }
  document.getElementById('cart-modal').classList.remove('active');
  setTimeout(() => {
    document.getElementById('checkout-modal').classList.add('active');
  }, 100);
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.remove('active');
  hideBackdrop();
  unlockBody();
  renderMenu(document.getElementById('search-input').value);
}

function backToCart() {
  document.getElementById('checkout-modal').classList.remove('active');
  setTimeout(() => {
    renderCartItems();
    document.getElementById('cart-modal').classList.add('active');
  }, 100);
}

// --- Summary Modal ---
function openOrderSummary() {
  // Validate form trước
  if (!validateForm()) return;

  document.getElementById('checkout-modal').classList.remove('active');
  setTimeout(() => {
    renderOrderSummary();
    document.getElementById('summary-modal').classList.add('active');
  }, 100);
}

function closeOrderSummary() {
  document.getElementById('summary-modal').classList.remove('active');
  hideBackdrop();
  unlockBody();
  renderMenu(document.getElementById('search-input').value);
}

function backToCheckout() {
  document.getElementById('summary-modal').classList.remove('active');
  setTimeout(() => {
    document.getElementById('checkout-modal').classList.add('active');
  }, 100);
}

// ═══════════════════════════════════════════
// HÌNH THỨC NHẬN HÀNG
// ═══════════════════════════════════════════

function handleReceiveTypeChange(type) {
  currentReceiveType = type;
  const addressGroup = document.getElementById('address-group');
  if (type === 'delivery') {
    addressGroup.classList.remove('hidden');
  } else {
    addressGroup.classList.add('hidden');
    // Xóa lỗi địa chỉ nếu có
    document.getElementById('input-address').classList.remove('error');
    document.getElementById('error-address').classList.add('hidden');
  }
}

// ═══════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════

function validateForm() {
  let isValid = true;

  // Validate tên
  const name = document.getElementById('input-name').value.trim();
  if (!name) {
    document.getElementById('input-name').classList.add('error');
    document.getElementById('error-name').classList.remove('hidden');
    isValid = false;
  } else {
    document.getElementById('input-name').classList.remove('error');
    document.getElementById('error-name').classList.add('hidden');
  }



  // Validate giỏ hàng
  if (cart.length === 0) {
    showToast('Vui lòng chọn ít nhất 1 món!', 'error');
    isValid = false;
  }

  return isValid;
}

// ═══════════════════════════════════════════
// TÓM TẮT ĐƠN HÀNG
// ═══════════════════════════════════════════

function renderOrderSummary() {
  const container = document.getElementById('summary-content');
  const name = document.getElementById('input-name').value.trim();
  const note = document.getElementById('input-note').value.trim();
  const { totalItems, totalPrice } = getCartSummary();

  const shippingFee = 0; // Có thể cấu hình sau
  const grandTotal = totalPrice + shippingFee;

  let html = `
    <!-- Thông tin khách hàng -->
    <div class="bg-primary-50 rounded-xl p-4 mb-4">
      <h3 class="font-bold text-sm text-primary-950 mb-2">👤 Thông tin khách hàng</h3>
      <div class="text-sm space-y-1">
        <p><span class="text-gray-500">Họ tên:</span> <span class="font-semibold">${name}</span></p>
        ${note ? `<p><span class="text-gray-500">Ghi chú:</span> <span class="font-semibold">${note}</span></p>` : ''}
      </div>
    </div>

    <!-- Danh sách món -->
    <div class="mb-4">
      <h3 class="font-bold text-sm text-primary-950 mb-3">📋 Danh sách món (${totalItems} món)</h3>
  `;

  cart.forEach((item, idx) => {
    const isDefaultPrice = item.size === 'default';
    const toppingTotal = item.toppings.reduce((sum, t) => sum + t.price, 0);
    const itemTotal = calculateItemTotal(item);

    html += `
      <div class="bg-white rounded-xl p-3 mb-2 border border-gray-100">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <p class="font-semibold text-sm">${idx + 1}. ${item.name}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              ${!isDefaultPrice ? `Size ${item.size} · ` : ''}${formatPrice(item.basePrice)} × ${item.quantity}
            </p>
            ${item.toppings.length > 0 ? `
              <p class="text-xs text-gray-400 mt-0.5">
                Topping: ${item.toppings.map(t => t.name).join(', ')}
                (+${formatPrice(toppingTotal)} × ${item.quantity})
              </p>
            ` : ''}
          </div>
          <p class="font-bold text-sm text-primary-700 flex-shrink-0 ml-2">${formatPrice(itemTotal)}</p>
        </div>
      </div>
    `;
  });

  html += `
    </div>

    <!-- Tổng cộng -->
    <div class="bg-gray-50 rounded-xl p-4">
      <div class="summary-row">
        <span class="text-gray-500">Tạm tính</span>
        <span class="font-semibold">${formatPrice(totalPrice)}</span>
      </div>
      <div class="summary-row">
        <span class="text-gray-500">Phí giao hàng</span>
        <span class="font-semibold">${shippingFee > 0 ? formatPrice(shippingFee) : 'Miễn phí'}</span>
      </div>
      <div class="summary-row total">
        <span>Tổng cộng</span>
        <span>${formatPrice(grandTotal)}</span>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// ═══════════════════════════════════════════
// GỬI ĐƠN HÀNG
// ═══════════════════════════════════════════

/**
 * Tạo Order ID dạng OC-YYYYMMDD-XXX
 */
function generateOrderId() {
  const now = new Date();
  const dateStr = now.getFullYear().toString()
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `OC-${dateStr}-${rand}`;
}

/**
 * Lấy thời gian hiện tại dạng YYYY-MM-DD HH:MM:SS
 */
function getCurrentTime() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

/**
 * Build payload gửi lên Google Apps Script
 */
function buildOrderPayload() {
  const orderId = generateOrderId();
  const createdAt = getCurrentTime();
  const name = document.getElementById('input-name').value.trim();
  const note = document.getElementById('input-note').value.trim();
  const { totalItems, totalPrice } = getCartSummary();
  const shippingFee = 0;
  const grandTotal = totalPrice + shippingFee;

  const items = cart.map(cartItem => {
    const toppingTotal = cartItem.toppings.reduce((sum, t) => sum + t.price, 0);
    return {
      id: cartItem.id,
      name: cartItem.name,
      category: cartItem.category,
      size: cartItem.size === 'default' ? '-' : cartItem.size,
      quantity: cartItem.quantity,
      basePrice: cartItem.basePrice,
      toppings: cartItem.toppings.map(t => ({ name: t.name, price: t.price })),
      toppingTotal: toppingTotal * cartItem.quantity,
      total: calculateItemTotal(cartItem),
    };
  });

  return {
    orderId,
    createdAt,
    customer: {
      name,
      phone: '',
      receiveType: '-',
      address: '',
    },
    items,
    totalQuantity: totalItems,
    subtotal: totalPrice,
    shippingFee,
    grandTotal,
    note,
  };
}

/**
 * Gửi đơn hàng lên Google Sheets qua Apps Script
 */
async function submitOrder() {
  // Chống bấm nhiều lần
  if (isSubmitting) return;

  // Validate lại 1 lần nữa
  if (cart.length === 0) {
    showToast('Giỏ hàng trống!', 'error');
    return;
  }

  isSubmitting = true;
  const btn = document.getElementById('btn-submit-order');
  const btnText = document.getElementById('submit-text');
  const spinner = document.getElementById('submit-spinner');

  btn.disabled = true;
  btnText.textContent = 'Đang gửi đơn...';
  spinner.classList.remove('hidden');

  const payload = buildOrderPayload();

  try {
    // Kiểm tra URL đã được cấu hình chưa
    if (GOOGLE_SCRIPT_URL === 'PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
      // Demo mode: giả lập thành công
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccessModal(payload.orderId);
      return;
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });

    // no-cors mode trả về opaque response, không đọc được body
    // Nên ta coi như thành công nếu không có exception
    showSuccessModal(payload.orderId);

  } catch (error) {
    console.error('Lỗi gửi đơn hàng:', error);
    showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');

    // Enable lại button nếu lỗi
    isSubmitting = false;
    btn.disabled = false;
    btnText.textContent = '✅ XÁC NHẬN ĐẶT HÀNG';
    spinner.classList.add('hidden');
  }
}

/**
 * Hiển thị popup thành công
 */
function showSuccessModal(orderId) {
  // Đóng tất cả modal
  document.getElementById('summary-modal').classList.remove('active');
  hideBackdrop();

  // Hiện success modal
  const modal = document.getElementById('success-modal');
  document.getElementById('success-order-id').textContent = orderId;
  modal.classList.remove('hidden');

  // Tạo confetti
  createConfetti();

  // Reset trạng thái submit
  isSubmitting = false;
  const btn = document.getElementById('btn-submit-order');
  const btnText = document.getElementById('submit-text');
  const spinner = document.getElementById('submit-spinner');
  btn.disabled = false;
  btnText.textContent = '✅ XÁC NHẬN ĐẶT HÀNG';
  spinner.classList.add('hidden');
}

/**
 * Reset giỏ hàng và đặt đơn mới
 */
function resetAndNewOrder() {
  cart = [];
  currentReceiveType = 'pickup';
  clearCartFromStorage();

  // Reset form
  document.getElementById('input-name').value = '';
  document.getElementById('input-note').value = '';

  // Ẩn success modal
  document.getElementById('success-modal').classList.add('hidden');

  // Unlock body
  unlockBody();

  // Re-render
  renderMenu();
  updateFloatingCart();

  // Scroll lên đầu
  window.scrollTo({ top: 0, behavior: 'smooth' });

  showToast('Sẵn sàng cho đơn hàng mới!', 'success');
}

// ═══════════════════════════════════════════
// TÌM KIẾM
// ═══════════════════════════════════════════

function handleSearch(query) {
  renderMenu(query);
}

// ═══════════════════════════════════════════
// CATEGORY SCROLL
// ═══════════════════════════════════════════

/**
 * Cuộn tới danh mục khi click
 */
function scrollToCategory(categoryId) {
  const section = document.getElementById(categoryId);
  if (!section) return;

  // Tính offset cho sticky header
  const navHeight = document.querySelector('.sticky').offsetHeight || 100;
  const sectionTop = section.getBoundingClientRect().top + window.scrollY - navHeight - 8;

  window.scrollTo({ top: sectionTop, behavior: 'smooth' });

  // Highlight chip
  setActiveCategory(categoryId);
}

/**
 * Đặt category active
 */
function setActiveCategory(categoryId) {
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.cat === categoryId);
  });

  // Scroll chip vào view
  const activeChip = document.querySelector(`.category-chip[data-cat="${categoryId}"]`);
  if (activeChip) {
    activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

/**
 * Scroll spy: theo dõi section nào đang hiển thị
 */
function setupScrollSpy() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    },
    {
      rootMargin: '-120px 0px -70% 0px',
      threshold: 0,
    }
  );

  // Observe sau khi render xong
  setTimeout(() => {
    MENU.forEach(cat => {
      const section = document.getElementById(cat.id);
      if (section) observer.observe(section);
    });
  }, 300);
}

// ═══════════════════════════════════════════
// LOCALSTORAGE
// ═══════════════════════════════════════════

const CART_STORAGE_KEY = 'overnight-coffee-cart';

function saveCartToStorage() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn('Không thể lưu giỏ hàng:', e);
  }
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate mỗi item trong giỏ
      cart = parsed.filter(item => {
        const menuItem = findMenuItem(item.id);
        if (!menuItem) return false;
        // Kiểm tra size hợp lệ
        if (!menuItem.prices[item.size]) return false;
        // Đảm bảo basePrice đúng (không cho chỉnh giá)
        item.basePrice = menuItem.prices[item.size];
        // Validate toppings
        item.toppings = (item.toppings || []).filter(t =>
          TOPPINGS.some(tp => tp.id === t.id)
        ).map(t => {
          const tp = TOPPINGS.find(tp => tp.id === t.id);
          return { id: tp.id, name: tp.name, price: tp.price };
        });
        // Đảm bảo quantity >= 1
        if (!item.quantity || item.quantity < 1) item.quantity = 1;
        return true;
      });
    }
  } catch (e) {
    console.warn('Không thể đọc giỏ hàng:', e);
    cart = [];
  }
}

function clearCartFromStorage() {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (e) {
    console.warn('Không thể xóa giỏ hàng:', e);
  }
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

/**
 * Format giá tiền dạng 25.000đ
 */
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

/**
 * Hiện toast thông báo
 */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/**
 * Tạo hiệu ứng confetti
 */
function createConfetti() {
  const colors = ['#1a5c2e', '#c8a951', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
  const container = document.body;

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (Math.random() * 8 + 6) + 'px';
    piece.style.height = (Math.random() * 8 + 6) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
    piece.style.animationDelay = (Math.random() * 1) + 's';
    container.appendChild(piece);

    // Tự xóa sau animation
    setTimeout(() => piece.remove(), 5000);
  }
}
