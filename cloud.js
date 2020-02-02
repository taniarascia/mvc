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

const M = app.model

function initCloud() {
    if (!localStorage.userName || !navigator.onLine) return false
    console.log("initCloud")

    app.handleAddTodo = todoText => {
        let n = M.todos.length
        M.addTodo(todoText)
        writeToCloud(M.todos[n], '')
    }
    
    app.handleEditTodo = (id, todoText) => {
        M.editTodo(id, todoText)
        let t = findID(id)
        writeToCloud(t, '')
    }
    
    app.handleDeleteTodo = id => {
        let t = findID(id) //before deleting
        M.deleteTodo(id)
        writeToCloud(t, 'D')
    }
    
    app.handleToggleTodo = id => {
        M.toggleTodo(id)
        let t = findID(id)
        writeToCloud(t, t.complete? 'C' : '')
    }

    app.view.bindAddTodo(app.handleAddTodo);
    app.view.bindEditTodo(app.handleEditTodo);
    app.view.bindDeleteTodo(app.handleDeleteTodo);
    app.view.bindToggleTodo(app.handleToggleTodo);
  
}

initCloud()