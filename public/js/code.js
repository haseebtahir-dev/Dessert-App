const emptyCart = document.querySelector(".empty-cart");
const cartContent = document.querySelector(".cart-content");
const totalCount = document.querySelector(".total-count");
const orderTotal = document.querySelector(".total-amount");

let totalQuantity = 0;
let cartItems = []; 

document.querySelectorAll(".addto-cart").forEach(cart => {
    const addToCartIcon = cart.querySelector(".cart-icon");
    const quantity = cart.querySelector(".quantity");
    const increment = cart.querySelector(".increment");
    const decrement = cart.querySelector(".decrement");
    const quantityValue = cart.querySelector(".quantity-value");
    const itemId = cart.getAttribute("data-item-id");

    let itemPrice = 0;

    addToCartIcon.addEventListener("click", function () {
        fetchItemData(itemId, cart, quantityValue);
        cart.style.backgroundColor = "hsl(14, 86%, 42%)";
        quantity.style.display = "flex";
        addToCartIcon.style.display = "none";
    });

    increment.addEventListener("click", function () {
        updateCartItem(itemId, 1, quantityValue, cart);
    });

    decrement.addEventListener("click", function () {
        updateCartItem(itemId, -1, quantityValue, cart);
    });

    function fetchItemData(itemId, cart, quantityValue) {
        fetch('/get-item-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: parseInt(itemId, 10) }) 
        })
        .then(response => response.json())
        .then(data => {
            itemPrice = data.price;

            let itemExists = cartItems.find(item => item.id === itemId);

            if (itemExists) {
                itemExists.quantity++;
            } else {
                cartItems.push({ id: itemId, name: data.item_name, quantity: 1, price: itemPrice });
            }

            totalQuantity++;
            quantityValue.textContent = 1;
            updateCartUI();
        })
        .catch(error => console.error('Error fetching item data:', error));
    }

    function updateCartItem(itemId, change, quantityValue, cart) {
        let itemIndex = cartItems.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            cartItems[itemIndex].quantity += change;

            if (cartItems[itemIndex].quantity <= 0) {
                cartItems.splice(itemIndex, 1);
                totalQuantity--;

                // Reset UI
                cart.style.backgroundColor = "hsl(20, 50%, 98%)";
                quantity.style.display = "none";
                addToCartIcon.style.display = "flex";
            } else {
                totalQuantity += change;
                quantityValue.textContent = cartItems[itemIndex].quantity;
            }
        }
        updateCartUI();
    }

    function updateCartUI() {
        cartContent.innerHTML = "";
        let totalPrice = 0;

        cartItems.forEach(item => {
            totalPrice += item.price * item.quantity;

            const cartItem = document.createElement("div");
            cartItem.classList.add("item-in-cart");
            cartItem.innerHTML = `
                <p class="cart-item-name">${item.name}</p>
                <div class="cart-item">
                    <div class="cart-item-price">
                        <p class="item-quantity">${item.quantity}x</p>
                        <p class="incart-price">@${item.price}</p>
                        <p class="item-total">$${item.price * item.quantity}</p>
                    </div>
                    <div class="remove-item">
                        <button class="remove-item-cart" data-id="${item.id}">
                            <img src="/assests/images/icon-remove-item.svg" alt="">
                        </button>
                    </div>
                </div>
                <div class="cart-border"></div>
            `;
            cartContent.appendChild(cartItem);
        });

        orderTotal.textContent = "$" + totalPrice;
        totalCount.innerHTML = `(${totalQuantity})`;

        if (totalQuantity === 0) {
            cartContent.style.display = "none";
            emptyCart.style.display = "block";
        } else {
            cartContent.style.display = "block";
            emptyCart.style.display = "none";
        }

        // Add the footer section
        if (!document.querySelector(".cart-footer")) {
            const cartFooter = document.createElement("div");
            cartFooter.classList.add("cart-footer");
            cartFooter.innerHTML = `
                <div class="order-total">
                    <p>Order Total</p>
                    <p class="total-amount">$${totalPrice}</p>
                </div>
                <div class="deliver">
                    <img src="/assests/images/icon-carbon-neutral.svg" alt="">
                    <p>This is <strong>carbon neutral</strong> delivery</p>
                </div>
                <div class="order-confirm">
                    <button>Confirm Order</button>
                </div>
            `;
            cartContent.appendChild(cartFooter);
        } else {
            document.querySelector(".total-amount").textContent = "$" + totalPrice;
        }

        document.querySelectorAll(".remove-item-cart").forEach(button => {
            button.addEventListener("click", function () {
                const id = button.getAttribute("data-id");
                let index = cartItems.findIndex(item => item.id === id);
                
                if (index !== -1) {
                    totalQuantity -= cartItems[index].quantity;
                    const removedItem = cartItems.splice(index, 1)[0]; // Get the removed item
                    
                    updateCartUI();  
        
                    // Find the corresponding cart element and reset its UI
                    const cartElement = document.querySelector(`[data-item-id="${removedItem.id}"]`);
                    if (cartElement) {

                        cart.style.backgroundColor = "hsl(20, 50%, 98%)";
                        quantity.style.display = "none";
                        addToCartIcon.style.display = "flex";
                    }
                }
            });
        });
        
    }
});
