const tasks = [];

// Model

class TaskModel {
  #tasks = [];
  get tasks() {
    return structuredClone(this.#tasks);
  }

  addTask(task) {
    const newTask = {
      id: crypto.randomUUID(),
      name: task,
      completed: false,
    };
    tasks.push(newTask);
  }

  deleteTask(taskId) {
    this.#tasks = this.#tasks.filter((task) => task.id != taskId);
  }

  toggleTask(taskId) {
    this.#tasks[taskId] = {
      ...this.#tasks,
      completed: !this.#tasks[taskId].completed,
    };
  }
}

function addTask(task) {
  const newTask = {
    id: crypto.randomUUID(),
    name: task,
    completed: false,
  };
  tasks.push(newTask);
}

function deleteTask(index) {
  tasks.splice(index, 1);
}

function updateTask(index) {
  tasks[index] = {
    ...tasks[index],
    completed: !tasks[index].completed,
  };
}

// View
class TaskView {
  _form = document.querySelector(".addtask");
  _task = document.querySelector("#task");
  _parentListItem = document.querySelector(".task-list-items");

  handleAdd(handler) {
    this._form.addEventListener("submit", (e) => {
      e.preventDefault();
      const task = this._task.value.trim("");
      task && handler(task);
      this._task.value = "";
    });
  }

  handleTaskAction(handler) {
    this._parentListItem.addEventListener("click", function (e) {
      const btn = e.target.closest(".task-list-item");
      if (!btn) return;
      //   const actionType = e.target.type === "radio" ? "update" : "delete";
      //   handler(+btn.dataset.taskId, actionType);
      const id = btn.dataset.taskId;

      if (e.target.matches(".btn-delete")) {
        handler(id, "delete");
      } else if (e.target.matches(".task-checkbox")) {
        handler(id, "toggle");
      }
    });
  }

  _clear() {
    this._parentListItem.innerHTML = "";
  }

  render() {
    this._clear();
    const markup = tasks.map(this._generateItem).join("");
    document
      .querySelector(".task-list-items")
      .insertAdjacentHTML("afterbegin", markup);
  }

  _generateItem(item, index) {
    return `<li data-task-id=${index} class='task-list-item' style="text-decoration:${item.completed ? "line-through" : "none"}">
    <p>
    <input type="checkbox" name=${item.name} class='task-checkbox' />
    ${item.name} - ${item.completed ? "tt" : "ff"}</p>
    <button class='btn-delete'>X</button>
    </li>`;
  }
}

// Controller
const taskView = new TaskView();
function taskAddController(task) {
  addTask(task);
  taskView.render();
}

function taskActionController(index, actionType) {
  actionType === "delete" && deleteTask(index);
  actionType === "toggle" && updateTask(index);
  taskView.render();
}

function init() {
  taskView.handleAdd(taskAddController);
  taskView.handleTaskAction(taskActionController);
}

init();
