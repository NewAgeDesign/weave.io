document.addEventListener('DOMContentLoaded', function () {
    workspaceInit();
    dashboardInit();
});


/*function checkSession() {
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
            opener();
            lpanelDir();
            pageTool();
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
    let scale = 1;
    let offsetX = 0, offsetY = 0;
    let isPanning = false, startX, startY;
    let lastPanX = 0, lastPanY = 0, lastScale = 1;
    let isSpacePressed = false;

    // Set default cursor
    viewport.style.cursor = 'default';
    canvas.style.cursor = 'default';

    // Center the canvas initially
    function centerCanvas() {
        const viewportWidth = viewport.clientWidth;
        const viewportHeight = viewport.clientHeight;
        const canvasWidth = canvas.offsetWidth;
        const canvasHeight = canvas.offsetHeight;
        
        offsetX = (viewportWidth - canvasWidth) / 2;
        offsetY = (viewportHeight - canvasHeight) / 2;
        updateTransform();
    }

    // Restore saved pan & zoom
    const savedState = JSON.parse(localStorage.getItem("viewportState"));
    if (savedState) {
        scale = lastScale = savedState.scale;
        offsetX = lastPanX = savedState.offsetX;
        offsetY = lastPanY = savedState.offsetY;
        updateTransform();
    } else {
        centerCanvas();
    }

    function updateTransform() {
        canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }

    function saveState() {
        localStorage.setItem("viewportState", JSON.stringify({ scale, offsetX, offsetY }));
    }

    // Handle space key for panning
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            isSpacePressed = true;
            viewport.style.cursor = 'grab';
            canvas.style.cursor = 'grab';
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            isSpacePressed = false;
            viewport.style.cursor = 'default';
            canvas.style.cursor = 'default';
        }
    });

    viewport.addEventListener("wheel", function (e) {
        e.preventDefault();
        let zoomFactor = 1.1;
        
        // Get viewport center
        const viewportCenterX = viewport.clientWidth / 2;
        const viewportCenterY = viewport.clientHeight / 2;
        
        // Calculate new scale
        let newScale = e.deltaY > 0 ? scale / zoomFactor : scale * zoomFactor;
        newScale = Math.max(0.2, Math.min(newScale, 3));

        // Calculate new offset to zoom from center
        const scaleRatio = newScale / scale;
        offsetX = viewportCenterX - (viewportCenterX - offsetX) * scaleRatio;
        offsetY = viewportCenterY - (viewportCenterY - offsetY) * scaleRatio;

        scale = newScale;
        updateTransform();
        saveState();
    });

    viewport.addEventListener("mousedown", function (e) {
        if (!isSpacePressed) return;
        
        isPanning = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        viewport.style.cursor = "grabbing";
        canvas.style.cursor = "grabbing";
    });

    viewport.addEventListener("mousemove", function (e) {
        if (!isPanning || !isSpacePressed) return;
        
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        updateTransform();
    });

    viewport.addEventListener("mouseup", function () {
        isPanning = false;
        viewport.style.cursor = isSpacePressed ? 'grab' : 'default';
        canvas.style.cursor = isSpacePressed ? 'grab' : 'default';
        saveState();
    });

    viewport.addEventListener("mouseleave", function () {
        isPanning = false;
        viewport.style.cursor = isSpacePressed ? 'grab' : 'default';
        canvas.style.cursor = isSpacePressed ? 'grab' : 'default';
        saveState();
    });

    viewport.addEventListener("dblclick", function () {
        scale = 1;
        centerCanvas();
        saveState();
    });

    viewport.addEventListener("dblclick", function (e) {
        if (e.shiftKey) {
            createGuide(0, e.clientY - viewport.offsetTop, "horizontal");
        } else {
            createGuide(e.clientX - viewport.offsetLeft, 0, "vertical");
        }
    });

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

function opener(){
    const toolGroups = document.querySelectorAll('.tool-group');
    
    toolGroups.forEach(toolGroup => {
        const opener = toolGroup.querySelector('.opener');
        const options = toolGroup.querySelector('.options');
        let selected = toolGroup.querySelector('.selected');
        
        if (opener && options) {
            // If no selected element exists, use the first child of options as default
            if (!selected || selected.innerHTML.trim() === '') {
                if (options.children.length > 0) {
                    if (!selected) {
                        // Create selected element if it doesn't exist
                        selected = document.createElement('div');
                        selected.classList.add('selected');
                        toolGroup.prepend(selected);
                    }
                    selected.innerHTML = options.children[0].innerHTML;
                }
            }
            
            opener.addEventListener('click', (event) => {
                options.classList.toggle('active');
            });
            
            const items = options.children;
            // Get element content
            // Loop through each child and log its innerHTML
            for (let item of items) {
                item.addEventListener('click', (event) => {
                    selected.innerHTML = item.innerHTML;
                    options.classList.remove('active');
                    console.log(selected.innerHTML);
                });
            }
            
            if (selected) {
                selected.addEventListener('click', (event) => {
                    console.log(selected.innerHTML);
                    let check = options.classList.contains('active');
                    if(check){
                        options.classList.remove('active');
                    }
                });
            }
        }
    });
}

function lpanelDir(){
    // Make items draggable
    const draggableItems = document.querySelectorAll('.folder-item, .page-item, .component-item');
    const dropZones = document.querySelectorAll('.folder, .page, .component, .dir');

    draggableItems.forEach(item => {
        item.setAttribute('draggable', 'true');
        
        item.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            item.classList.add('dragging');
            e.dataTransfer.setData('text/plain', item.closest('.folder, .page, .component').className);
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const draggingItem = document.querySelector('.dragging');
            if (!draggingItem) return;

            const draggedElement = draggingItem.closest('.folder, .page, .component');
            const draggingType = draggedElement.className;
            const zoneType = zone.className;

            if (isValidDrop(draggingType, zoneType)) {
                const closestElement = getClosestElement(e.clientY, zone);
                if (closestElement) {
                    const indicator = closestElement.querySelector('.drag-indicator') || 
                        createDragIndicator(closestElement);
                    indicator.style.display = 'block';
                }
                zone.classList.add('drag-over');
            }
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('drag-over');
            hideDragIndicators();
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('drag-over');
            hideDragIndicators();

            const draggingItem = document.querySelector('.dragging');
            if (!draggingItem) return;

            const draggedElement = draggingItem.closest('.folder, .page, .component');
            const draggingType = draggedElement.className;
            const zoneType = zone.className;

            if (isValidDrop(draggingType, zoneType)) {
                const closestElement = getClosestElement(e.clientY, zone);
                
                if (closestElement) {
                    // If dropping between items, insert after the top entity
                    draggedElement.remove();
                    closestElement.parentNode.insertBefore(draggedElement, closestElement);
                } else if (zoneType.includes('dir')) {
                    // If dropping in empty directory or at the end
                    draggedElement.remove();
                    zone.appendChild(draggedElement);
                } else {
                    // If dropping inside a folder/page/component
                    const container = zone.querySelector('.folder-content, .page-content, .component-content');
                    if (container) {
                        draggedElement.remove();
                        container.appendChild(draggedElement);
                    }
                }
            }
        });
    });

    function getClosestElement(y, container) {
        const draggableElements = [...container.querySelectorAll('.folder, .page, .component:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top;

            if (offset > 0 && offset < closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.POSITIVE_INFINITY }).element;
    }

    function createDragIndicator(element) {
        const indicator = document.createElement('div');
        indicator.className = 'drag-indicator';
        element.appendChild(indicator);
        return indicator;
    }

    function hideDragIndicators() {
        document.querySelectorAll('.drag-indicator').forEach(indicator => {
            indicator.style.display = 'none';
        });
    }

    function isValidDrop(draggingType, zoneType) {
        // Root directory (.dir) accepts everything
        if (zoneType.includes('dir')) {
            return true;
        }

        // Folders can contain pages, components, and other folders
        if (zoneType.includes('folder')) {
            return draggingType.includes('page') || 
                   draggingType.includes('component') || 
                   draggingType.includes('folder');
        }

        // Pages can only contain components
        if (zoneType.includes('page')) {
            return draggingType.includes('component');
        }

        // Components can contain other components
        if (zoneType.includes('component')) {
            return draggingType.includes('component');
        }

        return false;
    }

    // Toggle expansion
    document.querySelectorAll('.folder-item, .page-item, .component-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const container = item.closest('.folder, .page, .component');
            container.classList.toggle('expanded');
        });
    });

    // Handle selection
    document.querySelectorAll('.folder-item, .page-item, .component-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.folder-item, .page-item, .component-item').forEach(i => {
                i.classList.remove('active');
            });
            item.classList.add('active');
        });
    });

    // Handle visibility toggle
    document.querySelectorAll('.actions .visibility').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            icon.textContent = icon.textContent === 'visibility' ? 'visibility_off' : 'visibility';
        });
    });

    // Add folder creation
    document.getElementById('addFolder').addEventListener('click', () => {
        const dir = document.querySelector('.dir');
        const newFolder = document.createElement('div');
        newFolder.className = 'folder';
        newFolder.innerHTML = `
            <div class="folder-item">
                <span class="expand-arrow">
                    <icon class="material-icons">chevron_right</icon>
                </span>
                <icon class="material-icons">folder</icon>
                <span class="name">New Folder</span>
                <div class="actions">
                    <icon class="material-icons" title="Toggle visibility">visibility</icon>
                    <icon class="material-icons" title="Delete">delete</icon>
                </div>
            </div>
            <div class="folder-content"></div>
        `;
        dir.insertBefore(newFolder, dir.firstChild);

        // Add event handlers to new folder
        const newFolderItem = newFolder.querySelector('.folder-item');
        newFolderItem.setAttribute('draggable', 'true');
        
        newFolderItem.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            newFolderItem.classList.add('dragging');
            e.dataTransfer.setData('text/plain', newFolder.className);
        });

        newFolderItem.addEventListener('dragend', () => {
            newFolderItem.classList.remove('dragging');
        });

        // Add expansion toggle
        newFolderItem.addEventListener('click', (e) => {
            e.stopPropagation();
            newFolder.classList.toggle('expanded');
        });

        // Add selection
        newFolderItem.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.folder-item, .page-item, .component-item').forEach(i => {
                i.classList.remove('active');
            });
            newFolderItem.classList.add('active');
        });

        // Add visibility toggle
        newFolder.querySelector('.actions icon').addEventListener('click', (e) => {
            e.stopPropagation();
            const icon = e.target;
            icon.textContent = icon.textContent === 'visibility' ? 'visibility_off' : 'visibility';
        });

        // Add drop zone functionality
        newFolder.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const draggingItem = document.querySelector('.dragging');
            if (!draggingItem) return;

            const draggedElement = draggingItem.closest('.folder, .page, .component');
            const draggingType = draggedElement.className;
            const zoneType = newFolder.className;

            if (isValidDrop(draggingType, zoneType)) {
                newFolder.classList.add('drag-over');
            }
        });

        newFolder.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            newFolder.classList.remove('drag-over');
        });

        newFolder.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            newFolder.classList.remove('drag-over');

            const draggingItem = document.querySelector('.dragging');
            if (!draggingItem) return;

            const draggedElement = draggingItem.closest('.folder, .page, .component');
            const draggingType = draggedElement.className;
            const zoneType = newFolder.className;

            if (isValidDrop(draggingType, zoneType)) {
                const container = newFolder.querySelector('.folder-content');
                if (container) {
                    draggedElement.remove();
                    container.appendChild(draggedElement);
                }
            }
        });
    });
}
function pageTool(){
    // Page Tool Implementation
    const pageTool = document.getElementById('page');
    const viewport = document.querySelector('.canvas-wrapper');
    let isDragging = false;
    let isResizing = false;
    let currentPage = null;
    let selectedPage = null;
    let startX, startY;
    let pageCounter = 1;
    let activeHandle = null;

    // Function to create a new page
    function createPage(x, y, width = 0, height = 0) {
        const page = document.createElement('div');
        page.className = 'page-preview';
        page.style.left = x + 'px';
        page.style.top = y + 'px';
        page.style.width = width + 'px';
        page.style.height = height + 'px';

        // Add page name
        const pageName = document.createElement('div');
        pageName.className = 'page-name';
        pageName.textContent = `Page ${pageCounter++}`;
        page.appendChild(pageName);

        // Add resize handles (only corners)
        ['nw', 'ne', 'sw', 'se'].forEach(handle => {
            const resizeHandle = document.createElement('div');
            resizeHandle.className = `resize-handle ${handle}`;
            page.appendChild(resizeHandle);
        });

        return page;
    }

    // Function to select a page
    function selectPage(page) {
        if (selectedPage) {
            selectedPage.classList.remove('selected');
        }
        selectedPage = page;
        if (page) {
            page.classList.add('selected');
        }
    }

    // Function to duplicate a page
    function duplicatePage(page, x, y) {
        const rect = page.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        const newPage = createPage(
            x - viewportRect.left,
            y - viewportRect.top,
            rect.width,
            rect.height
        );
        viewport.appendChild(newPage);
        selectPage(newPage);
        return newPage;
    }

    pageTool.addEventListener('click', () => {
        pageTool.classList.add('active');
        viewport.style.cursor = 'crosshair';
    });

    viewport.addEventListener('mousedown', (e) => {
        const viewportRect = viewport.getBoundingClientRect();
        const relativeX = e.clientX - viewportRect.left;
        const relativeY = e.clientY - viewportRect.top;

        // Check if clicking on a resize handle
        const resizeHandle = e.target.closest('.resize-handle');
        if (resizeHandle) {
            isResizing = true;
            currentPage = resizeHandle.closest('.page-preview');
            activeHandle = resizeHandle;
            startX = relativeX;
            startY = relativeY;
            return;
        }

        // Check if clicking on a page
        const clickedPage = e.target.closest('.page-preview');
        if (clickedPage) {
            if (e.altKey) {
                // Duplicate page
                currentPage = duplicatePage(clickedPage, e.clientX, e.clientY);
                isDragging = true;
            } else {
                // Select and start dragging
                selectPage(clickedPage);
                currentPage = clickedPage;
                isDragging = true;
            }
            startX = relativeX - parseInt(currentPage.style.left);
            startY = relativeY - parseInt(currentPage.style.top);
            return;
        }

        // Create new page
        if (pageTool.classList.contains('active')) {
            isDragging = true;
            currentPage = createPage(relativeX, relativeY);
            viewport.appendChild(currentPage);
            selectPage(currentPage);
            startX = relativeX;
            startY = relativeY;
        }
    });

    viewport.addEventListener('mousemove', (e) => {
        if (!isDragging && !isResizing) return;

        const viewportRect = viewport.getBoundingClientRect();
        const relativeX = e.clientX - viewportRect.left;
        const relativeY = e.clientY - viewportRect.top;

        if (isResizing && currentPage && activeHandle) {
            const pageRect = currentPage.getBoundingClientRect();
            const pageLeft = pageRect.left - viewportRect.left;
            const pageTop = pageRect.top - viewportRect.top;

            let newWidth = pageRect.width;
            let newHeight = pageRect.height;
            let newLeft = pageLeft;
            let newTop = pageTop;

            if (activeHandle.classList.contains('nw')) {
                newWidth = pageRect.width + (pageLeft - relativeX);
                newHeight = pageRect.height + (pageTop - relativeY);
                newLeft = relativeX;
                newTop = relativeY;
            } else if (activeHandle.classList.contains('ne')) {
                newWidth = relativeX - pageLeft;
                newHeight = pageRect.height + (pageTop - relativeY);
                newTop = relativeY;
            } else if (activeHandle.classList.contains('sw')) {
                newWidth = pageRect.width + (pageLeft - relativeX);
                newHeight = relativeY - pageTop;
                newLeft = relativeX;
            } else if (activeHandle.classList.contains('se')) {
                newWidth = relativeX - pageLeft;
                newHeight = relativeY - pageTop;
            }

            if (newWidth > 50) {
                currentPage.style.width = newWidth + 'px';
                currentPage.style.left = newLeft + 'px';
            }
            if (newHeight > 50) {
                currentPage.style.height = newHeight + 'px';
                currentPage.style.top = newTop + 'px';
            }
        } else if (isDragging && currentPage) {
            if (pageTool.classList.contains('active')) {
                // Drawing new page
                const width = relativeX - startX;
                const height = relativeY - startY;
                currentPage.style.width = Math.abs(width) + 'px';
                currentPage.style.height = Math.abs(height) + 'px';
                
                if (width < 0) {
                    currentPage.style.left = relativeX + 'px';
                }
                if (height < 0) {
                    currentPage.style.top = relativeY + 'px';
                }
            } else {
                // Dragging existing page
                currentPage.style.left = (relativeX - startX) + 'px';
                currentPage.style.top = (relativeY - startY) + 'px';
            }
        }
    });

    viewport.addEventListener('mouseup', () => {
        if (isDragging || isResizing) {
            isDragging = false;
            isResizing = false;
            activeHandle = null;
            pageTool.classList.remove('active');
            viewport.style.cursor = 'default';

            if (currentPage && 
                (parseInt(currentPage.style.width) < 50 || 
                 parseInt(currentPage.style.height) < 50)) {
                currentPage.remove();
                if (selectedPage === currentPage) {
                    selectPage(null);
                }
            }
            
            currentPage = null;
        }
    });

    // Handle copy/paste
    document.addEventListener('keydown', (e) => {
        if (e.key === 'c' && e.ctrlKey && selectedPage) {
            // Copy page data
            const pageData = {
                width: selectedPage.style.width,
                height: selectedPage.style.height,
                name: selectedPage.querySelector('.page-name').textContent
            };
            localStorage.setItem('copiedPage', JSON.stringify(pageData));
        } else if (e.key === 'v' && e.ctrlKey) {
            // Paste page
            const pageData = JSON.parse(localStorage.getItem('copiedPage'));
            if (pageData) {
                const viewportRect = viewport.getBoundingClientRect();
                const newPage = createPage(
                    viewportRect.width / 2,
                    viewportRect.height / 2,
                    parseInt(pageData.width),
                    parseInt(pageData.height)
                );
                newPage.querySelector('.page-name').textContent = pageData.name + ' (Copy)';
                viewport.appendChild(newPage);
                selectPage(newPage);
            }
        }
    });
}
//✅ Where all my code is running (Without being triggered)
document.addEventListener('DOMContentLoaded', function () {
    checkSession();
});


canvas.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        // Handle zoom
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(5, canvas.zoom * delta));
        canvas.zoom = newZoom;
    } else {
        // Handle pan
        const newX = canvas.panX + e.deltaX;
        const newY = canvas.panY + e.deltaY;
        canvas.panX = newX;
        canvas.panY = newY;
    }
});

*/