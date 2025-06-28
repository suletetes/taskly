/*
// edit task
// Hide priority error when a radio is selected
document.querySelectorAll('input[name="priority"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        document.getElementById('priority-error').style.display = 'none';
    });
});

function quickDate(option) {
    const input = document.getElementById('due-date');
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

document.getElementById('edit-task-form').addEventListener('submit', function (e) {
    let valid = true;

    // Title validation
    const title = document.getElementById('task-title');
    const titleError = document.getElementById('title-error');
    if (!title.value.trim()) {
        title.classList.add('is-invalid');
        titleError.style.display = 'block';
        title.focus();
        valid = false;
    } else {
        title.classList.remove('is-invalid');
        titleError.style.display = 'none';
    }

    // Due date validation
    const dueDate = document.getElementById('due-date');
    const dueDateError = document.getElementById('due-date-error');
    if (!dueDate.value) {
        dueDate.classList.add('is-invalid');
        dueDateError.style.display = 'block';
        if (valid) dueDate.focus();
        valid = false;
    } else {
        dueDate.classList.remove('is-invalid');
        dueDateError.style.display = 'none';
    }

    // Priority validation
    const priorityError = document.getElementById('priority-error');
    const priorityChecked = document.querySelector('input[name="priority"]:checked');
    if (!priorityChecked) {
        priorityError.style.display = 'block';
        if (valid) document.getElementById('priority-low').focus();
        valid = false;
    } else {
        priorityError.style.display = 'none';
    }

    if (!valid) e.preventDefault();
});
document.getElementById('task-title').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('edit-task-form').requestSubmit();
    }
});

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
*/
