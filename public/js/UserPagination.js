// --- User Pagination ---
const userData = [
    {username: "alice", tasks: 62, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "bob", tasks: 48, avatar: "../../public/img/avatars/avatar2.png"},
    {username: "carol", tasks: 75, avatar: "../../public/img/avatars/avatar3.png"},
    {username: "dave", tasks: 30, avatar: "../../public/img/avatars/avatar4.png"},
    {username: "eve", tasks: 90, avatar: "../../public/img/avatars/avatar5.png"},
    {username: "frank", tasks: 12, avatar: "../../public/img/avatars/avatar6.png"},
    {username: "grace", tasks: 55, avatar: "../../public/img/avatars/avatar7.png"},
    {username: "heidi", tasks: 41, avatar: "../../public/img/avatars/avatar8.png"},
    {username: "ivan", tasks: 23, avatar: "../../public/img/avatars/avatar9.png"},
    {username: "judy", tasks: 67, avatar: "../../public/img/avatars/avatar10.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
    {username: "mallory", tasks: 38, avatar: "../../public/img/avatars/avatar1.png"},
]
const USERS_PER_PAGE = 12;
let userPage = 1;

function renderUserCards(page) {
    const start = (page - 1) * USERS_PER_PAGE;
    const end = start + USERS_PER_PAGE;
    const usersToShow = userData.slice(start, end);

    const usersList = document.getElementById('users-list');
    if (!usersList) return;
    usersList.innerHTML = usersToShow.map(user => `
        <div class="col-lg-3 col-md-6 text-center">
            <div class="user-card">
                <img src="${user.avatar}" alt="${user.username}" class="user-card-img" loading="lazy">
                <h3 class="text-lg-center mb-lg-1 mt-lg-1">${user.username}</h3>
                <h5 class="text-lg-center">Tasks Completed: ${user.tasks}</h5>
                <a href="/user/${user.username}" class="btn btn-view-profile mt-2">View Profile</a>
            </div>
        </div>
    `).join('');
}

function renderUserPagination() {
    const totalPages = Math.ceil(userData.length / USERS_PER_PAGE);
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = `
        <li class="page-item${userPage === 1 ? ' disabled' : ''}">
            <button class="page-link" data-user-page="${userPage - 1}" aria-label="Previous" ${userPage === 1 ? 'tabindex="-1" aria-disabled="true"' : ''}>&laquo;</button>
        </li>
        ${Array.from({length: totalPages}, (_, i) => `
            <li class="page-item${userPage === i + 1 ? ' active' : ''}">
                <button class="page-link" data-user-page="${i + 1}">${i + 1}</button>
            </li>
        `).join('')}
        <li class="page-item${userPage === totalPages ? ' disabled' : ''}">
            <button class="page-link" data-user-page="${userPage + 1}" aria-label="Next" ${userPage === totalPages ? 'tabindex="-1" aria-disabled="true"' : ''}>&raquo;</button>
        </li>
    `;
}

function onUserPaginationClick(e) {
    if (e.target.matches('[data-user-page]')) {
        const page = parseInt(e.target.getAttribute('data-user-page'));
        const totalPages = Math.ceil(userData.length / USERS_PER_PAGE);
        if (page >= 1 && page <= totalPages) {
            userPage = page;
            renderUserCards(userPage);
            renderUserPagination();
            window.scrollTo({top: document.getElementById('users-list').offsetTop - 80, behavior: 'smooth'});
        }
    }
}

// --- Initial Render ---
document.addEventListener('DOMContentLoaded', function () {
    // Users
    renderUserCards(userPage);
    renderUserPagination();
    const userPagination = document.getElementById('pagination');
    if (userPagination) {
        userPagination.addEventListener('click', onUserPaginationClick);
    }
});