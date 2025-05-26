// Estruturas de dados
let equipamentos = JSON.parse(localStorage.getItem('equipamentos')) || [];
let manutencoes = JSON.parse(localStorage.getItem('manutencoes')) || [];

// Navegação entre seções
const botoesMenu = document.querySelectorAll('.menu-btn');
const secoes = document.querySelectorAll('section');

botoesMenu.forEach(botao => {
    botao.addEventListener('click', () => {
        botoesMenu.forEach(btn => btn.classList.remove('active'));
        botao.classList.add('active');

        secoes.forEach(sec => sec.style.display = 'none');
        document.getElementById(botao.dataset.section).style.display = 'block';

        if (botao.dataset.section === 'listar') preencherTabelaEquipamentos();
        if (botao.dataset.section === 'registrar-manutencao') preencherSelectManutencao();
        if (botao.dataset.section === 'listar-manutencoes') preencherTabelaManutencoes();
    });
});

// Mostrar campo voltagem quando tipo for eletrônico
document.getElementById('tipo').addEventListener('change', function () {
    const container = document.getElementById('voltagem-container');
    if (this.value === 'Equipamento Eletrônico') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        document.getElementById('voltagem').value = '';
    }
});

// Adicionar equipamento
document.getElementById('form-adicionar-equipamento').addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const tipo = document.getElementById('tipo').value;
    const dataUltima = document.getElementById('data_ultima_manutencao').value;
    const prazo = document.getElementById('prazo_revisao').value;
    const voltagem = tipo === 'Equipamento Eletrônico' ? document.getElementById('voltagem').value : null;

    equipamentos.push({ nome, tipo, dataUltima, prazo, voltagem });
    localStorage.setItem('equipamentos', JSON.stringify(equipamentos));

    document.getElementById('form-adicionar-equipamento').reset();
    document.getElementById('voltagem-container').style.display = 'none';
    mostrarMensagem('mensagem-adicionar', 'Equipamento adicionado com sucesso!', true);
});

// Preencher tabela de equipamentos
function preencherTabelaEquipamentos() {
    const tbody = document.querySelector('#tabela-equipamentos tbody');
    tbody.innerHTML = '';

    equipamentos.forEach(eq => {
        const tr = document.createElement('tr');
        const hoje = new Date().toISOString().split('T')[0];
        const status = eq.prazo < hoje ? 'Revisão Vencida' : 'Em Dia';

        tr.innerHTML = `
            <td>${eq.nome}</td>
            <td>${eq.tipo}</td>
            <td>${eq.dataUltima}</td>
            <td>${eq.prazo}</td>
            <td style="color:${status === 'Revisão Vencida' ? 'red' : 'green'}">${status}</td>
            <td>${eq.voltagem || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Remover equipamento
document.getElementById('form-remover-equipamento').addEventListener('submit', function (e) {
    e.preventDefault();
    const nome = document.getElementById('nome-remover').value.trim();
    const inicial = equipamentos.length;
    equipamentos = equipamentos.filter(eq => eq.nome !== nome);
    localStorage.setItem('equipamentos', JSON.stringify(equipamentos));

    const msg = equipamentos.length < inicial ? 'Equipamento removido com sucesso.' : 'Equipamento não encontrado.';
    mostrarMensagem('mensagem-remover', msg, equipamentos.length < inicial);
    this.reset();
});

// Preencher select de equipamentos no formulário de manutenção
function preencherSelectManutencao() {
    const select = document.getElementById('equipamento-manutencao');
    select.innerHTML = '<option value="" disabled selected>Selecione um equipamento</option>';
    equipamentos.forEach(eq => {
        const option = document.createElement('option');
        option.value = eq.nome;
        option.textContent = eq.nome;
        select.appendChild(option);
    });
}

// Registrar manutenção
document.getElementById('form-registrar-manutencao').addEventListener('submit', function (e) {
    e.preventDefault();

    const equipamento = document.getElementById('equipamento-manutencao').value;
    const data = document.getElementById('data-manutencao').value;
    const detalhes = document.getElementById('detalhes-manutencao').value.trim();

    manutencoes.push({ equipamento, data, detalhes });
    localStorage.setItem('manutencoes', JSON.stringify(manutencoes));

    mostrarMensagem('mensagem-registrar', 'Manutenção registrada com sucesso!', true);
    this.reset();
});

// Listar manutenções
function preencherTabelaManutencoes() {
    const tbody = document.querySelector('#tabela-manutencoes tbody');
    tbody.innerHTML = '';

    manutencoes.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.equipamento}</td>
            <td>${m.data}</td>
            <td>${m.detalhes}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Verificar revisões vencidas
document.getElementById('form-verificar-revisoes').addEventListener('submit', function (e) {
    e.preventDefault();
    const dataAtual = document.getElementById('data-atual').value;

    const vencidos = equipamentos.filter(eq => eq.prazo < dataAtual);
    const div = document.getElementById('resultado-revisoes');

    if (vencidos.length === 0) {
        div.textContent = 'Nenhum equipamento com revisão vencida.';
        div.style.color = 'green';
    } else {
        div.innerHTML = `Equipamentos com revisão vencida:<br><ul>${vencidos.map(v => `<li>${v.nome}</li>`).join('')}</ul>`;
        div.style.color = 'red';
    }
});

// Utilitário para mostrar mensagens
function mostrarMensagem(id, texto, sucesso = true) {
    const div = document.getElementById(id);
    div.textContent = texto;
    div.style.color = sucesso ? 'green' : 'red';
    setTimeout(() => div.textContent = '', 4000);
}

