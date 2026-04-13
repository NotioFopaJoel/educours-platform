# Configuration Netlify de Educours

## 🚀 Guide de Déploiement sur Netlify

### Étape 1 : Variables d'Environnement Netlify

Dans le panneau Netlify (Settings > Build & Deploy > Environment), ajouter :

```
VITE_API_URL=https://your-backend-url.com/api
VITE_WS_URL=wss://your-backend-url.com
```

**Exemple avec Render.com :**
```
VITE_API_URL=https://educours-backend.onrender.com/api
VITE_WS_URL=wss://educours-backend.onrender.com
```

### Étape 2 : Configuration CORS Backend

Sur votre serveur backend (Render, Railway, etc.), ajouter la variable d'environnement :

```
FRONTEND_URL=https://your-netlify-site.netlify.app
```

Si vous avez plusieurs domaines :
```
FRONTEND_URL=https://your-netlify-site.netlify.app,https://your-custom-domain.com
```

### Étape 3 : Configuration netlify.toml

Vérifier que le fichier `netlify.toml` contient :

```toml
[build]
  command = "cd frontend && npm install && npm run build"
  publish = "frontend/dist"

[[redirects]]
  from = "/*"
  to = "/index.vue.html"
  status = 200

[functions]
  node_bundler = "esbuild"
```

### Étape 4 : Redirection des requêtes API

Ajouter une fonction Netlify pour proxifier les appels API (optionnel mais recommandé) :

**fichier: `netlify/functions/api.js`**

```javascript
exports.handler = async (event) => {
  const apiUrl = process.env.VITE_API_URL;
  const path = event.path.replace('/.netlify/functions/api', '');
  
  const response = await fetch(apiUrl + path, {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body
  });
  
  return {
    statusCode: response.status,
    body: await response.text()
  };
};
```

### ✅ Checklist avant de publier

- [ ] Backend déployé et accessible
- [ ] Variables d'environnement Netlify configurées
- [ ] FRONTEND_URL configurée sur le backend
- [ ] CORS configuré sur le backend
- [ ] netlify.toml créé/mis à jour
- [ ] Build local: `npm run build` fonctionne
- [ ] Lien backend correct dans `VITE_API_URL`

### 🔗 Variables d'Environnement Requises

**Frontend (Netlify):**
- `VITE_API_URL` - URL de l'API backend
- `VITE_WS_URL` - WebSocket URL du backend

**Backend (Render/Railway/etc):**
- `FRONTEND_URL` - URL(s) du site Netlify
- `MONGODB_URI` - Connexion MongoDB
- `JWT_SECRET` - Clé secrète JWT

### 🛠️ Dépannage

**Erreur: "CORS policy"**
→ Vérifier FRONTEND_URL sur le backend

**Erreur: "Cannot GET /API"**
→ Vérifier VITE_API_URL s'il pointe au bon endpoint

**Erreur: "Module not found"**
→ Relancer le build: `npm run build`

