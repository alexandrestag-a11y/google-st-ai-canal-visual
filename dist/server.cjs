var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
app.use(import_express.default.json({ limit: "10mb" }));
app.use(import_express.default.text({ limit: "10mb" }));
var DB_PATH = import_path.default.join(process.cwd(), "server", "db.json");
function readDatabase() {
  try {
    if (import_fs.default.existsSync(DB_PATH)) {
      const raw = import_fs.default.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Erro ao ler banco de dados JSON:", error);
  }
  return { products: [], categories: [], pages: [], paintSchemes: [], mediaFolders: [], mediaFiles: [], users: [], orders: [] };
}
function writeDatabase(data) {
  try {
    import_fs.default.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erro ao gravar no banco de dados JSON:", error);
  }
}
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
app.get("/api/db", (req, res) => {
  const db = readDatabase();
  const sanitizedDb = { ...db };
  delete sanitizedDb.users;
  delete sanitizedDb.orders;
  res.json(sanitizedDb);
});
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, currentProductContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Mensagens inv\xE1lidas ou ausentes." });
  }
  const db = readDatabase();
  const allProductsText = db.products.map((p) => `- ${p.name} (ID: ${p.id}): ${p.summary}. Pre\xE7o base: R$ ${p.price}. Categoria: ${p.category}. Embalagem: ${p.filters?.embalagem || ""}. Secagem: ${p.filters?.secagem || ""}. Rendimento: ${p.filters?.rendimento || ""}.`).join("\n");
  const allSchemesText = db.paintSchemes.map((s) => `- Esquema "${s.name}" para superf\xEDcie de ${s.surface}: ${s.description}.`).join("\n");
  const systemPrompt = `Voc\xEA \xE9 o assistente virtual da "Canal Visual - Revendedora Autorizada de tintas WEG". Seu objetivo \xE9 prestar suporte t\xE9cnico de alto n\xEDvel sobre tintas, vernizes, catalisadores e acess\xF3rios WEG.
Seja sempre extremamente cordial, profissional e use portugu\xEAs do Brasil de f\xE1cil compreens\xE3o.

Aqui est\xE3o informa\xE7\xF5es t\xE9cnicas do cat\xE1logo atual da Canal Visual:
PRODUTOS DISPON\xCDVEIS:
${allProductsText}

ESQUEMAS DE PINTURA RECOMENDADOS:
${allSchemesText}

${currentProductContext ? `CONTEXTO DO PRODUTO QUE O USU\xC1RIO EST\xC1 VISUALIZANDO AGORA:
- Nome: ${currentProductContext.name}
- Descri\xE7\xE3o: ${currentProductContext.description}
- Rendimento/Secagem: ${JSON.stringify(currentProductContext.filters)}` : ""}

Diretrizes de resposta:
1. Responda detalhadamente sobre tempos de secagem (ao toque, manuseio, cura total), propor\xE7\xE3o de cat\xE1lise (mistura de tinta com catalisador), superf\xEDcies adequadas (concreto, metal, a\xE7o carbono) e quantidade de dem\xE3os recomendadas.
2. Promova e recommende os produtos e esquemas acima de forma assertiva de acordo com a necessidade descrita (ex: para piso de concreto, sugira o W-POXI; para prote\xE7\xE3o externa contra raios UV em port\xF5es de ferro, recomende o W-THANE).
3. Se o cliente demonstrar interesse em fechar uma compra ou obter or\xE7amento personalizado, ofere\xE7a redirecionar ou simular o contato com um consultor comercial via WhatsApp (n\xFAmero fict\xEDcio ou real que ele possa clicar).
4. Mantenha as respostas bem formatadas em markdown para f\xE1cil leitura.`;
  try {
    const chatContents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });
    const aiText = response.text || "Desculpe, n\xE3o consegui processar sua resposta no momento.";
    res.json({ text: aiText });
  } catch (error) {
    console.error("Erro na API do Gemini:", error);
    res.status(500).json({
      text: "Ol\xE1! Notei que estamos com uma pequena instabilidade t\xE9cnica para processar perguntas por IA agora. Como revendedora autorizada WEG, eu posso te dizer que nossas tintas principais s\xE3o o W-THANE SRD 501 (Poliuretano) e o W-POXI IND 322 (Ep\xF3xi). Para qual superf\xEDcie voc\xEA gostaria de uma recomenda\xE7\xE3o t\xE9cnica?"
    });
  }
});
app.get("/api/products", (req, res) => {
  const db = readDatabase();
  res.json(db.products);
});
app.post("/api/products", (req, res) => {
  const db = readDatabase();
  const newProduct = req.body;
  if (!newProduct.id) {
    newProduct.id = "prod-" + Date.now();
  }
  db.products.push(newProduct);
  writeDatabase(db);
  res.status(201).json(newProduct);
});
app.put("/api/products/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const index = db.products.findIndex((p) => p.id === id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    writeDatabase(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: "Produto n\xE3o encontrado." });
  }
});
app.delete("/api/products/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const originalLength = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length < originalLength) {
    writeDatabase(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Produto n\xE3o encontrado." });
  }
});
app.get("/api/products-csv/export", (req, res) => {
  const db = readDatabase();
  const products = db.products;
  const headers = [
    "id",
    "name",
    "summary",
    "description",
    "category",
    "price",
    "image",
    "isPaint",
    "colors_json",
    "filter_secagem",
    "filter_brilho",
    "filter_embalagem",
    "filter_espessura",
    "filter_rendimento",
    "seo_title",
    "seo_description"
  ];
  const escapeCSV = (str) => {
    if (!str) return '""';
    const clean = str.replace(/"/g, '""');
    return `"${clean}"`;
  };
  const rows = products.map((p) => [
    p.id,
    escapeCSV(p.name),
    escapeCSV(p.summary),
    escapeCSV(p.description),
    p.category,
    p.price,
    escapeCSV(p.image),
    p.isPaint ? "true" : "false",
    escapeCSV(JSON.stringify(p.colors || [])),
    escapeCSV(p.filters?.secagem || ""),
    escapeCSV(p.filters?.brilho || ""),
    escapeCSV(p.filters?.embalagem || ""),
    escapeCSV(p.filters?.espessura || ""),
    escapeCSV(p.filters?.rendimento || ""),
    escapeCSV(p.seo?.title || ""),
    escapeCSV(p.seo?.description || "")
  ]);
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=catalogo_produtos_weg.csv");
  res.send(csvContent);
});
app.post("/api/products-csv/import", (req, res) => {
  const csvText = req.body;
  if (!csvText || typeof csvText !== "string") {
    return res.status(400).json({ error: "Corpo da requisi\xE7\xE3o CSV vazio ou inv\xE1lido." });
  }
  try {
    const lines = csvText.split("\n").filter((l) => l.trim() !== "");
    if (lines.length <= 1) {
      return res.status(400).json({ error: "CSV n\xE3o cont\xE9m dados para importar." });
    }
    const headers = lines[0].split(",").map((h) => h.trim());
    const db = readDatabase();
    const parseCSVLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    };
    let importedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      if (parts.length < 5) continue;
      const pId = parts[0] ? parts[0].trim() : "prod-" + Date.now() + "-" + i;
      const pName = parts[1] ? parts[1].trim() : "";
      const pSummary = parts[2] ? parts[2].trim() : "";
      const pDescription = parts[3] ? parts[3].trim() : "";
      const pCategory = parts[4] ? parts[4].trim() : "industrial";
      const pPrice = parseFloat(parts[5] || "0");
      const pImage = parts[6] ? parts[6].trim() : "";
      const pIsPaint = parts[7] ? parts[7].trim() === "true" : true;
      let pColors = [];
      try {
        if (parts[8]) {
          pColors = JSON.parse(parts[8].trim());
        }
      } catch (e) {
        pColors = [];
      }
      const pSecagem = parts[9] ? parts[9].trim() : "";
      const pBrilho = parts[10] ? parts[10].trim() : "";
      const pEmbalagem = parts[11] ? parts[11].trim() : "";
      const pEspessura = parts[12] ? parts[12].trim() : "";
      const pRendimento = parts[13] ? parts[13].trim() : "";
      const pSeoTitle = parts[14] ? parts[14].trim() : "";
      const pSeoDesc = parts[15] ? parts[15].trim() : "";
      const updatedProduct = {
        id: pId,
        name: pName,
        summary: pSummary,
        description: pDescription,
        category: pCategory,
        price: pPrice,
        image: pImage || "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600",
        isPaint: pIsPaint,
        colors: pColors,
        filters: {
          secagem: pSecagem,
          brilho: pBrilho,
          embalagem: pEmbalagem,
          espessura: pEspessura,
          rendimento: pRendimento
        },
        seo: {
          title: pSeoTitle,
          description: pSeoDesc
        },
        relatedIds: []
      };
      const existingIndex = db.products.findIndex((prod) => prod.id === pId);
      if (existingIndex !== -1) {
        db.products[existingIndex] = updatedProduct;
      } else {
        db.products.push(updatedProduct);
      }
      importedCount++;
    }
    writeDatabase(db);
    res.json({ success: true, count: importedCount });
  } catch (err) {
    console.error("Erro de importa\xE7\xE3o CSV:", err);
    res.status(500).json({ error: "Falha ao analisar arquivo CSV. Verifique a formata\xE7\xE3o." });
  }
});
app.post("/api/categories", (req, res) => {
  const db = readDatabase();
  const category = req.body;
  if (!category.id) {
    category.id = "cat-" + Date.now();
  }
  db.categories.push(category);
  writeDatabase(db);
  res.json(category);
});
app.put("/api/categories/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const index = db.categories.findIndex((c) => c.id === id);
  if (index !== -1) {
    db.categories[index] = { ...db.categories[index], ...req.body };
    writeDatabase(db);
    res.json(db.categories[index]);
  } else {
    res.status(404).json({ error: "Categoria n\xE3o encontrada" });
  }
});
app.delete("/api/categories/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.categories = db.categories.filter((c) => c.id !== id);
  db.categories.forEach((c) => {
    if (c.parentId === id) c.parentId = null;
  });
  writeDatabase(db);
  res.json({ success: true });
});
app.post("/api/pages", (req, res) => {
  const db = readDatabase();
  const page = req.body;
  if (!page.id) {
    page.id = "page-" + Date.now();
  }
  db.pages.push(page);
  writeDatabase(db);
  res.json(page);
});
app.put("/api/pages/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const index = db.pages.findIndex((p) => p.id === id);
  if (index !== -1) {
    db.pages[index] = { ...db.pages[index], ...req.body };
    writeDatabase(db);
    res.json(db.pages[index]);
  } else {
    res.status(404).json({ error: "P\xE1gina n\xE3o encontrada." });
  }
});
app.delete("/api/pages/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.pages = db.pages.filter((p) => p.id !== id);
  db.pages.forEach((p) => {
    if (p.parentId === id) p.parentId = null;
  });
  writeDatabase(db);
  res.json({ success: true });
});
app.post("/api/paint-schemes", (req, res) => {
  const db = readDatabase();
  const scheme = req.body;
  if (!scheme.id) {
    scheme.id = "scheme-" + Date.now();
  }
  db.paintSchemes.push(scheme);
  writeDatabase(db);
  res.json(scheme);
});
app.put("/api/paint-schemes/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const index = db.paintSchemes.findIndex((s) => s.id === id);
  if (index !== -1) {
    db.paintSchemes[index] = { ...db.paintSchemes[index], ...req.body };
    writeDatabase(db);
    res.json(db.paintSchemes[index]);
  } else {
    res.status(404).json({ error: "Esquema n\xE3o encontrado." });
  }
});
app.delete("/api/paint-schemes/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.paintSchemes = db.paintSchemes.filter((s) => s.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});
app.post("/api/media/folders", (req, res) => {
  const db = readDatabase();
  const folder = req.body;
  if (!folder.id) {
    folder.id = "folder-" + Date.now();
  }
  db.mediaFolders.push(folder);
  writeDatabase(db);
  res.json(folder);
});
app.delete("/api/media/folders/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.mediaFolders = db.mediaFolders.filter((f) => f.id !== id);
  db.mediaFiles.forEach((file) => {
    if (file.folderId === id) file.folderId = null;
  });
  db.mediaFolders.forEach((fol) => {
    if (fol.parentId === id) fol.parentId = null;
  });
  writeDatabase(db);
  res.json({ success: true });
});
app.post("/api/media/files", (req, res) => {
  const db = readDatabase();
  const file = req.body;
  if (!file.id) {
    file.id = "file-" + Date.now();
  }
  db.mediaFiles.push(file);
  writeDatabase(db);
  res.json(file);
});
app.delete("/api/media/files/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.mediaFiles = db.mediaFiles.filter((f) => f.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});
app.get("/api/categories", (req, res) => {
  res.json(readDatabase().categories || []);
});
app.get("/api/pages", (req, res) => {
  res.json(readDatabase().pages || []);
});
app.get("/api/paint-schemes", (req, res) => {
  res.json(readDatabase().paintSchemes || []);
});
app.get("/api/media/folders", (req, res) => {
  res.json(readDatabase().mediaFolders || []);
});
app.get("/api/media/files", (req, res) => {
  res.json(readDatabase().mediaFiles || []);
});
app.get("/api/orders", (req, res) => {
  const orders = readDatabase().orders || [];
  const sanitizedOrders = orders.map((o) => ({
    ...o,
    userEmail: o.userEmail ? o.userEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3") : void 0,
    userName: o.userName ? o.userName.replace(/(.{2})(.*)/, "$1***") : void 0
  }));
  res.json(sanitizedOrders);
});
app.post("/api/orders", (req, res) => {
  const db = readDatabase();
  const newOrder = req.body;
  if (!newOrder || !newOrder.items || !Array.isArray(newOrder.items) || newOrder.items.length === 0) {
    return res.status(400).json({ error: "Carrinho de compras vazio ou inv\xE1lido." });
  }
  newOrder.id = "ped-" + Math.floor(1e3 + Math.random() * 9e3);
  newOrder.date = (/* @__PURE__ */ new Date()).toISOString();
  db.orders.push(newOrder);
  writeDatabase(db);
  res.status(201).json(newOrder);
});
app.get("/sitemap.xml", (req, res) => {
  const db = readDatabase();
  const appUrl = process.env.APP_URL || "https://canalvisual.com.br";
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  db.pages.forEach((page) => {
    const slugPath = page.slug === "home" ? "" : `/${page.slug}`;
    xml += `
  <url>
    <loc>${appUrl}${slugPath}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page.slug === "home" ? "1.0" : "0.8"}</priority>
  </url>`;
  });
  db.products.forEach((p) => {
    xml += `
  <url>
    <loc>${appUrl}/produtos/${p.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });
  db.paintSchemes.forEach((s) => {
    xml += `
  <url>
    <loc>${appUrl}/esquemas-pintura/${s.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });
  xml += `
</urlset>`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(xml);
});
app.get("/robots.txt", (req, res) => {
  const appUrl = process.env.APP_URL || "https://canalvisual.com.br";
  const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${appUrl}/sitemap.xml
`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(content);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
