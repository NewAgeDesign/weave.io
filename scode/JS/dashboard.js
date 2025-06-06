dash = {
    session : function(){
        const app = document.querySelector('.app');
        const login = document.querySelector('.loginsys');
        const appDash = document.querySelector('.app .dash');
        const appWork = document.querySelector('.app .workspace');
        const weaveNav = localStorage.getItem('weave-nav');

        io.in('ajax', 'get', 'scode/function.php', { action: 'session' }, function (res) {

            if (!res.session) {
                // Show login gateway
                app.style.display = 'none';
                login.style.display = 'flex';
            } else {
                // Show main app
                login.style.display = 'none';
                app.style.display = 'flex';

                // Handle navigation state
                if (!weaveNav || weaveNav === 'dash') {
                    appDash.style.display = 'flex';
                    appWork.style.display = 'none';
                } else if (weaveNav === 'workspace') {
                    appDash.style.display = 'none';
                    appWork.style.display = 'flex';
                }

                // Optionally preload user data
                const avatar = document.querySelector('.profile .avatar');
                const name = document.querySelector('.profile .name');
                const role = document.querySelector('.plan span');

                const initials = (res.session.fname?.[0] || '') + (res.session.lname?.[0] || '');
                avatar.innerHTML = initials;
                avatar.style.backgroundColor = res.session.color;
                name.innerHTML = `${res.session.fname} ${res.session.lname}`;
                role.innerHTML = `Plan : <b>${res.session.plan}</b>`;
                role.querySelector('b').style.backgroundColor = res.session.color;
            }
        });
    },
    states : function(){
        // Return States
        // Team
        // Nav
        // Selected Tab
        // file Name
    },
    team : function(){
        const addteam = document.querySelector('#addTeam');
        const teamform = document.querySelector('.teamform');
        const exit = document.querySelector('.teamform .exit');
        const bgexit = document.querySelector('.teamform .bg-exit');
        fetchTeams();

        // Show form when #addTeam is clicked
        addteam.addEventListener('click', () => {
            teamform.style.display = 'flex';
        });

        // Hide form when .exit is clicked
        exit.addEventListener('click', () => {
            teamform.style.display = 'none';
            fetchTeams();
        });
        
        // Hide form when .exit is clicked
        bgexit.addEventListener('click', () => {
            teamform.style.display = 'none';
            fetchTeams();
        });

        function fetchTeams() {
            let savedTeamId = localStorage.getItem('weave-team');
            let personal = document.querySelector('.proj .personal');
            let teamtitle = document.querySelector('.pdashboard .top b');

            io.in('ajax', 'get', 'scode/function.php', { action: 'teams' }, function (res) {
                let teamContainer = document.querySelector('.team');
                if (!teamContainer) return;

                teamContainer.innerHTML = '';

                if (Array.isArray(res.teams)) {
                    res.teams.forEach(team => {
                        const teamEl = document.createElement('p');
                        teamEl.classList.add('item');
                        if (String(savedTeamId) === String(team.id)) {
                            teamEl.classList.add('active');
                        }

                        teamEl.innerHTML = `
                            ${team.name}
                            <span>
                                <icon class="info">info
                                <span class="desc">${team.descr}</span>
                                </icon>
                                <icon class="delete-team" team-id="${team.id}">delete</icon>
                            </span>
                        `;

                        teamContainer.appendChild(teamEl);
                        const teaminfo = teamEl.querySelector('.info');

                        if (team.descr === ''){
                            teaminfo.style.display = 'none';
                        }

                        teamEl.addEventListener('click', () => {
                            document.querySelectorAll('.team .item').forEach(el => el.classList.remove('active'));
                            localStorage.setItem('weave-team', team.id);
                            teamtitle.textContent = team.name;
                            teamEl.classList.add('active');
                            dash.project().fetch(localStorage.getItem('weave-team'));
                        });
                        
                    });

                    // Attach delete handlers after rendering
                    delTeam();
                    link();
                } else {
                    teamContainer.innerHTML = '<p class="empty">No teams found.</p>';
                }


                personal.addEventListener('click', () => {
                    localStorage.setItem('weave-team', 0);
                    teamtitle.textContent = personal.textContent;
                    dash.project().fetch(0);
                });

            });
        }
        
        function delTeam() {
            document.querySelectorAll('.team .delete-team').forEach(btn => {
                btn.addEventListener('click', function () {
                    let teamId = this.getAttribute('team-id');
                    if (confirm("All team members and projects will be removed permanently, are you sure you want to delete this team item?")) {
                        io.in('ajax', 'get', 'scode/function.php', { action: 'delete-team', id: teamId }, function (res) {
                            fetchTeams();  // Refresh after deletion
                        });
                    }
                });
            });
        }
        
        function link() {
            let addMemberBtn = document.getElementById('add_member');
            
            if (!addMemberBtn) return; // Ensure the button exists before proceeding
            
            addMemberBtn.addEventListener('click', function () {
                let selectedTeam = localStorage.getItem('weave-team');
                console.log(selectedTeam)
                
                if (!selectedTeam) { // Check for null, undefined, or empty string
                    io.out('errorMotd', 'bad', 'LC00 : No Team Selected', 'Please select a team first.');
                    return;
                }

                io.in(ajax, get, 'scode/function.php', { action: 'share-link', id: selectedTeam }, function (res) {
                    if (res.link) {
                        navigator.clipboard.writeText(res.link)
                            .then(() => {
                                io.out('errorMotd', 'info', 'LC01 : Link Copied', 'Your link has been copied to the clipboard.');
                            })
                            .catch(err => {
                                io.out('errorMotd', 'bad', 'LC02 : Copy Failed', 'Failed to copy invite link.');
                            });
                    } else {
                        io.out('errorMotd', 'bad', 'LC03 : AJAX Error', 'Failed to generate invite link.');
                    }
                });
            });
        }
    },
    project : function(){
        const addproject = document.querySelector('#addProject');
        const projectform = document.querySelector('.projform');
        const exit = document.querySelector('.projform .exit');
        const bgexit = document.querySelector('.projform .bg-exit');
        const teamId = localStorage.getItem('weave-team');
        const tidInput = document.getElementById('tid');
        
        let prevProjectsHTML = "";

        // Show form when #addProject is clicked
        addproject.addEventListener('click', () =>{
            if (tidInput) tidInput.value = teamId;
            projectform.style.display = 'flex';
        });
        // Hide form when .exit is clicked
        exit.addEventListener('click', closeProjectForm);
        // Hide form when .exit is clicked
        bgexit.addEventListener('click', closeProjectForm);

        function closeProjectForm() {
            projectform.style.display = 'none';
            console.log(teamId)
            dash.project().fetch(teamId);
        }

        
        function openProject() {
            let projectCards = document.querySelectorAll('.projects .card');

            projectCards.forEach(card => {
                card.addEventListener('click', function () {
                    let projectId = this.id;
                    if (!projectId) return;

                    localStorage.setItem('weave-project', projectId); // Optional: persist project selection

                    data = {
                        action: 'open_project', 
                        id: projectId
                    }
                    // Replace with your actual fetch or routing logic
                    io.in('ajax', 'post', 'scode/function.php', data, function (res) {
                        dash.tab(); // Refresh tabs after closing one
                    });
                });
            });
        }
        function delProject() {
            document.querySelectorAll('.projects .delete').forEach(delBtn => {
                delBtn.addEventListener('click', function () {
                    let id = this.getAttribute('data-id');
                    if (confirm("Are you sure you want to delete this project?")) {
                        io.in('ajax', 'get', 'scode/function.php', { action: 'delete-project', id }, function (res) {
                            let teamId = localStorage.getItem('weave-team');
                            dash.project().fetch(teamId); // Refresh projects
                        });
                    }
                });
            });
        }

        return{
            fetch : function(teamId) {
                if (!teamId || teamId === 'null') return;

                localStorage.setItem('weave-team', teamId); // Optional: persist selection

                io.in('ajax', 'get', 'scode/function.php', { action: 'projects', id: teamId }, function (res) {
                    let projects = res.projects;
                    let pcontainer = document.querySelector('.projects');

                    if (!pcontainer) return;

                    if (!projects || projects.length === 0) {
                        let emptyMessage = '<p class="empty">No projects created. Please add one.</p>';
                        pcontainer.innerHTML = emptyMessage;
                        prevProjectsHTML = emptyMessage;
                        return;
                    }

                    let pList = projects.map(p => {
                        let infoIcon = p.descr
                            ? `<icon id="view">info<span class="desc">${p.descr}</span></icon>`
                            : '';
                        return `
                            <span class="card" id="${p.id}">
                                <span class="text">
                                    <span class="title">${p.name}</span>
                                    <span class="button">
                                        ${infoIcon}
                                        <icon id="delete" data-id="${p.id}" class="delete">delete</icon>
                                    </span>
                                </span>
                            </span>
                        `;
                    }).join('');

                    if (pList !== prevProjectsHTML) {
                        prevProjectsHTML = pList;
                        pcontainer.innerHTML = pList;
                        openProject();
                        delProject();
                    }
                    
                });
            }
        }
    },
    tab : function(){
        io.in(ajax, 'get', 'scode/function.php', { action: 'fetch_tabs' }, function (res) {
            let nav = document.querySelector('header nav');
            console.log(res)
            
            if (!res.tabs || res.tabs.length === 0) {
                nav.innerHTML = '';
                return;
            }
            
            let tabsHTML = res.tabs.map(tab => `
                <span data-tab-id="${tab.id}" title="${tab.name}" class="tab">
                    <p>${tab.name}</p>
                    <icon class="close-tab" data-id="${tab.id}">close</icon>
                </span>
            `).join('');
            
            nav.innerHTML = tabsHTML;
            closeTab();
        });
        
        function closeTab() {
            document.querySelectorAll('nav .close-tab').forEach(icon => {
                icon.addEventListener('click', function (e) {
                    e.stopPropagation(); // 🚫 Prevent parent <span> from receiving the click
                    let tabId = this.getAttribute('data-id');
                    closeTabAction(tabId);
                });
            });
            openWorkspaceTab();
            
            function closeTabAction(tabId) {
                let data = { action: 'closetab', id: tabId };

                io.in(ajax, 'post', 'scode/function.php', data, function (res) {
                    if (res) {
                        // Check localStorage before refreshing tabs
                        const selected = JSON.parse(localStorage.getItem('selectedTabs')) || [];
                        if (selected.length > 0 && selected[0].id === tabId) {
                            // Reset to Home view if the closed tab is active
                            localStorage.setItem('selectedTabs', JSON.stringify([{ id: '0', name: 'Home' }]));

                            // Reset UI immediately
                            const dash = document.querySelector('.app .dash');
                            const workspace = document.querySelector('.app .workspace');
                            const title = document.querySelector('.viewport .title');

                            dash.style.display = 'flex';
                            workspace.style.display = 'none';
                            if (title) title.textContent = '';
                        }

                        dash.tab(); // Refresh tabs after closing one
                    } else {
                        console.error('Error closing tab:', res.message || 'Unknown error');
                    }
                }, function (err) {
                    console.error('AJAX request failed:', err);
                });
            }
        }

        function openWorkspaceTab() {
            const workspace = document.querySelector('.app .workspace');
            const tabs = document.querySelectorAll('nav > span.tab');
            const title = document.querySelector('.viewport .title');
            const home = document.querySelector('header > .logo');
            const dash = document.querySelector('.app .dash');

            // Utility: Set active class on selected tab
            function highlightActiveTab(tabId) {
                tabs.forEach(tab => {
                    if (tab.getAttribute('data-tab-id') === tabId) {
                        tab.classList.add('active');
                    } else {
                        tab.classList.remove('active');
                    }
                });
            }

            // Event: Clicking a tab
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.getAttribute('data-tab-id');
                    const tabName = tab.getAttribute('title');

                    // Store selected tab
                    localStorage.setItem('selectedTabs', JSON.stringify([{ id: tabId, name: tabName }]));

                    // Show workspace
                    dash.style.display = 'none';
                    workspace.style.display = 'flex';

                    // Update title and highlight
                    if (title){
                        title.textContent = tabName;
                        title.setAttribute('id', tabId)
                    }
                    highlightActiveTab(tabId);
                });
            });

            // Event: Clicking the Home logo
            home.addEventListener('click', () => {
                // Reset state to home
                localStorage.setItem('selectedTabs', JSON.stringify([{ id: '0', name: 'Home' }]));

                dash.style.display = 'flex';
                workspace.style.display = 'none';

                if (title) title.textContent = '';
                highlightActiveTab('0'); // remove all active tabs
            });

            // On load: Restore last state
            const selected = JSON.parse(localStorage.getItem('selectedTabs')) || [];
            if (selected.length > 0) {
                if (selected[0].id === '0') {
                    dash.style.display = 'flex';
                    workspace.style.display = 'none';
                    if (title) title.textContent = '';
                } else {
                    dash.style.display = 'none';
                    workspace.style.display = 'flex';
                    if (title) title.textContent = selected[0].name;
                }

                highlightActiveTab(selected[0].id);
            }
        }
    }
}


// Still Under Construction
function loadProjectFromTab() {
    const titleEl = document.querySelector(".viewport .title");
    const selectedTabs = JSON.parse(localStorage.getItem('selectedTabs') || '[]');
    
    // Get the most recently selected tab
    const lastSelectedTab = selectedTabs[selectedTabs.length - 1];

    // Defensive check
    if (!lastSelectedTab || lastSelectedTab.id === 0) return;

    const projectId = lastSelectedTab.id;
    const projectName = lastSelectedTab.name;

    const fileName = `${projectName}-${projectId}.json`;

    let project = JSON.parse(localStorage.getItem(fileName));
    if (!project) {
        project = {
        id: projectId,
        name: projectName,
        elements: []
        };
        localStorage.setItem(fileName, JSON.stringify(project));
    }

    window.currentProjectId = projectId;
    window.currentProjectName = projectName;
    window.projectFileName = fileName;
    window.projectData = project;

    renderProjectToCanvas();
    renderToLeftPanel();
}
function dashboardInit(){
    dash.session();
    dash.team();
    dash.tab();
}