import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

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

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// --- API Endpoints ---

// 1. Unified database endpoint for React initial state
app.get("/api/db", (req, res) => {
  const db = readDatabase();
  // Exclude sensitive user and order data from public endpoint
  const { users, orders, ...publicDb } = db;
  res.json(publicDb);
});

// 2. Chatbot Gemini AI Technical Assistant
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, currentProductContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Mensagens inválidas ou ausentes." });
  }

  const db = readDatabase();
  const allProductsText = db.products
    .map((p: any) => `- ${p.name} (ID: ${p.id}): ${p.summary}. Preço base: R$ ${p.price}. Categoria: ${p.category}. Embalagem: ${p.filters?.embalagem || ""}. Secagem: ${p.filters?.secagem || ""}. Rendimento: ${p.filters?.rendimento || ""}.`)
    .join("\n");

  const allSchemesText = db.paintSchemes
    .map((s: any) => `- Esquema "${s.name}" para superfície de ${s.surface}: ${s.description}.`)
    .join("\n");

  const systemPrompt = `Você é o assistente virtual da "Canal Visual - Revendedora Autorizada de tintas WEG". Seu objetivo é prestar suporte técnico de alto nível sobre tintas, vernizes, catalisadores e acessórios WEG.
Seja sempre extremamente cordial, profissional e use português do Brasil de fácil compreensão.

Aqui estão informações técnicas do catálogo atual da Canal Visual:
PRODUTOS DISPONÍVEIS:
${allProductsText}

ESQUEMAS DE PINTURA RECOMENDADOS:
${allSchemesText}

${currentProductContext ? `CONTEXTO DO PRODUTO QUE O USUÁRIO ESTÁ VISUALIZANDO AGORA:\n- Nome: ${currentProductContext.name}\n- Descrição: ${currentProductContext.description}\n- Rendimento/Secagem: ${JSON.stringify(currentProductContext.filters)}` : ""}

Diretrizes de resposta:
1. Responda detalhadamente sobre tempos de secagem (ao toque, manuseio, cura total), proporção de catálise (mistura de tinta com catalisador), superfícies adequadas (concreto, metal, aço carbono) e quantidade de demãos recomendadas.
2. Promova e recommende os produtos e esquemas acima de forma assertiva de acordo com a necessidade descrita (ex: para piso de concreto, sugira o W-POXI; para proteção externa contra raios UV em portões de ferro, recomende o W-THANE).
3. Se o cliente demonstrar interesse em fechar uma compra ou obter orçamento personalizado, ofereça redirecionar ou simular o contato com um consultor comercial via WhatsApp (número fictício ou real que ele possa clicar).
4. Mantenha as respostas bem formatadas em markdown para fácil leitura.`;

  try {
    // We format messages into standard Gemini SDK content parts.
    // Standard chat model works with roles 'user' and 'model' (or 'assistant').
    const chatContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // Generate content using gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const aiText = response.text || "Desculpe, não consegui processar sua resposta no momento.";
    res.json({ text: aiText });
  } catch (error: any) {
    console.error("Erro na API do Gemini:", error);
    res.status(500).json({
      text: "Olá! Notei que estamos com uma pequena instabilidade técnica para processar perguntas por IA agora. Como revendedora autorizada WEG, eu posso te dizer que nossas tintas principais são o W-THANE SRD 501 (Poliuretano) e o W-POXI IND 322 (Epóxi). Para qual superfície você gostaria de uma recomendação técnica?",
    });
  }
});

// 3. Products Endpoints
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
  const index = db.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    writeDatabase(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: "Produto não encontrado." });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const originalLength = db.products.length;
  db.products = db.products.filter((p: any) => p.id !== id);
  if (db.products.length < originalLength) {
    writeDatabase(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Produto não encontrado." });
  }
});

// 4. CSV Import / Export
app.get("/api/products-csv/export", (req, res) => {
  const db = readDatabase();
  const products = db.products;

  // Build CSV headers
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
    "seo_description",
  ];

  const escapeCSV = (str: string) => {
    if (!str) return '""';
    const clean = str.replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = products.map((p: any) => [
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
    escapeCSV(p.seo?.description || ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=catalogo_produtos_weg.csv");
  res.send(csvContent);
});

app.post("/api/products-csv/import", (req, res) => {
  const csvText = req.body;
  if (!csvText || typeof csvText !== "string") {
    return res.status(400).json({ error: "Corpo da requisição CSV vazio ou inválido." });
  }

  try {
    const lines = csvText.split("\n").filter((l) => l.trim() !== "");
    if (lines.length <= 1) {
      return res.status(400).json({ error: "CSV não contém dados para importar." });
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const db = readDatabase();

    // Simple CSV parser supporting quotes
    const parseCSVLine = (line: string) => {
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
        // Fallback default colors if JSON parsing fails
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
          rendimento: pRendimento,
        },
        seo: {
          title: pSeoTitle,
          description: pSeoDesc,
        },
        relatedIds: [],
      };

      const existingIndex = db.products.findIndex((prod: any) => prod.id === pId);
      if (existingIndex !== -1) {
        db.products[existingIndex] = updatedProduct;
      } else {
        db.products.push(updatedProduct);
      }
      importedCount++;
    }

    writeDatabase(db);
    res.json({ success: true, count: importedCount });
  } catch (err: any) {
    console.error("Erro de importação CSV:", err);
    res.status(500).json({ error: "Falha ao analisar arquivo CSV. Verifique a formatação." });
  }
});

// 5. Categories Tree CRUD
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
  const index = db.categories.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    db.categories[index] = { ...db.categories[index], ...req.body };
    writeDatabase(db);
    res.json(db.categories[index]);
  } else {
    res.status(404).json({ error: "Categoria não encontrada" });
  }
});

app.delete("/api/categories/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.categories = db.categories.filter((c: any) => c.id !== id);
  // Re-parent children if any
  db.categories.forEach((c: any) => {
    if (c.parentId === id) c.parentId = null;
  });
  writeDatabase(db);
  res.json({ success: true });
});

// 6. Pages Tree CMS CRUD
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
  const index = db.pages.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    db.pages[index] = { ...db.pages[index], ...req.body };
    writeDatabase(db);
    res.json(db.pages[index]);
  } else {
    res.status(404).json({ error: "Página não encontrada." });
  }
});

app.delete("/api/pages/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.pages = db.pages.filter((p: any) => p.id !== id);
  // Set parentId to null for subpages of the deleted page
  db.pages.forEach((p: any) => {
    if (p.parentId === id) p.parentId = null;
  });
  writeDatabase(db);
  res.json({ success: true });
});

// 7. Paint Schemes CRUD
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
  const index = db.paintSchemes.findIndex((s: any) => s.id === id);
  if (index !== -1) {
    db.paintSchemes[index] = { ...db.paintSchemes[index], ...req.body };
    writeDatabase(db);
    res.json(db.paintSchemes[index]);
  } else {
    res.status(404).json({ error: "Esquema não encontrado." });
  }
});

app.delete("/api/paint-schemes/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.paintSchemes = db.paintSchemes.filter((s: any) => s.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// 8. Media Library Folder & Files
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
  db.mediaFolders = db.mediaFolders.filter((f: any) => f.id !== id);
  // Re-parent nested files and subfolders
  db.mediaFiles.forEach((file: any) => {
    if (file.folderId === id) file.folderId = null;
  });
  db.mediaFolders.forEach((fol: any) => {
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
  db.mediaFiles = db.mediaFiles.filter((f: any) => f.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// 9. Orders Placement
app.post("/api/orders", (req, res) => {
  const db = readDatabase();
  const newOrder = req.body;
  newOrder.id = "ped-" + Math.floor(1000 + Math.random() * 9000);
  newOrder.date = new Date().toISOString();
  db.orders.push(newOrder);
  writeDatabase(db);
  res.status(201).json(newOrder);
});

// 10. Dynamic SEO Sitemap & Robots
app.get("/sitemap.xml", (req, res) => {
  const db = readDatabase();
  const appUrl = process.env.APP_URL || "https://canalvisual.com.br";
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Dynamic pages from CMS page tree
  db.pages.forEach((page: any) => {
    const slugPath = page.slug === "home" ? "" : `/${page.slug}`;
    xml += `
  <url>
    <loc>${appUrl}${slugPath}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page.slug === "home" ? "1.0" : "0.8"}</priority>
  </url>`;
  });

  // Dynamic products from Catalogue
  db.products.forEach((p: any) => {
    xml += `
  <url>
    <loc>${appUrl}/produtos/${p.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Dynamic paint schemes
  db.paintSchemes.forEach((s: any) => {
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

// Serve frontend with Vite integration or compiled production dist
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
