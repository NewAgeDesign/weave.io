import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
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
            viewport();
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
    if (tid !== 'null' && tid !== null) {
        io.in(ajax, get, 'scode/function.php', { action: 'projects', id: tid }, function (res) {
            let projects = res.projects;
            let pcontainer = document.querySelector('.project .selection');

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
        return;
    }

    projectItems.forEach(p => {
        if (!p) return; // Skip null/undefined elements

        p.addEventListener('click', function() {

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
// End of this function

//✅ Function for fetching and render tabs dynamically
function fetchTabs() {
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

//app navigator
function systemNav() {
    let dash = document.querySelector('.app .dash');
    let workspace = document.querySelector('.app .workspace');

    // Ensure elements exist before accessing them
    if (!dash || !workspace) {
        return;
    }

    // Show the last stored view immediately
    let currentView = localStorage.getItem('view') || 'dash';
    dash.style.display = (currentView === 'dash') ? 'flex' : 'none';
    workspace.style.display = (currentView === 'workspace') ? 'flex' : 'none';

    document.addEventListener('click', function (event) {

        // Handle home button click
        if (event.target.closest('.home')) {
            localStorage.setItem('view', 'dash');
            dash.style.display = 'flex';
            workspace.style.display = 'none'; // Hide workspace
        }

        // Handle tab selection inside the nav
        let tab = event.target.closest('nav span[data-tab-id]');
        if (tab) {
            let pid = tab.getAttribute('data-tab-id'); // Corrected this line
            localStorage.setItem('view', 'workspace');
            workspace.style.display = 'flex';
            dash.style.display = 'none'; // Hide dash
        }
    });
}
function viewport() {
    const viewport = document.querySelector(".viewport");
    const canvas = document.querySelector(".canvas-wrapper");
    let scale = 1, offsetX = 0, offsetY = 0;
    let isPanning = false, startX, startY;
    let lastPanX = 0, lastPanY = 0, lastScale = 1;
    let rulers = document.createElement("div");
    rulers.classList.add("rulers");
    viewport.appendChild(rulers);

    // Restore saved pan & zoom
    const savedState = JSON.parse(localStorage.getItem("viewportState"));
    if (savedState) {
        scale = lastScale = savedState.scale;
        offsetX = lastPanX = savedState.offsetX;
        offsetY = lastPanY = savedState.offsetY;
        updateTransform();
    }

    function updateTransform() {
        canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }

    function saveState() {
        localStorage.setItem("viewportState", JSON.stringify({ scale, offsetX, offsetY }));
    }

    viewport.addEventListener("wheel", function (e) {
        e.preventDefault();
        let zoomFactor = 1.1;
        let mouseX = e.clientX - viewport.offsetLeft;
        let mouseY = e.clientY - viewport.offsetTop;
        
        let newScale = e.deltaY > 0 ? scale / zoomFactor : scale * zoomFactor;
        newScale = Math.max(0.2, Math.min(newScale, 3));

        offsetX = mouseX - ((mouseX - offsetX) * (newScale / scale));
        offsetY = mouseY - ((mouseY - offsetY) * (newScale / scale));

        scale = newScale;
        updateTransform();
        saveState();
    });

    viewport.addEventListener("mousedown", function (e) {
        isPanning = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        viewport.style.cursor = "grabbing";
    });

    viewport.addEventListener("mousemove", function (e) {
        if (!isPanning) return;
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        updateTransform();
    });

    viewport.addEventListener("mouseup", function () {
        isPanning = false;
        viewport.style.cursor = "grab";
        saveState();
    });

    viewport.addEventListener("dblclick", function () {
        scale = 1;
        offsetX = offsetY = 0;
        updateTransform();
        saveState();
    });

    function createRulers() {
        rulers.innerHTML = '';
        const topRuler = document.createElement("div");
        const leftRuler = document.createElement("div");
        topRuler.classList.add("top-ruler");
        leftRuler.classList.add("left-ruler");
        rulers.appendChild(topRuler);
        rulers.appendChild(leftRuler);
    }

    function createGuide(x, y, type) {
        const guide = document.createElement("div");
        guide.classList.add("guide", type);
        if (type === "horizontal") {
            guide.style.top = `${y}px`;
        } else {
            guide.style.left = `${x}px`;
        }
        rulers.appendChild(guide);
    }

    viewport.addEventListener("dblclick", function (e) {
        if (e.shiftKey) {
            createGuide(0, e.clientY - viewport.offsetTop, "horizontal");
        } else {
            createGuide(e.clientX - viewport.offsetLeft, 0, "vertical");
        }
    });
    
    function setupRulers() {
        const viewport = document.querySelector(".viewport");
        const canvas = document.querySelector(".canvas-wrapper");
    
        let hRuler = document.querySelector(".ruler-horizontal");
        let vRuler = document.querySelector(".ruler-vertical");
    
        if (!hRuler) {
            hRuler = document.createElement("div");
            hRuler.classList.add("ruler-horizontal");
            viewport.appendChild(hRuler);
        }
    
        if (!vRuler) {
            vRuler = document.createElement("div");
            vRuler.classList.add("ruler-vertical");
            viewport.appendChild(vRuler);
        }
    
        function generateRulerMarks(scale = 1, offsetX = 0, offsetY = 0) {
            hRuler.innerHTML = "";
            vRuler.innerHTML = "";
    
            let step = 32 * scale; // 5rem (16px) * zoom scale
    
            // Horizontal Ruler
            for (let x = -offsetX; x <= canvas.clientWidth - offsetX; x += step) {
                let mark = document.createElement("div");
                mark.classList.add("ruler-mark");
                mark.style.left = `${x}px`;
                mark.innerText = Math.round(x / scale);
                hRuler.appendChild(mark);
            }
    
            // Vertical Ruler
            for (let y = -offsetY; y <= canvas.clientHeight - offsetY; y += step) {
                let mark = document.createElement("div");
                mark.classList.add("ruler-mark");
                mark.style.top = `${y}px`;
                mark.innerText = Math.round(y / scale);
                vRuler.appendChild(mark);
            }
        }
    
        function syncRulers(scale = 1, offsetX = 0, offsetY = 0) {
            hRuler.style.transform = `translateX(${offsetX}px) scaleX(${scale})`;
            vRuler.style.transform = `translateY(${offsetY}px) scaleY(${scale})`;
        }
    
        // Observer for canvas movement
        new MutationObserver(() => {
            const transform = canvas.style.transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)\s*scale\(([^)]+)\)/);
            if (transform) {
                let offsetX = parseFloat(transform[1]);
                let offsetY = parseFloat(transform[2]);
                let scale = parseFloat(transform[3]);
    
                generateRulerMarks(scale, offsetX, offsetY);
                syncRulers(scale, offsetX, offsetY);
            }
        }).observe(canvas, { attributes: true, attributeFilter: ["style"] });
    
        // Initial setup
        generateRulerMarks();
    }
    setupRulers();
    createRulers();

    function initializeToolbar() {
        const toolbar = document.querySelector(".toolbar");
        const canvas = document.querySelector(".canvas-wrapper");
        let activeTool = "selection";
    
        const tools = {
            selection: () => activateSelection(),
            move: () => activateMoveTool(),
            zoom: () => activateZoomTool(),
            hand: () => activateHandTool(),
            text: () => createTextElement(),
            rectangle: () => createShape("rectangle"),
            circle: () => createShape("circle"),
            line: () => createShape("line"),
            pen: () => activatePenTool(),
            form: () => createFormElement(),
            button: () => createInteractiveElement("button"),
            toggle: () => createInteractiveElement("toggle")
        };
    
        toolbar.addEventListener("click", (e) => {
            if (e.target.dataset.tool) {
                activeTool = e.target.dataset.tool;
                tools[activeTool]?.();
            }
        });
    
        function activateSelection() {
            canvas.style.cursor = "default";
        }
    
        function activateMoveTool() {
            canvas.style.cursor = "grab";
        }
    
        function activateZoomTool() {
            canvas.addEventListener("wheel", (e) => {
                e.preventDefault();
                let zoomFactor = 1.1;
                let newScale = e.deltaY > 0 ? scale / zoomFactor : scale * zoomFactor;
                scale = Math.max(0.2, Math.min(newScale, 3));
                updateTransform();
            });
        }
    
        function activateHandTool() {
            let isPanning = false;
            canvas.addEventListener("mousedown", (e) => {
                isPanning = true;
                canvas.style.cursor = "grabbing";
            });
            canvas.addEventListener("mouseup", () => {
                isPanning = false;
                canvas.style.cursor = "grab";
            });
        }
    
        function createTextElement() {
            const textElement = document.createElement("div");
            textElement.contentEditable = true;
            textElement.style.position = "absolute";
            textElement.style.left = "50px";
            textElement.style.top = "50px";
            textElement.innerText = "Text here...";
            canvas.appendChild(textElement);
        }
    
        function createShape(shapeType) {
            const shape = document.createElement("div");
            shape.classList.add("shape", shapeType);
            shape.style.position = "absolute";
            shape.style.left = "100px";
            shape.style.top = "100px";
            if (shapeType === "rectangle") {
                shape.style.width = "100px";
                shape.style.height = "50px";
                shape.style.backgroundColor = "blue";
            } else if (shapeType === "circle") {
                shape.style.width = "50px";
                shape.style.height = "50px";
                shape.style.borderRadius = "50%";
                shape.style.backgroundColor = "red";
            }
            canvas.appendChild(shape);
        }
    
        function activatePenTool() {
            console.log("Pen tool activated");
        }
    
        function createFormElement() {
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Enter text...";
            input.style.position = "absolute";
            input.style.left = "100px";
            input.style.top = "100px";
            canvas.appendChild(input);
        }
    
        function createInteractiveElement(type) {
            const element = document.createElement("button");
            element.innerText = type === "toggle" ? "Toggle" : "Button";
            element.style.position = "absolute";
            element.style.left = "150px";
            element.style.top = "150px";
            canvas.appendChild(element);
        }
    }
    
    initializeToolbar();
    

}

// Box Model Input Handling
function initBoxModelInputs() {
    const inputs = document.querySelectorAll('input[type="number"]');
    let mouseDownTimer;
    let isScrollMode = false;
    
    inputs.forEach(input => {
        input.addEventListener('mousedown', function(e) {
            if (e.button === 0) { // Left mouse button
                mouseDownTimer = setTimeout(() => {
                    isScrollMode = true;
                    this.style.cursor = 'ew-resize';
                }, 1000); // 1 second hold
            }
        });

        input.addEventListener('mouseup', function() {
            clearTimeout(mouseDownTimer);
            isScrollMode = false;
            this.style.cursor = 'text';
        });

        input.addEventListener('mouseleave', function() {
            clearTimeout(mouseDownTimer);
            isScrollMode = false;
            this.style.cursor = 'text';
        });

        input.addEventListener('wheel', function(e) {
            if (isScrollMode) {
                e.preventDefault();
                const delta = Math.sign(e.deltaX || e.deltaY);
                this.value = (parseInt(this.value) || 0) + delta;
            }
        }, { passive: false });
    });
}

//✅ Where all my code is running (Without being triggered)
document.addEventListener('DOMContentLoaded', function () {
    checkSession();
    initBoxModelInputs();
});

