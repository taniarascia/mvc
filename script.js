"use strict";

function writeToCloud(todo, mark) {
    console.log("writeToCloud")
    if (!localStorage.userName || !navigator.onLine) return false
    let s = todo.id+'_'+todo.text
    submitData(localStorage.userName, s, mark)
    console.log("sumbitted: "+s+' '+mark)
    return true
}

function findID(id) {
    return M.todos.find(x => x.id == id)
}

/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || []
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback
  }

  _commit() {
    this.onTodoListChanged(this.todos)
    localStorage.setItem('todos', JSON.stringify(this.todos))
  }

  addTodo(text) {
    let n = this.todos.length
    let id =  n ? this.todos[n-1].id + 1 : 1
    let complete = false
    const todo = { id, text, complete }

    this.todos.push(todo)
    writeToCloud(todo, '')
    this._commit()
  }

  editTodo(id, updatedText) {
    let todo = this.todos.find(x => x.id == id)
    if (!todo) return

    writeToCloud(todo, 'D')
    todo.text = updatedText
    writeToCloud(todo, '')
    this._commit()
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(x => x.id !== id)
    writeToCloud(todo, 'D')
    this._commit()
  }

  toggleTodo(id) {
    let todo = this.todos.find(x => x.id == id)
    if (!todo) return

    todo.complete = !todo.complete
    writeToCloud(todo, todo.complete? 'C' : '')
    this._commit()
  }
}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    this.app = this.getElement('#root')
    this.form = this.createElement('form')
    this.input = this.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = 'Add todo'
    this.input.name = 'todo'
    this.submitButton = this.createElement('button')
    this.submitButton.textContent = 'Submit'
    this.form.append(this.input, this.submitButton)
    this.title = this.createElement('h1')
    this.title.textContent = 'Todos'
    this.todoList = this.createElement('ul', 'todo-list')
    this.app.append(this.title, this.form, this.todoList)

    this._temporaryTodoText = ''
    this._initLocalListeners()
  }

  get _todoText() {
    return this.input.value
  }

  _resetInput() {
    this.input.value = ''
  }

  createElement(tag, className) {
    const element = document.createElement(tag)

    if (className) element.classList.add(className)

    return element
  }

  getElement(selector) {
    const element = document.querySelector(selector)

    return element
  }

  displayTodos(todos) {
    // Delete all nodes
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild)
    }

    // Show default message
    if (todos.length === 0) {
      const p = this.createElement('p')
      p.textContent = 'Nothing to do! Add a task?'
      this.todoList.append(p)
    } else {
      // Create nodes
      todos.forEach(todo => {
        const li = this.createElement('li')
        li.id = todo.id

        const checkbox = this.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = todo.complete

        const span = this.createElement('span')
        span.contentEditable = true
        span.classList.add('editable')

        if (todo.complete) {
          const strike = this.createElement('s')
          strike.textContent = todo.text
          span.append(strike)
        } else {
          span.textContent = todo.text
        }

        const deleteButton = this.createElement('button', 'delete')
        deleteButton.textContent = 'Delete'
        li.append(checkbox, span, deleteButton)

        // Append nodes
        this.todoList.append(li)
      })
    }

    // Debugging
    console.log(todos)
  }

  _initLocalListeners() {
    this.todoList.addEventListener('input', event => {
      if (event.target.className === 'editable') {
        this._temporaryTodoText = event.target.innerText
      }
    })
  }

  bindAddTodo(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault()

      if (this._todoText) {
        handler(this._todoText)
        this._resetInput()
      }
    })
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id)

        handler(id)
      }
    })
  }

  bindEditTodo(handler) {
    this.todoList.addEventListener('focusout', event => {
      if (this._temporaryTodoText) {
        const id = parseInt(event.target.parentElement.id)

        handler(id, this._temporaryTodoText)
        this._temporaryTodoText = ''
      }
    })
  }

  bindToggleTodo(handler) {
    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)

        handler(id)
      }
    })
  }
}

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Controller {
  constructor() {
    //M = model,  V = view -- global

    // Explicit this binding
    M.bindTodoListChanged(this.onTodoListChanged)
    V.bindAddTodo(this.handleAddTodo)
    V.bindEditTodo(this.handleEditTodo)
    V.bindDeleteTodo(this.handleDeleteTodo)
    V.bindToggleTodo(this.handleToggleTodo)

    // Display initial todos
    this.onTodoListChanged(M.todos)
  }

  onTodoListChanged(todos) {
    V.displayTodos(todos)
  }

  handleAddTodo(todoText) {
    M.addTodo(todoText)
  }

  handleEditTodo(id, todoText) {
    M.editTodo(id, todoText)
  }

  handleDeleteTodo(id) {
    M.deleteTodo(id)
  }

  handleToggleTodo(id) {
    M.toggleTodo(id)
  }
}

const M = new Model(), V = new View(), app = new Controller(M, V)
