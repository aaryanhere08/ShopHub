const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 79.99,
        category: "Electronics",
        description: "Noise-reducing wireless headphones with 30-hour battery life.",
        image: "WH",
        rating: 4.5,
        badge: "Best seller"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 199.99,
        category: "Electronics",
        description: "Track workouts, notifications, sleep, and heart rate in one place.",
        image: "SW",
        rating: 4.7,
        badge: "New"
    },
    {
        id: 3,
        name: "Running Shoes",
        price: 89.99,
        category: "Sports",
        description: "Lightweight shoes with soft cushioning for daily training.",
        image: "RS",
        rating: 4.6,
        badge: "Popular"
    },
    {
        id: 4,
        name: "Cotton T-Shirt",
        price: 29.99,
        category: "Fashion",
        description: "Breathable everyday tee with a relaxed premium fit.",
        image: "TS",
        rating: 4.2,
        badge: "Value"
    },
    {
        id: 5,
        name: "Coffee Maker",
        price: 49.99,
        category: "Home",
        description: "Programmable coffee maker with reusable filter and timer.",
        image: "CM",
        rating: 4.4,
        badge: "Deal"
    },
    {
        id: 6,
        name: "LED Desk Lamp",
        price: 39.99,
        category: "Home",
        description: "Adjustable lamp with warm, neutral, and focus lighting modes.",
        image: "DL",
        rating: 4.3,
        badge: "Top pick"
    },
    {
        id: 7,
        name: "Travel Backpack",
        price: 64.99,
        category: "Travel",
        description: "Water-resistant backpack with laptop sleeve and easy-access pockets.",
        image: "TB",
        rating: 4.8,
        badge: "Rated high"
    },
    {
        id: 8,
        name: "Yoga Mat",
        price: 34.99,
        category: "Sports",
        description: "Grippy, cushioned mat for studio workouts and home routines.",
        image: "YM",
        rating: 4.5,
        badge: "Comfort"
    }
];

let cart = [];
let wishlist = [];

const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});

document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    loadWishlist();
    populateCategories();
    bindEvents();
    updateAuthState();
    renderProducts();
    updateStats();
});

function bindEvents() {
    document.getElementById("searchInput")?.addEventListener("input", renderProducts);
    document.getElementById("categoryFilter")?.addEventListener("change", renderProducts);
    document.getElementById("sortSelect")?.addEventListener("change", renderProducts);
    document.getElementById("cartButton")?.addEventListener("click", openCart);
    document.getElementById("closeCartModal")?.addEventListener("click", closeCart);
    document.getElementById("closeProductModal")?.addEventListener("click", closeProductModal);
    document.getElementById("logoutBtn")?.addEventListener("click", logout);

    document.querySelectorAll(".modal").forEach((modal) => {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.classList.remove("show");
                modal.setAttribute("aria-hidden", "true");
            }
        });
    });
}

function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    if (!categoryFilter) return;

    const categories = [...new Set(products.map((product) => product.category))].sort();
    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function renderProducts() {
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    const query = document.getElementById("searchInput")?.value.trim().toLowerCase() || "";
    const category = document.getElementById("categoryFilter")?.value || "all";
    const sort = document.getElementById("sortSelect")?.value || "featured";

    let visibleProducts = products.filter((product) => {
        const matchesQuery = [product.name, product.description, product.category]
            .join(" ")
            .toLowerCase()
            .includes(query);
        const matchesCategory = category === "all" || product.category === category;
        return matchesQuery && matchesCategory;
    });

    visibleProducts = sortProducts(visibleProducts, sort);
    updateResultCount(visibleProducts.length);

    if (visibleProducts.length === 0) {
        grid.innerHTML = '<div class="empty-state">No products match your search.</div>';
        return;
    }

    grid.innerHTML = visibleProducts.map((product) => {
        const saved = wishlist.includes(product.id);
        return `
            <article class="product-card">
                <button class="product-image" onclick="openProductModal(${product.id})" aria-label="View ${product.name}">
                    <span class="product-visual">${product.image}</span>
                </button>
                <div class="product-info">
                    <div class="product-meta">${product.category} / ${product.badge}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-rating">${ratingText(product.rating)} ${product.rating.toFixed(1)}</div>
                    <div class="product-footer">
                        <div class="product-price">${money.format(product.price)}</div>
                        <button class="icon-btn wishlist-btn ${saved ? "active" : ""}" onclick="toggleWishlist(${product.id})" aria-label="Save ${product.name}">${saved ? "♥" : "+"}</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </article>
        `;
    }).join("");
}

function sortProducts(items, sort) {
    const sorted = [...items];
    if (sort === "price-low") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-high") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
}

function ratingText(rating) {
    const rounded = Math.round(rating);
    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function updateResultCount(count) {
    const resultCount = document.getElementById("resultCount");
    if (!resultCount) return;
    resultCount.textContent = count === 1 ? "Showing 1 product" : `Showing ${count} products`;
}

function addToCart(productId) {
    const product = products.find((item) => item.id === productId);
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    updateStats();
    renderCart();
    showToast(`${product.name} added to cart.`);
}

function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    saveCart();
    updateCartCount();
    updateStats();
    renderCart();
}

function changeQuantity(productId, delta) {
    const item = cart.find((cartItem) => cartItem.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCartCount();
    updateStats();
    renderCart();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    updateCartCount();
}

function loadWishlist() {
    wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
}

function toggleWishlist(productId) {
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter((id) => id !== productId);
        showToast("Removed from favorites.");
    } else {
        wishlist.push(productId);
        showToast("Saved to favorites.");
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    renderProducts();
    updateStats();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) cartCountElement.textContent = count;
}

function updateStats() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setText("productTotal", products.length);
    setText("wishlistTotal", wishlist.length);
    setText("heroSubtotal", money.format(subtotal));
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function openCart() {
    renderCart();
    const modal = document.getElementById("cartModal");
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
}

function closeCart() {
    const modal = document.getElementById("cartModal");
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}

function renderCart() {
    const body = document.getElementById("cartModalBody");
    if (!body) return;

    if (cart.length === 0) {
        body.innerHTML = '<div class="empty-message">Your cart is empty. Add a product to get started.</div>';
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    body.innerHTML = `
        ${cart.map((item) => `
            <div class="cart-row">
                <div>
                    <strong>${item.name}</strong>
                    <div class="muted">${money.format(item.price)} each</div>
                    <div class="quantity-control">
                        <button onclick="changeQuantity(${item.id}, -1)" aria-label="Decrease quantity">-</button>
                        <strong>${item.quantity}</strong>
                        <button onclick="changeQuantity(${item.id}, 1)" aria-label="Increase quantity">+</button>
                        <button class="link-button" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
                <strong>${money.format(item.price * item.quantity)}</strong>
            </div>
        `).join("")}
        <div class="cart-total"><span>Subtotal</span><span>${money.format(subtotal)}</span></div>
        <div class="hero-actions">
            <a class="primary-btn" href="pages/checkout.html">Checkout</a>
            <button class="ghost-btn" onclick="closeCart()">Keep Shopping</button>
        </div>
    `;
}

function openProductModal(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setText("modalTitle", product.name);
    document.getElementById("productModalBody").innerHTML = `
        <div class="product-image"><span class="product-visual">${product.image}</span></div>
        <p class="product-meta">${product.category} / ${product.badge}</p>
        <p class="product-description">${product.description}</p>
        <p class="product-rating">${ratingText(product.rating)} ${product.rating.toFixed(1)} customer rating</p>
        <div class="product-footer">
            <div class="product-price">${money.format(product.price)}</div>
            <button class="primary-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `;

    const modal = document.getElementById("productModal");
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
}

function closeProductModal() {
    const modal = document.getElementById("productModal");
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}

function updateAuthState() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const loginLink = document.getElementById("loginLink");
    const signupLink = document.getElementById("signupLink");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!user) return;
    loginLink.textContent = user.fullname ? `Hi, ${user.fullname.split(" ")[0]}` : "Account";
    loginLink.href = "#";
    signupLink.hidden = true;
    logoutBtn.hidden = false;
}

function logout() {
    localStorage.removeItem("user");
    showToast("You are logged out.");
    setTimeout(() => window.location.reload(), 600);
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}
