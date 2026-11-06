const errorEl = document.getElementById("error");
const userSelect = document.getElementById("user");
const productSelect = document.getElementById("product");

let products = [];

function cell(content) {
  const td = document.createElement("td");
  if (content instanceof Node) td.appendChild(content);
  else td.textContent = String(content);
  return td;
}

function actionButton(label, url, disabled) {
  const button = document.createElement("button");
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener("click", () => send(url));
  return button;
}

async function send(url, body) {
  errorEl.textContent = "";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const payload = await response.json();
    errorEl.textContent = payload.error;
  }
  await loadAll();
}

function renderProducts() {
  const body = document.getElementById("products");
  body.replaceChildren(
    ...products.map((p) => {
      const row = document.createElement("tr");
      row.append(cell(p.id), cell(p.name), cell(p.stock));
      return row;
    }),
  );
  const selected = productSelect.value;
  productSelect.replaceChildren(
    ...products.map((p) => new Option(`${p.name} (stock ${p.stock})`, String(p.id))),
  );
  if (selected) productSelect.value = selected;
}

function renderOrders(orders) {
  const body = document.getElementById("orders");
  body.replaceChildren(
    ...orders.map((order) => {
      const product = products.find((p) => p.id === order.productId);
      const badge = document.createElement("span");
      badge.className = `badge ${order.status}`;
      badge.textContent = order.status;

      const link = document.createElement("a");
      link.href = `/tracking.html?id=${order.id}`;
      link.textContent = "Track";

      const actions = document.createElement("div");
      actions.append(
        actionButton("Advance", `/orders/${order.id}/advance`, order.status === "delivered" || order.status === "cancelled"),
        " ",
        actionButton("Cancel", `/orders/${order.id}/cancel`, order.status !== "preparing"),
        " ",
        link,
      );

      const row = document.createElement("tr");
      row.append(cell(order.id), cell(product ? product.name : order.productId), cell(order.quantity), cell(badge), cell(actions));
      return row;
    }),
  );
}

async function loadAll() {
  const [productsResponse, ordersResponse] = await Promise.all([fetch("/products"), fetch("/orders")]);
  products = await productsResponse.json();
  renderProducts();
  renderOrders(await ordersResponse.json());
}

async function loadUsers() {
  const response = await fetch("/users");
  const users = await response.json();
  userSelect.replaceChildren(...users.map((u) => new Option(u.name, String(u.id))));
}

document.getElementById("order-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  await send("/orders", {
    userId: Number(userSelect.value),
    productId: Number(productSelect.value),
    quantity: Number(document.getElementById("quantity").value),
  });
});

const source = new EventSource("/events");
for (const name of ["order:created", "order:status", "order:cancelled", "stock:updated"]) {
  source.addEventListener(name, loadAll);
}

loadUsers();
loadAll();
