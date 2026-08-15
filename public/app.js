const API = "/api";

let token =
  localStorage.getItem("token");

let currentUser =
  JSON.parse(
    localStorage.getItem("user") || "null"
  );

let cart =
  JSON.parse(
    localStorage.getItem("cart") || "[]"
  );


function showSection(id) {

  document
    .querySelectorAll(".section")
    .forEach(section =>
      section.classList.add("hidden")
    );

  document
    .getElementById(id)
    .classList.remove("hidden");


  if (id === "shop")
    loadProducts();

  if (id === "cart")
    renderCart();

  if (id === "orders")
    loadMyOrders();

  if (id === "admin")
    loadAdmin();
}


function showRegister() {

  showSection("register");

}


function updateNav() {

  document
    .getElementById("loginNav")
    .classList.toggle(
      "hidden",
      !!token
    );

  document
    .getElementById("logoutBtn")
    .classList.toggle(
      "hidden",
      !token
    );

  document
    .getElementById("adminNav")
    .classList.toggle(
      "hidden",
      currentUser?.role !== "admin"
    );

  document
    .getElementById("cartCount")
    .textContent =
      cart.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );
}


async function loadProducts() {

  const response =
    await fetch(
      `${API}/products`
    );

  const products =
    await response.json();


  document
    .getElementById("products")
    .innerHTML = products
    .map(product => `

      <div class="product">

        <img
          src="${
            product.image ||
            "https://via.placeholder.com/600x400?text=Product"
          }"
          alt="${escapeHtml(product.name)}"
        >

        <h3>
          ${escapeHtml(product.name)}
        </h3>

        <p>
          ${escapeHtml(
            product.description || ""
          )}
        </p>

        <p>
          Category:
          ${escapeHtml(
            product.category || "General"
          )}
        </p>

        <p>
          Stock: ${product.stock}
        </p>

        <p class="price">
          ₹${product.price}
        </p>

        <button
          onclick='addToCart(${JSON.stringify({
            id: product._id,
            name: product.name,
            price: product.price,
            stock: product.stock
          })})'
          ${product.stock === 0 ? "disabled" : ""}
        >
          Add to Cart
        </button>

      </div>

    `)
    .join("");
}


function addToCart(product) {

  const existing =
    cart.find(
      item =>
        item.productId === product.id
    );


  if (existing) {

    if (
      existing.quantity <
      product.stock
    ) {
      existing.quantity++;
    }

  } else {

    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock
    });

  }

  saveCart();

  alert(
    "Product added to cart"
  );
}


function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateNav();

  renderCart();
}


function renderCart() {

  const box =
    document.getElementById(
      "cartItems"
    );

  const totalBox =
    document.getElementById(
      "cartTotal"
    );

  const checkoutBox =
    document.getElementById(
      "checkoutBox"
    );


  if (cart.length === 0) {

    box.innerHTML =
      "<p>Your cart is empty.</p>";

    totalBox.innerHTML = "";

    checkoutBox
      .classList
      .add("hidden");

    return;
  }


  box.innerHTML =
    cart.map(
      (item, index) => `

      <div class="card">

        <h3>
          ${escapeHtml(item.name)}
        </h3>

        <p>

          ₹${item.price}

          ×

          <button
            onclick="changeQty(${index}, -1)"
          >
            −
          </button>

          ${item.quantity}

          <button
            onclick="changeQty(${index}, 1)"
          >
            +
          </button>

        </p>

        <button
          onclick="removeFromCart(${index})"
        >
          Remove
        </button>

      </div>

    `
    ).join("");


  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
        item.quantity,
      0
    );


  totalBox.innerHTML =
    `<h3>Total: ₹${total}</h3>`;


  checkoutBox
    .classList
    .toggle(
      "hidden",
      !token
    );
}


function changeQty(
  index,
  change
) {

  cart[index].quantity +=
    change;


  if (
    cart[index].quantity <= 0
  ) {
    cart.splice(index, 1);
  }


  if (
    cart[index] &&
    cart[index].quantity >
      cart[index].stock
  ) {
    cart[index].quantity =
      cart[index].stock;
  }


  saveCart();
}


function removeFromCart(index) {

  cart.splice(index, 1);

  saveCart();
}


async function checkout() {

  if (!token) {

    showSection("login");

    return;
  }


  const shippingAddress =
    document
      .getElementById(
        "shippingAddress"
      )
      .value
      .trim();


  if (!shippingAddress) {

    alert(
      "Enter shipping address"
    );

    return;
  }


  const response =
    await fetch(
      `${API}/orders`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify({
          shippingAddress,

          items:
            cart.map(item => ({
              productId:
                item.productId,

              quantity:
                item.quantity
            }))
        })
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    alert(data.message);

    return;
  }


  cart = [];

  saveCart();


  alert(
    "Order placed successfully!"
  );


  showSection("orders");
}


document
  .getElementById("loginForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const response =
        await fetch(
          `${API}/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                email:
                  document
                    .getElementById(
                      "loginEmail"
                    )
                    .value,

                password:
                  document
                    .getElementById(
                      "loginPassword"
                    )
                    .value
              })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(data.message);

        return;
      }


      token = data.token;

      currentUser =
        data.user;


      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          currentUser
        )
      );


      updateNav();


      alert(
        `Welcome ${currentUser.name}`
      );


      showSection("shop");

    }
  );


document
  .getElementById("registerForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const response =
        await fetch(
          `${API}/auth/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                name:
                  document
                    .getElementById(
                      "regName"
                    )
                    .value,

                email:
                  document
                    .getElementById(
                      "regEmail"
                    )
                    .value,

                password:
                  document
                    .getElementById(
                      "regPassword"
                    )
                    .value
              })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(data.message);

        return;
      }


      token = data.token;

      currentUser =
        data.user;


      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          currentUser
        )
      );


      updateNav();

      showSection("shop");

    }
  );


function logout() {

  token = null;

  currentUser = null;


  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "user"
  );


  updateNav();

  showSection("shop");
}


async function loadMyOrders() {

  if (!token) {

    document
      .getElementById(
        "ordersList"
      )
      .innerHTML =
      "<p>Please login to see your orders.</p>";

    return;
  }


  const response =
    await fetch(
      `${API}/orders/my`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );


  if (!response.ok) {

    document
      .getElementById(
        "ordersList"
      )
      .innerHTML =
      "<p>Unable to load orders.</p>";

    return;
  }


  const orders =
    await response.json();


  document
    .getElementById(
      "ordersList"
    )
    .innerHTML = orders.length

    ? orders
        .map(
          order => `

          <div class="card">

            <h3>
              Order #${order._id.slice(-6)}
            </h3>

            <p class="status">
              Status: ${order.status}
            </p>

            <p>
              Total: ₹${order.total}
            </p>

            <p>
              Address:
              ${escapeHtml(
                order.shippingAddress
              )}
            </p>

            <div>

              ${order.items
                .map(
                  item => `

                  <div class="order-item">

                    ${escapeHtml(
                      item.name
                    )}

                    × ${item.quantity}

                    —

                    ₹${
                      item.price *
                      item.quantity
                    }

                  </div>

                `
                )
                .join("")}

            </div>

            <small>
              ${
                new Date(
                  order.createdAt
                ).toLocaleString()
              }
            </small>

          </div>

        `
        )
        .join("")

    : "<p>No orders yet.</p>";
}


async function loadAdmin() {

  if (
    currentUser?.role !==
    "admin"
  ) {
    return;
  }


  const productsResponse =
    await fetch(
      `${API}/products`
    );


  const products =
    await productsResponse.json();


  document
    .getElementById(
      "adminProducts"
    )
    .innerHTML = products
    .map(
      product => `

        <div class="card">

          <b>
            ${escapeHtml(
              product.name
            )}
          </b>

          —

          ₹${product.price}

          —

          Stock:
          ${product.stock}

          <button
            onclick="deleteProduct('${product._id}')"
          >
            Delete
          </button>

        </div>

      `
    )
    .join("");


  const ordersResponse =
    await fetch(
      `${API}/orders`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );


  const orders =
    await ordersResponse.json();


  document
    .getElementById(
      "adminOrders"
    )
    .innerHTML = orders
    .map(
      order => `

        <div class="card">

          <b>
            Order #${order._id.slice(-6)}
          </b>

          <p>
            User:
            ${escapeHtml(
              order.user?.name || ""
            )}

            (
            ${escapeHtml(
              order.user?.email || ""
            )}
            )
          </p>

          <p>
            Total: ₹${order.total}
          </p>

          <p>

            Status:

            <select
              onchange="updateOrderStatus(
                '${order._id}',
                this.value
              )"
            >

              ${
                [
                  "Placed",
                  "Processing",
                  "Shipped",
                  "Delivered",
                  "Cancelled"
                ]
                  .map(
                    status =>
                      `<option
                        ${
                          status ===
                          order.status
                            ? "selected"
                            : ""
                        }
                      >
                        ${status}
                      </option>`
                  )
                  .join("")
              }

            </select>

          </p>

        </div>

      `
    )
    .join("");
}


document
  .getElementById(
    "productForm"
  )
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const product = {

        name:
          document
            .getElementById(
              "pName"
            ).value,

        price:
          Number(
            document
              .getElementById(
                "pPrice"
              ).value
          ),

        stock:
          Number(
            document
              .getElementById(
                "pStock"
              ).value
          ),

        category:
          document
            .getElementById(
              "pCategory"
            ).value,

        image:
          document
            .getElementById(
              "pImage"
            ).value,

        description:
          document
            .getElementById(
              "pDescription"
            ).value
      };


      const response =
        await fetch(
          `${API}/products`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify(
                product
              )
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(data.message);

        return;
      }


      event.target.reset();

      loadAdmin();

      loadProducts();


      alert(
        "Product added successfully"
      );

    }
  );


async function deleteProduct(id) {

  if (
    !confirm(
      "Delete this product?"
    )
  ) {
    return;
  }


  const response =
    await fetch(
      `${API}/products/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    alert(data.message);

    return;
  }


  loadAdmin();

  loadProducts();
}


async function updateOrderStatus(
  id,
  status
) {

  const response =
    await fetch(
      `${API}/orders/${id}/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body:
          JSON.stringify({
            status
          })
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    alert(data.message);

  } else {

    alert(
      "Order status updated"
    );

  }
}


function escapeHtml(value) {

  return String(value).replace(
    /[&<>"']/g,

    character => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[character])
  );
}


updateNav();

loadProducts();

showSection("shop");
