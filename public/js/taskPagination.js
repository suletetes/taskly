// --- Task Pagination ---
const taskData = [
    {
        title: "Finalize design proposal",
        due: "2025-06-30",
        priority: "High",
        priorityClass: "danger",
        iconClass: "primary",
        description: "Complete the final design proposal and send it to the client for approval.",
        tags: ["Work", "Design"],
        status: "in-progress"
    },
    {
        title: "Update project documentation",
        due: "2025-07-02",
        priority: "Medium",
        priorityClass: "success",
        iconClass: "success",
        description: "Add new API endpoints and update diagrams.",
        tags: ["Docs", "API"],
        status: "in-progress"
    },
    {
        title: "Team meeting",
        due: "2025-07-03",
        priority: "Low",
        priorityClass: "warning",
        iconClass: "warning",
        description: "Weekly sync with the team.",
        tags: ["Meeting"],
        status: "in-progress"
    }, {
        title: "Finalize design proposal",
        due: "2025-06-30",
        priority: "High",
        priorityClass: "danger",
        iconClass: "primary",
        description: "Complete the final design proposal and send it to the client for approval.",
        tags: ["Work", "Design"],
        status: "in-progress"
    },
    {
        title: "Update project documentation",
        due: "2025-07-02",
        priority: "Medium",
        priorityClass: "success",
        iconClass: "success",
        description: "Add new API endpoints and update diagrams.",
        tags: ["Docs", "API"],
        status: "in-progress"
    },
    {
        title: "Team meeting",
        due: "2025-07-03",
        priority: "Low",
        priorityClass: "warning",
        iconClass: "warning",
        description: "Weekly sync with, the team.",
        tags: ["Meeting"],
        status: "in-progress"
    }, {
        title: "Finalize design proposal",
        due: "2025-06-30",
        priority: "High",
        priorityClass: "danger",
        iconClass: "primary",
        description: "Complete the final design proposal and send it to the client for approval.",
        tags: ["Work", "Design"],
        status: "in-progress"
    },
    {
        title: "Update project documentation",
        due: "2025-07-02",
        priority: "Medium",
        priorityClass: "success",
        iconClass: "success",
        description: "Add new API endpoints and update diagrams.",
        tags: ["Docs", "API"],
        status: "in-progress"
    },
    {
        title: "Team meeting",
        due: "2025-07-03",
        priority: "Low",
        priorityClass: "warning",
        iconClass: "warning",
        description: "Weekly sync with the team.",
        tags: ["Meeting"],
        status: "in-progress"
    },
    // Add more tasks as needed...
    {
        title: "Write unit tests",
        due: "2025-07-06",
        priority: "In Progress",
        priorityClass: "info",
        iconClass: "info",
        description: "Cover new features with unit tests.",
        tags: ["Testing"],
        status: "in-progress"
    },
    {
        title: "Deploy to production",
        due: "2025-07-01",
        priority: "Completed",
        priorityClass: "success",
        iconClass: "success",
        description: "Deployment finished successfully.",
        tags: ["Release"],
        status: "completed"
    },
    {
        title: "Send weekly report",
        due: "2025-07-02",
        priority: "Failed",
        priorityClass: "danger",
        iconClass: "danger",
        description: "Report was not sent due to email server error.",
        tags: ["Reporting"],
        status: "failed"
    }
]

const TASKS_PER_PAGE = 5;
let taskPage = 1;

function renderTaskCards(page) {
    const start = (page - 1) * TASKS_PER_PAGE;
    const end = start + TASKS_PER_PAGE;
    const pageTasks = taskData.slice(start, end);

    const container = document.querySelector('.d-flex.flex-column.gap-4');
    if (!container) return;
    container.innerHTML = pageTasks.map(task => {
        const tagsHtml = task.tags.map(tag =>
            `<span class="badge bg-secondary me-1">${tag}</span>`
        ).join('');

        // Status badge and icon
        let statusBadge, icon = '';
        if (task.status === "in-progress") {
            statusBadge = `<span class="badge bg-info text-dark ms-auto align-self-start px-3 py-2 fs-6 me-2">
                <i class="fa fa-hourglass-half me-1"></i> In Progress
            </span>`;
            icon = `<span class="fa fa-spinner fa-2x text-info me-3"></span>`;
        } else if (task.status === "completed") {
            statusBadge = `<span class="badge bg-success ms-auto align-self-start px-3 py-2 fs-6 me-2">
                <i class="fa fa-check me-1"></i> Completed
            </span>`;
            icon = `<span class="fa fa-check-circle fa-2x text-success me-3"></span>`;
        } else if (task.status === "failed") {
            statusBadge = `<span class="badge bg-danger ms-auto align-self-start px-3 py-2 fs-6 me-2">
                <i class="fa fa-exclamation-triangle me-1"></i> Failed
            </span>`;
            icon = `<span class="fa fa-times-circle fa-2x text-danger me-3"></span>`;
        } else if (task.status === "cancelled") {
            statusBadge = `<span class="badge bg-secondary ms-auto align-self-start px-3 py-2 fs-6 me-2">
                <i class="fa fa-ban me-1"></i> Cancelled
            </span>`;
            icon = `<span class="fa fa-ban fa-2x text-secondary me-3"></span>`;
        } else {
            // Default: treat as priority
            statusBadge = '';
            icon = `<span class="fa fa-tasks fa-2x text-${task.iconClass} me-3"></span>`;
        }

        // Priority badge
        let priorityBadge = '';
        if (task.priority === "High") {
            priorityBadge = `<span class="badge bg-danger align-self-start px-3 py-2 fs-6">
                <i class="fa fa-bolt me-1"></i> High
            </span>`;
        } else if (task.priority === "Medium") {
            priorityBadge = `<span class="badge bg-warning text-dark align-self-start px-3 py-2 fs-6">
                <i class="fa fa-arrow-up me-1"></i> Medium
            </span>`;
        } else if (task.priority === "Low") {
            priorityBadge = `<span class="badge bg-success align-self-start px-3 py-2 fs-6">
                <i class="fa fa-arrow-down me-1"></i> Low
            </span>`;
        } else if (task.priority === "Completed") {
            priorityBadge = `<span class="badge bg-success align-self-start px-3 py-2 fs-6">
                <i class="fa fa-arrow-down me-1"></i> Low
            </span>`;
        } else if (task.priority === "Failed") {
            priorityBadge = `<span class="badge bg-danger align-self-start px-3 py-2 fs-6">
                <i class="fa fa-bolt me-1"></i> High
            </span>`;
        } else if (task.priority === "In Progress") {
            priorityBadge = `<span class="badge bg-warning text-dark align-self-start px-3 py-2 fs-6">
                <i class="fa fa-arrow-up me-1"></i> Medium
            </span>`;
        } else if (task.priority === "Cancelled") {
            priorityBadge = `<span class="badge bg-warning text-dark align-self-start px-3 py-2 fs-6">
                <i class="fa fa-arrow-down me-1"></i> Low
            </span>`;
        }

        // Buttons
        let buttons = `
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3"><i class="fa fa-edit me-1"></i>Edit</button>
            <button class="btn btn-outline-danger btn-sm rounded-pill px-3"><i class="fa fa-trash me-1"></i>Delete</button>
        `;
        if (!["completed", "failed", "cancelled"].includes(task.status)) {
            buttons += `<button class="btn btn-success btn-sm rounded-pill px-3"><i class="fa fa-check me-1"></i>Done</button>`;
        }

        return `
        <div class="card shadow-lg border-0 rounded-4 overflow-hidden glass-card border-start border-5 border-${task.priorityClass}">
            <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                    ${icon}
                    <div>
                        <h4 class="card-title mb-1 fw-bold">${task.title}</h4>
                        <small class="text-muted"><i class="fa fa-calendar-alt me-1"></i>Due: ${task.due}</small>
                    </div>
                    ${statusBadge}${priorityBadge}
                </div>
                <p class="card-text text-muted mb-3">${task.description}</p>
                <div class="mb-3">${tagsHtml}</div>
                <div class="d-flex justify-content-end gap-2">
                    ${buttons}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderTaskPagination() {
    const totalPages = Math.ceil(taskData.length / TASKS_PER_PAGE);
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    pagination.innerHTML = `
        <li class="page-item${taskPage === 1 ? ' disabled' : ''}">
            <a class="page-link" href="#" data-task-page="${taskPage - 1}">Previous</a>
        </li>
        ${Array.from({length: totalPages}, (_, i) => `
            <li class="page-item${taskPage === i + 1 ? ' active' : ''}">
                <a class="page-link" href="#" data-task-page="${i + 1}">${i + 1}</a>
            </li>
        `).join('')}
        <li class="page-item${taskPage === totalPages ? ' disabled' : ''}">
            <a class="page-link" href="#" data-task-page="${taskPage + 1}">Next</a>
        </li>
    `;
}

function onTaskPaginationClick(e) {
    if (e.target.matches('[data-task-page]')) {
        e.preventDefault();
        const page = parseInt(e.target.getAttribute('data-task-page'));
        const totalPages = Math.ceil(taskData.length / TASKS_PER_PAGE);
        if (page >= 1 && page <= totalPages) {
            taskPage = page;
            renderTaskCards(taskPage);
            renderTaskPagination();
        }
    }
}


document.addEventListener('DOMContentLoaded', function () {
    // Tasks
    renderTaskCards(taskPage);
    renderTaskPagination();
    const taskPagination = document.querySelector('.pagination');
    if (taskPagination) {
        taskPagination.addEventListener('click', onTaskPaginationClick);
    }
});