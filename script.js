// Get today's date and show it at the top
var today = new Date();
document.getElementById("todayDate").textContent =
    today.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

// Set the date input to today
var dateInput = document.getElementById("studyDate");
dateInput.value = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

// Get the HTML elements we need
var taskForm = document.getElementById("taskForm");
var taskList = document.getElementById("taskList");
var filterTasks = document.getElementById("filterTasks");
var emptyMessage = document.getElementById("emptyMessage");

// Load saved tasks from the browser, or start with an empty array
var tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

// Run when the user submits the form
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    var subject = document.getElementById("subject").value.trim();
    var topic = document.getElementById("topic").value.trim();
    var studyDate = document.getElementById("studyDate").value;
    var priority = document.getElementById("priority").value;

    if (subject === "" || topic === "" || studyDate === "") {
        alert("Please fill in all the fields.");
        return;
    }

    var newTask = {
        id: Date.now(),
        subject: subject,
        topic: topic,
        studyDate: studyDate,
        priority: priority,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    showTasks();

    taskForm.reset();
    dateInput.value = today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");
});

// Save the tasks in localStorage
function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

// Display tasks on the page
function showTasks() {
    taskList.innerHTML = "";

    var selectedFilter = filterTasks.value;
    var visibleTasks = [];

    for (var i = 0; i < tasks.length; i++) {
        if (selectedFilter === "All" ||
            (selectedFilter === "Pending" && tasks[i].completed === false) ||
            (selectedFilter === "Completed" && tasks[i].completed === true)) {
            visibleTasks.push(tasks[i]);
        }
    }

    if (visibleTasks.length === 0) {
        emptyMessage.style.display = "block";
        if (tasks.length === 0) {
            emptyMessage.textContent = "No tasks yet. Add your first study goal above!";
        } else {
            emptyMessage.textContent = "No tasks match this filter.";
        }
    } else {
        emptyMessage.style.display = "none";
    }

    for (var i = 0; i < visibleTasks.length; i++) {
        var task = visibleTasks[i];

        var taskItem = document.createElement("div");
        taskItem.className = "task-item";
        if (task.completed) {
            taskItem.classList.add("done");
        }

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task completed");

        // Change the task's completed status when checked
        checkbox.addEventListener("change", function(taskId) {
            return function() {
                toggleTask(taskId);
            };
        }(task.id));

        var info = document.createElement("div");
        info.className = "task-info";

        var taskTitle = document.createElement("h3");
        taskTitle.textContent = task.subject + " — " + task.topic;

        var taskDetails = document.createElement("p");
        taskDetails.textContent = "Study date: " + task.studyDate;

        var priority = document.createElement("span");
        priority.className = "priority " + task.priority;
        priority.textContent = task.priority + " priority";

        info.appendChild(taskTitle);
        info.appendChild(taskDetails);
        info.appendChild(priority);

        var deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", function(taskId) {
            return function() {
                deleteTask(taskId);
            };
        }(task.id));

        taskItem.appendChild(checkbox);
        taskItem.appendChild(info);
        taskItem.appendChild(deleteButton);
        taskList.appendChild(taskItem);
    }

    updateCounts();
}

// Mark a task as completed or pending
function toggleTask(taskId) {
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            tasks[i].completed = !tasks[i].completed;
            break;
        }
    }

    saveTasks();
    showTasks();
}

// Delete a task
function deleteTask(taskId) {
    var updatedTasks = [];

    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id !== taskId) {
            updatedTasks.push(tasks[i]);
        }
    }

    tasks = updatedTasks;
    saveTasks();
    showTasks();
}

// Update the three numbers at the top
function updateCounts() {
    var completed = 0;

    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].completed) {
            completed++;
        }
    }

    document.getElementById("totalCount").textContent = tasks.length;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("pendingCount").textContent = tasks.length - completed;
}

// Update the task list when the filter changes
filterTasks.addEventListener("change", showTasks);

// Show saved tasks when the website opens
showTasks();
