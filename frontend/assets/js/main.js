// Sample Products Data
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 79.99,
        category: "electronics",
        description: "High-quality wireless headphones with noise cancellation",
        image: "🎧",
        rating: 4.5
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 199.99,
        category: "electronics",
        description: "Track your fitness and stay connected",
        image: "⌚",
        rating: 4.3
    },
    {
        id: 3,
        name: "Running Shoes",
        price: 89.99,
        category: "sports",
        description: "Comfortable running shoes for all terrain",
        image: "👟",
        rating: 4.6
    },
    {
        id: 4,
        name: "Casual T-Shirt",
        price: 29.99,
        category: "fashion",
        description: "Comfortable cotton t-shirt in various colors",
        image: "👕",
        rating: 4.2
    },
    {
        id: 5,
        name: "Coffee Maker",
        price: 49.99,
        category: "home",
        description: "Automatic coffee maker with timer",
        image: "☕",
        rating: 4.4
    },
    {
        id: 6,
        name: "Desk Lamp",
        price: 39.99,
        category: "home",
        description: "LED desk lamp with adjustable brightness",
        image: "💡",
        rating: 4.1
    }
];

// Cart Array
let cart = [];

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCart();
});

// Load and display products
function loadProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-rating">${'⭐'.repeat(Math.floor(product.rating))} ${product.rating}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    saveCart();
    updateCartCount();
    alert(`${product.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
}

// Update item quantity
function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
    updateCartCount();
}

// Update cart count in navbar
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// View cart (redirect to checkout)
function viewCart() {
    window.location.href = 'pages/checkout.html';
}
