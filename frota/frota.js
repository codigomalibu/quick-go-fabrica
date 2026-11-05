/* Frota Quick Go — módulo da aba Frota do site Quick Go Fábrica (só administradores).
   Uso: QGFrota.montar(elemento, {db, canWrite, user}); QGFrota.parar(); */
window.QGFrota = (function(){
'use strict';
const ESTILO = `
.qgf{--petroleo:#22343b;--petroleo-2:#172429;--petroleo-3:#2c434b;--linho:#faf0e6;--nevoa:#a9cad5;--mineral:#6f9ca7;--ambar:#d79a45;
  --texto:#faf0e6;--texto-2:#b3c4c8;--linha:#35505a;--campo:#1d2e34;
  --st-operando:#4fae7f;--st-manutencao:#e0604f;--st-acabamento:#e0a24a;--st-faltando:#e89a82;--st-a_produzir:#8494d4;
  --st-producao:#5aa6ba;--st-envio:#b98bb6;--st-devolucao:#8e9799;--st-aguardando:#a9cad5;
  --display:"Italiana","Didot","Bodoni 72",Georgia,serif;--rotulo:"Montserrat",system-ui,-apple-system,"Segoe UI",sans-serif;--corpo:"Anek Devanagari",system-ui,-apple-system,"Segoe UI",sans-serif;
  color-scheme:dark;background:var(--petroleo-2);color:var(--texto);font-family:var(--corpo);font-size:15px;line-height:1.45;
  display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:auto minmax(0,1fr);height:clamp(560px,calc(100svh - 190px),1000px);
  border-radius:22px;overflow:hidden;border:1px solid var(--linha);box-shadow:0 18px 50px rgba(14,23,27,.28)}
.qgf *{box-sizing:border-box}
.qgf button,.qgf select,.qgf input,.qgf textarea{font:inherit;color:inherit}
.qgf :focus-visible{outline:2px solid var(--ambar);outline-offset:2px}
.qgf .qgf-top{grid-column:1/-1;display:flex;align-items:center;gap:12px 22px;flex-wrap:wrap;background:var(--petroleo);border-bottom:1px solid var(--linha);padding:12px 16px}
.qgf .marca{display:flex;align-items:baseline;gap:12px;min-width:0;flex-wrap:wrap}
.qgf .marca h2{margin:0;font:400 28px/1 var(--display);color:var(--linho);letter-spacing:.01em}
.qgf .marca span{font:600 10.5px var(--rotulo);letter-spacing:.2em;text-transform:uppercase;color:var(--nevoa)}
.qgf .chips{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}
.qgf .chip{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--linha);background:var(--petroleo-2);border-radius:999px;padding:5px 11px 5px 9px;cursor:pointer;font:600 11px var(--rotulo);letter-spacing:.04em;color:var(--texto-2)}
.qgf .chip b{font-variant-numeric:tabular-nums;color:var(--linho);font-weight:700}
.qgf .chip i{width:9px;height:9px;border-radius:50%;display:inline-block}
.qgf .chip[aria-pressed="true"]{background:var(--linho);color:var(--petroleo);border-color:var(--linho)}
.qgf .chip[aria-pressed="true"] b{color:var(--petroleo)}
.qgf .chip.tot{cursor:default}
.qgf .palco{grid-column:1;grid-row:2;position:relative;min-height:0;overflow:hidden;background:#101b20}
.qgf #c{display:block;width:100%;height:100%;touch-action:none}
.qgf #labels{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.qgf .lbl{position:absolute;left:0;top:0;transform:translate(-50%,-100%);pointer-events:auto;cursor:pointer;white-space:nowrap;text-align:center;background:rgba(23,36,41,.82);border:1px solid var(--linha);border-radius:10px;padding:5px 10px 6px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:opacity .2s;font-weight:400;text-transform:none;letter-spacing:0}
.qgf .lbl .n{font:600 11.5px var(--rotulo);letter-spacing:.04em;color:var(--linho)}
.qgf .lbl .u{font:600 9.5px var(--rotulo);letter-spacing:.16em;color:var(--nevoa);margin-left:5px}
.qgf .lbl .d{display:flex;gap:4px;justify-content:center;margin-top:4px}
.qgf .lbl .d i{width:8px;height:8px;border-radius:50%}
.qgf .lbl .km{display:block;font:600 9.5px var(--rotulo);letter-spacing:.08em;color:var(--ambar);margin-top:2px}
.qgf #labels.longe .lbl{padding:3px 7px 4px;border-radius:8px}
.qgf #labels.longe .lbl .km,.qgf #labels.longe .lbl .u{display:none}
.qgf #labels.longe .lbl .d{margin-top:2px}
.qgf #labels.longe .lbl .n{font-size:10px}
.qgf #labels.longe .carga{font-size:8.5px;padding:2px 6px}
.qgf #labels.estreito .lbl{padding:3px 6px 4px;border-radius:7px}
.qgf #labels.estreito .lbl .n{font-size:9.5px}
.qgf #labels.estreito.longe .lbl{padding:2px 5px}
.qgf #labels.estreito.longe .lbl .n{font-size:8.5px;letter-spacing:0}
.qgf #labels.estreito.longe .lbl .d{display:none}
.qgf #labels.estreito.longe .carga{display:none}
.qgf .lbl.alvo{border-color:var(--ambar);box-shadow:0 0 0 2px rgba(215,154,69,.35)}
.qgf .lbl.fab{background:rgba(215,154,69,.16);border-color:rgba(215,154,69,.55)}
.qgf .carga{position:absolute;left:0;top:0;pointer-events:none;font:600 9.5px var(--rotulo);letter-spacing:.06em;color:#24190a;background:var(--ambar);border-radius:999px;padding:3px 8px;white-space:nowrap;transform:translate(-50%,-100%)}
.qgf .carga.volta{background:var(--st-devolucao);color:#101b20}
.qgf .dica{position:absolute;left:16px;bottom:14px;font:500 12px var(--rotulo);color:var(--texto-2);background:rgba(23,36,41,.78);border:1px solid var(--linha);border-radius:10px;padding:7px 11px;pointer-events:none;max-width:calc(100% - 330px)}
.qgf .vista{position:absolute;right:14px;bottom:14px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.qgf .modo{display:inline-flex;background:rgba(23,36,41,.85);border:1px solid var(--linha);border-radius:999px;padding:3px}
.qgf .modo button{border:0;background:transparent;border-radius:999px;padding:6px 13px;font:600 11.5px var(--rotulo);letter-spacing:.04em;cursor:pointer;color:var(--texto-2)}
.qgf .modo button[aria-pressed="true"]{background:var(--linho);color:var(--petroleo)}
.qgf .qbtn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--linha);background:var(--petroleo-2);border-radius:10px;padding:7px 12px;cursor:pointer;font:600 11.5px var(--rotulo);letter-spacing:.04em;color:var(--linho)}
.qgf .qbtn:hover{border-color:var(--mineral)}
.qgf .qbtn.pri{background:var(--ambar);border-color:var(--ambar);color:#24190a}
.qgf .qbtn.ghost{background:transparent}
.qgf .qbtn.perigo{color:#f19a8e;border-color:#6b3a35}
.qgf .qbtn:disabled{opacity:.45;cursor:not-allowed}
.qgf .tip{position:absolute;pointer-events:none;background:var(--linho);color:var(--petroleo);border-radius:8px;padding:6px 10px;font:500 13px var(--corpo);box-shadow:0 8px 24px rgba(0,0,0,.35);transform:translate(12px,12px);white-space:nowrap;z-index:2}
.qgf .tip b{font:600 11px var(--rotulo);letter-spacing:.06em;display:block}
.qgf .aviso{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px;color:var(--texto-2);pointer-events:none}
.qgf .aviso div{max-width:420px;background:rgba(23,36,41,.85);border:1px solid var(--linha);border-radius:14px;padding:20px 22px}
.qgf .aviso h2{font:400 28px/1.1 var(--display);color:var(--linho);margin:0 0 8px}
.qgf .lado{grid-column:2;grid-row:2;min-height:0;display:flex;flex-direction:column;background:var(--petroleo-2);border-left:1px solid var(--linha);position:relative}
.qgf .abas{display:flex;gap:4px;padding:10px 16px;border-bottom:1px solid var(--linha);background:var(--petroleo);flex-wrap:wrap}
.qgf .abas button[role="tab"]{border:0;background:transparent;border-radius:999px;padding:7px 14px;font:600 11.5px var(--rotulo);letter-spacing:.06em;cursor:pointer;color:var(--texto-2)}
.qgf .abas button[aria-selected="true"]{background:var(--linho);color:var(--petroleo)}
.qgf .abas .sp{flex:1}
.qgf .lista{flex:1;min-height:0;overflow:auto;padding:12px 16px 28px;display:flex;flex-direction:column;gap:10px}
.qgf .busca{width:100%;background:var(--campo);border:1px solid var(--linha);border-radius:10px;padding:8px 11px;box-shadow:none;color:var(--linho)}
.qgf .un{border:1px solid var(--linha);border-radius:12px;background:var(--petroleo);padding:10px 12px 12px;transition:border-color .15s,background .15s}
.qgf .un.over{border-color:var(--ambar);background:#2f3f3a}
.qgf .un.fab{background:linear-gradient(180deg,rgba(215,154,69,.12),rgba(215,154,69,.04));border-color:rgba(215,154,69,.45)}
.qgf .un.apagada{opacity:.4}
.qgf .un header{display:flex;align-items:baseline;gap:8px;cursor:pointer}
.qgf .un .nm{font:400 21px/1.1 var(--display);color:var(--linho);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.qgf .un .uf{font:600 10px var(--rotulo);letter-spacing:.16em;color:var(--nevoa)}
.qgf .un .num{margin-left:auto;font:600 10px var(--rotulo);color:var(--texto-2);font-variant-numeric:tabular-nums}
.qgf .un .nota{font-size:13px;color:var(--texto-2);margin-top:2px}
.qgf .un .comp{font:600 10px var(--rotulo);letter-spacing:.06em;color:var(--st-acabamento);margin-top:4px}
.qgf .mqs{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;min-height:34px}
.qgf .mq{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--linha);background:var(--petroleo-2);border-radius:8px;padding:5px 9px;cursor:grab;font:600 11px var(--rotulo);letter-spacing:.03em;color:var(--linho);user-select:none}
.qgf .mq:active{cursor:grabbing}
.qgf .mq i{width:9px;height:9px;border-radius:50%;flex:none}
.qgf .mq small{font:500 11px var(--corpo);color:var(--texto-2);letter-spacing:0}
.qgf .mq.dim{opacity:.3}
.qgf .mq.sel{border-color:var(--ambar)}
.qgf .vazio{font-size:13px;color:var(--texto-2);padding:6px 2px}
.qgf .movs{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.qgf .movs li{border:1px solid var(--linha);border-radius:10px;padding:8px 11px;background:var(--petroleo);font-size:14px}
.qgf .movs .t{font:600 10px var(--rotulo);letter-spacing:.1em;text-transform:uppercase;color:var(--nevoa)}
.qgf .legenda{display:grid;gap:8px}
.qgf .legenda div{display:grid;grid-template-columns:14px 1fr;gap:10px;align-items:start;font-size:14px}
.qgf .legenda i{width:12px;height:12px;border-radius:50%;margin-top:4px}
.qgf .legenda b{font:600 12px var(--rotulo);letter-spacing:.03em}
.qgf .legenda p{margin:0;color:var(--texto-2);font-size:13px}
.qgf .gaveta{position:absolute;inset:0;background:var(--petroleo-2);display:flex;flex-direction:column;z-index:5}
.qgf .gaveta .cab{padding:14px 16px;border-bottom:1px solid var(--linha);background:var(--petroleo);display:flex;align-items:center;gap:10px}
.qgf .gaveta .cab h2{margin:0;font:400 26px/1.05 var(--display);color:var(--linho);flex:1;min-width:0}
.qgf .gaveta .corpo{flex:1;overflow:auto;padding:16px;display:grid;gap:14px;align-content:start}
.qgf .ff{display:flex;flex-direction:column;gap:5px;font:600 10px var(--rotulo);letter-spacing:.14em;text-transform:uppercase;color:var(--texto-2)}
.qgf .ff input,.qgf .ff select,.qgf .ff textarea{font:400 15px var(--corpo);letter-spacing:0;text-transform:none;background:var(--campo);border:1px solid var(--linha);border-radius:10px;padding:8px 10px;color:var(--linho);box-shadow:none;width:100%;min-height:0}
.qgf .ff textarea{min-height:76px;resize:vertical}
.qgf .linha{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.qgf .acoes{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.qgf .conf{border:1px solid #6b3a35;background:rgba(224,96,79,.1);border-radius:10px;padding:10px 12px;font-size:14px;display:grid;gap:8px}
@media (max-width:900px){
  .qgf{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(380px,60svh) auto;height:auto}
  .qgf .lado{grid-column:1;grid-row:3;border-left:0;border-top:1px solid var(--linha);min-height:70svh}
  .qgf .chips{margin-left:0}
  .qgf .gaveta{position:fixed;z-index:30}
  .qgf .dica{display:none}
}
@media (max-width:700px){
  .qgf{border-radius:16px;grid-template-rows:auto minmax(340px,58svh) auto}
  .qgf .qgf-top{padding:10px 12px;gap:8px}
  .qgf .marca h2{font-size:22px}
  .qgf .marca span{font-size:9px;letter-spacing:.14em}
  .qgf .chips{flex-wrap:nowrap;overflow-x:auto;width:100%;scrollbar-width:none;padding-bottom:2px;-webkit-mask-image:linear-gradient(90deg,#000 90%,transparent);mask-image:linear-gradient(90deg,#000 90%,transparent)}
  .qgf .chips::-webkit-scrollbar{display:none}
  .qgf .chip{flex:none;min-height:34px}
  .qgf .vista{left:10px;right:10px;bottom:10px;justify-content:space-between}
  .qgf .modo button{padding:9px 12px}
  .qgf .qbtn{min-height:38px}
  .qgf .lado{min-height:0;max-height:78svh}
  .qgf .abas{padding:8px 10px}
  .qgf .abas button[role="tab"]{padding:9px 12px}
  .qgf .lista{padding:10px 12px 22px}
  .qgf .mq{min-height:36px;padding:7px 10px}
  .qgf .un .nm{font-size:19px}
  .qgf .lbl .n{font-size:10.5px}
  .qgf .linha{grid-template-columns:1fr}
  .qgf .ff input,.qgf .ff select,.qgf .ff textarea{font-size:16px;min-height:42px}
  .qgf .gaveta .acoes .qbtn{flex:1}
}
@media (prefers-reduced-motion:reduce){.qgf *{transition:none!important}}
`;
const MARKUP = `
  <div class="qgf-top">
    <div class="marca"><h2>Frota das microfranquias</h2><span>Mini Go &amp; Tech Go · só administradores</span></div>
    <div class="chips" id="chips" role="group" aria-label="Filtrar por status"></div>
  </div>
  <div class="palco" id="palco">
    <canvas id="c" aria-label="Pátio 3D com as unidades e suas máquinas"></canvas>
    <div id="labels"></div>
    <div class="tip" id="tip" hidden></div>
    <div class="aviso" id="aviso" hidden></div>
    <div class="dica" id="dica"></div>
    <div class="vista">
      <div class="modo" role="group" aria-label="Visualização">
        <button id="md-patio" type="button" aria-pressed="true" title="Unidades lado a lado, com a fábrica à frente">Pátio</button>
        <button id="md-rotas" type="button" aria-pressed="false" title="Mapa do Brasil com cada unidade sobre a sua cidade e caminhões saindo da fábrica">Mapa do Brasil</button>
      </div>
      <button class="qbtn" id="bt-geral" type="button">Visão geral</button>
    </div>
  </div>
  <div class="lado">
    <div class="abas" role="tablist">
      <button role="tab" id="ab-un" aria-selected="true">Unidades</button>
      <button role="tab" id="ab-mv" aria-selected="false">Movimentos</button>
      <button role="tab" id="ab-lg" aria-selected="false">Legenda</button>
      <span class="sp"></span>
      <button class="qbtn" id="bt-rel" type="button" title="Gera o status de todas as unidades para o financeiro">Relatório</button>
      <button class="qbtn" id="bt-nova" type="button" title="Cadastrar uma nova unidade com 2 Mini Go e 1 Tech Go">+ Unidade</button>
    </div>
    <div class="lista" id="lista"></div>
    <div class="gaveta" id="gaveta" hidden></div>
  </div>`;
let raiz = null, ATIVO = false, RAF = 0, iniciado = false, ultimoCw = null;
const API = {retomar:null, permissao:null};
function montar(alvo, ctx){
  if (!raiz){
    if (!document.getElementById('qgf-css')){ const st = document.createElement('style'); st.id = 'qgf-css'; st.textContent = ESTILO; document.head.appendChild(st); }
    raiz = document.createElement('div'); raiz.className = 'qgf'; raiz.innerHTML = MARKUP;
  }
  const novo = raiz.parentNode !== alvo;
  if (novo) alvo.replaceChildren(raiz);
  const cw = !!(ctx && ctx.canWrite);
  if (!iniciado){ iniciado = true; ATIVO = true; ultimoCw = cw; corpo(ctx); return; }
  if (cw !== ultimoCw){ ultimoCw = cw; if (API.permissao) API.permissao(cw); }
  if (novo || !ATIVO){ ATIVO = true; if (API.retomar) API.retomar(); }
}
function parar(){ ATIVO = false; }
function corpo(ctx){

const STATUS = {
  operando:   {n:'Operando',            d:'Máquina instalada e funcionando na unidade.'},
  manutencao: {n:'Em reparo',           d:'Precisa de conserto. Sinal vermelho pulsando no 3D.'},
  acabamento: {n:'Ajuste de acabamento',d:'Funciona, mas tem problema de acabamento a corrigir.'},
  faltando:   {n:'Falta entregar',      d:'A unidade ainda não recebeu esta máquina. Aparece só o contorno.'},
  a_produzir: {n:'A produzir',          d:'Ainda não entrou na linha de produção. Contorno tracejado.'},
  producao:   {n:'Em produção',         d:'Sendo montada na fábrica. O corpo sobe e desce como em construção.'},
  envio:      {n:'Em envio',            d:'Embalada e a caminho do franqueado. Aparece dentro do caixote.'},
  devolucao:  {n:'Devolução',           d:'Franquia devolvida; a máquina volta para a fábrica.'},
  aguardando: {n:'Aguardando compra',   d:'Franquia em negociação. Vaga reservada, sem máquina ainda.'},
};
const ORDEM = ['manutencao','acabamento','faltando','a_produzir','producao','envio','devolucao','aguardando','operando'];
const cssv = (k) => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
const COR_PADRAO = {operando:'#4fae7f', manutencao:'#e0604f', acabamento:'#e0a24a', faltando:'#e89a82', a_produzir:'#8494d4', producao:'#5aa6ba', envio:'#b98bb6', devolucao:'#8e9799', aguardando:'#a9cad5'};
const COR = Object.fromEntries(Object.keys(STATUS).map(k => [k, cssv('--st-' + k) || COR_PADRAO[k] || '#888']));
const MODELO = {MINI:'Mini Go', TECH:'Tech Go'};
const FAB = 'fabrica';
const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');

const S = {db:null, user:null, uid:null, canWrite:true, unidades:{}, maquinas:{}, movs:[], ok:{u:false,m:false}, erro:null};
const UI = {aba:'un', filtro:null, q:'', sel:null, gaveta:null, foco:null, modo:'patio'};
try { if (localStorage.getItem('qgf-vista') === 'rotas') UI.modo = 'rotas'; } catch(_){}
// Fábrica em Campo Grande - MS. Coordenadas (lat, lon) das cidades para a visão de rotas.
const FAB_LL = [-20.4697, -54.6201];
const GEO_LL = {'campo-grande':[-20.4697,-54.6201],'ponta-pora':[-22.5296,-55.7203],'dracena':[-21.4843,-51.535],'sinop':[-11.8642,-55.5066],'cuiaba':[-15.6014,-56.0979],
  'belo-horizonte':[-19.9167,-43.9345],'brasilia':[-15.7939,-47.8828],'sao-paulo':[-23.5505,-46.6333],'curitiba':[-25.4284,-49.2733],'manaus':[-3.119,-60.0217],
  'balneario-camboriu':[-26.9906,-48.6352],'uberlandia':[-18.9186,-48.2772],'dourados':[-22.2231,-54.812],'sao-gabriel-do-oeste':[-19.395,-54.5664],
  'sao-jose-do-rio-preto':[-20.8113,-49.3758],'bauru':[-22.3246,-49.0871]};
function kmDe(ll){ const R=6371, r=Math.PI/180; const [a1,o1]=FAB_LL, [a2,o2]=ll; const da=(a2-a1)*r, dlo=(o2-o1)*r;
  const h=Math.sin(da/2)**2+Math.cos(a1*r)*Math.cos(a2*r)*Math.sin(dlo/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }
function rumo(ll){ const r=Math.PI/180; const [a1,o1]=FAB_LL, [a2,o2]=ll; const y=Math.sin((o2-o1)*r)*Math.cos(a2*r);
  const x=Math.cos(a1*r)*Math.sin(a2*r)-Math.sin(a1*r)*Math.cos(a2*r)*Math.cos((o2-o1)*r); return Math.atan2(y,x); } // 0 = norte, horário
// Projeção do mapa: 1 unidade 3D ≈ 16,7 km (0,06 por km), norte para o fundo (-Z)
const MAPA = {k:.06, lat0:-14.5, lon0:-53, cos:Math.cos(14.5*Math.PI/180), esc:.55};
const mapXZ = (lat, lon) => ({x:(lon-MAPA.lon0)*MAPA.cos*111.2*MAPA.k, z:-(lat-MAPA.lat0)*111.2*MAPA.k});

const $ = (s, el=raiz) => el.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'unidade';
function toast(msg, err){ const t=document.createElement('div'); t.className='toast'+(err?' err':''); t.textContent=msg; t.setAttribute('role','status'); document.body.appendChild(t); setTimeout(()=>t.remove(), err?5200:2600); }
const unidadesOrd = () => Object.entries(S.unidades).map(([id,v])=>({id,...v})).sort((a,b)=>(a.ordem??999)-(b.ordem??999) || String(a.nome).localeCompare(String(b.nome)));
const maqsDe = (uid) => Object.entries(S.maquinas).map(([id,v])=>({id,...v})).filter(m => (m.unidade||FAB) === uid || (uid===FAB && !S.unidades[m.unidade] && m.unidade!==FAB))
  .sort((a,b)=> (a.modelo===b.modelo?0:a.modelo==='MINI'?-1:1) || String(a.serie||a.id).localeCompare(String(b.serie||b.id)));
const nomeUn = (id) => id===FAB ? 'Fábrica · Estoque' : (S.unidades[id]?.nome || 'Fábrica · Estoque');
const rotMq = (m) => (MODELO[m.modelo]||m.modelo) + (m.serie ? ' · ' + m.serie : '');
function saude(lista){ for (const k of ORDEM) if (lista.some(m=>m.status===k)) return k; return null; }

/* ---------------- dados ---------------- */
async function guard(fn, ok){
  if (!S.db){ toast('A base não está disponível nesta visualização. Entre na sua conta Claude para salvar.', true); return false; }
  if (!S.canWrite){ toast('Seu acesso a este painel é só de leitura.', true); return false; }
  try { await fn(); if (ok) toast(ok); return true; }
  catch(e){
    if (e && e.code==='invalid_argument'){ S.canWrite=false; toast('Seu perfil não pode alterar este painel.', true); }
    else if (e && e.code==='quota_exceeded') toast('A base atingiu o limite de registros.', true);
    else toast('Não foi possível salvar agora. Tente de novo em instantes.', true);
    renderAll(); return false;
  }
}
async function mover(id, para){
  const m = S.maquinas[id]; if (!m) return;
  const de = S.unidades[m.unidade] ? m.unidade : FAB;
  if (de === para) return;
  const ant = m.unidade;
  S.maquinas[id] = {...m, unidade: para}; renderAll();
  const ok = await guard(async () => {
    await S.db.doc('frota_maquinas/' + id).update({unidade: para});
    await S.db.collection('frota_movimentos').add({maquina:id, rotulo: rotMq(m), de, para, deNome: nomeUn(de), paraNome: nomeUn(para), status: m.status||'', ts: new Date().toISOString(), por: S.uid || null});
  }, rotMq(m) + ' → ' + nomeUn(para));
  if (!ok){ S.maquinas[id] = {...S.maquinas[id], unidade: ant}; renderAll(); }
}

async function boot(ctx){
  const db = ctx && ctx.db;
  if (!db){ S.erro='sem-db'; renderAll(); return; }
  S.db = db; S.canWrite = !!(ctx && ctx.canWrite);
  if (ctx.user && ctx.user.id) ctx.user.id().then(id => { S.uid = id; }).catch(()=>{});
  const timer = setTimeout(()=>{ if (!S.ok.u || !S.ok.m){ S.erro='lento'; renderAll(); } }, 10000);
  const fail = (e) => { clearTimeout(timer); S.erro = (e && e.code) || 'unavailable'; renderAll(); };
  const pronto = () => { if (S.ok.u && S.ok.m){ clearTimeout(timer); if (S.erro==='lento') S.erro=null; } };
  const cache = (s) => !!(s && s.metadata && s.metadata.fromCache);
  db.collection('frota_unidades').onSnapshot(s => { S.unidades = Object.fromEntries(s.docs.map(d=>[d.id, d.data()])); if(!cache(s)) S.ok.u=true; pronto(); renderAll(); }, fail);
  db.collection('frota_maquinas').onSnapshot(s => { S.maquinas = Object.fromEntries(s.docs.map(d=>[d.id, d.data()])); if(!cache(s)) S.ok.m=true; pronto(); renderAll(); }, fail);
  db.collection('frota_movimentos').orderBy('ts','desc').limit(40).onSnapshot(s => { S.movs = s.docs.map(d=>({id:d.id, ...d.data()})); if (UI.aba==='mv') renderLista(); }, ()=>{});
}
API.permissao = (cw) => { S.canWrite = !!cw; renderAll(); };

/* ---------------- painel lateral ---------------- */
function renderChips(){
  const all = Object.values(S.maquinas); const cont = {}; all.forEach(m => cont[m.status] = (cont[m.status]||0)+1);
  $('#chips').innerHTML = `<span class="chip tot" aria-label="Total de máquinas"><b>${all.length}</b> máquinas · <b>${unidadesOrd().length}</b> unidades</span>` +
    ORDEM.slice().reverse().filter(k=>cont[k]).map(k => `<button class="chip" data-f="${k}" aria-pressed="${UI.filtro===k}"><i style="background:${COR[k]}"></i>${STATUS[k].n} <b>${cont[k]}</b></button>`).join('');
}
function cardUn(u, fab){
  const ms = maqsDe(u.id); const q = UI.q.trim().toLowerCase();
  const mini = ms.filter(m=>m.modelo==='MINI').length, tech = ms.filter(m=>m.modelo==='TECH').length;
  const comp = !fab && (mini!==2 || tech!==1) ? `<div class="comp">Composição: ${mini} Mini + ${tech} Tech (padrão 2 + 1)</div>` : '';
  const apagada = UI.filtro && !ms.some(m=>m.status===UI.filtro);
  return `<section class="un${fab?' fab':''}${apagada?' apagada':''}" data-drop="${esc(u.id)}">
    <header data-un="${esc(u.id)}" title="${fab?'Máquinas sem unidade':'Editar unidade'}"><span class="nm">${esc(u.nome)}</span>${u.uf?`<span class="uf">${esc(u.uf)}</span>`:''}<span class="num">${fab?'':(u.ordem??'')}</span></header>
    ${u.implantacao?`<div class="nota">Implantada em ${esc(u.implantacao.split('-').reverse().join('/'))}</div>`:''}${u.nota?`<div class="nota">${esc(u.nota)}</div>`:''}${comp}
    <div class="mqs">${ms.length? ms.map(m=>`<span class="mq${UI.filtro&&m.status!==UI.filtro?' dim':''}${UI.sel===m.id?' sel':''}" draggable="${S.canWrite}" data-mq="${esc(m.id)}" role="button" tabindex="0" title="${esc(STATUS[m.status]?.n||m.status)}${m.nota?' · '+esc(m.nota):''}"><i style="background:${COR[m.status]||'#888'}"></i>${esc(MODELO[m.modelo]||m.modelo)}<small>${esc(m.serie||'')}</small></span>`).join('') : `<span class="vazio">${fab?'Arraste máquinas para cá para tirá-las de uma unidade.':'Sem máquinas.'}</span>`}
    ${fab?`<button class="qbtn ghost" data-addmq="1" type="button" style="padding:4px 9px">+ Máquina</button>`:''}</div>
  </section>`;
}
function renderLista(){
  ['un','mv','lg'].forEach(k => $('#ab-'+k).setAttribute('aria-selected', UI.aba===k));
  $('#bt-nova').hidden = UI.aba!=='un' || !S.canWrite || !S.db;
  const L = $('#lista');
  if (UI.aba==='lg'){
    L.innerHTML = `<div class="legenda">${ORDEM.slice().reverse().map(k=>`<div><i style="background:${COR[k]}"></i><span><b>${STATUS[k].n}</b><p>${STATUS[k].d}</p></span></div>`).join('')}
      <div><i style="background:transparent;border:1px solid var(--texto-2)"></i><span><b>Pedestal</b><p>O anel do pedestal mostra a pendência mais urgente da unidade. Cada unidade recebe 2 Mini Go e 1 Tech Go.</p></span></div></div>`;
    return;
  }
  if (UI.aba==='mv'){
    L.innerHTML = S.movs.length ? `<ul class="movs">${S.movs.map(m=>`<li><div class="t">${esc(new Date(m.ts).toLocaleString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}))}</div><b>${esc(m.rotulo||m.maquina)}</b>: ${esc(m.deNome||m.de)} → ${esc(m.paraNome||m.para)}</li>`).join('')}</ul>`
      : `<div class="vazio">Nenhuma transferência registrada ainda. Cada vez que uma máquina muda de unidade, ela aparece aqui.</div>`;
    return;
  }
  const q = UI.q.trim().toLowerCase();
  const uns = unidadesOrd().filter(u => !q || (u.nome+' '+(u.uf||'')+' '+(u.nota||'')).toLowerCase().includes(q));
  const keep = document.activeElement && document.activeElement.id==='busca';
  const sel = keep ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
  L.innerHTML = `<input class="busca" id="busca" type="search" placeholder="Buscar unidade, UF ou observação" value="${esc(UI.q)}" aria-label="Buscar unidade">` +
    (!S.db ? '' : cardUn({id:FAB, nome:'Fábrica · Estoque'}, true)) +
    (uns.length ? uns.map(u=>cardUn(u,false)).join('') : `<div class="vazio">${Object.keys(S.unidades).length?'Nenhuma unidade com esse nome.':'As unidades aparecem aqui assim que a base carregar. Use “+ Unidade” para cadastrar a primeira.'}</div>`);
  if (keep){ const b=$('#busca'); b.focus(); try{b.setSelectionRange(sel[0],sel[1]);}catch(_){} }
}
function renderAviso(){
  const a = $('#aviso'); let h = '';
  if (S.erro==='sem-db') h = `<div><h2>Base indisponível</h2>Entre na sua conta Claude para ver e mover as máquinas das unidades.</div>`;
  else if (S.erro==='lento') h = `<div><h2>Carregando…</h2>A base ainda não respondeu. Os dados aparecem sozinhos quando a conexão voltar.</div>`;
  else if (S.erro) h = `<div><h2>Não foi possível ler a base</h2>Recarregue a página para tentar de novo.</div>`;
  else if (S.ok.u && S.ok.m && !Object.keys(S.unidades).length && !Object.keys(S.maquinas).length) h = `<div><h2>Pátio vazio</h2>Nenhuma unidade cadastrada. Use “+ Unidade” para criar a primeira com 2 Mini Go e 1 Tech Go.</div>`;
  a.innerHTML = h; a.hidden = !h;
}

/* ---------------- gaveta de edição ---------------- */
function abrirMq(id){ UI.gaveta={tipo:'mq', id, conf:false}; UI.sel=id; renderGaveta(); renderLista(); }
function abrirUn(id){ if (id===FAB) return; UI.gaveta={tipo:'un', id, conf:false}; renderGaveta(); }
function fechar(){ UI.gaveta=null; UI.sel=null; renderGaveta(); renderLista(); }
function optsUn(atual){ return `<option value="${FAB}"${atual===FAB||!S.unidades[atual]?' selected':''}>Fábrica · Estoque</option>` + unidadesOrd().map(u=>`<option value="${esc(u.id)}"${u.id===atual?' selected':''}>${esc(u.nome)} – ${esc(u.uf||'')}</option>`).join(''); }
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
// Situação da unidade para o relatório mensal (ordem importa: a primeira regra que bate vale)
function situacaoUn(u){
  const m = maqsDe(u.id); const st = m.map(x=>x.status);
  const falt = st.filter(s=>s==='faltando'||s==='a_produzir').length;
  if (st.includes('devolucao')) return {k:'fech', m, falt};
  if (m.length && st.every(s=>s==='aguardando')) return {k:'nao', m, falt};
  if (falt) return {k:'falt', m, falt};
  if (m.length===3 && st.every(s=>s==='operando')) return {k:'ok', m, falt};
  return {k:'outras', m, falt};
}
function relatorioTexto(){
  const hoje = new Date();
  const lista = unidadesOrd().map(u=>({u, s:situacaoUn(u)}));
  const por = k => lista.filter(x=>x.s.k===k);
  const linha = x => `- ${x.u.nome}${x.u.uf?' ('+x.u.uf+')':''}`;
  const bloco = (titulo, itens, extra) => `${titulo} (${itens.length})\n` + (itens.length ? itens.map(x=>linha(x)+(extra?extra(x):'')).join('\n') : '- nenhuma');
  const totalMq = lista.reduce((s,x)=>s+x.s.m.length,0);
  const faltTotal = por('falt').reduce((s,x)=>s+x.s.falt,0);
  return [
    `Status das unidades Quick Go: ${MESES[hoje.getMonth()]} de ${hoje.getFullYear()}`,
    `Total: ${lista.length} unidades e ${totalMq} máquinas.`,
    '',
    bloco('1. Em processo de fechamento', por('fech'), x=>` (${x.s.m.length} máquina(s) em devolução)`),
    '',
    bloco('2. Com 100% das máquinas (3 de 3 operando)', por('ok')),
    '',
    bloco('3. Com máquinas faltando', por('falt'), x=>` (faltam ${x.s.falt})`),
    `   Total de máquinas faltando: ${faltTotal}`,
    '',
    bloco('4. Ainda não receberam as máquinas', por('nao')),
    '',
    bloco('5. Outras situações (reparo, acabamento, produção, envio)', por('outras'), x=>x.u.nota?` (${x.u.nota})`:''),
  ].join('\n');
}
function relatorioHtml(){
  return `<div class="cab"><h2>Relatório mensal</h2><button class="qbtn ghost" data-x="1" type="button">Fechar</button></div>
  <div class="corpo">
    <div class="vazio">Texto gerado agora. Copie e cole no e-mail para financeiro.franchising@malibubar.com.br. O envio automático do dia 04 ainda não está ligado.</div>
    <textarea id="rel-txt" readonly style="min-height:55vh;font:400 13px ui-monospace,Consolas,monospace">${esc(relatorioTexto())}</textarea>
    <div class="acoes"><button class="qbtn pri" type="button" data-copyrel="1">Copiar texto</button></div>
  </div>`;
}
function renderGaveta(){
  const G = $('#gaveta'); const g = UI.gaveta;
  if (!g){ G.hidden = true; G.innerHTML=''; return; }
  const ro = !S.canWrite || !S.db ? ' disabled' : '';
  if (g.tipo==='rel'){ G.innerHTML = relatorioHtml(); G.hidden = false; return; }
  if (g.tipo==='mq' || g.tipo==='novamq'){
    const m = g.tipo==='mq' ? S.maquinas[g.id] : {modelo:'MINI', status:'producao', unidade:FAB, serie:'', nota:''};
    if (!m){ fechar(); return; }
    G.innerHTML = `<div class="cab"><h2>${g.tipo==='mq'?esc(rotMq(m)):'Nova máquina'}</h2><button class="qbtn ghost" data-x="1" type="button">Fechar</button></div>
    <form class="corpo" id="fmq" autocomplete="off">
      <div class="linha"><label class="ff">Modelo<select id="mq-modelo"${ro}>${Object.entries(MODELO).map(([k,v])=>`<option value="${k}"${m.modelo===k?' selected':''}>${v}</option>`).join('')}</select></label>
      <label class="ff">Nº de série<input id="mq-serie" value="${esc(m.serie||'')}" maxlength="30"${ro}></label></div>
      <label class="ff">Status<select id="mq-status"${ro}>${ORDEM.slice().reverse().map(k=>`<option value="${k}"${m.status===k?' selected':''}>${STATUS[k].n}</option>`).join('')}</select></label>
      <label class="ff">Unidade<select id="mq-un"${ro}>${optsUn(m.unidade)}</select></label>
      <label class="ff">Observação<textarea id="mq-nota" maxlength="500"${ro} placeholder="Ex.: trocar bomba 2, aguardando peça">${esc(m.nota||'')}</textarea></label>
      ${ro?'<div class="vazio">Somente leitura.</div>':`<div class="acoes">${g.tipo==='mq'?'<button class="qbtn perigo" type="button" data-del="1">Excluir máquina</button>':''}<button class="qbtn pri" type="submit">${g.tipo==='mq'?'Salvar':'Cadastrar'}</button></div>`}
      ${g.conf?`<div class="conf">Excluir ${esc(rotMq(m))} de vez? O histórico de movimentos continua.<div class="acoes"><button class="qbtn" type="button" data-nconf="1">Manter</button><button class="qbtn perigo" type="button" data-sconf="1">Excluir</button></div></div>`:''}
    </form>`;
  } else {
    const nova = g.tipo==='novaun'; const u = nova ? {nome:'', uf:'', nota:'Franquia em compra', ordem: unidadesOrd().length+1} : S.unidades[g.id];
    if (!u){ fechar(); return; }
    const ms = nova ? [] : maqsDe(g.id);
    G.innerHTML = `<div class="cab"><h2>${nova?'Nova unidade':esc(u.nome)}</h2><button class="qbtn ghost" data-x="1" type="button">Fechar</button></div>
    <form class="corpo" id="fun" autocomplete="off">
      <div class="linha"><label class="ff">Cidade<input id="un-nome" value="${esc(u.nome)}" maxlength="60" required${ro}></label>
      <label class="ff">UF<select id="un-uf"${ro}>${UFS.map(x=>`<option${x===u.uf?' selected':''}>${x}</option>`).join('')}</select></label></div>
      <label class="ff">Situação da unidade<input id="un-nota" value="${esc(u.nota||'')}" maxlength="120"${ro} placeholder="Ex.: Máquinas em produção"></label>
      <label class="ff">Posição no pátio<input id="un-ordem" type="number" min="1" max="99" value="${esc(u.ordem??'')}"${ro}></label>
      <label class="ff">Data de implantação<input id="un-impl" type="date" value="${esc(u.implantacao||'')}"${ro}></label>
      ${nova?'<div class="vazio">A unidade nasce com 2 Mini Go e 1 Tech Go com status “Aguardando compra”.</div>':`<div class="vazio">${ms.length} máquina(s): ${ms.map(m=>esc(MODELO[m.modelo])+' ('+esc(STATUS[m.status]?.n||'')+')').join(', ')||'nenhuma'}.</div>`}
      ${ro?'':`<div class="acoes">${nova?'':'<button class="qbtn perigo" type="button" data-del="1">Excluir unidade</button>'}<button class="qbtn pri" type="submit">${nova?'Cadastrar unidade':'Salvar'}</button></div>`}
      ${g.conf?`<div class="conf">Excluir a unidade ${esc(u.nome)}? ${ms.length?`As ${ms.length} máquina(s) dela vão para Fábrica · Estoque.`:''}<div class="acoes"><button class="qbtn" type="button" data-nconf="1">Manter</button><button class="qbtn perigo" type="button" data-sconf="1">Excluir</button></div></div>`:''}
    </form>`;
  }
  G.hidden = false;
}
async function salvarMq(){
  const g = UI.gaveta; const d = {modelo:$('#mq-modelo').value, serie:$('#mq-serie').value.trim(), status:$('#mq-status').value, unidade:$('#mq-un').value, nota:$('#mq-nota').value.trim()};
  if (g.tipo==='novamq'){
    const id = 'mq-' + Date.now().toString(36);
    if (await guard(()=>S.db.doc('frota_maquinas/'+id).set(d), 'Máquina cadastrada')) fechar();
    return;
  }
  const m = S.maquinas[g.id]; const mudouUn = (S.unidades[m.unidade]?m.unidade:FAB) !== d.unidade;
  const ok = await guard(async ()=>{
    await S.db.doc('frota_maquinas/'+g.id).update(d);
    if (mudouUn) await S.db.collection('frota_movimentos').add({maquina:g.id, rotulo: rotMq(d), de: S.unidades[m.unidade]?m.unidade:FAB, para:d.unidade, deNome:nomeUn(m.unidade), paraNome:nomeUn(d.unidade), status:d.status, ts:new Date().toISOString(), por:S.uid||null});
  }, 'Máquina atualizada');
  if (ok) fechar();
}
async function salvarUn(){
  const g = UI.gaveta; const nome = $('#un-nome').value.trim(); if (!nome){ toast('Informe a cidade da unidade.', true); return; }
  const d = {nome, uf:$('#un-uf').value, nota:$('#un-nota').value.trim(), ordem: parseInt($('#un-ordem').value,10) || unidadesOrd().length+1, implantacao: $('#un-impl').value || ''};
  if (g.tipo==='novaun'){
    let id = slug(nome); while (S.unidades[id]) id += '-2';
    const ab = slug(nome).replace(/-/g,'').slice(0,3).toUpperCase();
    const ok = await guard(async ()=>{
      await S.db.doc('frota_unidades/'+id).set(d);
      for (const [k,mod] of [['m1','MINI'],['m2','MINI'],['t1','TECH']]) await S.db.doc('frota_maquinas/'+id+'-'+k).set({modelo:mod, unidade:id, status:'aguardando', serie: ab+'-'+k.toUpperCase(), nota:''});
    }, 'Unidade ' + nome + ' cadastrada');
    if (ok){ fechar(); focarUn(id); }
    return;
  }
  if (await guard(()=>S.db.doc('frota_unidades/'+g.id).update(d), 'Unidade atualizada')) fechar();
}
async function excluir(){
  const g = UI.gaveta;
  if (g.tipo==='mq'){ if (await guard(()=>S.db.doc('frota_maquinas/'+g.id).delete(), 'Máquina excluída')) fechar(); return; }
  const ms = maqsDe(g.id);
  const ok = await guard(async ()=>{ for (const m of ms) await S.db.doc('frota_maquinas/'+m.id).update({unidade:FAB}); await S.db.doc('frota_unidades/'+g.id).delete(); }, 'Unidade excluída');
  if (ok) fechar();
}

/* ---------------- eventos do painel ---------------- */
$('#chips').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; UI.filtro = UI.filtro===b.dataset.f ? null : b.dataset.f; renderAll(); });
['un','mv','lg'].forEach(k => $('#ab-'+k).addEventListener('click', ()=>{ UI.aba=k; renderLista(); }));
$('#bt-nova').addEventListener('click', ()=>{ UI.gaveta={tipo:'novaun', conf:false}; renderGaveta(); });
$('#bt-rel').addEventListener('click', ()=>{ UI.gaveta={tipo:'rel', conf:false}; renderGaveta(); });
$('#lista').addEventListener('input', e => { if (e.target.id==='busca'){ UI.q = e.target.value; renderLista(); } });
$('#lista').addEventListener('click', e => {
  const mq = e.target.closest('[data-mq]'); if (mq){ abrirMq(mq.dataset.mq); focarMq(mq.dataset.mq); return; }
  if (e.target.closest('[data-addmq]')){ UI.gaveta={tipo:'novamq', conf:false}; renderGaveta(); return; }
  const h = e.target.closest('[data-un]'); if (h){ focarUn(h.dataset.un); abrirUn(h.dataset.un); }
});
$('#lista').addEventListener('keydown', e => { const mq = e.target.closest('[data-mq]'); if (mq && (e.key==='Enter'||e.key===' ')){ e.preventDefault(); abrirMq(mq.dataset.mq); } });
$('#lista').addEventListener('dragstart', e => { const mq = e.target.closest('[data-mq]'); if (!mq) return; e.dataTransfer.setData('text/plain', mq.dataset.mq); e.dataTransfer.effectAllowed='move'; });
$('#lista').addEventListener('dragover', e => { const z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); raiz.querySelectorAll('.un.over').forEach(x=>x!==z&&x.classList.remove('over')); z.classList.add('over'); });
$('#lista').addEventListener('dragleave', e => { const z = e.target.closest('[data-drop]'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('over'); });
$('#lista').addEventListener('drop', e => { const z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); z.classList.remove('over'); const id = e.dataTransfer.getData('text/plain'); if (id && S.maquinas[id]) mover(id, z.dataset.drop); });
$('#gaveta').addEventListener('click', e => {
  if (e.target.closest('[data-x]')) return fechar();
  if (e.target.closest('[data-copyrel]')){ const t = $('#rel-txt'); navigator.clipboard.writeText(t.value).then(()=>toast('Texto copiado')).catch(()=>{ t.select(); toast('Selecione o texto e copie', true); }); return; }
  if (e.target.closest('[data-del]')){ UI.gaveta.conf = true; renderGaveta(); return; }
  if (e.target.closest('[data-nconf]')){ UI.gaveta.conf = false; renderGaveta(); return; }
  if (e.target.closest('[data-sconf]')) excluir();
});
$('#gaveta').addEventListener('submit', e => { e.preventDefault(); if (e.target.id==='fmq') salvarMq(); else salvarUn(); });
document.addEventListener('keydown', e => { if (ATIVO && e.key==='Escape' && UI.gaveta) fechar(); });

/* ---------------- 3D ---------------- */
const canvas = $('#c'), palco = $('#palco');
let R = null;
if (!window.THREE || !THREE.OrbitControls){ $('#dica').textContent = 'Não foi possível carregar o 3D. Use a lista ao lado para gerenciar as máquinas.'; }
else {
  try { R = new THREE.WebGLRenderer({canvas, antialias:true}); } catch(e){ R = null; $('#dica').textContent = 'Este navegador não abriu o 3D (WebGL desativado). Use a lista ao lado.'; }
}
const G3 = {};
const ALTURA = {MINI:3.0, TECH:4.4}; // a Tech Go é maior que a Mini Go
const FANTASMA = ['faltando','a_produzir','aguardando'];

function b64(s){ const b = atob(s); const u = new Uint8Array(b.length); for (let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u.buffer; }
// Modelo real (STL da vista explodida, simplificado): posições quantizadas + id da peça por vértice
function geoReal(M, alturaAlvo){
  const q = new Uint16Array(b64(M.pos)); const n = q.length/3; const p = new Float32Array(q.length);
  for (let i=0;i<q.length;i++){ const a=i%3; p[i] = M.min[a] + q[i]/65535*(M.max[a]-M.min[a]); }
  // frente do modelo aponta para +X: gira -90° em Y para ela olhar para a câmera (+Z)
  for (let i=0;i<n;i++){ const x=p[i*3], z=p[i*3+2]; p[i*3] = -z; p[i*3+2] = x; }
  const s = alturaAlvo / (M.max[1]-M.min[1]); for (let i=0;i<p.length;i++) p[i]*=s;
  const comp = new Uint16Array(b64(M.comp)); const nc = M.ncomp;
  const bmin = new Float32Array(nc*3).fill(1e9), bmax = new Float32Array(nc*3).fill(-1e9);
  for (let i=0;i<n;i++){ const c=comp[i]; for (let a=0;a<3;a++){ const v=p[i*3+a]; if (v<bmin[c*3+a]) bmin[c*3+a]=v; if (v>bmax[c*3+a]) bmax[c*3+a]=v; } }
  let corpo=0, vol=-1; for (let c=0;c<nc;c++){ const v=(bmax[c*3]-bmin[c*3])*(bmax[c*3+1]-bmin[c*3+1])*(bmax[c*3+2]-bmin[c*3+2]); if (v>vol){vol=v;corpo=c;} }
  const cc = [0,1,2].map(a => (bmin[corpo*3+a]+bmax[corpo*3+a])/2);
  const PAL = ['#efe4d6','#c9ccc9','#6f9ca7','#d79a45','#1b2328','#b9c2c4','#e6a58f'].map(h=>new THREE.Color(h));
  const CORPO = new THREE.Color('#26393f');
  const col = new Float32Array(p.length), off = new Float32Array(p.length);
  for (let i=0;i<n;i++){ const c=comp[i]; const k = c===corpo ? CORPO : PAL[c%PAL.length]; col[i*3]=k.r; col[i*3+1]=k.g; col[i*3+2]=k.b;
    // deslocamento da peça em relação ao corpo: usado para "fechar" a vista explodida durante a produção
    for (let a=0;a<3;a++) off[i*3+a] = c===corpo ? 0 : ((bmin[c*3+a]+bmax[c*3+a])/2 - cc[a]); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p,3)); g.setAttribute('color', new THREE.BufferAttribute(col,3)); g.setAttribute('off', new THREE.BufferAttribute(off,3));
  const ib = b64(M.idx); g.setIndex(new THREE.BufferAttribute(M.idx32 ? new Uint32Array(ib) : new Uint16Array(ib), 1));
  g.computeVertexNormals(); g.computeBoundingBox();
  const bb = g.boundingBox; const w = bb.max.x-bb.min.x, h = bb.max.y-bb.min.y, d = bb.max.z-bb.min.z;
  return {geo:g, w, h, d, corpo:{w:bmax[corpo*3]-bmin[corpo*3], h:bmax[corpo*3+1]-bmin[corpo*3+1], d:bmax[corpo*3+2]-bmin[corpo*3+2], y:cc[1]}};
}

if (R){
  if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
  R.setPixelRatio(Math.min(devicePixelRatio||1, 2)); R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#101b20'); scene.fog = new THREE.Fog('#101b20', 220, 560);
  const cam = new THREE.PerspectiveCamera(36, 1, 0.5, 1200);
  const ctl = new THREE.OrbitControls(cam, canvas); ctl.enableDamping = true; ctl.dampingFactor = .08; ctl.maxPolarAngle = Math.PI*0.47; ctl.minDistance = 6; ctl.maxDistance = 420;
  scene.add(new THREE.HemisphereLight('#dfe9ec', '#1b272c', .6));
  const sun = new THREE.DirectionalLight('#fff1de', 1.3); sun.position.set(80, 140, 90); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera, {left:-150,right:150,top:150,bottom:-150,near:10,far:420}); sun.shadow.bias = -0.0006; scene.add(sun);
  const rim = new THREE.DirectionalLight('#9fc3cf', .5); rim.position.set(-60, 40, -70); scene.add(rim);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(900,900), new THREE.MeshStandardMaterial({color:'#15242a', roughness:.95}));
  chao.rotation.x = -Math.PI/2; chao.receiveShadow = true; scene.add(chao);
  const grade = new THREE.GridHelper(600, 120, '#24383f', '#1b2d33'); grade.position.y = .01; scene.add(grade);
  const plano = new THREE.Plane(new THREE.Vector3(0,1,0), -0.9);
  Object.assign(G3, {scene, cam, ctl, grade, ped:{}, mq:{}, estradas:{}, caminhoes:{}, mapa:null, t0:performance.now()});

  const RB = THREE.RoundedBoxGeometry || null;
  const caixa = (w,h,d,r) => RB ? new RB(w,h,d,3,r) : new THREE.BoxGeometry(w,h,d);
  const GEO = {};
  for (const k of ['MINI','TECH']){
    let g = null;
    try { if (window.QG_MODELOS && QG_MODELOS[k]) g = geoReal(QG_MODELOS[k], ALTURA[k]); } catch(e){ g = null; }
    if (!g){ const w = k==='TECH'?2:1.6, h = ALTURA[k], d = k==='TECH'?1.6:1.35; const bg = caixa(w,h,d,.2); bg.translate(0,h/2,0);
      const n = bg.attributes.position.count; bg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n*3).fill(.16),3)); bg.setAttribute('off', new THREE.BufferAttribute(new Float32Array(n*3),3));
      g = {geo:bg, w, h, d, corpo:{w, h, d, y:h/2}}; }
    g.crate = new THREE.BoxGeometry(g.w*.9+.3, g.h+.3, g.d*.9+.3); g.crateE = new THREE.EdgesGeometry(g.crate);
    GEO[k] = g;
  }
  G3.real = !!(window.QG_MODELOS);
  const geoBeacon = new THREE.SphereGeometry(.2,20,14), geoAnel = new THREE.TorusGeometry(1,.05,10,48), geoHit = new THREE.BoxGeometry(1,1,1);

  function matMaquina(){
    const m = new THREE.MeshStandardMaterial({vertexColors:true, roughness:.48, metalness:.12, flatShading:true, transparent:true});
    m.userData.uExp = {value:1};
    m.onBeforeCompile = sh => { sh.uniforms.uExp = m.userData.uExp;
      sh.vertexShader = 'attribute vec3 off;\nuniform float uExp;\n' + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position - off * (1.0 - uExp);'); };
    m.customProgramCacheKey = () => 'qg-explodida';
    return m;
  }
  function novaMq(id, modelo){
    const g = GEO[modelo] || GEO.MINI; const grp = new THREE.Group(); grp.userData = {id, modelo};
    const mat = matMaquina();
    const corpo = new THREE.Mesh(g.geo, mat); corpo.castShadow = true; corpo.receiveShadow = true;
    const corpoG = new THREE.Group(); corpoG.add(corpo);
    const beacon = new THREE.Mesh(geoBeacon, new THREE.MeshStandardMaterial({color:'#fff', emissive:'#4fae7f', emissiveIntensity:1.4})); beacon.position.y = g.h + .45;
    const anel = new THREE.Mesh(geoAnel, new THREE.MeshBasicMaterial({color:'#4fae7f', transparent:true, opacity:.9})); anel.rotation.x = Math.PI/2; anel.position.y = .03;
    const rAnel = Math.max(g.w, g.d)*.55; anel.scale.setScalar(rAnel);
    const caixote = new THREE.Group();
    const cx = new THREE.Mesh(g.crate, new THREE.MeshStandardMaterial({color:'#b08454', roughness:.9, transparent:true, opacity:.94})); cx.castShadow = true;
    caixote.add(cx, new THREE.LineSegments(g.crateE, new THREE.LineBasicMaterial({color:'#6e5030'}))); caixote.position.y = (g.h+.3)/2;
    const hit = new THREE.Mesh(geoHit, new THREE.MeshBasicMaterial({visible:false})); hit.scale.set(g.w*.8+.3, g.h+.8, g.d*.8+.3); hit.position.y = (g.h+.8)/2; hit.userData.mqId = id;
    grp.add(corpoG, beacon, anel, caixote, hit);
    Object.assign(grp.userData, {g, mat, corpoG, beacon, anel, rAnel, caixote, hit, alvo:new THREE.Vector3(), escAlvo:1, rotAlvo:0, fase:Math.random()*6, via:null});
    scene.add(grp); return grp;
  }
  function estilo(grp, status, dim){
    const u = grp.userData; const c = new THREE.Color(COR[status] || '#888');
    u.status = status; u.beacon.material.emissive.copy(c); u.beacon.material.color.copy(c); u.anel.material.color.copy(c);
    const fant = FANTASMA.includes(status);
    u.corpoG.visible = status !== 'envio'; u.caixote.visible = status === 'envio'; u.beacon.visible = status !== 'aguardando';
    const m = u.mat; const op = dim ? .12 : 1;
    if (fant){ m.color.set('#ffffff'); m.emissive.copy(c); m.emissiveIntensity = .55; m.opacity = .2*op; m.depthWrite = false; }
    else if (status === 'devolucao'){ m.color.set('#8e9799'); m.emissive.set('#000'); m.opacity = .6*op; m.depthWrite = op > .5; }
    else { m.color.set('#ffffff'); m.emissive.copy(status==='manutencao' ? c : new THREE.Color('#000')); m.emissiveIntensity = status==='manutencao' ? .15 : 0; m.opacity = op; m.depthWrite = op > .5; }
    u.corpoG.children[0].castShadow = !fant;
    u.anel.material.opacity = .9*op; u.caixote.children[0].material.opacity = .94*op; u.beacon.material.emissiveIntensity = dim ? .2 : 1.4;
    if (status !== 'producao') m.userData.uExp.value = 1;
  }
  function novoPed(id, fab){
    const grp = new THREE.Group(); grp.userData = {id, fab, alvo:new THREE.Vector3()};
    const raio = 5.2;
    const base = fab ? new THREE.Mesh(caixa(24,.8,12,.35), new THREE.MeshStandardMaterial({color:'#2b3a36', roughness:.7, metalness:.15}))
                     : new THREE.Mesh(new THREE.CylinderGeometry(raio, raio+.35, .8, 56), new THREE.MeshStandardMaterial({color:'#1f3037', roughness:.6, metalness:.2}));
    base.position.y = .4; base.receiveShadow = true; base.castShadow = true;
    const borda = fab ? new THREE.Mesh(new THREE.BoxGeometry(24.2,.06,12.2), new THREE.MeshBasicMaterial({color:'#d79a45', transparent:true, opacity:.22}))
                      : new THREE.Mesh(new THREE.RingGeometry(raio-.35, raio, 64), new THREE.MeshBasicMaterial({color:'#4fae7f', side:THREE.DoubleSide, transparent:true, opacity:.9}));
    if (!fab) borda.rotation.x = -Math.PI/2; borda.position.y = .83;
    grp.add(base, borda); grp.userData.borda = borda; grp.userData.base = base;
    if (fab){ // galpão da fábrica: telhado em shed atrás da plataforma
      const galpao = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({color:'#33474e', roughness:.8});
      const parede = new THREE.Mesh(new THREE.BoxGeometry(24,4.2,.4), mat); parede.position.set(0,2.9,-5.8); parede.castShadow = true;
      for (let i=0;i<4;i++){ const sh = new THREE.Mesh(new THREE.BoxGeometry(6,.25,2.4), new THREE.MeshStandardMaterial({color:'#d79a45', roughness:.6})); sh.position.set(-9+i*6, 5.2, -5.3); sh.rotation.x = -.5; galpao.add(sh); }
      galpao.add(parede); grp.add(galpao); grp.userData.galpao = galpao;
    }
    scene.add(grp); return grp;
  }
  function caminhao(){
    const grp = new THREE.Group();
    const bau = new THREE.Mesh(new THREE.BoxGeometry(7.4,.35,3), new THREE.MeshStandardMaterial({color:'#3a4e55', roughness:.7})); bau.position.y = .85;
    const cab = new THREE.Mesh(caixa(2.2,2.1,3,.25), new THREE.MeshStandardMaterial({color:'#d79a45', roughness:.5, metalness:.2})); cab.position.set(4.9,1.75,0);
    const vid = new THREE.Mesh(new THREE.PlaneGeometry(2.5,.8), new THREE.MeshStandardMaterial({color:'#0f171a', roughness:.15, metalness:.5})); vid.position.set(6.01,2.15,0); vid.rotation.y = Math.PI/2;
    const chassi = new THREE.Mesh(new THREE.BoxGeometry(11,.35,2.4), new THREE.MeshStandardMaterial({color:'#1b2328'})); chassi.position.set(.9,.5,0);
    grp.add(bau, cab, vid, chassi);
    const rg = new THREE.CylinderGeometry(.45,.45,.4,18), rm = new THREE.MeshStandardMaterial({color:'#111', roughness:.9});
    for (const x of [-2.6,-1.4,4.9]) for (const z of [-1.3,1.3]){ const r = new THREE.Mesh(rg, rm); r.rotation.x = Math.PI/2; r.position.set(x,.45,z); grp.add(r); }
    grp.traverse(o => { if (o.isMesh) o.castShadow = true; });
    scene.add(grp); return grp;
  }
  Object.assign(G3, {novaMq, estilo, novoPed, caminhao, plano});
}

/* layout: posição de cada pedestal no modo atual */
let layout = {};
function calcLayout(){
  const uns = unidadesOrd(); const L = {};
  if (UI.modo === 'rotas'){
    const e = MAPA.esc; const cg = mapXZ(FAB_LL[0], FAB_LL[1]);
    const fp = mapXZ(-21.5, -35.5);   // galpão fora do mapa, no oceano a leste, para não cobrir as unidades
    L[FAB] = {x:fp.x, z:fp.z, fab:true, esc:.6};
    let fora = 0;
    uns.forEach(u => {
      const ll = GEO_LL[u.id] || (u.lat!=null && u.lon!=null ? [u.lat,u.lon] : null);
      if (ll){ const p = mapXZ(ll[0], ll[1]); L[u.id] = {x:p.x, z:p.z, fab:false, km:kmDe(ll), esc:e}; }
      else { L[u.id] = {x:150, z:-60 + (fora++)*9, fab:false, km:null, esc:e, semMapa:true}; } // cidade sem coordenada: fica no oceano, à direita
    });
  } else {
    const cols = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(uns.length || 1)))); const esp = 15, rows = Math.ceil(uns.length/cols);
    uns.forEach((u,i) => { const c = i%cols, r = Math.floor(i/cols); L[u.id] = {x:(c-(cols-1)/2)*esp, z:(r-(rows-1)/2)*esp - 6, fab:false, esc:1}; });
    L[FAB] = {x:0, z:((rows-1)/2)*esp - 6 + 18, fab:true, esc:1};
  }
  return L;
}
// onde a máquina está fisicamente: no modo rotas, produção fica na fábrica e envio/devolução vão no caminhão
function localFisico(m){
  const dono = S.unidades[m.unidade] ? m.unidade : FAB;
  if (UI.modo !== 'rotas' || dono === FAB) return {onde:dono};
  if (m.status === 'producao' || m.status === 'a_produzir') return {onde:FAB, para:dono};
  if (m.status === 'envio') return {onde:'cam', cam:dono+':ida', dono};
  if (m.status === 'devolucao') return {onde:'cam', cam:dono+':volta', dono};
  return {onde:dono};
}
function curvaRota(p){
  const f = layout[FAB];
  const a = new THREE.Vector3(f.x,.08,f.z), b = new THREE.Vector3(p.x,.08,p.z);
  const dir = b.clone().sub(a); const len = dir.length(); dir.normalize();
  a.add(dir.clone().multiplyScalar(Math.min(5.5, len*.3))); b.sub(dir.clone().multiplyScalar(Math.min(3.2, len*.3)));
  const perp = new THREE.Vector3(-dir.z,0,dir.x); const mid = a.clone().lerp(b,.5).add(perp.multiplyScalar(len*.1));
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}
function sync3D(){
  if (!R) return;
  layout = calcLayout();
  const rotas = UI.modo === 'rotas';
  for (const id of Object.keys(G3.ped)) if (!layout[id]){ G3.scene.remove(G3.ped[id]); delete G3.ped[id]; }
  for (const [id,p] of Object.entries(layout)){ if (!G3.ped[id]){ G3.ped[id] = G3.novoPed(id, p.fab); G3.ped[id].position.set(p.x,0,p.z); G3.ped[id].scale.setScalar(p.esc); } G3.ped[id].userData.alvo.set(p.x, 0, p.z); G3.ped[id].userData.escAlvo = p.esc; }
  for (const id of Object.keys(G3.mq)) if (!S.maquinas[id] || G3.mq[id].userData.modelo !== S.maquinas[id].modelo){ G3.scene.remove(G3.mq[id]); delete G3.mq[id]; }
  // agrupa as máquinas pelo lugar físico
  const grupos = {}, cargas = {};
  for (const [id,m] of Object.entries(S.maquinas)){
    const lf = localFisico(m);
    if (lf.onde === 'cam') (cargas[lf.cam] = cargas[lf.cam] || []).push({id,...m});
    else (grupos[lf.onde] = grupos[lf.onde] || []).push({id,...m});
  }
  const ord = (a,b) => (a.modelo===b.modelo?0:a.modelo==='MINI'?-1:1) || String(a.unidade).localeCompare(String(b.unidade)) || String(a.serie||a.id).localeCompare(String(b.serie||b.id));
  for (const [lugar,p] of Object.entries(layout)){
    const ms = (grupos[lugar] || []).sort(ord); const porLinha = p.fab ? 6 : 3; const e = p.esc; const passo = (p.fab ? 3.6 : 3.4)*e;
    if (!p.fab){ const doDono = maqsDe(lugar); const k = saude(doDono); const b = G3.ped[lugar].userData.borda.material; b.color.set(k ? COR[k] : '#3a525a'); b.opacity = UI.filtro && !doDono.some(m=>m.status===UI.filtro) ? .2 : .9; }
    ms.forEach((m,i) => {
      let o = G3.mq[m.id]; if (!o){ o = G3.mq[m.id] = G3.novaMq(m.id, m.modelo); o.position.set(p.x, .8, p.z); }
      const lins = Math.ceil(ms.length/porLinha); const n = Math.min(porLinha, ms.length - Math.floor(i/porLinha)*porLinha); const col = i%porLinha, lin = Math.floor(i/porLinha);
      o.userData.via = null; o.userData.escAlvo = e; o.userData.rotAlvo = 0;
      o.userData.alvo.set(p.x + (col-(n-1)/2)*passo, .8*e, p.z + ((lin-(lins-1)/2)*-3.2 + (p.fab?0.6:.4))*e);
      G3.estilo(o, m.status, UI.filtro && m.status!==UI.filtro);
    });
  }
  // estradas e caminhões (só no modo rotas)
  const precisa = new Set();
  if (rotas) for (const id of Object.keys(layout)) if (id !== FAB) precisa.add(id);
  for (const id of Object.keys(G3.estradas)) if (!precisa.has(id)){ G3.scene.remove(G3.estradas[id].mesh); delete G3.estradas[id]; }
  for (const id of precisa){
    const p = layout[id]; const chave = p.x.toFixed(1)+','+p.z.toFixed(1);
    let e = G3.estradas[id];
    if (!e || e.chave !== chave){ if (e) G3.scene.remove(e.mesh);
      const curva = curvaRota(p); const mesh = new THREE.Mesh(new THREE.TubeGeometry(curva, 64, .11, 6, false), new THREE.MeshBasicMaterial({color:'#3a525a', transparent:true, opacity:.9}));
      G3.scene.add(mesh); e = G3.estradas[id] = {curva, mesh, chave, len:curva.getLength()}; }
    const k = saude(maqsDe(id)); e.mesh.material.color.set(k && k!=='operando' ? COR[k] : '#3a525a'); e.mesh.material.opacity = UI.filtro && !maqsDe(id).some(m=>m.status===UI.filtro) ? .25 : .85;
  }
  const precisaCam = new Set(Object.keys(cargas).filter(k => G3.estradas[k.split(':')[0]]));
  for (const k of Object.keys(G3.caminhoes)) if (!precisaCam.has(k)){ G3.scene.remove(G3.caminhoes[k].grp); delete G3.caminhoes[k]; }
  for (const k of precisaCam){
    if (!G3.caminhoes[k]) G3.caminhoes[k] = {grp:G3.caminhao(), fase:Math.random(), volta:k.endsWith(':volta')};
    const c = G3.caminhoes[k]; c.est = k.split(':')[0]; const ec = MAPA.esc; c.grp.scale.setScalar(ec);
    const ms = cargas[k].sort(ord);
    ms.forEach((m,i) => {
      let o = G3.mq[m.id]; if (!o){ o = G3.mq[m.id] = G3.novaMq(m.id, m.modelo); }
      const nPorFila = 3, fila = Math.floor(i/nPorFila), n = Math.min(nPorFila, ms.length - fila*nPorFila);
      o.userData.via = {cam:k, x:(((i%nPorFila)-(n-1)/2)*2.2 - .6)*ec, z:0, y:(1.05 + fila*2.2)*ec};
      o.userData.escAlvo = .45*ec;
      G3.estilo(o, m.status, UI.filtro && m.status!==UI.filtro);
    });
  }
  // mapa do Brasil: estados preenchidos, divisas e siglas
  if (rotas && !G3.mapa && window.QG_BRASIL){
    const grp = new THREE.Group(); const fill = new THREE.MeshStandardMaterial({color:'#24404a', roughness:.95, side:THREE.DoubleSide});
    const lineM = new THREE.LineBasicMaterial({color:'#4d6f79', transparent:true, opacity:.8});
    for (const est of QG_BRASIL){
      let maior = null, area = -1;
      for (const r of est.r){
        const pts = r.slice(0, -1).map(([lon,lat]) => { const p = mapXZ(lat, lon); return new THREE.Vector2(p.x, p.z); });
        if (pts.length < 3) continue;
        const sg = new THREE.ShapeGeometry(new THREE.Shape(pts)); sg.rotateX(Math.PI/2);
        const mesh = new THREE.Mesh(sg, fill); mesh.position.y = .02; mesh.receiveShadow = true; grp.add(mesh);
        const lg = new THREE.BufferGeometry().setFromPoints(pts.concat([pts[0]]).map(v => new THREE.Vector3(v.x, .06, v.y))); grp.add(new THREE.Line(lg, lineM));
        const a = Math.abs(THREE.ShapeUtils.area(pts)); if (a > area){ area = a; maior = pts; }
      }
      if (maior && est.uf){ // sigla do estado deitada no mapa
        let cx = 0, cz = 0; maior.forEach(v => { cx += v.x; cz += v.y; }); cx /= maior.length; cz /= maior.length;
        const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64; const g = cv.getContext('2d');
        g.font = '600 40px Montserrat, system-ui, sans-serif'; g.fillStyle = 'rgba(250,240,230,.30)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(est.uf, 64, 34);
        const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding;
        const s = est.uf === 'DF' ? 2 : Math.min(9, Math.max(3.5, Math.sqrt(area)*.35));
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(s*2, s), new THREE.MeshBasicMaterial({map:tx, transparent:true, depthWrite:false}));
        pl.rotation.x = -Math.PI/2; pl.position.set(cx, .1, cz + (est.uf==='DF'?2.2:0)); grp.add(pl);
      }
    }
    G3.mapa = grp; G3.scene.add(grp);
  }
  if (G3.mapa) G3.mapa.visible = rotas;
  if (G3.grade) G3.grade.visible = !rotas;
  for (const [id,o] of Object.entries(G3.ped)) if (o.userData.galpao) o.userData.galpao.visible = true;
  syncLabels();
}
function syncLabels(){
  const L = $('#labels'); if (!R) { L.innerHTML=''; return; }
  L.querySelectorAll('.lbl').forEach(el => { if (!layout[el.dataset.id]) el.remove(); });
  for (const id of Object.keys(layout)){
    let el = L.querySelector(`.lbl[data-id="${CSS.escape(id)}"]`);
    if (!el){ el = document.createElement('div'); el.className = 'lbl' + (id===FAB?' fab':''); el.dataset.id = id; L.appendChild(el); }
    const u = id===FAB ? {nome: UI.modo==='rotas' ? 'Fábrica · Campo Grande' : 'Fábrica · Estoque', uf:''} : S.unidades[id]; const ms = maqsDe(id);
    const km = layout[id].km; const kmTxt = UI.modo==='rotas' && id!==FAB && km!=null ? `<span class="km">≈ ${Math.round(km).toLocaleString('pt-BR')} km da fábrica</span>` : '';
    el.innerHTML = `<span class="n">${esc(u.nome)}</span>${u.uf?`<span class="u">${esc(u.uf)}</span>`:''}${kmTxt}<div class="d">${ms.slice(0,12).map(m=>`<i style="background:${COR[m.status]||'#888'}" title="${esc(MODELO[m.modelo])}: ${esc(STATUS[m.status]?.n||'')}"></i>`).join('') || '<i style="background:#3a525a"></i>'}</div>`;
  }
  L.querySelectorAll('.carga').forEach(el => { if (!G3.caminhoes[el.dataset.cam]) el.remove(); });
  for (const [k,c] of Object.entries(G3.caminhoes || {})){
    let el = L.querySelector(`.carga[data-cam="${CSS.escape(k)}"]`);
    if (!el){ el = document.createElement('div'); el.className = 'carga' + (c.volta?' volta':''); el.dataset.cam = k; L.appendChild(el); }
    const n = Object.values(G3.mq).filter(o => o.userData.via && o.userData.via.cam === k).length;
    el.textContent = (c.volta ? 'Devolução ← ' : 'Envio → ') + nomeUn(c.est) + ' · ' + n + (n===1?' máquina':' máquinas');
  }
}
$('#labels').addEventListener('click', e => { const l = e.target.closest('.lbl'); if (!l) return; focarUn(l.dataset.id); if (l.dataset.id !== FAB) abrirUn(l.dataset.id); });

/* câmera */
let voo = null;
function voar(alvo, dist, alt){
  if (!R) return; const c = G3.ctl; const dir = new THREE.Vector3().subVectors(G3.cam.position, c.target).setY(0).normalize();
  if (!isFinite(dir.x) || dir.lengthSq() < .1) dir.set(0,0,1);
  voo = {t:0, p0:G3.cam.position.clone(), t0:c.target.clone(), p1:alvo.clone().add(dir.multiplyScalar(dist)).setY(alt), t1:alvo.clone()};
}
function geral(){
  if (!R) return; let ext = 20, cx = 0, cz = 0; const ps = Object.values(layout);
  if (ps.length){ const xs = ps.map(p=>p.x), zs = ps.map(p=>p.z); cx = (Math.min(...xs)+Math.max(...xs))/2; cz = (Math.min(...zs)+Math.max(...zs))/2; ext = Math.max(Math.max(...xs)-Math.min(...xs), Math.max(...zs)-Math.min(...zs))/2 + 12; }
  const d = ext*(UI.modo==='rotas' ? 2.6 : 1.85) / Math.min(1, Math.max(.5, G3.cam.aspect*1.15)); /* tela em pé (celular): afasta para caber na largura */ voo = {t:0, p0:G3.cam.position.clone(), t0:G3.ctl.target.clone(), p1:new THREE.Vector3(cx + d*.3, d*.78, cz + d*1.05), t1:new THREE.Vector3(cx,0,cz)};
}
function focarUn(id){ const p = layout[id]; if (!p) return; voar(new THREE.Vector3(p.x, 1.5, p.z), p.fab?22:15, p.fab?14:10); }
function focarMq(id){ const o = G3.mq && G3.mq[id]; if (!o) return; voar(o.position.clone().setY(1.5), 9, 5.5); }
$('#bt-geral').addEventListener('click', geral);
function setModo(m){
  UI.modo = m; try { localStorage.setItem('qgf-vista', m); } catch(_){}
  $('#md-patio').setAttribute('aria-pressed', m==='patio'); $('#md-rotas').setAttribute('aria-pressed', m==='rotas');
  $('#dica').textContent = (m==='rotas'
    ? 'Cada unidade sobre a sua cidade · a fábrica fica fora do mapa, à direita · caminhões levam os envios e trazem as devoluções'
    : 'Arraste uma máquina até outro pedestal para transferir · clique para editar') + ' · WASD ou setas movem · Q/E giram · R/F aproximam · Shift acelera';
  sync3D(); geral();
}
$('#md-patio').addEventListener('click', ()=>setModo('patio'));
$('#md-rotas').addEventListener('click', ()=>setModo('rotas'));

/* arrastar no 3D */
const ray = R ? new THREE.Raycaster() : null; const ptr = R ? new THREE.Vector2() : null;
let drag = null, hover = null;
function pick(ev){
  const r = canvas.getBoundingClientRect(); ptr.set(((ev.clientX-r.left)/r.width)*2-1, -((ev.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(ptr, G3.cam);
  const hits = ray.intersectObjects(Object.values(G3.mq).map(o=>o.userData.hit), false);
  return hits.length ? hits[0].object.userData.mqId : null;
}
function pedPerto(pt){
  let best = null, bd = 1e9;
  for (const [id,p] of Object.entries(layout)){
    const dx = Math.abs(pt.x-p.x), dz = Math.abs(pt.z-p.z);
    const e = p.esc || 1; const dentro = p.fab ? (dx < 12.5*e && dz < 6.5*e) : Math.hypot(dx,dz) < 6.5*e;
    const d = Math.hypot(dx,dz); if (dentro && d < bd){ bd = d; best = id; }
  }
  return best;
}
function marcarAlvo(id){
  for (const [pid,o] of Object.entries(G3.ped)) o.userData.base.material.emissive.set(pid===id ? '#5a3f17' : '#000000');
  raiz.querySelectorAll('#labels .lbl').forEach(el => el.classList.toggle('alvo', el.dataset.id===id));
}
if (R){
  palco.addEventListener('pointerdown', ev => {
    if (ev.button !== 0 || ev.target !== canvas) return;
    const id = pick(ev); if (!id) return;
    ev.stopPropagation(); ev.preventDefault();
    drag = {id, x:ev.clientX, y:ev.clientY, ativo:false, alvo:null};
    G3.ctl.enabled = false; try{ canvas.setPointerCapture(ev.pointerId); }catch(_){}
  }, true);
  window.addEventListener('pointermove', ev => {
    if (drag){
      if (!drag.ativo && Math.hypot(ev.clientX-drag.x, ev.clientY-drag.y) > 5){ if (!S.canWrite || !S.db) drag.bloq = true; drag.ativo = true; canvas.style.cursor = 'grabbing'; $('#tip').hidden = true; }
      if (drag.ativo && !drag.bloq){
        const r = canvas.getBoundingClientRect(); ptr.set(((ev.clientX-r.left)/r.width)*2-1, -((ev.clientY-r.top)/r.height)*2+1); ray.setFromCamera(ptr, G3.cam);
        const pt = new THREE.Vector3(); if (ray.ray.intersectPlane(G3.plano, pt)){ const o = G3.mq[drag.id]; o.userData.arrasto = pt.setY(2.4); drag.alvo = pedPerto(pt); marcarAlvo(drag.alvo); }
      }
      return;
    }
    if (ev.target !== canvas) { if (hover){ hover=null; $('#tip').hidden=true; } return; }
    const id = pick(ev); const tip = $('#tip');
    if (id !== hover){ hover = id; canvas.style.cursor = id ? 'grab' : ''; }
    if (id && S.maquinas[id]){ const m = S.maquinas[id]; const r = palco.getBoundingClientRect(); const lf = localFisico(m);
      const onde = lf.onde==='cam' ? (m.status==='devolucao' ? 'voltando de ' : 'a caminho de ') + nomeUn(lf.dono) : lf.para ? 'na fábrica, para ' + nomeUn(lf.para) : nomeUn(m.unidade);
      tip.innerHTML = `<b>${esc(rotMq(m))}</b>${esc(STATUS[m.status]?.n||m.status)} · ${esc(onde)}${m.nota?'<br>'+esc(m.nota):''}`;
      tip.style.left = (ev.clientX - r.left) + 'px'; tip.style.top = (ev.clientY - r.top) + 'px'; tip.hidden = false; }
    else tip.hidden = true;
  });
  const fim = () => {
    if (!drag) return; const d = drag; drag = null; G3.ctl.enabled = true; canvas.style.cursor = '';
    const o = G3.mq[d.id]; if (o) o.userData.arrasto = null; marcarAlvo(null);
    if (!d.ativo){ abrirMq(d.id); focarMq(d.id); return; }
    if (d.bloq){ toast(S.db ? 'Seu acesso a este painel é só de leitura.' : 'Entre na sua conta Claude para mover máquinas.', true); return; }
    if (d.alvo) mover(d.id, d.alvo);
  };
  window.addEventListener('pointerup', fim); window.addEventListener('pointercancel', fim);
}

/* teclado: WASD/setas andam, Q/E giram, R/F (ou +/-) aproximam, Shift acelera */
const TECLA = {KeyW:'f',ArrowUp:'f',KeyS:'t',ArrowDown:'t',KeyA:'e',ArrowLeft:'e',KeyD:'d',ArrowRight:'d',KeyQ:'ge',KeyE:'gd',KeyR:'zi',KeyF:'zo',Equal:'zi',Minus:'zo',NumpadAdd:'zi',NumpadSubtract:'zo'};
const apertadas = new Set(); let turbo = false, tAnt = null;
const campo = (el) => el && el.closest && el.closest('input,textarea,select,[contenteditable="true"]');
document.addEventListener('keydown', e => {
  if (!ATIVO) return;
  turbo = e.shiftKey; if (campo(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
  const a = TECLA[e.code]; if (!a || !R) return;
  e.preventDefault(); apertadas.add(a); voo = null;
  if (!e.repeat) mover3d(new Set([a]), 1/15);   // um toque rápido também anda um passo
});
document.addEventListener('keyup', e => { turbo = e.shiftKey; const a = TECLA[e.code]; if (a) apertadas.delete(a); });
window.addEventListener('blur', () => apertadas.clear());
function andar(t){
  const dt = tAnt == null ? 0 : Math.min(.05, t - tAnt); tAnt = t;
  if (!apertadas.size || !dt) return;
  mover3d(apertadas, dt);
}
function mover3d(apertadas, dt){
  const cam = G3.cam, alvo = G3.ctl.target; const off = new THREE.Vector3().subVectors(cam.position, alvo);
  const dist = off.length(); const vel = Math.max(6, dist*.85) * dt * (turbo ? 2.6 : 1);
  const frente = off.clone().setY(0).negate(); if (frente.lengthSq() < 1e-6) frente.set(0,0,-1); frente.normalize();
  const direita = new THREE.Vector3(-frente.z, 0, frente.x);
  const mv = new THREE.Vector3();
  if (apertadas.has('f')) mv.add(frente); if (apertadas.has('t')) mv.sub(frente);
  if (apertadas.has('d')) mv.add(direita); if (apertadas.has('e')) mv.sub(direita);
  if (mv.lengthSq()){ mv.normalize().multiplyScalar(vel); alvo.add(mv); cam.position.add(mv);
    alvo.x = Math.max(-260, Math.min(260, alvo.x)); alvo.z = Math.max(-260, Math.min(260, alvo.z)); cam.position.copy(alvo).add(off); }
  const giro = (apertadas.has('ge') ? 1 : 0) - (apertadas.has('gd') ? 1 : 0);
  if (giro){ off.applyAxisAngle(new THREE.Vector3(0,1,0), giro * 1.4 * dt * (turbo ? 2 : 1)); cam.position.copy(alvo).add(off); }
  const zoom = (apertadas.has('zo') ? 1 : 0) - (apertadas.has('zi') ? 1 : 0);
  if (zoom){ const nd = Math.max(G3.ctl.minDistance, Math.min(G3.ctl.maxDistance, dist * (1 + zoom * 1.3 * dt * (turbo ? 2 : 1)))); off.setLength(nd); cam.position.copy(alvo).add(off); }
}

/* loop */
function tamanho(){ if (!R) return; const w = palco.clientWidth, h = palco.clientHeight; R.setSize(w, h, false); G3.cam.aspect = w/Math.max(h,1); G3.cam.updateProjectionMatrix(); }
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const v3 = R ? new THREE.Vector3() : null, tmp = R ? new THREE.Vector3() : null;
function quadro(now){
  if (!ATIVO){ RAF = 0; G3.tq = null; tAnt = null; return; }
  RAF = requestAnimationFrame(quadro);
  const t = (now - G3.t0)/1000;
  const dtq = Math.min(.25, G3.tq == null ? 0 : t - G3.tq); G3.tq = t;
  if (voo){ voo.t = Math.min(1, voo.t + (reduz ? 1 : dtq/0.9)); const k = voo.t<.5 ? 2*voo.t*voo.t : 1-Math.pow(-2*voo.t+2,2)/2;
    G3.cam.position.lerpVectors(voo.p0, voo.p1, k); G3.ctl.target.lerpVectors(voo.t0, voo.t1, k); if (voo.t>=1) voo = null; }
  for (const o of Object.values(G3.ped)){ o.position.lerp(o.userData.alvo, .1); const es = o.scale.x + ((o.userData.escAlvo||1) - o.scale.x)*.12; o.scale.setScalar(es); }
  andar(t);
  // caminhões andando na estrada: ida fábrica → unidade, volta unidade → fábrica
  for (const c of Object.values(G3.caminhoes)){
    const e = G3.estradas[c.est]; if (!e) continue;
    const dur = 8 + e.len/9; let s = reduz ? .55 : ((t/dur + c.fase) % 1); if (c.volta) s = 1 - s;
    const p = e.curva.getPointAt(s), tg = e.curva.getTangentAt(s); if (c.volta) tg.negate();
    const lado = new THREE.Vector3(-tg.z,0,tg.x).multiplyScalar((c.volta ? -1.7 : 1.7)*MAPA.esc);
    c.grp.position.copy(p).add(lado).setY(0); c.grp.rotation.y = Math.atan2(-tg.z, tg.x);
    c.pos = c.grp.position; c.rot = c.grp.rotation.y;
  }
  for (const o of Object.values(G3.mq)){
    const u = o.userData; let alvo = u.arrasto || u.alvo; let k = u.arrasto ? .35 : .12;
    if (!u.arrasto && u.via && G3.caminhoes[u.via.cam] && G3.caminhoes[u.via.cam].pos){
      const c = G3.caminhoes[u.via.cam]; const cs = Math.cos(c.rot), sn = Math.sin(c.rot);
      tmp.set(c.pos.x + u.via.x*cs, u.via.y, c.pos.z - u.via.x*sn); alvo = tmp;
      if (u.preso === u.via.cam) k = 1; else { k = .14; if (o.position.distanceTo(tmp) < .8) u.preso = u.via.cam; }  // depois de embarcar, anda junto com o caminhão
      o.rotation.y += (c.rot - o.rotation.y) * .3;
    } else { o.rotation.y += (0 - o.rotation.y) * .15; u.preso = null; }
    o.position.lerp(alvo, k);
    const es = o.scale.x + ((u.arrasto ? 1 : u.escAlvo) - o.scale.x) * .15; o.scale.setScalar(es);
    if (reduz) continue;
    const ph = t*2 + u.fase;
    if (u.status==='manutencao'){ const pulso = Math.max(0,Math.sin(t*5+u.fase)); u.beacon.scale.setScalar(1 + .35*pulso); u.beacon.material.emissiveIntensity = .6 + 1.4*pulso; u.mat.emissiveIntensity = .05 + .2*pulso; }
    else if (u.status==='acabamento') u.beacon.scale.setScalar(1 + .12*Math.sin(ph));
    else u.beacon.scale.setScalar(1);
    u.beacon.position.y = u.g.h + .45 + .12*Math.sin(ph);
    if (u.status==='producao') u.mat.userData.uExp.value = .22 + .78*((Math.sin(t*.8+u.fase)+1)/2);  // peças se juntam e se afastam: montagem
    if (u.status==='envio' && !u.via){ u.caixote.position.y = (u.g.h+.3)/2 + .08*Math.sin(t*3+u.fase); }
    u.anel.scale.setScalar(u.rAnel * (u.arrasto ? 1.25 : 1));
  }
  G3.ctl.update(); R.render(G3.scene, G3.cam);
  const w = palco.clientWidth, h = palco.clientHeight;
  const proj = (el, x, y, z) => { v3.set(x,y,z).project(G3.cam); const vis = v3.z < 1 && Math.abs(v3.x) < 1.15 && Math.abs(v3.y) < 1.15;
    el.style.opacity = vis ? 1 : 0; el.style.pointerEvents = vis && el.classList.contains('lbl') ? 'auto' : 'none';
    el.style.transform = `translate(${(v3.x*.5+.5)*w}px, ${(-v3.y*.5+.5)*h}px) translate(-50%,-100%)`; };
  const longe = G3.cam.position.distanceTo(G3.ctl.target) > 95; const LB = $('#labels'); if (LB.classList.contains('longe') !== longe) LB.classList.toggle('longe', longe);
  const estreito = w < 560; if (LB.classList.contains('estreito') !== estreito) LB.classList.toggle('estreito', estreito);
  raiz.querySelectorAll('#labels .lbl').forEach(el => { const o = G3.ped[el.dataset.id]; if (!o){ el.style.opacity = 0; return; } proj(el, o.position.x, (el.dataset.id===FAB ? 7 : 6.8)*o.scale.x, o.position.z); });
  raiz.querySelectorAll('#labels .carga').forEach(el => { const c = G3.caminhoes[el.dataset.cam]; if (!c || !c.pos){ el.style.opacity = 0; return; } proj(el, c.pos.x, 4.6*MAPA.esc, c.pos.z); });
}

function renderAll(){ renderChips(); renderLista(); renderAviso(); sync3D(); if (UI.gaveta && UI.gaveta.tipo==='mq' && !S.maquinas[UI.gaveta.id]) fechar(); }

if (R){
  G3.cam.position.set(46, 62, 82); G3.ctl.target.set(0,0,4);
  new ResizeObserver(tamanho).observe(palco); tamanho(); RAF = requestAnimationFrame(quadro);
}
setModo(UI.modo);
renderAll();
let primeiraVista = false;
const obs = setInterval(()=>{ if (S.ok.u && !primeiraVista){ primeiraVista = true; geral(); clearInterval(obs); } }, 300);
API.retomar = () => { if (R && !RAF) RAF = requestAnimationFrame(quadro); tamanho(); };
boot(ctx);
}
return {montar, parar};
})();
