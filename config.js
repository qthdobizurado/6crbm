/* ============================================================
   ⚙️  CONFIGURAÇÃO GERAL — PAINEL DE COMANDO BOMBEIRO MILITAR
   ============================================================
   Edite apenas este arquivo para personalizar o painel.
   O site se adapta automaticamente a qualquer mudança aqui.
   ============================================================ */

/* ------------------------------------------------------------
   🏷️  IDENTIDADE DO COMANDO
   ------------------------------------------------------------ */
const TITULO_COMANDO   = '6° COMANDO REGIONAL';   // Linha principal do cabeçalho
const SUBTITULO        = 'BOMBEIRO MILITAR';        // Linha secundária do cabeçalho
const NOME_CURTO       = '6º CRBM';                // Usado em botões e mensagens (ex: "Enviar ao 6º CRBM")

/* ------------------------------------------------------------
   🔗  URL DO GOOGLE APPS SCRIPT (Web App)
   Passos para obter:
   1. Abra script.google.com e cole o código .gs
   2. Menu: Implantações > Nova implantação > App da Web
   3. Copie a URL e cole aqui
   ------------------------------------------------------------ */
const SCRIPT_URL        = 'https://script.google.com/macros/s/AKfycbyuxiVvORoZHOmyoowKkeVcGw7snAj308CzOY7ktGUx1p95bXokpY69dDMA-tQKXbSp/exec';
const SCRIPT_URL_DIARIO = SCRIPT_URL;
const SCRIPT_URL_MENSAL = SCRIPT_URL;

/* ------------------------------------------------------------
   🏢  UNIDADES SUBORDINADAS
   Adicione, remova ou renomeie unidades aqui.
   Cada unidade precisa de:
     - nome  : nome completo exibido no painel
     - tipo  : tipo da unidade (aparece como subtítulo)
     - abrev : abreviação curta para gráficos
     - slug  : identificador único sem espaços/acentos (para URLs)

   Cores são atribuídas automaticamente na ordem abaixo.
   Para personalizar cores, adicione "cor: '#HEX'" em cada item.
   ------------------------------------------------------------ */
const CONFIG_UNIDADES = [
    {
        nome:  '12º BBM - Cidade de Goiás',
        tipo:  'Batalhão de Bombeiros Militar',
        abrev: '12º BBM',
        slug:  '12bbm'
    },
    {
        nome:  '13ª CIBM - Iporá',
        tipo:  'Companhia Independente de Bombeiros Militar',
        abrev: '13ª CIBM',
        slug:  '13cibm'
    },
    {
        nome:  '17ª CIBM - Itaberaí',
        tipo:  'Companhia Independente de Bombeiros Militar',
        abrev: '17ª CIBM',
        slug:  '17cibm'
    },
    {
        nome:  '19ª CIBM - São Luís de Montes Belos',
        tipo:  'Companhia Independente de Bombeiros Militar',
        abrev: '19ª CIBM',
        slug:  '19cibm'
    },
    {
        nome:  '1º PBM - Aruana',
        tipo:  'Posto de Bombeiros Militar',
        abrev: '1º PBM',
        slug:  '1pbm'
    },
    {
        nome:  'DBM - Mozarlândia (17ª CIBM)',
        tipo:  'Destacamento de Bombeiros Militar — 17ª CIBM',
        abrev: 'DBM Moz',
        slug:  'dbmmoz'
    }
];

/* ============================================================
   ⚠️  NÃO EDITE ABAIXO DESTA LINHA
   O código abaixo transforma CONFIG_UNIDADES no formato
   interno usado pelo painel. Qualquer alteração pode
   quebrar o funcionamento do site.
   ============================================================ */
const _CORES_PADRAO = [
    '#1e5fa5','#fb8c00','#28a745','#d85a30','#888780',
    '#6a1fb5','#e91e63','#00897b','#f4511e','#546e7a'
];

const unidades = CONFIG_UNIDADES.map((u, i) => ({
    id:   i + 1,
    nome: u.nome,
    tipo: u.tipo
}));

const coresUnidades  = CONFIG_UNIDADES.map((u, i) => u.cor || _CORES_PADRAO[i % _CORES_PADRAO.length]);
const nomesUnidades  = CONFIG_UNIDADES.map(u => u.abrev || u.nome);
const nomesAbrev     = CONFIG_UNIDADES.map(u => u.slug  || u.abrev || u.nome);
const slugsUnidades  = CONFIG_UNIDADES.map(u => u.slug);
