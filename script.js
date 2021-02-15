// Objeto que cria o Modal
const Modal = {
  open() {
    // Abrir o modal
    // Adicionar a class active ao modal
    document.querySelector('.modal-overlay').classList.add('active');
  },

  close() {
    // Fechar o modal
    // Remover a class active ao modal
    document.querySelector('.modal-overlay').classList.remove('active');
  },
};

// Armazenando as transacoes no LocalStorage
const Storage = {
  // Retornando as transacoes em formato de array
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
  },
  // Guardando as transacoes no LocalStorage em formato de string
  set(transactions) {
    localStorage.setItem(
      'dev.finances:transactions',
      JSON.stringify(transactions)
    );
  },
};

// Calculo das transacoes
const Transaction = {
  // Objeto com os dados das transacoes guardados no LocalStorage
  all: Storage.get(),

  // Adiciona uma transacao ao vetor de transacoes
  add(transaction) {
    Transaction.all.push(transaction);
    // Apos adicionar a transacao, recarrega a aplicacao
    App.reload();
  },

  // Remove uma transacao com base no index do vetor
  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;
    // pegar todas as transacoes
    // para cada transacao
    Transaction.all.forEach((transaction) => {
      // se ela for maior que zero
      if (transaction.amount > 0) {
        // somar a uma variavel e retornar a variavel
        income += transaction.amount;
      }
    });
    return income;
  },
  expenses() {
    let expense = 0;
    // pegar todas as transacoes
    // para cada transacao
    Transaction.all.forEach((transaction) => {
      // se ela for menor que zero
      if (transaction.amount < 0) {
        // somar a uma variavel e retornar a variavel
        expense += transaction.amount;
      }
    });
    return expense;
  },
  total() {
    // entradas - saidas
    return Transaction.incomes() + Transaction.expenses();
  },
};

// Adicionando uma transacao na tabela
const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),

  // Criando uma linha na tabela para cada transacao
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionContainer.appendChild(tr);
  },

  // Inserindo a transacao no HTML
  innerHTMLTransaction(transaction, index) {
    // Se a transacao for menor que 0 adiciona a classe income, se nao, a classe expense para diferenciar os valores positivos e negativos
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense';

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
                    <td class="description">${transaction.description}</td>
                    <td class="${CSSclass}">${amount}</td>
                    <td class="date">${transaction.date}</td>
                    <td>
                    <img class="removeIcon" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação" />
                    </td>  
                `;
    return html;
  },

  // Atualizando os valores dos cards de transacoes
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransaction() {
    DOM.transactionContainer.innerHTML = '';
  },
};

// Formatando os valores das transacoes
const Utils = {
  // Formatando os valores de dinheiro
  formatAmount(value) {
    value = Number(value) * 100;

    return value;
  },

  // Formatando os valores de data do formato padrao para o formato separado por barra ordenando de tras para frente no array
  formatDate(date) {
    const splittedDate = date.split('-');
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  // Formatando os valores da transacao para a moeda brasileira
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';

    value = String(value).replace(/\D/g, '');

    value = Number(value) / 100;

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return signal + value;
  },
};

const Form = {
  // Pegando o value dos inputs
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  // Validando se os campos foram preenchidos e retornando um erro se nao forem
  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Por favor, preencha todos os campos');
    }
  },

  // Funcao que retorna os dados ja formatados
  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  // Limpar os dados dos campos do formulario
  clearFields() {
    Form.description.value = '';
    Form.amount.value = '';
    Form.date.value = '';
  },

  // Funcao que trata do evento submit do formulario
  subtmit(event) {
    // Prevendo o comportamento padrao do form
    event.preventDefault();

    // Condicao para que se algumas das funcionalidades nao derem certo, retorna um erro
    try {
      // Verificar se todas as informacoes foram preenchidas
      Form.validateFields();
      // Formatar os dados para salvar
      const transaction = Form.formatValues();
      // Salvar
      Transaction.add(transaction);
      // Apagar os dados dos campos do formulario
      Form.clearFields();
      // Fechar o modal
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  // Funcao que trata do inicio da aplicacao
  init() {
    // A cada transacao nova, adiciona a transacao na tabela
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });

    // Chamando a funcao que atualiza os cardss
    DOM.updateBalance();

    Storage.set(Transaction.all);
  },
  // Funcao que trata do recarregamento da aplicacao
  reload() {
    DOM.clearTransaction();
    App.init();
  },
};

App.init();
