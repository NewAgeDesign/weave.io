const ws = {
    lpanel: {},
    viewport: {
        tool : function() {
            if (window.toolboxInitialized) return;
            window.toolboxInitialized = true;

            const toggles = [
                { buttonId: "open-navigators", panelId: "navigators" },
                { buttonId: "open-elements", panelId: "elements" },
                { buttonId: "open-vectors", panelId: "vectors" },
                { buttonId: "open-shapes", panelId: "shapes" }
            ];

            const getEl = id => document.getElementById(id);
            const allPanels = toggles.map(t => getEl(t.panelId));
            const allToggleButtons = toggles.map(t => getEl(t.buttonId));
            const panelToToolIcon = Object.fromEntries(toggles.map(({ buttonId, panelId }) => [
                panelId, getEl(buttonId).previousElementSibling
            ]));

            // 🔄 Setup toggle buttons and their icon selection logic
            toggles.forEach(({ buttonId, panelId }) => {
                const button = getEl(buttonId);
                const panel = getEl(panelId);
                const toolIcon = panelToToolIcon[panelId];

                button.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const isActive = panel.classList.contains("active");
                    allPanels.forEach(p => p.classList.remove("active"));
                    allToggleButtons.forEach(b => b.textContent = "keyboard_arrow_up");
                    if (!isActive) {
                        panel.classList.add("active");
                        button.textContent = "keyboard_arrow_down";
                    }
                });

                // 🧩 Icon click inside dropdown
                panel.querySelectorAll("icon").forEach(icon => {
                    icon.addEventListener("click", (e) => {
                        e.stopPropagation();

                        document.querySelectorAll(".toolbox icon.active, .tool.active").forEach(el => el.classList.remove("active"));
                        icon.classList.add("active");

                        if (toolIcon) {
                            const tooltip = icon.getAttribute("data-tooltip");
                            const cursor = icon.getAttribute("data-cursor");

                            toolIcon.textContent = icon.textContent.trim();
                            toolIcon.classList.add("active");
                            toolIcon.closest(".tool")?.classList.add("active");

                            tooltip ? toolIcon.setAttribute("data-tooltip", tooltip) : toolIcon.removeAttribute("data-tooltip");
                            cursor ? toolIcon.setAttribute("data-cursor", cursor) : toolIcon.removeAttribute("data-cursor");
                        }

                        panel.classList.remove("active");
                        button.textContent = "keyboard_arrow_up";
                        updateViewportCursor();
                    });
                });
            });

            // 🖱️ Toolbar icon click
            document.querySelectorAll(".tool").forEach(tool => {
                tool.addEventListener("click", (e) => {
                    e.stopPropagation();
                    document.querySelectorAll(".tool.active").forEach(t => t.classList.remove("active"));
                    tool.classList.add("active");
                    updateViewportCursor();
                });
            });

            // 🧹 Global click to close panels
            document.addEventListener("click", (e) => {
                const clickedInside = allPanels.some(panel => panel.contains(e.target)) ||
                                    allToggleButtons.some(button => button.contains(e.target));
                if (!clickedInside) {
                    allPanels.forEach(panel => panel.classList.remove("active"));
                    allToggleButtons.forEach(button => button.textContent = "keyboard_arrow_up");
                }
            });

            // ⌨️ Keyboard Shortcuts
            window.addEventListener("load", () => {
                const workspace = document.querySelector('.workspace');
                const app = document.querySelector('.app');
                const viewport = document.querySelector('.workspace .viewport');

                if (!workspace || !app || !viewport) return;

                const shortcutMap = buildShortcutMap();
                let keyBuffer = [];
                let bufferTimer = null;

                document.addEventListener("keydown", (e) => {
                    // ❌ Ignore shortcuts if you're not inside `.viewport`
                    if (!viewport.contains(document.activeElement)) return;

                    // ❌ Ignore if typing in input or textarea
                    const tag = document.activeElement.tagName.toLowerCase();
                    if (["input", "textarea"].includes(tag)) return;

                    const key = e.key.toLowerCase();
                    if (["shift", "control", "alt", "meta"].includes(key)) return;

                    clearTimeout(bufferTimer);
                    bufferTimer = setTimeout(() => keyBuffer = [], 1000);

                    const modifiers = [];
                    if (e.shiftKey) modifiers.push("shift");
                    if (e.ctrlKey) modifiers.push("ctrl");
                    if (e.altKey) modifiers.push("alt");

                    keyBuffer.push([...modifiers, key].join("+"));

                    for (let i = keyBuffer.length; i > 0; i--) {
                        const combo = keyBuffer.slice(-i).join("+");
                        const match = shortcutMap[combo];
                        if (!match) continue;

                        e.preventDefault();
                        keyBuffer = [];

                        if (match.options) {
                            match.options.click();
                        } else if (match.toolbar) {
                            const toolIcon = match.toolbar;
                            const tool = toolIcon.closest(".tool");

                            document.querySelectorAll(".tool > icon.active, .tool.active").forEach(el => el.classList.remove("active"));
                            toolIcon.classList.add("active");
                            tool?.classList.add("active");

                            const tooltip = toolIcon.getAttribute("data-tooltip");
                            tooltip ? toolIcon.setAttribute("data-tooltip", tooltip) : toolIcon.removeAttribute("data-tooltip");

                            document.querySelectorAll(".options").forEach(p => p.classList.remove("active"));
                            document.querySelectorAll(".toggle-button").forEach(b => b.textContent = "keyboard_arrow_up");
                            updateViewportCursor();
                        }
                        break;
                    }
                });
            });

            function buildShortcutMap() {
                const shortcutMap = {};
                document.querySelectorAll("icon[data-tooltip]").forEach(icon => {
                    const tooltip = icon.getAttribute("data-tooltip");
                    const match = tooltip?.match(/\(([^)]+)\)/);
                    if (!match) return;

                    const shortcut = match[1].toLowerCase().replace(/\s*\+\s*/g, '+').replace(/\s+/g, '');
                    if (!shortcutMap[shortcut]) shortcutMap[shortcut] = {};

                    if (icon.closest(".tool")) {
                        shortcutMap[shortcut].toolbar = icon;
                    } else if (icon.closest(".options")) {
                        shortcutMap[shortcut].options = icon;
                    }
                });
                return shortcutMap;
            }
            
            function updateViewportCursor() {
                const activeToolIcon = document.querySelector(".tool.active > icon:not(.more)");
                const cursor = activeToolIcon?.getAttribute("data-cursor");
                const viewport = document.querySelector(".viewport");
                if (cursor && viewport) {
                    viewport.style.cursor = cursor;
                    console.log(`Cursor updated to: ${cursor}`);
                }
            }

            document.querySelectorAll('toggle').forEach(toggle => {
                toggle.addEventListener('click', e => {
                    e.stopPropagation();

                    const nextUL = [...toggle.parentElement.children].find(
                        el => el.tagName === 'UL'
                    );

                    const isVisible = nextUL && getComputedStyle(nextUL).display !== 'none';
                    const expanded = !isVisible;

                    if (nextUL) {
                        nextUL.style.display = expanded ? 'flex' : 'none';
                    }

                    toggle.classList.toggle('open', expanded);

                    const arrow = toggle.querySelector(".arrow");
                    if (arrow) {
                        arrow.textContent = expanded ? "keyboard_arrow_down" : "keyboard_arrow_up";
                    }

                    toggle.setAttribute('aria-expanded', expanded);
                });
            });
        },
        features : function() {
            const viewportEl = document.querySelector('.viewport');
            const gridCanvas = document.createElement('canvas');
            gridCanvas.className = 'grid-canvas';
            viewportEl.appendChild(gridCanvas);

            const ctx = gridCanvas.getContext('2d');
            let scale = 1;
            let offsetX = 0, offsetY = 0;
            let isPanning = false;
            let snapToGrid = false;
            let panKeyActive = false;
            let activeTool = 'move';

            function resizeCanvas() {
                gridCanvas.width = viewportEl.offsetWidth;
                gridCanvas.height = viewportEl.offsetHeight;
                drawGrid();
            }

            function drawGrid() {
                ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary3') || '#333';
                const spacing = 16 * scale;

                for (let x = -offsetX % spacing; x < gridCanvas.width; x += spacing) {
                    for (let y = -offsetY % spacing; y < gridCanvas.height; y += spacing) {
                        ctx.beginPath();
                        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
            }

            viewportEl.addEventListener('wheel', e => {
                if (e.ctrlKey) {
                    e.preventDefault();
                    const delta = -e.deltaY * 0.001;
                    const oldScale = scale;
                    scale = Math.min(Math.max(0.1, scale + delta), 10);

                    const rect = viewportEl.getBoundingClientRect();
                    const mx = e.clientX - rect.left;
                    const my = e.clientY - rect.top;
                    offsetX = mx - ((mx - offsetX) * scale / oldScale);
                    offsetY = my - ((my - offsetY) * scale / oldScale);

                    drawGrid();
                }
            }, { passive: false });

            viewportEl.addEventListener('mousedown', e => {
                if (panKeyActive || activeTool === 'pan') {
                    isPanning = true;
                    let startX = e.clientX;
                    let startY = e.clientY;

                    function onMouseMove(ev) {
                        offsetX += (ev.clientX - startX);
                        offsetY += (ev.clientY - startY);
                        startX = ev.clientX;
                        startY = ev.clientY;
                        drawGrid();
                    }

                    function onMouseUp() {
                        isPanning = false;
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                    }

                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                }
            });

            window.addEventListener('keydown', e => {
                if (e.code === 'Space') panKeyActive = true;
                if (e.altKey && e.key.toLowerCase() === 's') {
                    snapToGrid = !snapToGrid;
                    console.log("Snap to grid:", snapToGrid);
                }
            });

            window.addEventListener('keyup', e => {
                if (e.code === 'Space') panKeyActive = false;
            });

            document.querySelectorAll('#navigators icon').forEach(icon => {
                icon.addEventListener('click', () => {
                    activeTool = icon.getAttribute('data-cursor') === 'grab' ? 'pan' : 'move';
                });
            });

            function snap(x, y) {
                if (!snapToGrid) return { x, y };
                const spacing = 16 * scale;
                return {
                    x: Math.round((x - offsetX) / spacing) * spacing + offsetX,
                    y: Math.round((y - offsetY) / spacing) * spacing + offsetY
                };
            }

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            viewportEl.addEventListener('dblclick', (e) => {
                if (activeTool !== 'draw') {
                    scale = 1;
                    offsetX = 0;
                    offsetY = 0;
                    drawGrid();
                    return;
                }

                const obj = document.createElement('div');
                obj.className = 'object';
                obj.style.position = 'absolute';
                const rect = viewportEl.getBoundingClientRect();
                const pos = {
                    x: (e.clientX - rect.left - offsetX) / scale,
                    y: (e.clientY - rect.top - offsetY) / scale,
                };
                const snapped = snap(pos.x * scale + offsetX, pos.y * scale + offsetY);
                obj.style.left = snapToGrid ? snapped.x + 'px' : pos.x * scale + offsetX + 'px';
                obj.style.top = snapToGrid ? snapped.y + 'px' : pos.y * scale + offsetY + 'px';
                obj.style.width = '100px';
                obj.style.height = '100px';
                obj.style.background = 'var(--primary2)';
                obj.draggable = true;
                viewportEl.appendChild(obj);
            });

            setTimeout(() => resizeCanvas(), 50);
            return { snap, getOffset: () => ({ offsetX, offsetY }), getScale: () => scale };

        }
    },
    rpanel: {
        number: function () {
            const numberInputs = document.querySelectorAll('input[type="number"]');

            numberInputs.forEach(function (input) {
                // Revert to 0 when the input is empty
                input.addEventListener('input', function () {
                    if (input.value.trim() === '') {
                        input.value = 0;
                    }
                });

                // Revert to 0 when the input loses focus and is empty
                input.addEventListener('blur', function () {
                    if (input.value.trim() === '') {
                        input.value = 0;
                    }
                });

                // Allow the user to type freely
                input.addEventListener('focus', function () {
                    if (input.value === '0') {
                        input.value = '';
                    }
                });
            });
        },

    }
};


function workspaceInit(){
    ws.viewport.tool();
    window.addEventListener("load", () => {
        requestAnimationFrame(() => {
            ws.viewport.features();
        });
    });
    ws.rpanel.number();
    // Add any other initialization code here
}
