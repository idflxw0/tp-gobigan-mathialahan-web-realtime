# Order tracking (TP noté 1)

Git: https://github.com/idflxw0/tp-gobigan-mathialahan-web-realtime

## Run

```bash
docker compose up --build -d
```

App on http://localhost:3000. Tracking page: `/tracking.html?id=1`.

## API

| Route | Description | Codes |
| --- | --- | --- |
| GET `/users`, `/products`, `/orders` | Lists | 200 |
| GET `/orders/:id` | One order | 200, 400, 404 |
| POST `/orders` | Body `{userId, productId, quantity}`, lowers the stock | 201, 400 invalid, 404 unknown user/product, 409 no stock |
| POST `/orders/:id/advance` | preparing → shipped → delivered (auto delivery 20 s after shipped) | 200, 400, 404, 409 |
| POST `/orders/:id/cancel` | Only if preparing, stock given back | 200, 400, 404, 409 |

## SSE

- `GET /events`: all events.
- `GET /orders/:id/events`: only this order, filtered by the server.

Events: `order:created`, `order:status`, `order:cancelled`, `stock:updated`.

## Status

F1 to F10 done. B1 to B4 not done.
