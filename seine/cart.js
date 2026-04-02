const STORAGE_KEY = 'seine-cart';

// Detect localStorage availability
let useLocalStorage = false;
try {
  const testKey = '__seine_storage_test__';
  localStorage.setItem(testKey, '1');
  localStorage.removeItem(testKey);
  useLocalStorage = true;
} catch {
  useLocalStorage = false;
}

// In-memory fallback
let memoryCart = [];

/**
 * Write cart array to storage.
 */
function saveCart(cart) {
  if (useLocalStorage) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } else {
    memoryCart = cart;
  }
}

/**
 * Validate that a value is a proper cart array:
 * each item must have a string `name` and a positive integer `quantity`.
 */
function isValidCart(data) {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.name === 'string' &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
  );
}

/**
 * Read cart from storage. Returns a valid cart array.
 * Resets to empty on corrupted or invalid data.
 */
export function getCart() {
  if (!useLocalStorage) {
    return memoryCart;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn('Seine cart: corrupted localStorage data, resetting cart.');
    saveCart([]);
    return [];
  }

  if (!isValidCart(parsed)) {
    console.warn('Seine cart: invalid cart data in localStorage, resetting cart.');
    saveCart([]);
    return [];
  }

  return parsed;
}

/**
 * Add one unit of productName to the cart.
 * Increments quantity if the item already exists.
 * Returns the updated cart.
 */
export function addToCart(productName) {
  const cart = getCart();
  const existing = cart.find((item) => item.name === productName);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name: productName, quantity: 1 });
  }

  saveCart(cart);
  updateBadge();
  return cart;
}

/**
 * Returns the total number of items (sum of all quantities).
 */
export function getTotalItemCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Remove a product from the cart entirely.
 */
export function removeFromCart(productName) {
  const cart = getCart().filter((item) => item.name !== productName);
  saveCart(cart);
  updateBadge();
  renderPopup();
  return cart;
}

/**
 * Clear the cart completely.
 */
export function clearCart() {
  saveCart([]);
  updateBadge();
}

/**
 * Update the cart badge in the header if the element exists.
 */
function updateBadge() {
  const badge = document.querySelector('.cart-badge');
  if (!badge) return;

  const count = getTotalItemCount();
  badge.textContent = count;
  if (count === 0) {
    badge.classList.add('hidden');
  } else {
    badge.classList.remove('hidden');
  }
}

/**
 * Render the cart popup content from current cart state.
 */
export function renderPopup() {
  const cart = getCart();
  const itemsContainer = document.querySelector('#cart-popup-items');
  const footer = document.querySelector('#cart-popup-footer');
  const totalEl = document.querySelector('#cart-popup-total');

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = '<p class="cart-empty-message">Your cart is empty</p>';
    if (footer) footer.style.display = 'none';
  } else {
    itemsContainer.innerHTML = cart
      .map((item) => `<div class="cart-popup-item"><span>${item.name}</span><span class="cart-popup-item-right">×${item.quantity}<button class="cart-remove-btn" data-name="${item.name}" aria-label="Remove ${item.name}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></span></div>`)
      .join('');
    itemsContainer.querySelectorAll('.cart-remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromCart(btn.dataset.name);
      });
    });
    if (footer) footer.style.display = '';
    if (totalEl) totalEl.textContent = getTotalItemCount();
  }
}

/**
 * Toggle the cart popup open/closed.
 */
export function togglePopup() {
  const popup = document.querySelector('#cart-popup');
  if (!popup) return;

  const isHidden = popup.classList.contains('hidden');
  if (isHidden) {
    renderPopup();
    popup.classList.remove('hidden');
  } else {
    popup.classList.add('hidden');
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  updateBadge();

  const cartIconContainer = document.querySelector('.cart-icon-container');
  if (cartIconContainer) {
    cartIconContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopup();
    });
  }

  document.addEventListener('click', () => {
    const popup = document.querySelector('#cart-popup');
    if (popup && !popup.classList.contains('hidden')) {
      popup.classList.add('hidden');
    }
  });

  const addToCartBtn = document.querySelector('.product-actions .btn-primary');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      addToCart('SoundWave Pro X1 Wireless Headphones');
      const originalText = addToCartBtn.textContent;
      addToCartBtn.textContent = 'Added!';
      setTimeout(() => {
        addToCartBtn.textContent = originalText;
      }, 1500);
    });
  }
});

