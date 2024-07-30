document.addEventListener('DOMContentLoaded', (event) => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const editTaskModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    const editTaskInput = document.getElementById('editTaskInput');
    const saveEditButton = document.getElementById('saveEditButton');
    let editTaskId = null;

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    loadTasks();
    initializeCalendar();

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== "") {
            addTask(taskText);
            taskInput.value = "";
        }
    });

    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete')) {
            e.target.closest('li').remove();
            saveTasks();
            updateCalendar();
        } else if (e.target.classList.contains('complete')) {
            e.target.closest('li').classList.toggle('completed');
            saveTasks();
            updateCalendar();
        } else if (e.target.classList.contains('edit')) {
            editTaskId = e.target.closest('li');
            editTaskInput.value = editTaskId.querySelector('span').innerText;
            editTaskModal.show();
        }
    });

    saveEditButton.addEventListener('click', () => {
        if (editTaskId) {
            editTaskId.querySelector('span').innerText = editTaskInput.value.trim();
            editTaskModal.hide();
            saveTasks();
            updateCalendar();
        }
    });

    function addTask(task) {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <span>${task}</span>
            <div>
                <button class="btn btn-success complete">Complete</button>
                <button class="btn btn-info edit">Edit</button>
                <button class="btn btn-danger delete">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
        saveTasks();
        updateCalendar();
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(task => {
            tasks.push({
                text: task.querySelector('span').innerText,
                completed: task.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'list-group-item' + (task.completed ? ' completed' : '');
            li.innerHTML = `
                <span>${task.text}</span>
                <div>
                    <button class="btn btn-success complete">Complete</button>
                    <button class="btn btn-info edit">Edit</button>
                    <button class="btn btn-danger delete">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    function initializeCalendar() {
        $('#calendar').fullCalendar({
            events: getCalendarEvents(),
            editable: true,
            eventDrop: function(event) {
                const task = taskList.querySelector(`li[data-id="${event.id}"] span`);
                task.textContent = event.title;
                saveTasks();
            }
        });
    }

    function updateCalendar() {
        $('#calendar').fullCalendar('removeEvents');
        $('#calendar').fullCalendar('addEventSource', getCalendarEvents());
    }

    function getCalendarEvents() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        return tasks.map((task, index) => ({
            id: index,
            title: task.text,
            start: moment().add(index, 'days').format('YYYY-MM-DD'),
            className: task.completed ? 'completed' : ''
        }));
    }

    function showNotification(task) {
        if (Notification.permission === "granted") {
            new Notification("To-Do List", {
                body: task,
            });
        }
    }
});

