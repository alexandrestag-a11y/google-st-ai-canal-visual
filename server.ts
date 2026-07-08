import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "canal-visual-secret-key-2026";

// Setup parser for JSON and text payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.text({ limit: "10mb" }));

// Path to the database
const DB_PATH = path.join(process.cwd(), "server", "db.json");

// Helper to read DB
function readDatabase(): any {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Erro ao ler banco de dados JSON:", error);
  }
  return { products: [], categories: [], pages: [], paintSchemes: [], mediaFolders: [], mediaFiles: [], users: [], orders: [] };
}

// Helper to write DB
function writeDatabase(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erro ao gravar no banco de dados JSON:", error);
  }
}

// --- Middleware: Auth ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Acesso negado. Token não fornecido." });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Token inválido ou expirado." });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Acesso restrito a administradores." });
  }
};

// Initialize Gemini Client
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || "dummy-key");

// --- API Endpoints ---

// 0. Auth Endpoints
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = readDatabase();
  const user = db.users.find((u: any) => u.email === email);

  if (!user) return res.status(400).json({ error: "Usuário não encontrado." });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ error: "Senha incorreta." });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });

  const { password: _, ...userWithoutPass } = user;
  res.json({ token, user: userWithoutPass });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  const db = readDatabase();

  if (db.users.some((u: any) => u.email === email)) {
    return res.status(400).json({ error: "E-mail já cadastrado." });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: "user-" + Date.now(),
    email,
    password: hashedPassword,
    name,
    role: 'client',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=005792&color=fff`
  };

  db.users.push(newUser);
  writeDatabase(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '8h' });
  const { password: _, ...userWithoutPass } = newUser;
  res.status(201).json({ token, user: userWithoutPass });
});

// 1. Unified database endpoint for React initial state
app.get("/api/db", (req, res) => {
  const db = readDatabase();
  // Filter out sensitive info
  const publicDb = { ...db, users: db.users.map(({password, ...u}: any) => u) };
  res.json(publicDb);
});

// 2. Chatbot Gemini AI Technical Assistant
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, currentProductContext } = req.body;
  const db = readDatabase();

  const allProductsText = db.products.slice(0, 20)
    .map((p: any) => `- ${p.name}: ${p.resumo_produto_weg}. Linha: ${p.linha_weg}.`)
    .join("\n");

  const systemPrompt = `Você é o assistente técnico da Canal Visual (Revenda WEG).
Responda dúvidas sobre tintas Epóxi, PU e esquemas de pintura.
Catálogo: ${allProductsText}`;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
    });

    const result = await chat.sendMessage(messages[messages.length - 1].text);
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (error: any) {
    res.status(500).json({ text: "O suporte técnico da Canal Visual está disponível. Como posso ajudar com sua pintura WEG?" });
  }
});

// 3. Products Endpoints (Protected)
app.get("/api/products", (req, res) => {
  const db = readDatabase();
  res.json(db.products);
});

app.post("/api/products", authenticateToken, isAdmin, (req, res) => {
  const db = readDatabase();
  const newProduct = req.body;
  if (!newProduct.id) newProduct.id = "prod-" + Date.now();
  db.products.push(newProduct);
  writeDatabase(db);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", authenticateToken, isAdmin, (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const index = db.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    writeDatabase(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: "Produto não encontrado." });
  }
});

app.delete("/api/products/:id", authenticateToken, isAdmin, (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.products = db.products.filter((p: any) => p.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// 4. CSV Import / Export
app.get("/api/products-csv/export", (req, res) => {
  const db = readDatabase();
  const products = db.products;

  // Header 63 fields + base
  const headers = [
    "id", "name", "price", "image", "category", "isPaint",
    "id_produto_interno_cv", "codigo_produto_weg", "sku_cv", "site_cv",
    "nome_comercial_canal_visual", "nome_produto_weg", "resumo_produto_weg",
    "descricao_produto_canal_visual", "superficie_aplicacao", "preparacao_superficie",
    "recomendacoes_uso", "descricao_tinta", "linha_weg", "linha_weg_descricao",
    "codigo_cv_linha_produtos", "caracteristica_especiais_sigla", "caracteristica_especiais",
    "funcao_tinta_sigla", "funcao_tinta", "sistema_de_resina_num", "sistema_resina",
    "peso", "altura", "largura", "comprimento", "cubagem", "solidos_volume",
    "componente_tinta", "diluente_etq", "diluicao_maxima_volume", "componente_b",
    "componente_c", "catalizacao_por_volume_a", "catalizacao_por_volume_b",
    "catalizacao_por_volume_c", "vida_util_mistura_25", "produto_equivalente_fab_tint",
    "espessura_por_demao_minima_seca", "espessura_por_demao_maxima_seca",
    "acabamento_pintura", "escala_brilho_minima", "escala_brilho_maxima",
    "secagem_toque_25", "secagem_ao_manuseio_25", "secagem_final_25",
    "seo_title", "seo_description"
  ];

  const escapeCSV = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = products.map((p: any) => headers.map(h => escapeCSV(p[h])));
  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=catalogo_canal_visual_weg.csv");
  res.send(csvContent);
});

app.post("/api/products-csv/import", authenticateToken, isAdmin, (req, res) => {
  const csvText = req.body;
  try {
    const lines = csvText.split("\n").filter((l: string) => l.trim() !== "");
    const headers = lines[0].split(",").map((h: string) => h.trim().replace(/"/g, ''));
    const db = readDatabase();

    const parseCSVLine = (line: string) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
          else inQuotes = !inQuotes;
        } else if (line[i] === "," && !inQuotes) { result.push(current); current = ""; }
        else current += line[i];
      }
      result.push(current);
      return result;
    };

    lines.slice(1).forEach((line: string) => {
      const parts = parseCSVLine(line);
      const product: any = { colors: [], relatedIds: [] };
      headers.forEach((h, idx) => {
        let val: any = parts[idx];
        if (h === "price") val = parseFloat(val || "0");
        if (h === "isPaint") val = val === "true";
        product[h] = val;
      });

      const existingIndex = db.products.findIndex((p: any) => p.id === product.id);
      if (existingIndex !== -1) db.products[existingIndex] = { ...db.products[existingIndex], ...product };
      else db.products.push(product);
    });

    writeDatabase(db);
    res.json({ success: true, count: lines.length - 1 });
  } catch (err) {
    res.status(500).json({ error: "Erro ao processar CSV." });
  }
});

// CMS and other endpoints (Tree) follow same pattern...
app.get("/api/pages", (req, res) => res.json(readDatabase().pages));
app.post("/api/pages", authenticateToken, isAdmin, (req, res) => {
  const db = readDatabase();
  const page = req.body;
  if (!page.id) page.id = "page-" + Date.now();
  db.pages.push(page);
  writeDatabase(db);
  res.json(page);
});

app.put("/api/pages/:id", authenticateToken, isAdmin, (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const idx = db.pages.findIndex((p: any) => p.id === id);
  if (idx !== -1) { db.pages[idx] = { ...db.pages[idx], ...req.body }; writeDatabase(db); res.json(db.pages[idx]); }
  else res.status(404).json({ error: "Página não encontrada" });
});

app.get("/api/categories", (req, res) => res.json(readDatabase().categories));
app.get("/api/paint-schemes", (req, res) => res.json(readDatabase().paintSchemes));
app.get("/api/media/folders", (req, res) => res.json(readDatabase().mediaFolders));
app.get("/api/media/files", (req, res) => res.json(readDatabase().mediaFiles));
app.get("/api/orders", (req, res) => res.json(readDatabase().orders));

// Serve frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
