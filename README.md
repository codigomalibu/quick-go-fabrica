# Quick Go Fábrica

Sistema da fábrica Quick Go Drinks (Campo Grande, MS) para as máquinas **Mini Go** e **Tech Go**: peças, montagem, custos e preços, estoque e compras, links de compra, praças, manuais e, para administradores, a **Frota** das microfranquias em 3D.

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | Página do site (versão publicada como Artifact do Claude, com base de dados `window.claude`). |
| `frota/frota.js` | Módulo da aba Frota: pátio 3D, mapa do Brasil, caminhões de envio/devolução, arrastar máquinas entre unidades. |
| `frota/modelos.js` | Modelos 3D reais (vista explodida) da Mini Go e da Tech Go, simplificados a partir dos STL. |
| `frota/brasil.js` | Divisas simplificadas dos 27 estados para o mapa. |
| `img/`, `fotos/` | Fotos do equipamento, dos conjuntos e de cada componente. |
| `manuais/` | Manual Técnico e Manual de Equipamento (PDF). |
| `wix/embed.html` | Versão para o site Wix "Máquinas Quick Go" (HTML embutido que conversa com o Velo por `postMessage`). Carrega o 3D da Frota deste repositório via jsDelivr. |
| `wix/embed-anterior.html` | Cópia do HTML que estava no Wix antes da aba Frota. |
| `ferramentas/frota-avulsa.html` | Painel Frota antigo, independente (referência). |

## Perfis

- **Administrador**: tudo, incluindo custos, compras, links e a aba Frota.
- **Montagem Técnica**: peças, montagem, estoque, praças e manuais.
- **Somente leitura**: consulta.

## Frota

A aba Frota lê e grava as coleções `frota_unidades`, `frota_maquinas` e `frota_movimentos`, acessíveis só a administradores. Cada unidade recebe 2 Mini Go e 1 Tech Go. Navegação: arraste para girar, WASD/setas andam, Q/E giram, R/F aproximam.
