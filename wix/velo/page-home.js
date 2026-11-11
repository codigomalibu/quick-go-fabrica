import * as fab from "backend/fabrica.web";
import { authentication } from "wix-members-frontend";

// Ponte entre o app da fábrica (dentro do bloco HTML #html1) e o servidor.
$w.onReady(function () {
  const app = $w("#html1");
  app.onMessage(async (event) => {
    const m = event.data;
    if (!m || !m.qg) return;
    try {
      let res;
      if (m.op === "entrar") res = await fab.entrar(...m.args);
      else if (m.op === "google") {
        // Abre o login do Wix (com a opção Google) só se a pessoa ainda não entrou como membro
        if (!authentication.loggedIn()) {
          try { await authentication.promptLogin({ mode: "login", modal: true }); }
          catch (e) { throw new Error("cancelado"); }
        }
        res = await fab.entrarGoogle();
      }
      else if (m.op === "sairConta") { if (authentication.loggedIn()) await authentication.logout(); res = true; }
      else if (["carregar", "salvar", "atualizar", "excluir"].includes(m.op)) res = await fab[m.op](m.token, ...m.args);
      else throw new Error("Operação desconhecida");
      app.postMessage({ qg: 1, id: m.id, ok: true, res });
    } catch (err) {
      const msg = String((err && err.message) || "erro");
      app.postMessage({ qg: 1, id: m.id, ok: false, code: msg.replace(/^.*?(senha|bloqueado|sessao|permissao|inexistente|naocadastrado|cancelado|conta).*$/, "$1"), err: msg });
    }
  });
});
