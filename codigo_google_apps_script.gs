// ============================================================
// 6º COMANDO REGIONAL BOMBEIRO MILITAR
// Google Apps Script — Backend do Painel
// ============================================================
// INSTRUÇÕES DE IMPLANTAÇÃO:
// 1. Acesse script.google.com e crie um novo projeto
// 2. Cole todo este código substituindo o conteúdo existente
// 3. No menu: Implantações > Nova implantação
//    - Tipo: App da Web
//    - Executar como: Eu mesmo
//    - Quem pode acessar: Qualquer pessoa
// 4. Copie a URL gerada e cole no painel HTML:
//    - SCRIPT_URL_DIARIO  → URL deste script (mesmo para ambos)
//    - SCRIPT_URL_MENSAL  → URL deste script (mesmo para ambos)
// ============================================================

const SHEET_ID = 'COLE_AQUI_O_ID_DA_SUA_PLANILHA'; // Ex: '1BxiMVs...'

// Nomes das abas da planilha
const ABA_DIARIO  = 'QuadroDiario';
const ABA_MENSAL  = 'DadosMensais';

// ============================================================
// CABEÇALHOS — criados automaticamente na primeira execução
// ============================================================
const CABECALHO_DIARIO = [
    'Timestamp', 'UnidadeId', 'Unidade',
    'EfetivoOrd', 'EfetivoAC4', 'EfetivoTotal',
    'OficialDia', 'Contato', 'VTRsAtivas'
];

const CABECALHO_MENSAL = [
    'Timestamp', 'UnidadeId', 'Unidade',
    'Oficiais', 'Pracas', 'Operacional',
    'AdmOficiais', 'AdmPracas', 'Afastamentos',
    'VtrOperacional', 'VtrManutencao', 'VtrInoperante',
    'EmbOperacional', 'EmbManutencao', 'EmbInoperante',
    'MatDesencarcerador', 'MatDEA', 'MatDrone',
    'MatCompressor', 'MatMergulho'
];

// ============================================================
// CORS — permite chamadas do HTML hospedado em qualquer origem
// ============================================================
function setCORSHeaders(output) {
    return output
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'GET, POST')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ============================================================
// GET — responde ao preflight CORS e leitura de dados
// ============================================================
function doGet(e) {
    const tipo      = e?.parameter?.tipo      || '';
    const unidadeId = e?.parameter?.unidadeId || '';
    let resultado;

    if (tipo === 'diario' && unidadeId) {
        // Retorna último registro diário de uma unidade específica
        resultado = lerUltimoDiarioPorUnidade(unidadeId);
    } else if (tipo === 'mensal' && unidadeId) {
        // Retorna último registro mensal de uma unidade específica
        resultado = lerUltimoMensalPorUnidade(unidadeId);
    } else if (tipo === 'diario') {
        resultado = lerUltimosDiarios();
    } else if (tipo === 'mensal') {
        resultado = lerUltimosMensais();
    } else {
        resultado = { sucesso: true, mensagem: 'API ativa' };
    }

    const output = ContentService
        .createTextOutput(JSON.stringify(resultado))
        .setMimeType(ContentService.MimeType.JSON);

    return setCORSHeaders(output);
}

// ============================================================
// POST — recebe dados do formulário e grava na planilha
// ============================================================
function doPost(e) {
    let resultado;

    try {
        const dados = JSON.parse(e.postData.contents);
        const tipo  = dados.tipo;

        if (tipo === 'diario') {
            resultado = gravarDiario(dados);
        } else if (tipo === 'mensal') {
            resultado = gravarMensal(dados);
        } else {
            resultado = { sucesso: false, mensagem: 'Tipo desconhecido: ' + tipo };
        }
    } catch (err) {
        resultado = { sucesso: false, mensagem: 'Erro ao processar: ' + err.message };
    }

    const output = ContentService
        .createTextOutput(JSON.stringify(resultado))
        .setMimeType(ContentService.MimeType.JSON);

    return setCORSHeaders(output);
}

// ============================================================
// GRAVAR — Quadro Diário
// ============================================================
function gravarDiario(d) {
    const aba = obterOuCriarAba(ABA_DIARIO, CABECALHO_DIARIO);

    // Verifica se já existe linha para esta unidade hoje e atualiza
    const hoje = new Date().toLocaleDateString('pt-BR');
    const dados = aba.getDataRange().getValues();
    let linhaExistente = -1;

    for (let i = 1; i < dados.length; i++) {
        const ts   = dados[i][0]?.toString() || '';
        const unId = dados[i][1]?.toString() || '';
        if (ts.startsWith(hoje) && unId == d.unidadeId) {
            linhaExistente = i + 1; // 1-indexed
            break;
        }
    }

    const linha = [
        d.timestamp, d.unidadeId, d.unidade,
        d.efetivoOrd, d.efetivoAc4, d.efetivoTotal,
        d.oficial, d.contato, d.vtrs
    ];

    if (linhaExistente > 0) {
        aba.getRange(linhaExistente, 1, 1, linha.length).setValues([linha]);
    } else {
        aba.appendRow(linha);
    }

    return { sucesso: true, mensagem: 'Quadro Diário salvo com sucesso.' };
}

// ============================================================
// GRAVAR — Dados Mensais
// ============================================================
function gravarMensal(d) {
    const aba = obterOuCriarAba(ABA_MENSAL, CABECALHO_MENSAL);

    // Verifica se já existe linha para esta unidade neste mês e atualiza
    const mesAno = new Date().toLocaleDateString('pt-BR', { month:'2-digit', year:'numeric' }).replace('/','/');
    const dados  = aba.getDataRange().getValues();
    let linhaExistente = -1;

    for (let i = 1; i < dados.length; i++) {
        const ts   = dados[i][0]?.toString() || '';
        const unId = dados[i][1]?.toString() || '';
        if (ts.includes(mesAno.split('/')[1]) && unId == d.unidadeId) {
            linhaExistente = i + 1;
            break;
        }
    }

    const linha = [
        d.timestamp, d.unidadeId, d.unidade,
        d.oficiais, d.pracas, d.operacional,
        d.admOf, d.admPr, d.afastamentos,
        d.vtrOp, d.vtrMt, d.vtrIn,
        d.embOp, d.embMt, d.embIn,
        d.matDes, d.matDea, d.matDrone,
        d.matComp, d.matMerg
    ];

    if (linhaExistente > 0) {
        aba.getRange(linhaExistente, 1, 1, linha.length).setValues([linha]);
    } else {
        aba.appendRow(linha);
    }

    return { sucesso: true, mensagem: 'Dados mensais salvos com sucesso.' };
}

// ============================================================
// LER — último registro diário de uma unidade específica
// ============================================================
function lerUltimoDiarioPorUnidade(unidadeId) {
    try {
        const aba   = obterOuCriarAba(ABA_DIARIO, CABECALHO_DIARIO);
        const dados = aba.getDataRange().getValues();
        if (dados.length <= 1) return { sucesso: true, registro: null };

        let ultimo = null;
        for (let i = 1; i < dados.length; i++) {
            const uid = dados[i][1]?.toString();
            if (uid == unidadeId) {
                if (!ultimo || dados[i][0] > ultimo[0]) {
                    ultimo = dados[i];
                }
            }
        }

        if (!ultimo) return { sucesso: true, registro: null };

        return {
            sucesso: true,
            registro: {
                timestamp:   ultimo[0], unidadeId: ultimo[1], unidade: ultimo[2],
                efetivoOrd:  ultimo[3], efetivoAc4: ultimo[4], efetivoTotal: ultimo[5],
                oficial:     ultimo[6], contato: ultimo[7], vtrs: ultimo[8]
            }
        };
    } catch(e) {
        return { sucesso: false, mensagem: e.message };
    }
}

// ============================================================
// LER — último registro mensal de uma unidade específica
// ============================================================
function lerUltimoMensalPorUnidade(unidadeId) {
    try {
        const aba   = obterOuCriarAba(ABA_MENSAL, CABECALHO_MENSAL);
        const dados = aba.getDataRange().getValues();
        if (dados.length <= 1) return { sucesso: true, registro: null };

        const cab = dados[0];
        let ultimo = null;
        for (let i = 1; i < dados.length; i++) {
            const uid = dados[i][1]?.toString();
            if (uid == unidadeId) {
                if (!ultimo || dados[i][0] > ultimo[0]) {
                    ultimo = dados[i];
                }
            }
        }

        if (!ultimo) return { sucesso: true, registro: null };

        const obj = {};
        cab.forEach((c, i) => { obj[c] = ultimo[i]; });
        return { sucesso: true, registro: obj };
    } catch(e) {
        return { sucesso: false, mensagem: e.message };
    }
}

// ============================================================
// LER — últimos registros diários (um por unidade)
// ============================================================
function lerUltimosDiarios() {
    try {
        const aba   = obterOuCriarAba(ABA_DIARIO, CABECALHO_DIARIO);
        const dados = aba.getDataRange().getValues();
        if (dados.length <= 1) return { sucesso: true, registros: [] };

        // Agrupa por unidadeId e pega o mais recente
        const mapa = {};
        for (let i = 1; i < dados.length; i++) {
            const uid = dados[i][1];
            if (!mapa[uid] || dados[i][0] > mapa[uid][0]) {
                mapa[uid] = dados[i];
            }
        }

        const registros = Object.values(mapa).map(r => ({
            timestamp: r[0], unidadeId: r[1], unidade: r[2],
            efetivoOrd: r[3], efetivoAc4: r[4], efetivoTotal: r[5],
            oficial: r[6], contato: r[7], vtrs: r[8]
        }));

        return { sucesso: true, registros };
    } catch(e) {
        return { sucesso: false, mensagem: e.message };
    }
}

// ============================================================
// LER — últimos registros mensais (um por unidade)
// ============================================================
function lerUltimosMensais() {
    try {
        const aba   = obterOuCriarAba(ABA_MENSAL, CABECALHO_MENSAL);
        const dados = aba.getDataRange().getValues();
        if (dados.length <= 1) return { sucesso: true, registros: [] };

        const mapa = {};
        for (let i = 1; i < dados.length; i++) {
            const uid = dados[i][1];
            if (!mapa[uid] || dados[i][0] > mapa[uid][0]) {
                mapa[uid] = dados[i];
            }
        }

        const cab   = dados[0];
        const registros = Object.values(mapa).map(r => {
            const obj = {};
            cab.forEach((c, i) => { obj[c] = r[i]; });
            return obj;
        });

        return { sucesso: true, registros };
    } catch(e) {
        return { sucesso: false, mensagem: e.message };
    }
}

// ============================================================
// UTILITÁRIO — obtém ou cria aba com cabeçalho
// ============================================================
function obterOuCriarAba(nomeAba, cabecalho) {
    const ss  = SpreadsheetApp.openById(SHEET_ID);
    let   aba = ss.getSheetByName(nomeAba);

    if (!aba) {
        aba = ss.insertSheet(nomeAba);
        aba.getRange(1, 1, 1, cabecalho.length)
           .setValues([cabecalho])
           .setFontWeight('bold')
           .setBackground('#CE1126')
           .setFontColor('#FFFFFF');
        aba.setFrozenRows(1);
        aba.autoResizeColumns(1, cabecalho.length);
    }

    return aba;
}

// ============================================================
// TESTE MANUAL — rode esta função no editor para testar
// ============================================================
function testarScript() {
    const resultDiario = gravarDiario({
        tipo: 'diario', unidadeId: 1, unidade: '12º BBM - Cidade de Goiás',
        timestamp: new Date().toLocaleString('pt-BR'),
        efetivoOrd: 6, efetivoAc4: 2, efetivoTotal: 8,
        oficial: 'Cap. Teste', contato: '(62) 99999-0000',
        vtrs: 'ABT-12, UR-205'
    });
    Logger.log('Diário: ' + JSON.stringify(resultDiario));

    const resultMensal = gravarMensal({
        tipo: 'mensal', unidadeId: 1, unidade: '12º BBM - Cidade de Goiás',
        timestamp: new Date().toLocaleString('pt-BR'),
        oficiais: 12, pracas: 45, operacional: 48,
        admOf: 6, admPr: 9, afastamentos: 8,
        vtrOp: 6, vtrMt: 2, vtrIn: 1,
        embOp: 3, embMt: 1, embIn: 0,
        matDes: 3, matDea: 4, matDrone: 2,
        matComp: 3, matMerg: 4
    });
    Logger.log('Mensal: ' + JSON.stringify(resultMensal));
}
