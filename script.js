

const $html = document.querySelector('html')
const checkbox = document.querySelector('#powerswitch')

checkbox.addEventListener('click', () => $html.classList.toggle('dark-mode'))




const Modal = {
    open(){
        // Abrir o modal
        // Adicionar o class active no modal

        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close(){
        //Fechar o modal
        // Remover o class active no modal 

        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("midas.finances:transactions")) || []
    },

    set(transactions){
        localStorage.setItem("midas.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        let income = 0;

        Transaction.all.forEach(transaction => {

            if (transaction.amount > 0 ) {
                income = income + transaction.amount;
            }
        })
        return income
    },

    expenses(){
        let expense = 0

        Transaction.all.forEach(transaction => {

            if (transaction.amount < 0 ) {
                expense = expense + transaction.amount
            }
        })
        return expense
    },

    total(){
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
       
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expensive"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = ` 
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img id="delete" onclick="Transaction.remove(${index})" src="./image/minus.svg" alt="logo remover transação">
        </td>
        `
        
        return html 

    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }

}

const Utils = {
formatAmount(value){
        value = Number(value.replace(/\,\./g, "")) * 100

    
    return value
    
},

formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
},




formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100 

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        
        return signal + value
    }

}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    
    getValues(){
        
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const {description, amount, date} = Form.getValues()
        
        if(description.trim() === "" ||
           amount.trim() === "" ||
           date.trim() === "") {
               throw new Error("Por favor, preencha todos os dados")
           }
           
    },

    formatValues(){
        let {description, amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        console.log(date)
        date = Utils.formatDate(date)
        console.log(date)
        return {
            description,
            amount,
            date
        }
       
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        
    },

    submit(event){
        event.preventDefault()
        

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            //Salvar
            Transaction.add(transaction)
            //apagar os dados do formulário
            Form.clearFields()
            //modal feche
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init(){

        Transaction.all.forEach(function(transaction, index){
            DOM.addTransaction(transaction, index)
        }) 

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    },
}

App.init()
