const orderId = Number(new URLSearchParams(window.location.search).get("id"));

const messageEl = document.getElementById("message");
const orderEl = document.getElementById("order");
const connectionEl = document.getElementById("connection");
const statusEl = document.getElementById("order-status");

let productName = "";

function render(order) {
  document.getElementById("order-id").textContent = `#${order.id}`;
  document.getElementById("order-product").textContent = productName || `#${order.productId}`;
  document.getElementById("order-quantity").textContent = String(order.quantity);
  document.getElementById("order-created").textContent = new Date(order.createdAt).toLocaleString();
  statusEl.textContent = order.status;
  statusEl.className = `badge ${order.status}`;
  orderEl.hidden = false;
}

function onOrderEvent(event) {
  render(JSON.parse(event.data));
}

async function loadProductName(productId) {
  const response = await fetch("/products");
  const products = await response.json();
  const product = products.find((p) => p.id === productId);
  if (product) productName = product.name;
}

function connect() {
  const source = new EventSource(`/orders/${orderId}/events`);
  source.addEventListener("order:status", onOrderEvent);
  source.addEventListener("order:cancelled", onOrderEvent);
  source.onopen = () => {
    connectionEl.textContent = "Live: connected";
  };
  source.onerror = () => {
    connectionEl.textContent = "Connection lost, reconnecting...";
  };
}

async function start() {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    messageEl.textContent = "Missing or invalid order id. Use tracking.html?id=1";
    return;
  }
  const response = await fetch(`/orders/${orderId}`);
  if (!response.ok) {
    messageEl.textContent = `Order ${orderId} not found`;
    return;
  }
  const order = await response.json();
  await loadProductName(order.productId);
  render(order);
  connect();
}

start();
