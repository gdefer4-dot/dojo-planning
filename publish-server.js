#!/usr/bin/env node
"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const ROOT = __dirname;
const PORT = 4172;
const VERSION_URL = "https://gdefer4-dot.github.io/dojo-planning/version.json";

function run(command, args, cwd = ROOT) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd, windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(String(stderr || stdout || error.message).trim()));
        return;
      }
      resolve(String(stdout || "").trim());
    });
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 30 * 1024 * 1024) {
        reject(new Error("Données trop volumineuses."));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function contentType(file) {
  return ({
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8"
  })[path.extname(file).toLowerCase()] || "application/octet-stream";
}

async function verifierDepot() {
  try { await run("git", ["rebase", "--abort"]); } catch (_) {}
  try { await run("git", ["merge", "--abort"]); } catch (_) {}

  const root = path.resolve(await run("git", ["rev-parse", "--show-toplevel"]));
  if (root !== path.resolve(ROOT)) {
    throw new Error("Le dossier FRONTEND actif n'est pas la racine du dépôt Git.");
  }

  const remote = await run("git", ["remote", "get-url", "origin"]);
  if (!/gdefer4-dot\/dojo-planning(?:\.git)?$/i.test(remote)) {
    throw new Error("Le dépôt local n'est pas relié au bon dépôt GitHub.");
  }

  return root;
}

function lireHistorique() {
  const p = path.join(ROOT, "publication-history.json");
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

function prochainBuild(history) {
  const nums = history.map(x => Number(x.build)).filter(Number.isFinite);
  return nums.length ? Math.max(...nums) + 1 : 1;
}

function updateMobileFiles(payload, buildNumber) {
  const visibleVersion = `V49.0.${buildNumber}`;
  const cacheToken = `490${buildNumber}`;
  const cacheName = `planning-dojo-club-v49-0-${buildNumber}`;

  fs.writeFileSync(
    path.join(ROOT, "mobile-data.js"),
    "'use strict';\nconst DONNEES=" +
      JSON.stringify(payload.donnees).replace(/</g, "\\u003c") +
      ";\n",
    "utf8"
  );

  const indexPath = path.join(ROOT, "index.html");
  let index = fs.readFileSync(indexPath, "utf8");
  index = index.replace(/V\d+\.\d+(?:\.\d+)? PWA/g, `${visibleVersion} PWA`);
  index = index.replace(/app\.css\?v=[^"'&<\s]+/g, `app.css?v=${cacheToken}`);
  index = index.replace(/mobile-data\.js\?v=[^"'&<\s]+/g, `mobile-data.js?v=${cacheToken}`);
  index = index.replace(/app\.js\?v=[^"'&<\s]+/g, `app.js?v=${cacheToken}`);
  index = index.replace(/manifest\.webmanifest\?v=[^"'&<\s]+/g, `manifest.webmanifest?v=${cacheToken}`);
  fs.writeFileSync(indexPath, index, "utf8");

  const appPath = path.join(ROOT, "app.js");
  let app = fs.readFileSync(appPath, "utf8");
  app = app.replace(/const APP_VERSION='[^']+';/, `const APP_VERSION='${visibleVersion}';`);
  app = app.replace(/service-worker\.js\?v=[^"'&<\s]+/g, `sw-v481.js?v=${cacheToken}`);
  fs.writeFileSync(appPath, app, "utf8");

  const swPath = path.join(ROOT, "sw-v481.js");
  let sw = fs.readFileSync(swPath, "utf8");
  sw = sw.replace(/const VERSION\s*=\s*["'][^"']+["'];/, `const VERSION = "${visibleVersion}";`);
  sw = sw.replace(/const CACHE_NAME\s*=\s*["'][^"']+["'];/, `const CACHE_NAME = "${cacheName}";`);
  fs.writeFileSync(swPath, sw, "utf8");

  fs.writeFileSync(
    path.join(ROOT, "version.json"),
    JSON.stringify({
      version: visibleVersion,
      build: cacheToken,
      cacheName,
      publishedAt: new Date().toISOString()
    }, null, 2),
    "utf8"
  );

  return { visibleVersion, cacheToken, cacheName };
}

async function verifierVersionEnLigne(version, attempts = 36) {
  return new Promise(resolve => {
    let count = 0;
    const check = () => {
      count += 1;
      https.get(
        `${VERSION_URL}?ts=${Date.now()}`,
        { headers: { "Cache-Control": "no-cache", "User-Agent": "Dojo-Manager-V48" } },
        response => {
          let body = "";
          response.on("data", chunk => body += chunk);
          response.on("end", () => {
            try {
              if (JSON.parse(body).version === version) {
                resolve(true);
                return;
              }
            } catch (_) {}
            if (count >= attempts) resolve(false);
            else setTimeout(check, 5000);
          });
        }
      ).on("error", () => {
        if (count >= attempts) resolve(false);
        else setTimeout(check, 5000);
      });
    };
    check();
  });
}

async function publish(payload) {
  if (
    !payload?.donnees?.fitness?.cours ||
    !payload?.donnees?.martial?.cours
  ) {
    throw new Error("Les données du planning sont incomplètes.");
  }

  await verifierDepot();

  const history = lireHistorique();
  const buildNumber = prochainBuild(history);
  const { visibleVersion } = updateMobileFiles(payload, buildNumber);

  history.unshift({
    build: buildNumber,
    version: visibleVersion,
    date: new Date().toISOString(),
    fitness: payload.donnees.fitness.cours.length,
    martial: payload.donnees.martial.cours.length
  });
  fs.writeFileSync(
    path.join(ROOT, "publication-history.json"),
    JSON.stringify(history.slice(0, 100), null, 2),
    "utf8"
  );

  await run("git", ["add", "-A"]);
  const status = await run("git", ["status", "--porcelain"]);

  if (status.trim()) {
    await run("git", ["commit", "-m", `${visibleVersion} - Mise à jour automatique du planning`]);
  }

  /*
   * Dépôt mono-utilisateur : la version locale fonctionnelle devient la référence.
   * --force-with-lease évite d'écraser une modification distante inconnue.
   */
  await run("git", ["fetch", "origin", "main"]);
  await run("git", ["push", "--force-with-lease", "origin", "HEAD:main"]);

  const online = await verifierVersionEnLigne(visibleVersion, 1);

  return {
    ok: true,
    unchanged: false,
    online,
    pending: !online,
    version: visibleVersion,
    fitness: payload.donnees.fitness.cours.length,
    martial: payload.donnees.martial.cours.length
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/api/status") {
    try {
      const root = await verifierDepot();
      sendJson(res, 200, { ok: true, root });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: error.message });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/api/publish") {
    try {
      const payload = JSON.parse(await readBody(req));
      sendJson(res, 200, await publish(payload));
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { ok: false, error: error.message });
    }
    return;
  }

  const clean = decodeURIComponent((req.url || "/").split("?")[0]);
  const relative = clean === "/" ? "planning-affiche.html" : clean.replace(/^\/+/, "");
  const file = path.resolve(ROOT, relative);

  if (!file.startsWith(path.resolve(ROOT))) {
    res.writeHead(403);
    res.end("Accès refusé");
    return;
  }

  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Fichier introuvable");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType(file),
      "Cache-Control": "no-store"
    });
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Dojo Manager prêt : http://127.0.0.1:${PORT}/planning-affiche.html`);
});
