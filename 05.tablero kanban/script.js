let draggedTask = null;


function saveBoardState() {
    const board = {};
    document.querySelectorAll(".task-list").forEach(list => {
        board[list.id] = Array.from(list.children)
            .filter(child => child.classList.contains("task"))
            .map(task => ({
                text: task.querySelector('span').textContent,
                color: task.dataset.color || "",
                date: task.dataset.date || ""
            }));
    });
    localStorage.setItem("kanbanBoard", JSON.stringify(board));
}

function loadBoardState() {
    const board = JSON.parse(localStorage.getItem("kanbanBoard") || "{}");
    for (const [columnId, tasks] of Object.entries(board)) {
        const list = document.getElementById(columnId);
        if (list) {
            list.innerHTML = "";
            tasks.forEach(taskObj => {
                const task = createTaskElement(taskObj.text, taskObj.color, taskObj.date);
                list.appendChild(task);
            });
        }
    }
    updateCounters();
}


function createTaskElement(taskText, color = "", date = "") {
    const task = document.createElement("div");
    task.className = "task";
    task.draggable = true;

    if (color) {
        task.style.background = color;
        task.dataset.color = color;
    }
    if (date) {
        task.dataset.date = date;
    }

    const span = document.createElement("span");
    span.textContent = taskText;
    task.appendChild(span);

   
    if (date) {
        const dateEl = document.createElement("small");
        dateEl.className = "duedate";
        dateEl.style.marginLeft = "6px";
        dateEl.textContent = `📅 ${date}`;
        task.appendChild(dateEl);
    }

    
    const priorityBtn = document.createElement("button");
    priorityBtn.textContent = "⭐";
    priorityBtn.title = "Marcar como prioridad";
    priorityBtn.className = "priority-btn";
    priorityBtn.onclick = (e) => {
        e.stopPropagation();
        if (task.style.background === "gold") {
            task.style.background = color || "#f0f4fa";
            task.dataset.color = color || "";
        } else {
            task.style.background = "gold";
            task.dataset.color = "gold";
        }
        saveBoardState();
    };
    task.appendChild(priorityBtn);


    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.title = "Editar tarea";
    editBtn.className = "edit-btn";
    editBtn.onclick = (e) => {
        e.stopPropagation();
        editTask(task);
    };
    task.appendChild(editBtn);

    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "delete-btn";
    deleteBtn.title = "Eliminar tarea";
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm("¿Eliminar esta tarea?")) {
            task.remove();
            updateCounters();
            saveBoardState();
        }
    };
    task.appendChild(deleteBtn);

    
    span.ondblclick = () => {
        editTask(task);
    };

    addDragAndDropEvents(task);
    return task;
}

function addTask(columnId) {
    const taskText = prompt("Escribe la tarea:");
    if (taskText && taskText.trim() !== "") {
        
        const color = prompt("Color de fondo para la tarea: 'lightgreen', 'pink', '#fffd82'");
       
        const date = prompt("Fecha de vencimiento (opcional, formato AAAA-MM-DD):");
        const task = createTaskElement(taskText.trim(), color || "", date || "");
        document.getElementById(columnId).appendChild(task);
        updateCounters();
        saveBoardState();
    }
}

function editTask(task) {
    const span = task.querySelector("span");
    const oldText = span.textContent;
    const newText = prompt("Edita la tarea:", oldText);
    if (newText && newText.trim() !== "") {
        span.textContent = newText.trim();
    }

    
    let dateEl = task.querySelector(".duedate");
    let oldDate = task.dataset.date || "";
    const newDate = prompt("Edita la fecha de vencimiento (AAAA-MM-DD):", oldDate);
    if (newDate && newDate.trim() !== "") {
        task.dataset.date = newDate.trim();
        if (!dateEl) {
            dateEl = document.createElement("small");
            dateEl.className = "duedate";
            dateEl.style.marginLeft = "6px";
            task.appendChild(dateEl);
        }
        dateEl.textContent = `📅 ${newDate.trim()}`;
    } else if (dateEl) {
        dateEl.remove();
        task.dataset.date = "";
    }

    saveBoardState();
}

function addDragAndDropEvents(task) {
    task.addEventListener("dragstart", () => {
        draggedTask = task;
        setTimeout(() => task.classList.add("dragging"), 0);
    });
    task.addEventListener("dragend", () => {
        task.classList.remove("dragging");
        draggedTask = null;
        updateCounters();
        saveBoardState();
    });
}


function setupColumnsEvents() {
    document.querySelectorAll(".task-list").forEach(list => {
        list.addEventListener("dragover", (e) => {
            e.preventDefault();
            list.classList.add("drag-over");
        });
        list.addEventListener("dragleave", () => {
            list.classList.remove("drag-over");
        });
        list.addEventListener("drop", () => {
            if (draggedTask) {
                list.appendChild(draggedTask);
            }
            list.classList.remove("drag-over");
            updateCounters();
            saveBoardState();
        });
    });
}


function updateCounters() {
    document.querySelectorAll(".task-list").forEach(list => {
        const counter = list.parentElement.querySelector(".counter");
        if (counter) {
            const count = list.querySelectorAll(".task").length;
            counter.textContent = `(${count})`;
        }
    });
}


function searchTasks() {
    const query = prompt("Buscar tareas (por texto):");
    if (query && query.trim() !== "") {
        const q = query.trim().toLowerCase();
        document.querySelectorAll(".task").forEach(task => {
            const text = task.querySelector("span").textContent.toLowerCase();
            task.style.display = text.includes(q) ? "" : "none";
        });
    } else {
        
        document.querySelectorAll(".task").forEach(task => task.style.display = "");
    }
}


function clearColumn(columnId) {
    if (confirm("¿Estás seguro de que deseas borrar todas las tareas de esta columna?")) {
        const column = document.getElementById(columnId);
        column.innerHTML = "";
        updateCounters();
        saveBoardState();
    }
}


function setupAddTaskButtons() {
    document.querySelectorAll(".add-task-btn").forEach(btn => {
        btn.onclick = () => addTask(btn.dataset.columnId);
    });
}


function setupExtraUI() {
    
    const searchBar = document.createElement("button");
    searchBar.textContent = "🔎 Buscar tarea";
    searchBar.className = "search-btn";
    searchBar.style.margin = "0 0 18px 0";
    searchBar.onclick = searchTasks;
    document.body.insertBefore(searchBar, document.querySelector(".board"));

    
    document.querySelectorAll(".task-list").forEach(list => {
        const clearBtn = document.createElement("button");
        clearBtn.textContent = "🧹 Limpiar columna";
        clearBtn.className = "clear-btn";
        clearBtn.style.margin = "6px 0 0 0";
        clearBtn.onclick = () => clearColumn(list.id);
        list.parentElement.insertBefore(clearBtn, list.nextSibling);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    setupColumnsEvents();
    setupAddTaskButtons();
    setupExtraUI();
    loadBoardState();
});
