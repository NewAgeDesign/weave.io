function checkSession() {
    io.in('ajax', 'get', 'scode/function.php', { action: 'session' }, function (res) {

        // If session exists, show "app", otherwise show "gateway"
        const target = res.session ? 'app' : 'gateway';

        // ✅ Ensure only one section remains
        io.showMain('body', target);

        if(target === 'app') {
            let avatar = document.querySelector('.user .avatar');
            let name = document.querySelector('.user .name');
            let email = document.querySelector('.user .email');
            let role = document.querySelector('.top .badge');

            let initials = res.session.fname[0] + res.session.lname[0];
            avatar.innerHTML = initials;
            avatar.style.backgroundColor = res.session.color;
            name.innerHTML = res.session.fname + ' ' + res.session.lname;
            role.innerHTML = 'Plan : <b>' + res.session.plan + '</b>';
            role.querySelector('b').style.backgroundColor = res.session.color;
        }
    });

    
    let nav, team, project;
    nav = document.querySelector('header nav');
    team = document.querySelector('.team');
    project = document.querySelector('.selection');
    
    setTimeout(() => {
        if (team) {
            checkTeam();
            io.setupModal('add_team', 'teamOverlay', 'modal', 'closeModalBtn');
            uiUpdate();
        }
        if (nav) {
            fetchTabs();
            systemNav();
            openProject('.selection > .item');
            uiUpdate();
        }
        if (project) {
            projects();
            io.setupModal('add_project', 'projectOverlay', 'modal', 'pcloseModalBtn', 'tid');
        }

        setTimeout(() => {
            openProject('.selection > .item');
            link();
        }, 500);
        
    }, 3000);
}

//✅ Functions for teams
function checkTeam() {
    let savedTeamId = localStorage.getItem('selectedTeam');
    io.in(ajax, get, 'scode/function.php', { action: 'teams' }, function (res) {
        let teamContainer = document.querySelector('.team');
        if (!teamContainer) {
            console.error("Error: .team container not found in the DOM.");
            return;
        }

        let teams = res.teams || [];
        let existingTeams = Array.from(teamContainer.children).map(t => t.dataset.teamId);
        let newTeamIds = teams.map(t => t.id);

        // If nothing changed, do nothing (prevents unnecessary re-rendering)
        if (JSON.stringify(existingTeams) === JSON.stringify(newTeamIds)) return;

        let projectdash = document.querySelector('.projects');

        // If teams list is empty
        if (teams.length === 0) {
            teamContainer.innerHTML = '<p>No Teams Created</p>';
            projectdash.innerHTML = ''; // Clear projects
            if (savedTeamId !== null) {
                localStorage.setItem('selectedTeam', null);
            }
        } else {
            teamContainer.innerHTML = teams.map(t => `
                <span class="item" id="team-${t.id}" data-team-id="${t.id}" data-team-name="${t.name}">
                    <b class="name">${t.name}</b>
                    <span>
                        <icon class="del" title="delete team" team-id="${t.id}">delete</icon>
                    </span>
                </span>
            `).join('');

            if (!document.querySelector('.projects .selection')) {
                // Only update projects if they don't exist already
                projectdash.innerHTML = `
                    <span class="title">
                        <h3></h3>
                        <span>
                            <icon class="add_project" id="add_project" title="Create Project">add</icon>
                            <icon class="add_member" id="add_member" title="Add Member">link</icon>
                        </span>
                    </span>
                    <span class="project">
                        <h5>Projects</h5>
                        <span class="selection"></span>
                    </span>
                `;
                projects(); // Ensure projects() runs when first setting up
            }
        }

        // Get saved team from localStorage
        let selectedTeam = savedTeamId
            ? document.querySelector(`#team-${savedTeamId}`)
            : document.querySelector('.team .item');

        if (selectedTeam) {
            selectedTeam.classList.add('selected');
            showTeamUI(selectedTeam.dataset.teamName);
        }

        // Click event to handle team selection
        document.addEventListener('click', function (event) {
            let item = event.target.closest('.team .item'); // Ensure click is inside an item
            if (item) {
                document.querySelectorAll('.team .item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');

                let teamId = item.dataset.teamId;
                let teamName = item.dataset.teamName;
                localStorage.setItem('selectedTeam', teamId);

                showTeamUI(teamName, teamId);
                projects(); // Run projects only when a team is selected
            }
        });

        delTeam();
    });
}

function delTeam() {
    document.querySelectorAll('.team .del').forEach(btn => {
        btn.addEventListener('click', function() {
            let teamId = this.getAttribute('team-id');
            console.log(teamId)
            if (confirm("All team members and projects will be removed permanently, are you sure you want to delete this team item?")) {
                io.in(ajax, get, 'scode/function.php', {action: 'delete-team', id: teamId}, function(res) {
                    checkTeam(); // Refresh the projects list
                });
            }
        });
    });
}
// End of Teams function

//✅ Function for Updating UI based on form submission
// ✅ Function for Updating UI based on form submission
function uiUpdate() {
    document.getElementById('teamOverlay').addEventListener('click', function (event) {
        if (event.target.matches('#teamOverlay, .close-button')) { 
            checkTeam(); 
            projects(); // Ensure projects load after teams are updated
        }
    });

    document.getElementById('projectOverlay').addEventListener('click', function (event) {
        if (event.target.matches('#projectOverlay, .close-button')) { 
            projects(); 
        }
    });
}

// End of UI update


//✅ Function to display the selected team's name in the dashboard
function showTeamUI(teamName) {
    let teamTitle = document.querySelector('.projects .title h3');
    if (teamTitle) {
        teamTitle.innerText = teamName; // Display the team name instead of the ID
    }
}
// End of Name Update, though something tells me this could have been better if all of it were to load at the same time.

//✅ Functions for displaying Project UI with components
let prevProjectsHTML = ""; // Store previous HTML state
function projects() {
    let tid = localStorage.getItem('selectedTeam');
    console.log(tid);
    if (tid !== 'null' && tid !== null) {
        io.in(ajax, get, 'scode/function.php', { action: 'projects', id: tid }, function (res) {
            let projects = res.projects;
            let pcontainer = document.querySelector('.project .selection');
            console.log(projects);

            if (!projects || projects.length === 0) {
                let emptyMessage = '<p>No projects Created, please create a project for your team.</p>';
                pcontainer.innerHTML = emptyMessage; // Ensure it updates the DOM
                prevProjectsHTML = emptyMessage; // Store the empty state
                return; // Stop further execution
            }

            let pList = projects.map(p => {
                let infoIcon = p.descr ? `<icon>info<span class='info'>${p.descr}</span></icon>` : '';
                return `
                    <span class="item" id="${p.id}">
                        <span class="details">
                            <b>${p.name}</b>
                            <span>
                                <icon data-id="${p.id}" class="delete">delete</icon>
                                ${infoIcon}
                            </span>
                        </span>
                    </span>
                `;
            }).join('');

            // Only update the DOM if the content has changed
            if (pList !== prevProjectsHTML) {
                prevProjectsHTML = pList;
                pcontainer.innerHTML = pList;
                attachDeleteListeners(); // Reattach delete event listeners
            }
        });

        io.setupModal('add_project', 'projectOverlay', 'modal', 'pcloseModalBtn', 'tid');

    }
}
// End of project function

//✅ Function for deleting project from the database
function attachDeleteListeners() {
    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            let projectId = this.getAttribute('data-id');
            if (confirm("Are you sure you want to delete this project?")) {
                io.in(ajax, get, 'scode/function.php', {action: 'delete-project', id: projectId}, function(res) {
                    openProject('.selection > .item');
                    projects(); // Refresh the projects list
                });
            }
        });
    });
}
// End of that function

//✅ Function for opening project tabs, these are in the header
function openProject(item) {
    let projectItems = document.querySelectorAll(item);

    if (projectItems.length === 0) {
        console.warn("No project items found for selector:", item);
        return;
    }

    projectItems.forEach(p => {
        if (!p) return; // Skip null/undefined elements

        console.log(p); // Debugging

        p.addEventListener('click', function() {
            console.log('it works');

            let id = p.getAttribute('id'); 
            if (!id) {
                io.out(errorMotd, bad , 'ID Not Found', 'No project id was found');
                return;
            }
            let data = { action: 'addTab', id: id}

            io.in(ajax, post, 'scode/function.php', data, function(res) {
            });
            fetchTabs(); // Refresh tabs after closing one
        });
    });
}
// End of that function

//✅ Function for collaboration Link to a team.
function link() {
    let addMemberBtn = document.getElementById('add_member');
    
    if (!addMemberBtn) return; // Ensure the button exists before proceeding
    
    addMemberBtn.addEventListener('click', function () {
        let selectedTeam = localStorage.getItem('selectedTeam');
        
        if (!selectedTeam) { // Check for null, undefined, or empty string
            io.out('errorMotd', 'bad', 'LC00 : No Team Selected', 'Please select a team first.');
            return;
        }

        console.log("Sharing link for team:", selectedTeam);

        io.in(ajax, get, 'scode/function.php', { action: 'share-link', id: selectedTeam }, function (res) {
            if (res.link) {
                navigator.clipboard.writeText(res.link)
                    .then(() => {
                        io.out('errorMotd', 'info', 'LC01 : Link Copied', 'Your link has been copied to the clipboard.');
                    })
                    .catch(err => {
                        console.error('Clipboard error:', err);
                        io.out('errorMotd', 'bad', 'LC02 : Copy Failed', 'Failed to copy invite link.');
                    });
            } else {
                io.out('errorMotd', 'bad', 'LC03 : AJAX Error', 'Failed to generate invite link.');
            }
        });
    });
}
// End of this function

//✅ Function for fetching and render tabs dynamically
function fetchTabs() {
    console.log("this is running");
    io.in(ajax, 'get', 'scode/function.php', { action: 'fetch_tabs' }, function (res) {
        let nav = document.querySelector('header nav');
        
        if (!res.tabs || res.tabs.length === 0) {
            nav.innerHTML = '';
            return;
        }
        
        let tabsHTML = res.tabs.map(tab => `
            <span data-tab-id="${tab.id}">
                <p>${tab.name}</p>
                <icon class="close-tab" data-id="${tab.id}">close</icon>
            </span>
        `).join('');
        
        nav.innerHTML = tabsHTML;
        attachTabListeners();
    });
}
// End of this function

//✅ Function to attach event listeners to close buttons
function attachTabListeners() {
    document.querySelectorAll('nav .close-tab').forEach(icon => {
        icon.addEventListener('click', function () {
            let tabId = this.getAttribute('data-id');
            closeTab(tabId);
        });
    });
}
//✅ Function to close my tabs.
function closeTab(tabId) {
    let data = { action: 'closetab', id: tabId };
    
    io.in(ajax, 'post', 'scode/function.php', data, function (res) {
        if (res) {
            fetchTabs(); // Refresh tabs after closing one
        } else {
            console.error('Error closing tab:', res.message || 'Unknown error');
        }
    }, function (err) {
        console.error('AJAX request failed:', err);
    });
}
// End of this function
function systemNav() {
    console.log('systemNav initialized!');
    let dash = document.querySelector('.app .dash');
    let workspace = document.querySelector('.app .workspace');

    // Show the last stored view immediately
    let currentView = localStorage.getItem('view') || 'dash';
    dash.style.display = (currentView === 'dash') ? 'flex' : 'none';
    workspace.style.display = (currentView === 'workspace') ? 'flex' : 'none';

    document.addEventListener('click', function (event) {
        console.log('Click detected:', event.target);

        if (event.target.closest('.home')) {
            console.log('Home was selected');
            localStorage.setItem('view', 'dash');
            dash.style.display = 'flex';
            workspace.style.display = 'none';  // ❌ Hide workspace
        }
        if (event.target.closest('nav span[data-tab-id]')) {
            console.log('Tab was selected');
            localStorage.setItem('view', 'workspace');
            workspace.style.display = 'flex';
            dash.style.display = 'none';  // ❌ Hide dash
        }
    });
}

//✅ Where all my code is running (Without being triggered)
document.addEventListener('DOMContentLoaded', function () {
    checkSession();
});