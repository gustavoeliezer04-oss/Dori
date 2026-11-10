import http from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import initSqlJs from "sql.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "memory-piece.sqlite");
const SESSION_DAYS = 30;
const MIME = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".ico":"image/x-icon" };
const SQL = await initSqlJs();
let db = existsSync(DB_FILE) ? new SQL.Database(new Uint8Array(readFileSync(DB_FILE))) : new SQL.Database();

db.run(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','normal','hard')),
    best_seconds INTEGER NOT NULL,
    best_moves INTEGER NOT NULL,
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, difficulty)
  );
`);
await mkdir(DATA_DIR, { recursive: true });
function persist() { writeFileSync(DB_FILE, Buffer.from(db.export())); }
persist();

function query(sql, params = []) {
  const statement = db.prepare(sql);
  try {
    statement.bind(params);
    const rows = [];
    while (statement.step()) rows.push(statement.getAsObject());
    return rows;
  } finally { statement.free(); }
}
function execute(sql, params = []) { db.run(sql, params); persist(); }
function hashToken(token) { return createHash("sha256").update(token).digest("hex"); }
function cookieValue(header, name) {
  const part = (header || "").split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : "";
}
function send(res, status, body, extraHeaders = {}) {
  res.writeHead(status, { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff", ...extraHeaders });
  res.end(JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => { raw += chunk; if (raw.length > 16_384) { reject(new Error("Corpo muito grande")); req.destroy(); } });
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { reject(new Error("JSON inválido")); } });
    req.on("error", reject);
  });
}
function currentUser(req) {
  const token = cookieValue(req.headers.cookie, "mp_session");
  if (!token) return null;
  const rows = query(`SELECT users.id, users.username, users.email
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?`, [hashToken(token), Date.now()]);
  return rows[0] || null;
}
function createSession(userId, res) {
  const token = randomBytes(32).toString("hex");
  const expires = Date.now() + SESSION_DAYS * 86400000;
  execute("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)", [hashToken(token), userId, expires]);
  res.setHeader("Set-Cookie", `mp_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}`);
}
function publicUser(user) { return { id:user.id, username:user.username, email:user.email }; }

async function api(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") return send(res, 200, { ok:true, database:"SQLite local", environment:"development" });
  if (req.method === "POST" && url.pathname === "/api/register") {
    const body = await readBody(req);
    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!/^[\p{L}\p{N}_-]{3,20}$/u.test(username)) return send(res, 400, { error:"O nome deve ter de 3 a 20 caracteres (letras, números, _ ou -)." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) return send(res, 400, { error:"Informe um e-mail válido." });
    if (password.length < 8 || password.length > 128) return send(res, 400, { error:"A senha precisa ter entre 8 e 128 caracteres." });
    const salt = randomBytes(16).toString("hex");
    const passwordHash = scryptSync(password, salt, 64).toString("hex");
    try {
      execute("INSERT INTO users(username,email,password_hash,password_salt) VALUES(?,?,?,?)", [username,email,passwordHash,salt]);
      const user = query("SELECT id,username,email FROM users WHERE email = ?", [email])[0];
      createSession(user.id, res);
      return send(res, 201, { user:publicUser(user) });
    } catch (error) {
      if (String(error).includes("UNIQUE")) return send(res, 409, { error:"Este e-mail já está cadastrado." });
      throw error;
    }
  }
  if (req.method === "POST" && url.pathname === "/api/login") {
    const body = await readBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = query("SELECT id,username,email,password_hash,password_salt FROM users WHERE email = ?", [email])[0];
    if (!user) return send(res, 401, { error:"E-mail ou senha incorretos." });
    const candidate = scryptSync(password, user.password_salt, 64);
    const stored = Buffer.from(user.password_hash, "hex");
    if (candidate.length !== stored.length || !timingSafeEqual(candidate, stored)) return send(res, 401, { error:"E-mail ou senha incorretos." });
    createSession(user.id, res);
    return send(res, 200, { user:publicUser(user) });
  }
  if (req.method === "POST" && url.pathname === "/api/logout") {
    const token = cookieValue(req.headers.cookie, "mp_session");
    if (token) execute("DELETE FROM sessions WHERE token_hash = ?", [hashToken(token)]);
    return send(res, 200, { ok:true }, { "Set-Cookie":"mp_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" });
  }
  if (req.method === "GET" && url.pathname === "/api/me") {
    const user = currentUser(req);
    return user ? send(res, 200, { user:publicUser(user) }) : send(res, 401, { error:"Não autenticado." });
  }
  if (url.pathname.startsWith("/api/")) {
    const user = currentUser(req);
    if (!user) return send(res, 401, { error:"Entre na sua conta para acessar os recordes." });
    if (req.method === "GET" && url.pathname === "/api/records") {
      const records = query("SELECT difficulty,best_seconds AS seconds,best_moves AS moves,completed_at AS completedAt FROM records WHERE user_id = ?", [user.id]);
      return send(res, 200, { records });
    }
    if (req.method === "POST" && url.pathname === "/api/records") {
      const body = await readBody(req);
      const { difficulty, seconds, moves } = body;
      if (!["easy","normal","hard"].includes(difficulty)) return send(res, 400, { error:"Dificuldade inválida." });
      if (!Number.isInteger(seconds) || seconds < 1 || seconds > 86400 || !Number.isInteger(moves) || moves < 1 || moves > 10000) return send(res, 400, { error:"Resultado inválido." });
      const previous = query("SELECT best_seconds AS seconds,best_moves AS moves FROM records WHERE user_id = ? AND difficulty = ?", [user.id,difficulty])[0];
      const isRecord = !previous || seconds < previous.seconds || (seconds === previous.seconds && moves < previous.moves);
      if (isRecord) {
        execute(`INSERT INTO records(user_id,difficulty,best_seconds,best_moves,completed_at)
          VALUES(?,?,?,?,CURRENT_TIMESTAMP)
          ON CONFLICT(user_id,difficulty) DO UPDATE SET
          best_seconds=excluded.best_seconds,best_moves=excluded.best_moves,completed_at=CURRENT_TIMESTAMP`,
          [user.id,difficulty,seconds,moves]);
      }
      const record = query("SELECT difficulty,best_seconds AS seconds,best_moves AS moves,completed_at AS completedAt FROM records WHERE user_id = ? AND difficulty = ?", [user.id,difficulty])[0];
      return send(res, 200, { isRecord, record });
    }
    return send(res, 404, { error:"Rota não encontrada." });
  }
  return send(res, 404, { error:"Rota não encontrada." });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) return await api(req,res,url);
    if (req.method !== "GET" && req.method !== "HEAD") return send(res,405,{error:"Método não permitido."});
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";
    const filePath = path.resolve(ROOT, "." + pathname);
    if (!filePath.startsWith(ROOT + path.sep)) return send(res,403,{error:"Acesso negado."});
    try {
      const data = await readFile(filePath);
      res.writeHead(200, { "Content-Type":MIME[path.extname(filePath)] || "application/octet-stream", "X-Content-Type-Options":"nosniff" });
      return res.end(req.method === "HEAD" ? undefined : data);
    } catch { return send(res,404,{error:"Arquivo não encontrado."}); }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) send(res,500,{error:"Erro interno do servidor."});
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Memory Piece local: http://localhost:${PORT}`);
  console.log(`SQLite: ${DB_FILE}`);
});
