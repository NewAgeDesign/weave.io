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
            setInterval(checkTeam, 3000);
        }
    });
    
    setTimeout(() => {
        checkTeam();
        projects();
        link();
        io.setupModal('add_team', 'teamOverlay', 'modal', 'closeModalBtn');
        io.setupModal('add_project', 'projectOverlay', 'modal', 'pcloseModalBtn', 'tid');
        setInterval(() => {
            checkTeam();
            projects();
        }, 1000);
    }, 5000);
}
function checkTeam() {
    let savedTeamId = localStorage.getItem('selectedTeam');
    io.in('ajax', 'get', 'scode/function.php', { action: 'teams' }, function (res) {
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

        // Update only if there's a change
        if (teams.length === 0) {
            teamContainer.innerHTML = '<p>No Teams Created</p>';
            projectdash.innerHTML = '';
            if(savedTeamId !== null){
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
        }

        // Get saved team from localStorage
        let selectedTeam = savedTeamId
            ? document.querySelector(`#team-${savedTeamId}`)
            : document.querySelector('.team .item');

        if (selectedTeam) {
            selectedTeam.classList.add('selected');
            showTeamUI(selectedTeam.dataset.teamName);
        }


        // Delete a team
        del();
    });
}

// Click event to handle team selection
document.addEventListener('click', function (event) {
    let item = event.target.closest('.team .item'); // Ensure click is inside an item
    if (item) {

        // Remove 'selected' from all items
        document.querySelectorAll('.team .item').forEach(i => i.classList.remove('selected'));

        // Add 'selected' class to the clicked item
        item.classList.add('selected');

        // Save selected team in localStorage
        let teamId = item.dataset.teamId;
        let teamName = item.dataset.teamName;
        localStorage.setItem('selectedTeam', teamId);

        // Show team UI
        showTeamUI(teamName, teamId);
    }
});

function del() {
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

// Function to display the selected team's name
function showTeamUI(teamName) {
    let teamTitle = document.querySelector('.projects .title h3');
    if (teamTitle) {
        teamTitle.innerText = teamName; // Display the team name instead of the ID
    }
}
let prevProjectsHTML = ""; // Store previous HTML state

function projects() {
    let tid = localStorage.getItem('selectedTeam');
    if(tid != 'null'){
        io.in(ajax, get, 'scode/function.php', {action: 'projects', id : tid}, function(res) {
            let projects = res.projects;
            let pcontainer = document.querySelector('.project .selection');

            if (!projects || projects.length === 0) {
                let emptyMessage = '<p>No projects Created, please create a project for your team.</p>';
                if (pcontainer.innerHTML.trim() !== emptyMessage) {
                    pcontainer.innerHTML = emptyMessage;
                }
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

function attachDeleteListeners() {
    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            let projectId = this.getAttribute('data-id');
            if (confirm("Are you sure you want to delete this project?")) {
                io.in(ajax, get, 'scode/function.php', {action: 'delete-project', id: projectId}, function(res) {
                    projects(); // Refresh the projects list
                });
            }
        });
    });
}

function link() {
    document.addEventListener('click', function (event) {
        let selectedteam = localStorage.getItem('selectedTeam');
        
        if (!selectedteam || selectedteam === 'null') {
            return;
        }
    
        // Check if the clicked element is the "add member" button
        if (event.target && event.target.id === 'add_member') {
            console.log("Sharing link for team:", selectedteam);
    
            io.in('ajax', 'get', 'scode/function.php', { action: 'share-link', id: selectedteam }, function (res) {
                console.log(res.link)
                if (res.link) {
                    navigator.clipboard.writeText(res.link).then(() => {
                        io.out('errorMotd', 'info', 'LC01 : Link Copied', 'Your Link has been copied to the clipboard.');
                    }).catch(() => {
                        io.out('errorMotd', 'bad', 'LC02 : Copy Failed', 'Failed to copy invite link.');
                    });
                } else {
                    io.out('errorMotd', 'bad', 'LC03 : AJAX Error', 'Failed to generate invite link.');
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    checkSession();
});

