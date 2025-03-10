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
}
function checkTeam() {
    io.in('ajax', 'get', 'scode/function.php', { action: 'teams' }, function (res) {
        let teamContainer = document.querySelector('.team');

        if (!teamContainer) {
            console.error("Error: .team container not found in the DOM.");
            return; // Stop execution if `.team` is missing
        }

        let teams = res.teams;
        teamContainer.innerHTML = ''; // Clear previous teams

        if (teams.length === 0) {
            teamContainer.innerHTML = '<p>No Teams Created</p>';
        } else {
            let teamList = teams.map(t => `
                <span class="item" id="team-${t.id}" data-team-id="${t.id}" data-team-name="${t.name}">
                    <b class="name">${t.name}</b>
                    <span>
                        <icon class="del" title="delete team">delete</icon>
                        <icon class="edit" title="edit team">edit</icon>
                    </span>
                </span>
            `).join('');
            teamContainer.innerHTML = teamList;

            // Get saved team from localStorage
            let savedTeamId = localStorage.getItem('selectedTeam');
            let selectedTeam = savedTeamId
                ? document.querySelector(`#team-${savedTeamId}`)
                : document.querySelector('.team .item');

            if (selectedTeam) {
                selectedTeam.classList.add('selected');
                showTeamUI(selectedTeam.dataset.teamName);
            }
        }
    });
}

// Click event to handle team selection
document.addEventListener('click', function (event) {
    let item = event.target.closest('.team .item'); // Ensure click is inside an item
    if (item) {
        console.log('Item clicked:', item);

        // Remove 'selected' from all items
        document.querySelectorAll('.team .item').forEach(i => i.classList.remove('selected'));

        // Add 'selected' class to the clicked item
        item.classList.add('selected');

        // Save selected team in localStorage
        let teamId = item.dataset.teamId;
        let teamName = item.dataset.teamName;
        localStorage.setItem('selectedTeam', teamId);

        // Show team UI
        showTeamUI(teamName);
    }
});

// Function to display the selected team's name
function showTeamUI(teamName) {
    let teamTitle = document.querySelector('.projects .title h3');
    if (teamTitle) {
        teamTitle.innerText = teamName; // Display the team name instead of the ID
    }
}

function projects(){
    let pcontainer = document.querySelector('.project .selection');
    pcontainer.innerHTML = '';
    io.in(ajax, get, 'scode/function.php', {action: 'projects'}, function(res){
        let projects = res.projects
        if(!res.projects){
            pcontainer.innerHTML = '<p>No projects Created, please create a project for your team.</p>'
        }else{
            projects.forEach(p, ()=>{
                pcontainer.innerHTML = `
                            <span class="item">
                                <span class="details">
                                    <b>${p.name}</b>
                                    <icon>info
                                        <span class='info'>${p.descr}</span>
                                    </icon>
                                </span>
                            </span>`;
            })
        }
    })
}
// Run on page load
document.addEventListener('DOMContentLoaded', function () {
    io.setupModal('add_team', 'teamOverlay', 'modal', 'closeModalBtn');
    io.setupModal('add_project', 'projectOverlay', 'modal', 'pcloseModalBtn');
});
document.addEventListener('DOMContentLoaded', function () {
    checkSession();
    setTimeout(checkTeam, 1000); // Delay to ensure DOM is loaded
    projects();
});

