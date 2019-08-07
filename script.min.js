"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * @class Model
 *
 * Manages the data of the application.
 */
var Model =
/*#__PURE__*/
function () {
  function Model() {
    _classCallCheck(this, Model);

    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
  }

  _createClass(Model, [{
    key: "bindTodoListChanged",
    value: function bindTodoListChanged(callback) {
      this.onTodoListChanged = callback;
    }
  }, {
    key: "_commit",
    value: function _commit(todos) {
      this.onTodoListChanged(todos);
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, {
    key: "addTodo",
    value: function addTodo(todoText) {
      var todo = {
        id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
        text: todoText,
        complete: false
      };
      this.todos.push(todo);

      this._commit(this.todos);
    }
  }, {
    key: "editTodo",
    value: function editTodo(id, updatedText) {
      this.todos = this.todos.map(function (todo) {
        return todo.id === id ? {
          id: todo.id,
          text: updatedText,
          complete: todo.complete
        } : todo;
      });

      this._commit(this.todos);
    }
  }, {
    key: "deleteTodo",
    value: function deleteTodo(id) {
      this.todos = this.todos.filter(function (todo) {
        return todo.id !== id;
      });

      this._commit(this.todos);
    }
  }, {
    key: "toggleTodo",
    value: function toggleTodo(id) {
      this.todos = this.todos.map(function (todo) {
        return todo.id === id ? {
          id: todo.id,
          text: todo.text,
          complete: !todo.complete
        } : todo;
      });

      this._commit(this.todos);
    }
  }]);

  return Model;
}();
/**
 * @class View
 *
 * Visual representation of the model.
 */


var View =
/*#__PURE__*/
function () {
  function View() {
    _classCallCheck(this, View);

    this.app = this.getElement('#root');
    this.form = this.createElement('form');
    this.input = this.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Add todo';
    this.input.name = 'todo';
    this.submitButton = this.createElement('button');
    this.submitButton.textContent = 'Submit';
    this.form.append(this.input, this.submitButton);
    this.title = this.createElement('h1');
    this.title.textContent = 'Todos';
    this.todoList = this.createElement('ul', 'todo-list');
    this.app.append(this.title, this.form, this.todoList);
    this._temporaryTodoText = '';

    this._initLocalListeners();
  }

  _createClass(View, [{
    key: "_resetInput",
    value: function _resetInput() {
      this.input.value = '';
    }
  }, {
    key: "createElement",
    value: function createElement(tag, className) {
      var element = document.createElement(tag);
      if (className) element.classList.add(className);
      return element;
    }
  }, {
    key: "getElement",
    value: function getElement(selector) {
      var element = document.querySelector(selector);
      return element;
    }
  }, {
    key: "displayTodos",
    value: function displayTodos(todos) {
      var _this = this;

      // Delete all nodes
      while (this.todoList.firstChild) {
        this.todoList.removeChild(this.todoList.firstChild);
      } // Show default message


      if (todos.length === 0) {
        var p = this.createElement('p');
        p.textContent = 'Nothing to do! Add a task?';
        this.todoList.append(p);
      } else {
        // Create nodes
        todos.forEach(function (todo) {
          var li = _this.createElement('li');

          li.id = todo.id;

          var checkbox = _this.createElement('input');

          checkbox.type = 'checkbox';
          checkbox.checked = todo.complete;

          var span = _this.createElement('span');

          span.contentEditable = true;
          span.classList.add('editable');

          if (todo.complete) {
            var strike = _this.createElement('s');

            strike.textContent = todo.text;
            span.append(strike);
          } else {
            span.textContent = todo.text;
          }

          var deleteButton = _this.createElement('button', 'delete');

          deleteButton.textContent = 'Delete';
          li.append(checkbox, span, deleteButton); // Append nodes

          _this.todoList.append(li);
        });
      } // Debugging


      console.log(todos);
    }
  }, {
    key: "_initLocalListeners",
    value: function _initLocalListeners() {
      var _this2 = this;

      this.todoList.addEventListener('input', function (event) {
        if (event.target.className === 'editable') {
          _this2._temporaryTodoText = event.target.innerText;
        }
      });
    }
  }, {
    key: "bindAddTodo",
    value: function bindAddTodo(handler) {
      var _this3 = this;

      this.form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (_this3._todoText) {
          handler(_this3._todoText);

          _this3._resetInput();
        }
      });
    }
  }, {
    key: "bindDeleteTodo",
    value: function bindDeleteTodo(handler) {
      this.todoList.addEventListener('click', function (event) {
        if (event.target.className === 'delete') {
          var id = parseInt(event.target.parentElement.id);
          handler(id);
        }
      });
    }
  }, {
    key: "bindEditTodo",
    value: function bindEditTodo(handler) {
      var _this4 = this;

      this.todoList.addEventListener('focusout', function (event) {
        if (_this4._temporaryTodoText) {
          var id = parseInt(event.target.parentElement.id);
          handler(id, _this4._temporaryTodoText);
          _this4._temporaryTodoText = '';
        }
      });
    }
  }, {
    key: "bindToggleTodo",
    value: function bindToggleTodo(handler) {
      this.todoList.addEventListener('change', function (event) {
        if (event.target.type === 'checkbox') {
          var id = parseInt(event.target.parentElement.id);
          handler(id);
        }
      });
    }
  }, {
    key: "_todoText",
    get: function get() {
      return this.input.value;
    }
  }]);

  return View;
}();
/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */


var Controller = function Controller(model, view) {
  var _this5 = this;

  _classCallCheck(this, Controller);

  _defineProperty(this, "onTodoListChanged", function (todos) {
    _this5.view.displayTodos(todos);
  });

  _defineProperty(this, "handleAddTodo", function (todoText) {
    _this5.model.addTodo(todoText);
  });

  _defineProperty(this, "handleEditTodo", function (id, todoText) {
    _this5.model.editTodo(id, todoText);
  });

  _defineProperty(this, "handleDeleteTodo", function (id) {
    _this5.model.deleteTodo(id);
  });

  _defineProperty(this, "handleToggleTodo", function (id) {
    _this5.model.toggleTodo(id);
  });

  this.model = model;
  this.view = view; // Explicit this binding

  this.model.bindTodoListChanged(this.onTodoListChanged);
  this.view.bindAddTodo(this.handleAddTodo);
  this.view.bindEditTodo(this.handleEditTodo);
  this.view.bindDeleteTodo(this.handleDeleteTodo);
  this.view.bindToggleTodo(this.handleToggleTodo); // Display initial todos

  this.onTodoListChanged(this.model.todos);
};

var app = new Controller(new Model(), new View());