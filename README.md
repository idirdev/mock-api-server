# mock-api-server

> **[EN]** Spin up a fully configurable mock HTTP API server in seconds from a JSON config file — define routes with static responses, dynamic handlers, custom status codes, and optional latency simulation.
> **[FR]** Lancez un serveur HTTP mock entièrement configurable en quelques secondes depuis un fichier JSON — définissez des routes avec des réponses statiques, des gestionnaires dynamiques, des codes de statut personnalisés et une simulation de latence optionnelle.

---

## Features / Fonctionnalités

**[EN]**
- Define routes in a simple JSON file with method + path patterns (`GET /users/:id`)
- URL path parameters (`:id`, `:slug`) extracted and passed to dynamic handlers
- Query string parameters available in handler context
- Request body parsed automatically (JSON)
- Configurable response delay with `--delay` to simulate slow APIs
- Static responses (plain JSON object) or dynamic function handlers
- Custom HTTP status codes and response headers per route
- 404 handler for unmatched routes returns structured JSON error
- Zero dependencies — pure Node.js `http` module

**[FR]**
- Définissez des routes dans un fichier JSON simple avec patterns méthode + chemin (`GET /users/:id`)
- Paramètres de chemin URL (`:id`, `:slug`) extraits et passés aux gestionnaires dynamiques
- Paramètres de query string disponibles dans le contexte du gestionnaire
- Corps de la requête parsé automatiquement (JSON)
- Délai de réponse configurable avec `--delay` pour simuler des APIs lentes
- Réponses statiques (objet JSON simple) ou gestionnaires de fonctions dynamiques
- Codes de statut HTTP et en-têtes de réponse personnalisés par route
- Gestionnaire 404 pour les routes non trouvées retournant une erreur JSON structurée
- Aucune dépendance — module `http` Node.js pur

---

## Installation

```bash
npm install -g @idirdev/mock-api-server
```

---

## CLI Usage / Utilisation CLI

```bash
# Start with default mock.json on port 3000 (démarrer avec mock.json par défaut sur le port 3000)
mock-api

# Use a specific config file (utiliser un fichier de config spécifique)
mock-api api-routes.json

# Custom port (port personnalisé)
mock-api mock.json --port 8080

# Simulate network delay of 500ms (simuler un délai réseau de 500ms)
mock-api mock.json --delay 500

# Show help (afficher l'aide)
mock-api --help
```

### Example Config / Exemple de configuration

```json
{
  "routes": {
    "GET /users": { "body": [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}] },
    "GET /users/:id": { "body": {"id": 1, "name": "Alice", "email": "alice@example.com"} },
    "POST /users": { "status": 201, "body": {"created": true, "id": 42} },
    "DELETE /users/:id": { "status": 204, "body": null },
    "GET /health": { "body": {"status": "ok", "uptime": 9823} }
  }
}
```

### Example Output / Exemple de sortie

```
$ mock-api mock.json --port 4000
Mock API running on :4000
  GET /users
  GET /users/:id
  POST /users
  DELETE /users/:id
  GET /health
```

---

## API (Programmatic) / API (Programmation)

```js
const { createRouter, createServer, loadConfig } = require('@idirdev/mock-api-server');

// Load routes from a JSON file (charger les routes depuis un fichier JSON)
const config = loadConfig('./mock.json');

// Create and start a server (créer et démarrer un serveur)
const server = createServer(config, { delay: 200 });
server.listen(3001, () => console.log('Mock API on :3001'));

// Define routes inline without a file (définir des routes inline sans fichier)
const inlineServer = createServer({
  routes: {
    'GET /ping': { body: { pong: true } },
    'GET /items/:id': ({ params }) => ({
      body: { id: params.id, name: 'Widget ' + params.id }
    }),
    'POST /items': ({ body }) => ({
      status: 201,
      body: { created: true, received: body }
    })
  }
});
inlineServer.listen(3002);

// Use the router directly (utiliser le routeur directement)
const router = createRouter({
  'GET /health': { body: { status: 'ok' } }
});
```

---

## License

MIT © idirdev
