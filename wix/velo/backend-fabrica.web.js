// backend/fabrica.web.js — Fábrica Quick GO
// Guarda e entrega os dados da fábrica (coleção FabricaDados) conforme o perfil de quem entrou.
// As senhas e a chave de assinatura ficam só aqui no servidor; o navegador nunca as vê.
// CÓPIA PARA O REPOSITÓRIO: os valores de SENHAS e CHAVE foram retirados e só existem no editor do Wix.
import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import crypto from "crypto";

const COLECAO = "FabricaDados";
// SHA-256 de "qg-fabrica:<senha>"
const SENHAS = {
  // "<sha256 de qg-fabrica:senha>": "tecnico" | "admin"  (valores reais só no editor do Wix)
};
const CHAVE = "<chave secreta de assinatura, só no editor do Wix>";
const VALIDADE_MS = 12 * 60 * 60 * 1000; // 12 horas
const opts = { suppressAuth: true };

// Coleções que só a administração lê e altera
const SO_ADMIN = ["precos", "compras", "links", "frota_unidades", "frota_maquinas", "frota_movimentos"]; // frota: só administração lê e altera
const SO_ADMIN_DOCS = ["config/geral"];
// Coleções que todos leem, mas só a administração altera
const ESCRITA_ADMIN = ["pracas", "arquivos"];

const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
const assinar = (p) => crypto.createHmac("sha256", CHAVE).update(p).digest("hex");
function gerarToken(perfil) {
  const exp = Date.now() + VALIDADE_MS;
  const p = Buffer.from(JSON.stringify({ perfil, exp })).toString("base64");
  return { token: p + "." + assinar(p), perfil, exp };
}
function lerToken(token) {
  if (!token || typeof token !== "string" || token.indexOf(".") < 0) throw erro("sessao", "Sessão inválida");
  const [p, s] = token.split(".");
  const esperado = assinar(p);
  if (s.length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(esperado))) throw erro("sessao", "Sessão inválida");
  const d = JSON.parse(Buffer.from(p, "base64").toString());
  if (d.exp < Date.now()) throw erro("sessao", "Sessão expirada");
  return d.perfil;
}
function erro(code) { return new Error(code); }
const podeLer = (perfil, col, id) => perfil === "admin" || (!SO_ADMIN.includes(col) && !SO_ADMIN_DOCS.includes(col + "/" + id));
const ESCRITA_TECNICO = ["itens", "movs", "producao"];
const podeEscrever = (perfil, col, id) => perfil === "admin" || ESCRITA_TECNICO.includes(col) || (col === "config" && id === "montagem");

const tentativas = {};
export const entrar = webMethod(Permissions.Anyone, async (senha) => {
  const agora = Date.now();
  const t = (tentativas.g = tentativas.g || { n: 0, ate: 0 });
  if (t.ate > agora) throw erro("bloqueado", "Aguarde");
  const perfil = SENHAS[hash("qg-fabrica:" + String(senha || "").trim().toLowerCase())];
  if (!perfil) { t.n++; if (t.n >= 8) { t.ate = agora + 60000; t.n = 0; } throw erro("senha", "Senha incorreta"); }
  t.n = 0;
  return gerarToken(perfil);
});

export const carregar = webMethod(Permissions.Anyone, async (token) => {
  const perfil = lerToken(token);
  const out = {};
  let res = await wixData.query(COLECAO).limit(1000).find(opts);
  const juntar = (items) => items.forEach((it) => { if (podeLer(perfil, it.colecao, it.docId)) (out[it.colecao] = out[it.colecao] || {})[it.docId] = it.dados || {}; });
  juntar(res.items);
  while (res.hasNext()) { res = await res.next(); juntar(res.items); }
  return out;
});

export const salvar = webMethod(Permissions.Anyone, async (token, col, id, dados) => {
  const perfil = lerToken(token);
  if (!podeEscrever(perfil, col, id)) throw erro("permissao", "Sem permissão");
  if (perfil !== "admin" && col === "itens") {
    // Montagem Técnica só altera estoque e mínimo de itens já existentes
    const atual = await wixData.get(COLECAO, col + "__" + id, opts);
    if (!atual) throw erro("permissao", "Sem permissão");
    dados = { ...atual.dados, estoque: dados.estoque, minimo: dados.minimo };
  }
  await wixData.save(COLECAO, { _id: col + "__" + id, colecao: col, docId: id, dados }, opts);
  return true;
});

export const atualizar = webMethod(Permissions.Anyone, async (token, col, id, patch) => {
  const perfil = lerToken(token);
  if (!podeEscrever(perfil, col, id)) throw erro("permissao", "Sem permissão");
  const atual = await wixData.get(COLECAO, col + "__" + id, opts);
  if (!atual) throw erro("inexistente", "Documento não encontrado");
  let p = patch || {};
  if (perfil !== "admin" && col === "itens") p = Object.fromEntries(Object.entries(p).filter(([k]) => k === "estoque" || k === "minimo"));
  atual.dados = { ...(atual.dados || {}), ...p };
  await wixData.update(COLECAO, atual, opts);
  return true;
});

export const excluir = webMethod(Permissions.Anyone, async (token, col, id) => {
  const perfil = lerToken(token);
  if (perfil !== "admin") throw erro("permissao", "Sem permissão");
  await wixData.remove(COLECAO, col + "__" + id, opts);
  return true;
});
