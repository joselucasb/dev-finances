const messages = {
  alert: {
    optionNotSelect: 'Por favor, escolha uma transação.',
    emptyFilds: 'É necessário preencher todos campos.',
    transactionNotFound: 'Nenhuma transação encontrada.',
  },
};

const ModifyCSS = {
  body: document.body,

  aplly(htmlElement, styles = {}) {
    for (let property in styles) {
      const value = styles[property];

      htmlElement.style[property] = value;
    }
  },

  bodyOverflow(value = 'auto') {
    const { body } = ModifyCSS;

    body.style.overflow = value;
  },
};

const ApplicationStorage = {
  key: 'dev.finances:data',

  get() {
    const dataString = localStorage.getItem(ApplicationStorage.key);
    return ApplicationStorage._deserialize(dataString) || [];
  },

  set(data) {
    const string = ApplicationStorage._serialize(data);
    localStorage.setItem(ApplicationStorage.key, string);
  },

  // Private method
  _serialize(data) {
    return JSON.stringify(data);
  },

  // Private method
  _deserialize(string) {
    return JSON.parse(string);
  },

  clearStorage(boo = false) {
    if (boo) localStorage.clear();
  },
};

/*
 * Transaction - CRUD
 */

const Transaction = {
  data: ApplicationStorage.get(),

  incomes() {
    let income = 0;

    Transaction.data.forEach(({ amount }) => {
      if (amount > 0) income += amount;
    });

    return income;
  },

  expenses() {
    let expense = 0;

    Transaction.data.forEach(({ amount }) => {
      if (amount < 0) expense += amount;
    });

    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  },

  set({ description, amount, date }) {
    Transaction.data.unshift({
      description,
      amount,
      date,
    });
  },

  delete(index) {
    Transaction.data.splice(index, 1);
  },

  update(index, object) {
    for (let key in object) {
      if (object[key] !== '') {
        const value = object[key];
        Transaction.data[index][key] = value;
      }
    }
  },

  clear() {
    Transaction.data = [];
  },
};

/*
 * Exception - Exceções
 */

const Exception = {
  container: document.querySelector('.exception-container'),
  textView: document.querySelector('.exception-content'),

  className: 'active',
  handleTimeoutValue: null,

  // Private method
  _default() {
    if (Exception.handleTimeoutValue) {
      Exception.clearHandleTimeout();
    }
  },

  open() {
    Exception._default();
    const boolean = Exception._constaisClassName();

    if (!boolean) {
      Exception.container.classList.add(Exception.className);
    }
  },

  close() {
    Exception._default();
    const boolean = Exception._constaisClassName();

    if (boolean) {
      Exception.container.classList.remove(Exception.className);
    }
  },

  automatiacClosing(seconds = 5) {
    const milliseconds = Utils.secondsToMilliseconds(seconds);
    const isPresent = Exception._constaisClassName();

    const timeoutHandle = () => {
      Exception.close();
    };

    if (isPresent) {
      const handle = setTimeout(timeoutHandle, milliseconds);
      Exception._setHandleTimeout(handle);
    }
  },

  // Private method
  _constaisClassName(className = null) {
    const { classList } = Exception.container;

    return classList.contains(className || Exception.className);
  },

  clearHandleTimeout() {
    clearTimeout(Exception.handleTimeoutValue);
    Exception.handleTimeoutValue = null;
  },

  // Private method
  _setHandleTimeout(handle = null) {
    Exception.handleTimeoutValue = handle;
  },

  setMessage(message) {
    Exception.textView.textContent = message;
  },
};

/*
 * Moda
 */

const Modal = {
  modalOverlay: document.querySelector('#modal'),

  open() {
    Modal.modalOverlay.classList.remove('hidden');

    ModifyCSS.bodyOverflow('hidden');
  },

  close() {
    Modal.modalOverlay.classList.add('hidden');

    ModifyCSS.bodyOverflow('auto');
    Form.clearFields();
  },
};

/*
 * Modal update
 */

const ModalUpdate = {
  overlay: document.querySelector('#modal-update'),
  fields: document.querySelectorAll('#modal-update input'),
  selectField: document.querySelector(' #modal-update select'),

  open() {
    const { length } = Transaction.data;

    try {
      if (length <= 0) {
        const { transactionNotFound } = messages.alert;

        throw new Error(transactionNotFound);
      }

      ModalUpdate.overlay.classList.remove('hidden');
      ModifyCSS.bodyOverflow('hidden');
    } catch ({ message }) {
      Exception.setMessage(message);
      Exception.open();

      Exception.automatiacClosing(10);
    }
  },

  close() {
    ModalUpdate.overlay.classList.add('hidden');

    ModifyCSS.bodyOverflow('auto');
    ModalUpdate.clearFields();
  },

  clearFields() {
    ModalUpdate.fields.forEach((field) => {
      field.value = '';
    });

    ModalUpdate.selectField.value = '';
  },

  removeSelectOptions() {
    const options = ModalUpdate.selectField.querySelectorAll('option');

    options.forEach((option, key) => {
      if (key > 0) option.remove();
    });
  },
};

/*
 * Form
 */

const Form = {
  fields: document.querySelectorAll('#modal input'),

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const data = Form.formatValues();

      Transaction.set(data);
      Modal.close();

      ApplicationStorage.set(Transaction.get);
      App.reload();
    } catch ({ message }) {
      // Error alert
      Exception.setMessage(message);

      Exception.open();
      Exception.automatiacClosing(10);
    }
  },

  values() {
    const object = {};
    Form.fields.forEach((field) => {
      object[field.name] = field.value.trim();
    });

    return object;
  },

  validateFields() {
    const values = Form.values();
    let isEmpty;

    for (key in values) {
      if (values[key] === '') {
        isEmpty = true;
        break;
      }
    }

    if (isEmpty) {
      const { emptyFilds } = messages.alert;

      throw new Error(emptyFilds);
    }
  },

  formatValues() {
    let { description, amount, date } = Form.values();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return { description, amount, date };
  },

  clearFields() {
    Form.fields.forEach((field) => {
      field.value = '';
    });
  },
};

const FormUpdate = {
  submit(event) {
    event.preventDefault();

    try {
      const fields = ModalUpdate.fields;
      const key = ModalUpdate.selectField.value;

      if (!key) {
        const { optionNotSelect } = messages.alert;

        throw new Error(optionNotSelect);
      }

      let object = {};

      fields.forEach((field) => {
        if (field.value !== '') {
          let value = FormUpdate.formatValues(field.name, field.value);

          object[field.name] = value;
        }
      });

      Transaction.update(key, object);
      ModalUpdate.close();

      App.reload();
    } catch ({ message }) {
      Exception.setMessage(message);

      Exception.open();
      Exception.automatiacClosing(10);
    }
  },

  formatValues(name, value) {
    switch (name) {
      case 'amount':
        value = Utils.formatAmount(value);
        break;

      case 'date':
        value = Utils.formatDate(value);
        break;

      default:
        return value;
    }

    return value;
  },
};

/*
 * View
 */

const View = {
  tableBody: document.querySelector('tbody'),

  addTransaction(transaction, index) {
    const tableRow = document.createElement('tr');

    tableRow.innerHTML = View.createHtmlTemplate(transaction);
    tableRow.setAttribute('data-index', index);

    View.tableBody.appendChild(tableRow);
  },

  removeTransaction(target) {
    const { index } = target.parentNode.dataset;

    Transaction.delete(index);

    App.reload();
  },

  createHtmlTemplate({ description, amount, date }) {
    const className = amount >= 0 ? 'expense' : 'income';
    const money = Utils.formatCurrency(amount);

    const template = `
      <td class="description">${description}</td>
      <td class="${className}">${money}</td>
      <td class="date">${date}</td>
      <td class="remove" title="Excluir transação" onclick="View.removeTransaction(this)">
        <img src="./public/assets/minus.svg" alt="Remover transação"/>
      </td>
    `;

    return template;
  },

  updateBalance() {
    const income = document.querySelector('.income-display');
    income.innerHTML = Utils.formatCurrency(Transaction.incomes());

    const expense = document.querySelector('.expense-display');
    expense.innerHTML = Utils.formatCurrency(Transaction.expenses());

    const total = document.querySelector('.total-display');
    total.innerHTML = Utils.formatCurrency(Transaction.total());
  },

  populateModal() {
    ModalUpdate.removeSelectOptions();

    const transactions = Transaction.data;

    transactions.forEach(({ description, amount }, index) => {
      const option = document.createElement('option');
      const money = Utils.formatCurrency(amount);

      option.textContent = `${description}, ${money}`;
      option.value = index;

      ModalUpdate.selectField.appendChild(option);
    });
  },

  clearView() {
    View.tableBody.innerHTML = '';
  },
};

const Utils = {
  formatCurrency(amount) {
    const signal = Number(amount) < 0 ? '-' : '';

    let value = String(amount).replace(/\D/gi, '');
    value = Number(value) / 100;

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return `${signal} ${value}`;
  },

  formatAmount(amount) {
    return Math.round(100 * amount);
  },

  formatDate(date) {
    const splittedDate = date.split('-');
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  secondsToMilliseconds(seconds) {
    return seconds * 1000;
  },
};

const App = {
  init() {
    View.populateModal();
    View.updateBalance();
    View.clearView();

    Transaction.data.forEach(View.addTransaction);
    ApplicationStorage.set(Transaction.data);
  },

  reload() {
    App.init();
  },
};

const setCurrentYear = () => {
  const dateDisplayElement = document.querySelector('.date-display');
  dateDisplayElement.textContent = new Date().getFullYear();
};

const loadHandle = () => {
  App.init();
  setCurrentYear();
};

window.addEventListener('load', loadHandle);
