// UiGod Version 1.0
function getStackTrace() {
    var stack = new Error().stack;
    // Remove the first line from the stack trace
    return stack.split('\n').slice(2).join('\n');
} 

const printHTML = 'printHTML';
const addBefore = 'addBefore';
const errorMotd = 'errorMotd';
const conStyle = 'conStyle';
const addAfter = 'addAfter';
const getValue = 'getValue';
const replace = 'replace';
const deleter = 'delete';
const select = 'select';
const getURL = 'getURL';
const setURL = 'setURL';
const patch = 'patch';
const check = 'check';
const print = 'print';
const info = 'info';
const root = 'root';
const ajax = 'ajax';
const post = 'post';
const good = 'good';
const pick = 'pick';
const put = 'put';
const all = 'all';
const bad = 'bad';
const get = 'get';

io = {
    create : function (parent, element, attributes) {
        const parentSelector = typeof parent === 'string' ? document.querySelector(parent) : parent;
        const newElement = document.createElement(element);
        if (typeof attributes === 'object') {
            for (let key in attributes) {
                newElement.setAttribute(key, attributes[key]);
            }
        } else {
            console.error('Attribute Error: The attributes must be written in form of an object');
        }
        if (parentSelector) {
            parentSelector.appendChild(newElement);
        } else {
            console.error('Parent Error: The Parent element does not exist within the html.');
        }
    },
    in : function (action, element, param3, param4, param5) {
        switch(action){
            case 'select' :
                const sElement = document.querySelector(element);
                if (sElement) {
                    if (typeof param3 === 'function') {
                        param3.call(sElement);
                    }
                    return sElement;
                } else {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
            break;
            
            case 'pick':
                const pElement = document.querySelectorAll(element);
                if (!pElement) {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
                else if (typeof param3 === 'number' && typeof param4 === 'function' && pElement.length > param3) {
                    const selectedElement = pElement[param3 - 1];
                    param4.call(selectedElement);
                    return selectedElement;
                }
                else if(!param4){
                    return pElement[param3 - 1];
                }
            break;

            case 'all' :
                const aElement = document.querySelectorAll(element);
                if (!aElement) {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
                else if (typeof param3 === 'function' && aElement.length > 0) {
                    aElement.forEach(function(param2) {
                        param3.call(param2);
                    });
                    return aElement;
                }
            break;

            case "getValue" :
                const myElement = document.querySelector(element);
                if(!myElement){
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                    return;
                }
                if(myElement.tagName.toLowerCase() === "input"){
                    return myElement.value;
                }else{
                    return myElement.textContent;
                }

            case "getURL" :
                const currentUrl = window.location.href;
            
                if (currentUrl.includes(element) && typeof param3 === "function") {
                    param3.call();
                } else {
                    io.out("bad", "String Mismatch : Your String is not in the URL, please debug your Links and try again.");
                }
            break;

            case "setURL":
                const url = new URL(element);
                const params = new URLSearchParams(url.search);

                for (const key in param3) {
                    params.set(key, param3[key]);
                }
                url.search = params.toString();
                window.location.href = url.toString();

                // Check if the file exists
                fetch(url.toString())
                .then(response => {
                    if (!response.ok) {
                        io.out('bad', 'File Error: The file does not exist within the server.');
                    } else {
                        window.location.href = url.toString();
                    }
                })
                .catch(e => {
                    console.error('There was a problem with the fetch operation: ' + e.message);
                });
            break;

            case 'conStyle':
                if (element === 'root') {
                    io.in(ajax, get, 'scode/config.json', function(data){
                        for (const key in data) {
                            if (data.hasOwnProperty(key)) {
                                document.documentElement.style.setProperty(`--${key}`, data[key]);
                            }
                        }
                    });
                }
            break;

            case 'ajax':
            let method = element.toUpperCase();
            let file = param3;
            let data = param4;
            let callback = param5;

            // If data is a function, assign it to callback and set data to null
            if (typeof param4 === 'function') {
                callback = param4;
                data = null;
            }

            let options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            };

            // Only include body if the method is not GET or HEAD
            if (method !== 'GET' && method !== 'HEAD') {
                options.body = JSON.stringify(data);
            }
            if (method === 'GET' && data) {
                const params = new URLSearchParams(data).toString();
                file += `?${params}`;
            }

            // Set a timeout for the fetch request
            const controller = new AbortController();
            options.signal = controller.signal;
            const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout after 10 seconds

            fetch(file, options)
                .then(response => {
                    clearTimeout(timeoutId);
                    // Check if the response's content type is JSON
                    const contentType = response.headers.get("content-type");
                    // If the response isn't a 2xx status code, treat it as an error
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return contentType && contentType.includes("application/json")
                    ? response.json()
                    : response.text();
                })
                .then(responseData => {
                    if (typeof callback === 'function') {
                        callback.call(this, responseData);
                    }
                    if (typeof responseData === 'string') {
                        // The response is HTML, render it in the error message
                        io.out('errorMotd', 'bad', 'PHP Error', responseData);
                    } else if (responseData.errormsg) {
                        if(responseData.errormsg.success !== ''){
                            const { success, head, message } = responseData.errormsg;
                            switch (success) {
                                case 'bad':
                                    io.out('errorMotd', 'bad', head, message);
                                    break;
                                case 'good':
                                    io.out('errorMotd', 'good', head, message);
                                    setTimeout(() => window.location.reload(), 3000);
                                    break;
                                case 'check':
                                    io.out('errorMotd', 'check', head, message);
                                    break;
                                default:
                                    io.out('errorMotd', 'info', head, message);
                            }
                        }
                    }
                })
                .catch(error => {
                    const errorDetails = `${method} ${file}`;
                    if (error.name === 'AbortError') {
                        io.out('errorMotd', 'bad', 'Request Timeout', `The request to ${errorDetails} took too long and was aborted.`);
                    } else {
                        io.out('errorMotd', 'bad', 'Request Error', `Error on ${errorDetails}: ${error.message}`);
                    }
                    console.error(`Error during fetch to ${errorDetails}:`, error);
                });
            break;
            default:
                console.error(`Action '${action}' is not supported.`);
            break;
            
        }
    },
    out : function (action, element, param3, param4) {
        switch(action){
            case 'bad':
                console.log('%c' + element, 'color: #f9caca; background-color: #d9534f79; font-weight:600; padding: 5pt 10pt; border-radius: 50pt;');
                console.error(getStackTrace());
            break;

            case 'good':
                console.log('%c' + element, 'color: #9dfcc1; background-color: #0e924179; font-weight:600; padding: 5pt 10pt; border-radius: 50pt;');
                console.error(getStackTrace());
            break;

            case 'check':
                console.log('%c' + element, 'color: #e5e5e5; background-color: #ffc40079; font-weight:600; padding: 5pt 10pt; border-radius: 50pt;');
                console.error(getStackTrace());
            break;

            case 'print':
                const prElement = document.querySelector(element);
                if (prElement) {
                    prElement.textContent = param3;
                } else {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
            break;

            case 'printHTML' :
                const aElement = document.querySelector(element);
                if (aElement) {
                    aElement.innerHTML += param3;
                } else {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
            break;

            case 'replace':
                const rElement = document.querySelector(element);
                if (rElement) {
                    if (param4 !== undefined) {
                        // If param4 is defined, replace the param3 string with param4
                        rElement.innerHTML = rElement.innerHTML.replace(new RegExp(param3, 'g'), param4);
                    } else {
                        // If param4 is not defined, replace the entire HTML with param3
                        rElement.innerHTML = param3;
                    }
                } else {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
            break;

            case 'addBefore':
                const bElement = document.querySelector(element);
                if (bElement) {
                    if (bElement.innerHTML.includes(param3)) {
                        bElement.innerHTML = bElement.innerHTML.replace(param3, param4 + param3);
                    } else {
                        io.out('bad', 'Search Error: The search string does not exist within the html element.');
                    }
                } else {
                    io.out('bad', 'Element Error: The element does not exist within the html.');
                }
            break;

            case 'addAfter':
            const pElement = document.querySelector(element);
            if (pElement) {
                if (pElement.innerHTML.includes(param3)) {
                    pElement.innerHTML = pElement.innerHTML.replace(param3, param3 + param4);
                } else {
                    io.out('bad', 'Search Error: The search string does not exist within the html element.');
                }
            } else {
                io.out('bad', 'Element Error: The element does not exist within the html.');
            }
        break;

        case 'errorMotd':
            io.create('body', 'div', {class: 'error-motd'});
            const createError = document.querySelector('.error-motd');
            
            // Initial styles
            createError.style.transition = 'opacity 0.5s, right 0.5s';
            createError.style.position = 'fixed';
            createError.style.display = 'none';
            createError.style.right = '-20rem';
            createError.style.bottom = '1rem';
            createError.style.width = '360px';
            createError.style.opacity = '0';

            // Set the class and content based on the type
            switch (element) {
                case 'bad':
                    createError.className = 'bad-motd';
                    break;
                case 'check':
                    createError.className = 'check-motd';
                    break;
                case 'good':
                    createError.className = 'good-motd';
                    break;
                case 'info':
                    createError.className = 'info-motd';
                    break;
            }
            createError.innerHTML = `<icon align="right">close</icon><b>${param3}</b><p>${param4}</p>`;
            if (createError) {
                const content = createError.querySelector('*'); // Select the first child
                if (content) {
                    content.style.color = '#fff';
                }
            }

            document.body.appendChild(createError);

            // Display the error message with a delay
            setTimeout(() => {
                createError.style.display = 'block';
                setTimeout(() => {
                    createError.style.opacity = '1';
                    createError.style.right = '1rem'; // Move into view
                }, 50);
            }, 0);

            // Hide the error message after 10 seconds
            setTimeout(() => {
                createError.style.opacity = '0';
                createError.style.right = '-20rem'; // Move out of view
                setTimeout(() => {
                    createError.style.display = 'none';
                    document.body.removeChild(createError);
                }, 500); // Wait for the transition to complete
            }, 10500);

            // Handle click on close icon
            document.body.addEventListener('click', function(event) {
                const error = event.target.closest('.good-motd, .bad-motd, .info-motd, .check-motd');
                const icon = event.target.closest('icon');

                if (error && icon) {
                    console.log("Icon was clicked!");
                    error.style.opacity = '0';
                    error.style.right = '-20rem';
                    setTimeout(() => {
                        error.style.display = 'none';
                        try {
                            document.body.removeChild(error);
                        } catch (err) {
                            console.warn("Error removing element:", err);
                        }
                    }, 500);
                }
            });
        break;

        }
    },
    showMain: function showMain(parentSelector, targetClass) {
        const parent = document.querySelector(parentSelector);
        if (!parent) {
            console.error(`Parent element '${parentSelector}' not found.`);
            return;
        }
    
        // Iterate over direct children only
        [...parent.children].forEach(child => {
            if (child.classList.contains(targetClass) || child.tagName === "HEADER") {
                // ✅ Keep this element
                child.style.display = 'flex';
            } else {
                // ❌ Remove unwanted elements completely
                child.remove();
            }
        });
    },
    form: function () {
    
        // ✅ 1. Floating Labels for Inputs
        function floatingLabels() {
            const formContainer = document.querySelector(".forms"); // Parent Check
            if (!formContainer) return; // Stop if parent doesn't exist
    
            const inputs = document.querySelectorAll("form input, form textarea");
            inputs.forEach(input => {
                input.addEventListener("input", () => {
                    let label = document.querySelector(`label[for="${input.id}"]`);
                    if (label) {
                        label.style.color = input.value.trim() ? "var(--accent)" : "var(--secondary2)";
                        label.style.fontSize = input.value.trim() ? "0.8rem" : "1rem";
                        label.style.top = input.value.trim() ? "-1.4rem" : "0.5rem";
                        label.style.left = input.value.trim() ? "0" : "0.5rem";
                    }
    
                    // Handle character counter
                    const limit = input.getAttribute("data-limit");
                    if (limit !== null) {
                        const count = input.value.length;
                        let counter = document.getElementById(`${input.id}Counter`);
    
                        // Create counter element if it doesn't exist
                        if (!counter) {
                            counter = document.createElement('span');
                            counter.classList.add('counter');
                            counter.id = `${input.id}Counter`;
                            input.parentElement.appendChild(counter);
                        }
    
                        counter.textContent = `${count}/${limit}`;
    
                        // Enforce character limit
                        if (count > limit) {
                            input.value = input.value.slice(0, limit);
                            counter.textContent = `${limit}/${limit}`;
                        }
                    }
                });
            });
        }
    
        // ✅ 2. Password Visibility Toggle
        function passwordToggle() {
            document.querySelectorAll('.input').forEach(container => {
                const passwordInput = container.querySelector('input[type="password"]');
                if (passwordInput) {
                    let toggleIcon = container.querySelector('.pswd-toggle');
                    
                    // Ensure toggle icon exists
                    if (!toggleIcon) {
                        toggleIcon = document.createElement('icon');
                        toggleIcon.classList.add('pswd-toggle');
                        container.appendChild(toggleIcon); // Append to container
                    }
        
                    Object.assign(toggleIcon.style, {
                        fontSize: "14pt", color: "var(--secondary2)", cursor: "pointer",
                        position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)"
                    });
        
                    toggleIcon.textContent = 'visibility';
        
                    toggleIcon.addEventListener('click', () => {
                        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
                        toggleIcon.textContent = passwordInput.type === 'password' ? 'visibility' : 'visibility_off';
                    });
                }
            });
        }
        
    
        // ✅ 3. Search Input Enhancement
        function searchEnhancements() {
            document.querySelectorAll('.input').forEach(container => {
                const searchInput = container.querySelector('input[type="search"]');
                if (searchInput) {
                    let searchIcon = container.querySelector('.search-icon') || io.create(container, 'icon', { class: 'search-icon' });
                    let clearBtn = container.querySelector('.clear-btn') || io.create(container, 'icon', { class: 'clear-btn' });
    
                    Object.assign(searchIcon.style, {
                        fontSize: "14pt", color: "var(--secondary2)", cursor: "pointer",
                        position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)"
                    });
    
                    Object.assign(clearBtn.style, {
                        fontSize: "14pt", color: "var(--secondary2)", cursor: "pointer",
                        position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "none"
                    });
    
                    searchIcon.textContent = 'search';
                    clearBtn.textContent = 'close';
    
                    searchInput.addEventListener('input', () => {
                        clearBtn.style.display = searchInput.value ? "inline-block" : "none";
                    });
    
                    clearBtn.addEventListener('click', () => {
                        searchInput.value = "";
                        clearBtn.style.display = "none";
                        searchInput.focus();
                    });
    
                    searchInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            console.log("Searching for:", searchInput.value);
                            // Implement search logic here
                        }
                    });
                }
            });
        }
    
        // ✅ 4. Verification Code Input Auto-Advance
        function autoAdvanceCodeInputs() {
            const inputs = document.querySelectorAll('.input-group .code');
    
            inputs.forEach((input, index) => {
                input.addEventListener('input', function () {
                    if (input.value.length === 1 && index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                });
    
                input.addEventListener('keydown', function (event) {
                    if (event.key === 'Backspace' && index > 0 && input.value === '') {
                        inputs[index - 1].focus();
                    }
                });
            });
        }
    
        // ✅ 5. Form Submission (AJAX)
        function handleFormSubmission() {
            document.querySelectorAll('form').forEach(form => {
                form.addEventListener('submit', function (event) {
                    event.preventDefault();
    
                    let data = {};
                    const formData = new FormData(form);
                    formData.forEach((value, key) => { data[key] = value.trim(); });
                    data['action'] = event.submitter.name; // Capture submit button action
                    console.log(data);
    
                    io.in('ajax', 'POST', 'scode/function.php', data, function (res) {
                        console.log(res);
                    });
                });
            });
        }
    
        // ✅ 6. Logout Handling
        function handleLogout() {
            const logout = document.querySelector('#logout');
            if (logout) {
                logout.addEventListener('click', function () {
                    io.in('ajax', 'POST', 'scode/function.php', { action: 'logout' }, function (res) {
                        if (res.errormsg.success) {
                            io.out('errorMotd', 'good', res.errormsg.head, res.errormsg.message);
                            setTimeout(() => { window.location.href = "index.php"; }, 3000);
                        } else {
                            io.out('errorMotd', 'bad', res.errormsg.head, res.errormsg.message);
                        }
                    });
                });
            }
        }

        // ✅ Call all necessary functions
        floatingLabels();
        passwordToggle();
        searchEnhancements();
        autoAdvanceCodeInputs();
        handleFormSubmission();
        handleLogout();

        return {
            navigator: function (defaultSection, linkSelector, sectionSelector, storageKey) {
                const links = document.querySelectorAll(linkSelector);
                const sections = document.querySelectorAll(sectionSelector);
    
                // Ensure localStorage has a default value
                if (!localStorage.getItem(storageKey)) {
                    localStorage.setItem(storageKey, defaultSection);
                }
    
                // Check if elements exist
                if (links.length === 0 || sections.length === 0) {
                    console.warn("Navigator Warning: Missing required elements. Clearing localStorage...");
                    localStorage.removeItem(storageKey); // Clear localStorage if elements don't exist
                    return;
                }
    
                const showSection = (sectionId) => {
                    sections.forEach(section => {
                        section.style.display = section.id.toLowerCase() === sectionId.toLowerCase() ? "flex" : "none";
                    });
                };
    
                // Show stored section or default on load
                const storedSection = localStorage.getItem(storageKey);
                showSection(storedSection);
    
                // Handle link clicks
                links.forEach(link => {
                    link.addEventListener("click", function (event) {
                        event.preventDefault(); // Stop any accidental form submission
    
                        const sectionId = link.getAttribute('data-target').toLowerCase(); // Get the target section ID
                        const targetSection = document.getElementById(sectionId); // Get the target section
    
                        if (targetSection) {
                            // Hide all sections and show the target section
                            sections.forEach(section => {
                                section.style.display = section.id.toLowerCase() === sectionId ? "flex" : "none";
                            });
    
                            // Store in localStorage
                            localStorage.setItem(storageKey, sectionId);
                        }
                    });
                });
    
                return this; // Enables chaining
            }
        };
    },
    setupModal: function setupModal(triggerId, overlayId, modalId, closeButtonId) {
        const trigger = document.getElementById(triggerId);
        const overlay = document.getElementById(overlayId);
        const modal = document.getElementById(modalId);
        const closeButton = document.getElementById(closeButtonId);
    
        trigger.addEventListener('click', openModal);
    
        closeButton.addEventListener('click', closeModal);
        overlay.addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal();
            }
        });
    
        function openModal() {
            overlay.classList.add('active');
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.transform = 'translateY(0) rotate(0deg)';
            }, 10);
        }
    
        function closeModal() {
            modal.style.opacity = '0';
            modal.style.transform = 'translateY(100%) rotate(5deg)';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.classList.remove('active');
                // Reset modal styles to ensure it can be reopened
                modal.style.opacity = '';
                modal.style.transform = '';
                overlay.style.opacity = '';
            }, 300); // Ensure this matches the transition duration in CSS
        }
    }
    
    
};

io.in(conStyle, root, 'config.json');

document.addEventListener('DOMContentLoaded', function () {
    io.form().navigator("signup", ".links", ".form", "formStore");
});