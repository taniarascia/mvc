"use strict";

function readFromCloud(unused, data) {
    let un = localStorage.userName
    let map = new Map()
    for (let t of data) if (t.user == un) {
        let [id, txt] = t.topic.split('_')
        map.set(Number(id), [txt, t.marks])
    }
    console.log(map)
    for (let id of map.keys()) {
        let todo = findID(id)
        let [txt, mrk] = map.get(id)
        if (mrk.startsWith('D')) {
            M.removeItem(id)
        } else if (todo) { //found in todos
            todo.text = txt
            todo.complete = mrk.startsWith('C')
        } else { //new item with given id
            todo = M.newItem(txt, mrk.startsWith('C'), id)
            M.todos.push(todo)
        }
    }
    M.todos.sort((a, b) => a.id - b.id)
    V.displayTodos(M.todos)
}

function writeToCloud(todo, mark) {
    let s = todo.id+'_'+todo.text
    submitData(localStorage.userName, s, mark)
    console.log('sumbitted: '+s+' '+mark)
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
    let td = localStorage.todos
    this.todos = td? JSON.parse(td) : []
    if (localStorage.userName && navigator.onLine)
        tabularData(readFromCloud)
  }

  setDisplayHandler(callback) {
    this.displayHandler = callback
  }

  _commit(todo, mark) {
    this.displayHandler(this.todos)
    localStorage.todos = JSON.stringify(this.todos)
    if (localStorage.userName && navigator.onLine)
        writeToCloud(todo, mark)
  }

  newItem(text, complete, id) { //id is optional
    let n = this.todos.length
    if (!id)
      id =  n ? this.todos[n-1].id + 1 : 1
    return { id, text, complete }
  }
  addTodo(text) {
    let todo = this.newItem(text, false)
    this.todos.push(todo)
    this._commit(todo, '')
  }

  editTodo(id, updatedText) {
    let todo = findID(id)
    if (!todo) return
    todo.text = updatedText
    this._commit(todo, '')
  }

  removeItem(id) {
    let k = this.todos.findIndex(x => x.id == id)
    if (k < 0) return null
    let [todo] = this.todos.splice(k, 1)
    return todo
  }
  deleteTodo(id) {
    let todo = this.removeItem(id)
    if (!todo) return
    this._commit(todo, 'D')
  }

  toggleTodo(id) {
    let todo = findID(id)
    if (!todo) return
    todo.complete = !todo.complete
    this._commit(todo, todo.complete? 'C' : '')
  }
}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    this._temporaryTodoText = ''
    this._initLocalListeners()
  }

  showDialog() {
    user.value = localStorage.userName || ''
    user.select(0, user.value.length)
    dialog.hidden = false; user.focus()
  }

  setUser(u) { //use dialog entry
    dialog.hidden = true
    if (u === false) return
    else if (u) { //public data
      localStorage.userName = u
      localUser.innerText = 'User: '+u
      localUser.style.background = 'yellow'
    }
    else { //undefined -- go private
      delete localStorage.userName
      localUser.innerText = 'Private data'
      localUser.style.background = ''
    }
  }

  displayTodos(todos) {
    const ITEM = `  <li id="ID">
      <input type=checkbox CHCK>
      <span contenteditable=true class=editable>TEXT</span>
      <button class=delete>Delete</button>
    </li>`
    let toListItem = (todo) => 
      ITEM.replace('ID', todo.id)
          .replace('CHCK', todo.complete? 'checked' : '')
          .replace('TEXT', todo.text);

    if (todos.length === 0) { // default message
      list.innerHTML = '<p>Nothing to do! Add a task?</p>'
    } else { //
      list.innerHTML = todos.map(toListItem).join('\n')
    }

    // Debugging
    console.log(todos)
  }

  _initLocalListeners() {
    list.oninput = event => {
      if (event.target.className === 'editable') {
        this._temporaryTodoText = event.target.innerText
      }
    }
    form.onsubmit = event => {
      event.preventDefault()

      if (input.value) {
        M.addTodo(input.value)
        input.value = ''
      }
    }
    list.onclick = event => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id)

        M.deleteTodo(id)
      }
    }
    list.onfocusout = event => {
      if (this._temporaryTodoText) {
        const id = parseInt(event.target.parentElement.id)

        M.editTodo(id, this._temporaryTodoText)
        this._temporaryTodoText = ''
      }
    }
    list.onchange = event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)

        M.toggleTodo(id)
      }
    }
  }
}

/**
 * Controller -- use globals rather than class
 *
 * Links the user input and the view output.
 *
 */

const M = new Model() //V calls M to modify model
const V = new View()  //M calls V to display

V.setUser(localStorage.userName)

M.setDisplayHandler(V.displayTodos)
V.displayTodos(M.todos) //inital list
