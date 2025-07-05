// --- Helper Functions ---
function validateInput(input, condition, errorSelector, errorMessage = '') {
    const errorElement = errorSelector ? document.querySelector(errorSelector) : null;
    if (condition) {
        input.classList.remove('is-invalid');
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
        return true;
    } else {
        input.classList.add('is-invalid');
        if (errorElement) {
            errorElement.style.display = 'block';
            if (errorMessage) errorElement.textContent = errorMessage;
        }
        return false;
    }
}

// --- General Form Validation Handler ---
function handleFormValidation(event, validations) {
    event.preventDefault();
    let isValid = true;

    validations.forEach(validation => {
        const {input, condition, errorSelector, errorMessage} = validation;
        isValid &= validateInput(input, condition(), errorSelector, errorMessage);
    });

    if (isValid) {
        event.currentTarget.submit();
    }
}

// --- Quick Date Selection ---
function quickDate(option) {
    const input = document.getElementById('due-date');
    if (!input) return;

    const today = new Date();
    const calcDate = {
        today: new Date(today),
        tomorrow: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        nextweek: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
    };

    input.valueAsDate = calcDate[option];
}

// --- Tag Utility Functions ---
function createTagElement(text) {
    const tag = document.createElement('span');
    tag.className = 'badge bg-secondary me-1 tag-item';
    tag.textContent = text;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-close btn-close-white btn-sm ms-1 remove-tag';
    removeBtn.setAttribute('aria-label', 'Remove');
    removeBtn.onclick = () => tag.remove();

    tag.appendChild(removeBtn);
    return tag;
}

function setupTagInput(tagInput, tagList) {
    if (tagInput && tagList) {
        tagInput.addEventListener('keydown', event => {
            if (event.key === 'Enter' && tagInput.value.trim()) {
                event.preventDefault();
                const tag = createTagElement(tagInput.value.trim());
                tagList.appendChild(tag);
                tagInput.value = '';
            }
        });

        tagList.addEventListener('click', event => {
            if (event.target.classList.contains('remove-tag')) {
                event.target.closest('.tag-item').remove();
            }
        });
    }
}

function makeInitialTagsRemovable(tagListSelector) {
    document.querySelectorAll(`${tagListSelector} .tag-item`).forEach(function (tag) {
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
}

// --- Modularized Validation Logic ---
function validateTitle() {
    const title = document.getElementById('task-title');
    return {
        input: title,
        condition: () => title.value.trim(),
        errorSelector: '#title-error',
        errorMessage: 'Title is required.',
    };
}

function validateDueDate() {
    const dueDate = document.getElementById('due-date');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
        input: dueDate,
        condition: () => {
            const selectedDate = new Date(dueDate.value);
            return dueDate.value && selectedDate >= today;
        },
        errorSelector: '#due-date-error',
        errorMessage: dueDate.value ? 'Due date cannot be in the past.' : 'Due date is required.',
    };
}

function validatePriority() {
    const priorityChecked = document.querySelector('input[name="priority"]:checked');
    return {
        input: document.querySelector('input[name="priority"]'),
        condition: () => Boolean(priorityChecked),
        errorSelector: '#priority-error',
        errorMessage: 'Please select a priority.',
    };
}

// --- Form Validations ---
function setupFormValidation(formId, extraValidations = []) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', event => {
        handleFormValidation(event, [
            validateTitle(),
            validateDueDate(),
            validatePriority(),
            ...extraValidations,
        ]);
    });

    // Enter key submits form for title input
    const titleInput = document.getElementById('task-title');
    if (titleInput) {
        titleInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                form.requestSubmit();
            }
        });
    }

    // Tag input setup
    const tagInput = document.getElementById('tag-input');
    const tagList = document.getElementById('tag-list');
    makeInitialTagsRemovable('#tag-list');
    setupTagInput(tagInput, tagList);
}

// --- Login Form Validation ---
setupFormValidation('login-form', [
    {
        input: document.getElementById('username'),
        condition: () => document.getElementById('username').value.trim(),
        errorSelector: '#username-error',
        errorMessage: 'Username is required.',
    },
    {
        input: document.getElementById('password'),
        condition: () => document.getElementById('password').value,
        errorSelector: '#password-error',
        errorMessage: 'Password is required.',
    },
]);

// --- Signup Form Validation ---
setupFormValidation('signup-form', [
    {
        input: document.getElementById('fullname'),
        condition: () => document.getElementById('fullname').value.trim(),
        errorSelector: '#fullname-error',
        errorMessage: 'Full name is required.',
    },
    {
        input: document.getElementById('email'),
        condition: () =>
            document.getElementById('email').value.trim() &&
            document.getElementById('email').value.includes('@'),
        errorSelector: '#email-error',
        errorMessage: 'A valid email is required.',
    },
    {
        input: document.getElementById('password'),
        condition: () =>
            document.getElementById('password').value &&
            document.getElementById('password').value.length >= 6,
        errorSelector: '#password-error',
        errorMessage: 'Password must be at least 6 characters.',
    },
    {
        input: document.getElementById('confirm_password'),
        condition: () =>
            document.getElementById('confirm_password').value ===
            document.getElementById('password').value &&
            document.getElementById('confirm_password').value,
        errorSelector: '#confirm-password-error',
        errorMessage: 'Passwords must match.',
    },
]);

// --- Add/Edit Task Form Validation ---
setupFormValidation('add-task-form');
setupFormValidation('edit-task-form');

// --- Avatar Selection Logic ---
const thumbs = document.querySelectorAll('.avatar-thumb');
const avatarLarge = document.getElementById('avatar-large');
const avatarInput = document.getElementById('avatar-input');

if (thumbs.length && avatarLarge && avatarInput) {
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbs.forEach(t => t.classList.remove('selected'));
            thumb.classList.add('selected');
            const avatarPath = thumb.dataset.avatar || thumb.getAttribute('data-src');
            avatarLarge.src = avatarPath;
            avatarInput.value = avatarPath;
        });
    });
}

// --- Hide priority error when a radio is selected ---
document.querySelectorAll('input[name="priority"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        const priorityError = document.getElementById('priority-error');
        if (priorityError) priorityError.style.display = 'none';
    });
});