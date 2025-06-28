// Helper: Add/remove invalid class based on condition
function validateInput(input, condition) {
    if (condition) {
        input.classList.remove('is-invalid');
        return true;
    } else {
        input.classList.add('is-invalid');
        return false;
    }
}

// --- Login Form Validation ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        let valid = true;
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        valid &= validateInput(username, username && username.value.trim());
        valid &= validateInput(password, password && password.value);
        if (!valid) e.preventDefault();
    });
}

// --- Signup Form Validation ---
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
        let valid = true;
        const fullname = document.getElementById('fullname');
        const username = document.getElementById('username');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const confirm = document.getElementById('confirm_password');

        valid &= validateInput(fullname, fullname && fullname.value.trim());
        valid &= validateInput(username, username && username.value.trim());
        valid &= validateInput(email, email && email.value.trim() && email.value.includes('@'));
        valid &= validateInput(password, password && password.value.length >= 6);
        valid &= validateInput(confirm, confirm && confirm.value === password.value && confirm.value);

        if (!valid) e.preventDefault();
    });
}

// --- Avatar Selection Logic ---
const thumbs = document.querySelectorAll('.avatar-thumb');
const avatarLarge = document.getElementById('avatar-large');
const avatarInput = document.getElementById('avatar-input');
if (thumbs.length && avatarLarge && avatarInput) {
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', function () {
            thumbs.forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            avatarLarge.src = this.dataset.avatar;
            avatarInput.value = this.dataset.avatar;
        });
    });
}

// --- Add Task Form Validation & Tag Logic ---

// Hide priority error when a radio is selected
document.querySelectorAll('input[name="priority"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        const priorityError = document.getElementById('priority-error');
        if (priorityError) priorityError.style.display = 'none';
    });
});

// Quick date selection
function quickDate(option) {
    const input = document.getElementById('due-date');
    if (!input) return;
    const today = new Date();
    if (option === 'today') {
        input.valueAsDate = today;
    } else if (option === 'tomorrow') {
        const tmr = new Date(today);
        tmr.setDate(today.getDate() + 1);
        input.valueAsDate = tmr;
    } else if (option === 'nextweek') {
        const nw = new Date(today);
        nw.setDate(today.getDate() + 7);
        input.valueAsDate = nw;
    }
}

// Add Task Form validation
const addTaskForm = document.getElementById('add-task-form');
if (addTaskForm) {
    addTaskForm.addEventListener('submit', function (e) {
        let valid = true;

        // Title validation
        const title = document.getElementById('task-title');
        const titleError = document.getElementById('title-error');
        if (!title.value.trim()) {
            title.classList.add('is-invalid');
            if (titleError) titleError.style.display = 'block';
            title.focus();
            valid = false;
        } else {
            title.classList.remove('is-invalid');
            if (titleError) titleError.style.display = 'none';
        }

        // Due date validation
        const dueDate = document.getElementById('due-date');
        const dueDateError = document.getElementById('due-date-error');
        if (!dueDate.value) {
            dueDate.classList.add('is-invalid');
            if (dueDateError) dueDateError.style.display = 'block';
            if (valid) dueDate.focus();
            valid = false;
        } else {
            dueDate.classList.remove('is-invalid');
            if (dueDateError) dueDateError.style.display = 'none';
        }

        // Priority validation
        const priorityError = document.getElementById('priority-error');
        const priorityChecked = document.querySelector('input[name="priority"]:checked');
        if (!priorityChecked) {
            if (priorityError) priorityError.style.display = 'block';
            if (valid) document.getElementById('priority-low').focus();
            valid = false;
        } else {
            if (priorityError) priorityError.style.display = 'none';
        }

        if (!valid) e.preventDefault();
    });

    // Submit on Enter in title
    const titleInput = document.getElementById('task-title');
    if (titleInput) {
        titleInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTaskForm.requestSubmit();
            }
        });
    }

    // Editable tags
    const tagInput = document.getElementById('tag-input');
    const tagList = document.getElementById('tag-list');

    function createTagElement(text) {
        const tag = document.createElement('span');
        tag.className = 'badge bg-secondary me-1 tag-item';
        tag.textContent = text;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-close btn-close-white btn-sm ms-1 remove-tag';
        btn.setAttribute('aria-label', 'Remove');
        btn.onclick = function () {
            tag.remove();
        };
        tag.appendChild(document.createTextNode(' '));
        tag.appendChild(btn);
        return tag;
    }

    // Make initial tags removable
    document.querySelectorAll('#tag-list .tag-item').forEach(function (tag) {
        if (!tag.querySelector('.remove-tag')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-close btn-close-white btn-sm ms-1 remove-tag';
            btn.setAttribute('aria-label', 'Remove');
            btn.onclick = function () {
                tag.remove();
            };
            tag.appendChild(document.createTextNode(' '));
            tag.appendChild(btn);
        }
    });

    if (tagInput && tagList) {
        tagInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && tagInput.value.trim()) {
                e.preventDefault();
                const tag = createTagElement(tagInput.value.trim());
                tagList.appendChild(tag);
                tagInput.value = '';
            }
        });

        tagList.addEventListener('click', function (e) {
            if (e.target.classList.contains('remove-tag')) {
                e.target.closest('.tag-item').remove();
            }
        });
    }
}

// --- Edit Task Form Validation & Tag Logic ---

const editTaskForm = document.getElementById('edit-task-form');
if (editTaskForm) {
    editTaskForm.addEventListener('submit', function (e) {
        let valid = true;

        // Title validation
        const title = document.getElementById('task-title');
        const titleError = document.getElementById('title-error');
        if (!title.value.trim()) {
            title.classList.add('is-invalid');
            if (titleError) titleError.style.display = 'block';
            title.focus();
            valid = false;
        } else {
            title.classList.remove('is-invalid');
            if (titleError) titleError.style.display = 'none';
        }

        // Due date validation
        const dueDate = document.getElementById('due-date');
        const dueDateError = document.getElementById('due-date-error');
        if (!dueDate.value) {
            dueDate.classList.add('is-invalid');
            if (dueDateError) dueDateError.style.display = 'block';
            if (valid) dueDate.focus();
            valid = false;
        } else {
            dueDate.classList.remove('is-invalid');
            if (dueDateError) dueDateError.style.display = 'none';
        }

        // Priority validation
        const priorityError = document.getElementById('priority-error');
        const priorityChecked = document.querySelector('input[name="priority"]:checked');
        if (!priorityChecked) {
            if (priorityError) priorityError.style.display = 'block';
            if (valid) document.getElementById('priority-low').focus();
            valid = false;
        } else {
            if (priorityError) priorityError.style.display = 'none';
        }

        if (!valid) e.preventDefault();
    });

    // Submit on Enter in title
    const titleInput = document.getElementById('task-title');
    if (titleInput) {
        titleInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                editTaskForm.requestSubmit();
            }
        });
    }

// Editable tags
    const tagInput = document.getElementById('tag-input');
    const tagList = document.getElementById('tag-list');

    function createTagElement(text) {
        const tag = document.createElement('span');
        tag.className = 'badge bg-secondary me-1 tag-item';
        tag.textContent = text;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-close btn-close-white btn-sm ms-1 remove-tag';
        btn.setAttribute('aria-label', 'Remove');
        btn.onclick = function () {
            tag.remove();
        };
        tag.appendChild(document.createTextNode(' '));
        tag.appendChild(btn);
        return tag;
    }

// Make initial tags removable
    document.querySelectorAll('#tag-list .tag-item').forEach(function (tag) {
        if (!tag.querySelector('.remove-tag')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-close btn-close-white btn-sm ms-1 remove-tag';
            btn.setAttribute('aria-label', 'Remove');
            btn.onclick = function () {
                tag.remove();
            };
            tag.appendChild(document.createTextNode(' '));
            tag.appendChild(btn);
        }
    });

    if (tagInput && tagList) {
        tagInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && tagInput.value.trim()) {
                e.preventDefault();
                const tag = createTagElement(tagInput.value.trim());
                tagList.appendChild(tag);
                tagInput.value = '';
            }
        });

        tagList.addEventListener('click', function (e) {
            if (e.target.classList.contains('remove-tag')) {
                e.target.closest('.tag-item').remove();
            }
        });
    }
}
