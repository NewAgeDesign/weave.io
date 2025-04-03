<?php 
session_start();

if (isset($_GET['action']) && $_GET['action'] === 'joint') { // Ensure 'joint' is set in the URL
    $join = $_GET['join'];
    $link = "http://localhost/multicore/dev.weave.io/scode/function?action=joint&join=$join";

    if (isset($_SESSION['email'])) { // Check if user is logged in
        header("Location: $link"); 
        exit(); // Ensure script stops after redirect
    }
}
?>


<!DOCTYPE html>
<html>
    <head>
        <title>Weave.io</title>
        <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto+Flex:opsz,wght@8..144,100;8..144,200;8..144,300;8..144,400;8..144,500;8..144,600;8..144,700;8..144,800;8..144,900;8..144,1000&display=swap">
        <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">
        <meta name="keywords" content="Web builder, Weave, Website, Build, Build your website, Create">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" type="text/css" href="scode/uigod.css">
        <link rel="stylesheet" type="text/css" href="scode/style.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <meta name="description" content="This is a web builder">
        <meta name="author" content="New Age Design TZ">
        <link rel="icon" href="scode/bolt.svg">
    </head>
    <body>
        <!-- GATEWAY SECTION (Signup, Login, Reset Password) -->
        <section class="gateway">
            <header>
                <span>
                    <img src="scode/bolt.svg" alt="scode/bolt.svg">
                    <b>WeaveIO</b>
                </span>
                <span></span>
            </header>
            <main class="register">
                <span class="text">
                    <h1>Web Dev Simplified</h1>
                    <p>Create stunning Web Apps, collaborate with clients and teams, manage Projects, and so much more.</p>
                    <small>Design | Create | Become</small>
                </span>
                <span class="forms">
                    <form id="signup" class="form" action="scode/function.php" method="POST">
                        <h2>Signup</h2>
                        <span class="input">
                            <input type="email" name="semail" id="semail">
                            <label for="semail">Email</label>
                        </span>
                        <span class="input-group">
                            <span class="input">
                                <input type="text" name="fname" id="fname">
                                <label for="fname">First Name</label>
                            </span>
                            <span class="input">
                                <input type="text" name="lname" id="lname">
                                <label for="lname">Last Name</label>
                            </span>
                        </span>
                        <span class="input-group">
                            <span class="input">
                                <input type="password" name="spsw" id="spsw">
                                <label for="spsw">Password</label>
                            </span>
                            <span class="input">
                                <input type="password" name="scpsw" id="scpsw">
                                <label for="scpsw">Confirm Password</label>
                            </span>
                        </span>
                        <div class="button">
                            <button type="submit" name="signup">Signup</button>
                            <button type="reset">Reset</button>
                            <span title="login" class="links" data-target="login">Login</span>
                        </div>
                    </form>
                    <form id="login" class="form" action="scode/function.php" method="POST">
                        <h2>Login</h2>
                        <span class="input">
                            <input type="email" name="lemail" id="lemail">
                            <label for="lemail">Email</label>
                        </span>
                        <span class="input">
                            <input type="password" name="lpsw" id="lpsw">
                            <label for="lpsw">Password</label>
                        </span>
                        <div class="button">
                            <button type="submit" name="login">Login</button>
                            <button type="reset">Reset</button>
                            <span title="signup" class="links" data-target="signup">Signup</span>
                            <span title="reset" class="links" data-target="reset">Forgot Password?</span>
                        </div>
                    </form>
                    <form id="reset" class="form" action="scode/function.php" method="POST">
                        <h2>Reset Password</h2>
                        <span class="input">
                            <input type="email" name="remail" id="remail">
                            <label for="remail">Email</label>
                        </span>
                        <span class="code">
                            <input type="text" name="code1" id="code1" aria-label="code">
                            <input type="text" name="code2" id="code2" aria-label="code">
                            <input type="text" name="code3" id="code3" aria-label="code">
                            <input type="text" name="code4" id="code4" aria-label="code">
                            <input type="text" name="code5" id="code5" aria-label="code">
                            <input type="text" name="code6" id="code6" aria-label="code">
                        </span>
                        <span class="input">
                            <input type="password" name="rpsw" id="rpsw">
                            <label for="rpsw">Reset Password</label>
                        </span>
                        <div class="button">
                            <button type="submit" name="signup">Signup</button>
                            <button type="reset">Reset</button>
                            <span title="login" class="links" data-target="login">Login</span>
                        </div>
                    </form>
                </span>
            </main>
        </section>
    
        <!-- APP SECTION (Dashboard) -->
        <section class="app">
            <header>
                <span class="home">
                    <img src="scode/bolt.svg" alt="scode/bolt.svg">
                    <b>WeaveIO</b>
                </span>
                <nav>
                </nav>
                <span class="members">
                    <span class="avatar" style="background-color:rgb(190, 46, 13);">AB</span>
                    <span class="avatar" style="background-color:rgb(19, 105, 180);">BC</span>
                    <span class="avatar" style="background-color:rgb(16, 131, 43);">CD</span>
                    <span class="avatar" style="background-color:rgb(167, 125, 2);">DE</span>
                    <span class="avatar more">+3</span>
                </span>

            </header>
            <span class="dash">

                <div id="projectOverlay" class="overlay">
                    <div id="modal" class="modal forms">
                        <span class="title">
                            <b>Create New Project</b>
                            <icon id="pcloseModalBtn" class="close-button">close</icon>
                        </span>
                        <form action="scode/function.php" method="POST">
                            <input type="hidden" name="tid" id="tid" name="">
                            <span class="input">
                                <input type="text" name="pname" id="pname">
                                <label for="pname">Project Name</label>
                            </span>
                            <span class="input">
                                <textarea name="pdesc" id="pdesc" data-limit="150"></textarea>
                                <label for="pdesc">Project Description</label>
                            </span>
                            <div class="button">
                                <button type="submit" name="createProject">Create Project</button>
                                <button type="reset">Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div id="teamOverlay" class="overlay">
                    <div id="modal" class="modal forms">
                        <span class="title">
                            <b>Add Team</b>
                            <icon id="closeModalBtn" class="close-button">close</icon>
                        </span>
                        <form action="scode/function.php" method="POST">
                            <span class="input">
                                <input type="text" name="teamname" id="teamname">
                                <label for="teamname">Team Name</label>
                            </span>
                            <span class="input">
                                <textarea name="teamdesc" id="teamdesc" data-limit="250"></textarea>
                                <label for="teamdesc">Team Description</label>
                            </span>

                            <div class="button">
                                <button type="submit" name="createTeam">Create Team</button>
                                <button type="reset">Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
                <span class="lpaneld">
                    <span class="top">
                        <span class="user">
                            <span class="avatar"></span>
                            <span class="right">
                                <b class="name"></b>
                                <span class="badge"></span>
                            </span>
                        </span>
                        <span class="teams">
                            <span class="title">
                                <b>Teams</b>
                                <icon class="add_team" id="add_team" title="Create Team">add</icon>
                            </span>

                            <span class="team">
                                <span class="item shine">
                                </span>
                            </span>
                        </span>
                    </span>

                    <icon id="logout">logout <p>Logout</p></icon>
                </span>
                <span class="projects">
                </span>
            </span>
            <span class="workspace">
                <span class="toolbar">
                    <!-- Basic Tools -->
                    <ul class="tool-group basic">
                        <li class="selected"></li>
                        <li class="opener"></li>
                        <ul class="options">
                            <li  id="select" title="select">
                                <svg width="16" height="16" id="Layer_1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1">
                                    <path d="m21.08 14.492-7.165-5.767c-.901-.771-2.131-.943-3.208-.446-1.078.496-1.748 1.542-1.748 2.729v9.493c0 .605.364 1.151.922 1.384.553.232 1.202.11 1.633-.318l2.087-2.066 1.727 3.359c.526 1.028 1.805 1.427 2.811.919 1.026-.487 1.468-1.829.935-2.833l-1.723-3.397 2.987-.401c.594-.08 1.084-.506 1.245-1.083.161-.578-.037-1.196-.504-1.572zm-9.081-3.459 4.479 3.606-2.083.28c-.323.043-.624.191-.855.421l-1.566 1.55.025-5.856zm-2.04-7.533v-2c0-.829.671-1.5 1.5-1.5s1.5.671 1.5 1.5v2c0 .829-.671 1.5-1.5 1.5s-1.5-.671-1.5-1.5zm-2.013 3.188c-.52.65-1.466.749-2.108.233l-1.561-1.25c-.647-.518-.751-1.462-.233-2.108s1.463-.751 2.108-.233l1.561 1.25c.647.518.751 1.462.233 2.108zm7.026 0c-.518-.646-.414-1.59.233-2.108l1.561-1.25c.647-.518 1.591-.412 2.108.233.518.646.414 1.59-.233 2.108l-1.561 1.25c-.276.222-.608.329-.937.329-.44 0-.875-.192-1.172-.562zm-7.99 3.266c.083.824-.517 1.56-1.341 1.644l-1.99.202c-.81.087-1.564-.514-1.644-1.341-.083-.824.517-1.56 1.341-1.644l1.99-.202c.821-.089 1.561.517 1.644 1.341z"/>
                                </svg>
                            </li>
                            <li id="zoom" title="zoom">
                                <svg  width="16" height="16" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                                    <path d="M22.552,20.372l-4.331-4.292c.957-1.472,1.468-3.389,1.511-5.734-.104-5.94-3.429-9.233-9.374-9.272C4.342,1.111,.996,4.516,.996,10.345c0,5.745,3.349,9.273,9.374,9.308,2.334-.014,4.249-.505,5.726-1.456l4.345,4.306c.556,.524,1.46,.609,2.121-.01,.605-.566,.579-1.538-.01-2.121Z"/>
                                </svg>
                            </li>
                        </ul>
                    </ul>
                    <!-- Containers -->
                    <ul class="tool-group container">
                        <li class="selected"></li>
                        <li class="opener"></li>
                        <ul class="options">
                            <li id="page" title="page">
                                <svg id="Layer_1" height="12" viewBox="0 0 24 24" width="12" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1">
                                    <path d="m17 12.5a1.5 1.5 0 0 1 -1.5 1.5h-7a1.5 1.5 0 0 1 0-3h7a1.5 1.5 0 0 1 1.5 1.5zm-4.5 3.5h-4a1.5 1.5 0 0 0 0 3h4a1.5 1.5 0 0 0 0-3zm9.5-7.843v10.343a5.506 5.506 0 0 1 -5.5 5.5h-9a5.506 5.506 0 0 1 -5.5-5.5v-13a5.506 5.506 0 0 1 5.5-5.5h6.343a5.462 5.462 0 0 1 3.889 1.611l2.657 2.657a5.464 5.464 0 0 1 1.611 3.889zm-3 10.343v-9.5h-4a2 2 0 0 1 -2-2v-4h-5.5a2.5 2.5 0 0 0 -2.5 2.5v13a2.5 2.5 0 0 0 2.5 2.5h9a2.5 2.5 0 0 0 2.5-2.5z"/>
                                </svg>
                            </li>
                            <li id="header" title="header">
                                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12">
                                    <path d="m22,3v18h2v3h-7v-3h2v-8H5v8h2v3H0v-3h2V3H0V0h7v3h-2v7h14V3h-2V0h7v3h-2Z"/>
                                </svg>
                            </li>
                            <li id="section" title="section">
                                <svg xmlns="http://www.w3.org/2000/svg" id="Bold" viewBox="0 0 24 24" width="12" height="12">
                                    <path d="M18.5,3H5.5A5.506,5.506,0,0,0,0,8.5v7A5.506,5.506,0,0,0,5.5,21h13A5.506,5.506,0,0,0,24,15.5v-7A5.506,5.506,0,0,0,18.5,3ZM21,15.5A2.5,2.5,0,0,1,18.5,18H5.5A2.5,2.5,0,0,1,3,15.5v-7A2.5,2.5,0,0,1,5.5,6h13A2.5,2.5,0,0,1,21,8.5Z"/>
                                </svg>
                            </li>
                            <li id="div" title="divider">
                                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" width="12" height="12" viewBox="0 0 24 24">
                                    <path d="m24,6v-3h-3V0h-3v3H6V0h-3v3H0v3h3v12H0v3h3v3h3v-3h12v3h3v-3h3v-3h-3V6h3Zm-6,12H6V6h12v12Z"/>
                                </svg>
                            </li>
                            <li id="span" title="span">
                                <svg xmlns="http://www.w3.org/2000/svg" id="Bold" viewBox="0 0 24 24" width="12" height="12">
                                    <path d="M22.5,15.5A1.5,1.5,0,0,0,21,17v1.5A2.5,2.5,0,0,1,18.5,21H17a1.5,1.5,0,0,0,0,3h1.5A5.506,5.506,0,0,0,24,18.5V17A1.5,1.5,0,0,0,22.5,15.5Z"/><path d="M7,0H5.5A5.506,5.506,0,0,0,0,5.5V7A1.5,1.5,0,0,0,3,7V5.5A2.5,2.5,0,0,1,5.5,3H7A1.5,1.5,0,0,0,7,0Z"/><path d="M7,21H5.5A2.5,2.5,0,0,1,3,18.5V17a1.5,1.5,0,0,0-3,0v1.5A5.506,5.506,0,0,0,5.5,24H7a1.5,1.5,0,0,0,0-3Z"/><path d="M18.5,0H17a1.5,1.5,0,0,0,0,3h1.5A2.5,2.5,0,0,1,21,5.5V7a1.5,1.5,0,0,0,3,0V5.5A5.506,5.506,0,0,0,18.5,0Z"/>
                                </svg>
                            </li>
                            <li id="footer" title="footer">
                                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12">
                                    <path d="M20.5,0H7.5C4.467,0,2,2.467,2,5.5V22.5c.033,1.972,2.967,1.971,3,0V14h11.5c1.972-.033,1.971-2.967,0-3H5V5.5c0-1.378,1.122-2.5,2.5-2.5h13c1.972-.033,1.971-2.967,0-3Z"/>
                                </svg>
                            </li>
                        </ul>
                    </ul>
                    <!-- Elements -->
                    <ul class="tool-group element">
                        <li class="selected"></li>
                        <li class="opener"></li>
                        <ul class="options">
                            <li id="text" title="text">
                                <svg id="Layer_1" height="12" viewBox="0 0 24 24" width="12" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1">
                                    <path d="m18.5 0h-13a5.506 5.506 0 0 0 -5.5 5.5v13a5.506 5.506 0 0 0 5.5 5.5h13a5.506 5.506 0 0 0 5.5-5.5v-13a5.506 5.506 0 0 0 -5.5-5.5zm2.5 18.5a2.5 2.5 0 0 1 -2.5 2.5h-13a2.5 2.5 0 0 1 -2.5-2.5v-13a2.5 2.5 0 0 1 2.5-2.5h13a2.5 2.5 0 0 1 2.5 2.5zm-2-10a1.5 1.5 0 0 1 -3 0 .5.5 0 0 0 -.5-.5h-2v8a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 1 0-3v-8h-2a.5.5 0 0 0 -.5.5 1.5 1.5 0 0 1 -3 0 3.5 3.5 0 0 1 3.5-3.5h7a3.5 3.5 0 0 1 3.5 3.5z"/>
                                </svg>
                            </li>
                            <li id="input" title="input">
                                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12">
                                    <path d="m8,8.5v7c0,.828-.671,1.5-1.5,1.5s-1.5-.672-1.5-1.5v-7c0-.828.671-1.5,1.5-1.5s1.5.672,1.5,1.5Zm16-1v9c0,3.032-2.467,5.5-5.5,5.5H5.5c-3.033,0-5.5-2.468-5.5-5.5V7.5C0,4.468,2.467,2,5.5,2h13c3.033,0,5.5,2.468,5.5,5.5Zm-3,0c0-1.379-1.122-2.5-2.5-2.5H5.5c-1.378,0-2.5,1.121-2.5,2.5v9c0,1.379,1.122,2.5,2.5,2.5h13c1.378,0,2.5-1.121,2.5-2.5V7.5Z"/>
                                </svg>
                            </li>
                            <li id="button" title="button">
                                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="12" height="12">
                                    <path d="m24,5v1c0,2.757-2.243,5-5,5h-4.5c-.828,0-1.5-.671-1.5-1.5s.672-1.5,1.5-1.5h4.5c1.103,0,2-.897,2-2v-1c0-1.103-.897-2-2-2H5c-1.103,0-2,.897-2,2v1c0,.989.736,1.84,1.713,1.979.819.117,1.39.877,1.272,1.697-.118.82-.885,1.386-1.698,1.272-2.444-.35-4.287-2.478-4.287-4.949v-1C0,2.243,2.243,0,5,0h14c2.757,0,5,2.243,5,5Zm-6.92,11.708l-6.08-1.824v-5.291c0-.704-.447-1.368-1.129-1.543-1.001-.256-1.884.492-1.884,1.449v10.269l-1.64-1.296c-.866-.722-2.153-.604-2.874.261-.722.866-.605,2.153.261,2.874l1.68,1.483c.663.585,1.516.908,2.4.908h.762c1.338,0,2.423-1.085,2.423-2.423v-3.561l5.219,1.566c1.065.319,1.781,1.281,1.781,2.394v.524c0,.829.672,1.5,1.5,1.5s1.5-.671,1.5-1.5v-.524c0-2.448-1.575-4.565-3.92-5.268Z"/>
                                </svg>
                            </li>
                        </ul>
                    </ul>
                     <!-- Vectors-->
                    <ul class="tool-group vector">
                        <li class="selected"></li>
                        <li class="opener"></li>
                        <ul class="options">
                            <li id="pen_tool" title="pen tool">
                                <svg id="Layer_1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" width="12" height="12">
                                    <path d="m22.712 7.652c-.387-.394-1.021-.398-1.414-.011-.87.856-1.756 1.69-2.644 2.508l-4.748-4.748c.834-.906 1.686-1.811 2.562-2.7.388-.394.383-1.026-.01-1.415-.393-.387-1.027-.382-1.414.01-1.135 1.152-2.241 2.329-3.302 3.503-4.357.299-4.693.629-4.94.875-6.165 6.167-5.744 15.275-5.731 15.359.157 1.005.937 1.786 1.936 1.942.123.02.354.034.675.034 2.378 0 9.697-.775 14.688-5.767.264-.264.743-.748 1.008-5.042 1.115-1.011 2.231-2.059 3.324-3.134.394-.387.398-1.021.011-1.414zm-18.202 13.307 4.158-4.158c.38.131.823.199 1.331.199 1.991 0 3-1.009 3-3s-1.009-3-3-3-3 1.009-3 3c0 .545.083 1.01.234 1.408l-4.141 4.141c.164-2.476.986-8.217 4.993-12.326.436-.109 1.851-.303 4.349-.462l4.894 4.894c.042 1.828-.324 4.177-.444 4.244-4.131 4.075-9.917 4.899-12.376 5.062zm4.49-6.959c0-.878.122-1 1-1s1 .122 1 1-.122 1-1 1-1-.122-1-1z"/>
                                </svg>
                            </li>
                        </ul>
                    </ul>
                </span>

                <span class="lpanel">
                    <span class="ptitle">
                        <b>Project Name</b>
                        <small>Team name <small class="badge">Badge</small></small>
                        <div class="adds">
                            <icon class="material-icons" title="Search pages">search</icon>
                            <icon class="material-icons" title="Add folder" id="addFolder">folder</icon>
                        </div>
                    </span>
                    <span class="dir">
                        <!-- Root level items -->
                        <div class="folder">
                            <div class="folder-item">
                                <span class="expand-arrow">
                                    <icon class="material-icons">chevron_right</icon>
                                </span>
                                <icon class="material-icons">folder</icon>
                                <span class="name">Folder 1</span>
                                <div class="actions">
                                    <icon class="material-icons visibility" title="Toggle visibility">visibility</icon>
                                    <icon class="material-icons" title="Delete">delete</icon>
                                </div>
                            </div>
                            <div class="folder-content">
                                <!-- Nested items -->
                            </div>
                        </div>
                        <div class="page">
                            <div class="page-item">
                                <span class="expand-arrow">
                                    <icon class="material-icons">chevron_right</icon>
                                </span>
                                <icon class="material-icons">description</icon>
                                <span class="name">Page 1</span>
                                <div class="actions">
                                    <icon class="material-icons visibility" title="Toggle visibility">visibility</icon>
                                    <icon class="material-icons" title="Delete">delete</icon>
                                </div>
                            </div>
                            <div class="page-content">
                                <!-- Page components -->
                            </div>
                        </div>
                        <div class="component">
                            <div class="component-item">
                                <span class="expand-arrow">
                                    <icon class="material-icons">chevron_right</icon>
                                </span>
                                <icon class="material-icons">code</icon>
                                <span class="name">Component 1</span>
                                <div class="actions">
                                    <icon class="material-icons visibility" title="Toggle visibility">visibility</icon>
                                    <icon class="material-icons" title="Delete">delete</icon>
                                </div>
                            </div>
                            <div class="component-content">
                                <!-- Nested components -->
                            </div>
                        </div>
                        <div class="folder">
                            <div class="folder-item">
                                <span class="expand-arrow">
                                    <icon class="material-icons">chevron_right</icon>
                                </span>
                                <icon class="material-icons">folder</icon>
                                <span class="name">Folder 2</span>
                                <div class="actions">
                                    <icon class="material-icons visibility" title="Toggle visibility">visibility</icon>
                                    <icon class="material-icons" title="Delete">delete</icon>
                                </div>
                            </div>
                            <div class="folder-content">
                                <!-- Nested items -->
                            </div>
                        </div>
                        <div class="page">
                            <div class="page-item">
                                <span class="expand-arrow">
                                    <icon class="material-icons">chevron_right</icon>
                                </span>
                                <icon class="material-icons">description</icon>
                                <span class="name">Page 2</span>
                                <div class="actions">
                                    <icon class="material-icons visibility" title="Toggle visibility">visibility</icon>
                                    <icon class="material-icons" title="Delete">delete</icon>
                                </div>
                            </div>
                            <div class="page-content">
                                <!-- Page components -->
                            </div>
                        </div>
                        <div class="component">
                            <div class="component-item">
                                <span class="expand-arrow">
                                    <icon class="material-icons">chevron_right</icon>
                                </span>
                                <icon class="material-icons">code</icon>
                                <span class="name">Component 2</span>
                                <div class="actions">
                                    <icon class="material-icons visibility" title="Toggle visibility">visibility</icon>
                                    <icon class="material-icons" title="Delete">delete</icon>
                                </div>
                            </div>
                            <div class="component-content">
                                <!-- Nested components -->
                            </div>
                        </div>
                        <div class="folder">
                            <div class="folder-item">
                                <span class="expand-arrow">
                                    <icon class="material-icons">chevron_right</icon>
                                </span>
                                <icon class="material-icons">folder</icon>
                                <span class="name">Folder 3</span>
                                <div class="actions">
                                    <icon class="material-icons visibility" title="Toggle visibility">visibility</icon>
                                    <icon class="material-icons" title="Delete">delete</icon>
                                </div>
                            </div>
                            <div class="folder-content">
                                <!-- Nested items -->
                            </div>
                        </div>
                        <div class="page">
                            <div class="page-item">
                                <span class="expand-arrow">
                                    <icon class="material-icons">chevron_right</icon>
                                </span>
                                <icon class="material-icons">description</icon>
                                <span class="name">Page 3</span>
                                <div class="actions">
                                    <icon class="material-icons visibility" title="Toggle visibility">visibility</icon>
                                    <icon class="material-icons" title="Delete">delete</icon>
                                </div>
                            </div>
                            <div class="page-content">
                                <!-- Page components -->
                            </div>
                        </div>
                        <div class="component">
                            <div class="component-item">
                                <span class="expand-arrow">
                                    <icon class="material-icons">chevron_right</icon>
                                </span>
                                <icon class="material-icons">code</icon>
                                <span class="name">Component 3</span>
                                <div class="actions">
                                    <icon class="material-icons visibility" title="Toggle visibility">visibility</icon>
                                    <icon class="material-icons" title="Delete">delete</icon>
                                </div>
                            </div>
                            <div class="component-content">
                                <!-- Nested components -->
                            </div>
                        </div>
                    </span>

                    <icon id="logout">logout <p>Logout</p></icon>
                </span>
                <span class="viewport">
                    <div class="canvas-wrapper" id="canvas"></div>
                </span>
                <span class="rpanel">
                    <div class="rpanel-header">
                        <b>Properties</b>
                        <button class="close-rpanel"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="rpanel-content">
                        <div class="box-model">
                            <small>Position & Scale</small>
                            <div class="position">
                                <span class="top-sp"><p>Top</p> <input type="number" min="0" max="1000" step="1" value="0"></span>
                                <span class="right-sp"><p>Right</p> <input type="number" min="0" max="1000" step="1" value="0"></span>
                                <span class="bottom-sp"><p>Bottom</p> <input type="number" min="0" max="1000" step="1" value="0"></span>
                                <span class="left-sp"><p>Left</p> <input type="number" min="0" max="1000" step="1" value="0"></span>
                            </div>
                            <div class="margin">
                                <span class="top"><input type="number" step="1" value="0"></span>
                                <span class="right"><input type="number" step="1" value="0"></span>
                                <span class="bottom"><input type="number" step="1" value="0"></span>
                                <span class="left"><input type="number" step="1" value="0"></span>
                                <div class="border">
                                    <span class="top"><input type="number" step="1" value="0"></span>
                                    <span class="right"><input type="number" step="1" value="0"></span>
                                    <span class="bottom"><input type="number" step="1" value="0"></span>
                                    <span class="left"><input type="number" step="1" value="0"></span>
                                    <div class="padding">
                                        <span class="top"><input type="number" step="1" value="0"></span>
                                        <span class="right"><input type="number" step="1" value="0"></span>
                                        <span class="bottom"><input type="number" step="1" value="0"></span>
                                        <span class="left"><input type="number" step="1" value="0"></span>
                                        <div class="content">
                                            <input type="number" step="1" value="0" style="width: 42px;"> x <input type="number" step="1" value="0" style="width: 42px;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="align">
                                <ul class="vertical">
                                    <li><icon id="align-top">align_vertical_top</icon></li>
                                    <li><icon id="align-middle">align_vertical_center</icon></li>
                                    <li><icon id="align-bottom">align_vertical_bottom</icon></li>
                                    <li><icon id="align-right">vertical_distribute</icon></li>
                                </ul>
                                <ul class="horizontal">
                                    <li><icon id="align-left">align_horizontal_left</icon></li>
                                    <li><icon id="align-center">align_horizontal_center</icon></li>
                                    <li><icon id="align-right">align_horizontal_right</icon></li>
                                    <li><icon id="align-right">horizontal_distribute</icon></li>
                                </ul>
                                <!--ul class="text-vertical-align">
                                    <li><icon>vertical_align_top</icon></li>
                                    <li><icon>vertical_align_center</icon></li>
                                    <li><icon>vertical_align_bottom</icon></li>
                                </ul>
                                <ul class="text-align">
                                    <li><icon>format_align_left</icon></li>
                                    <li><icon>format_align_center</icon></li>
                                    <li><icon>format_align_right</icon></li>
                                    <li><icon>format_align_justify</icon></li>
                                </ul-->
                            </div>
                        </div>
                    </div>
                </span>
            </span>
        </section>
    </body>
    <script type="module" src="scode/script.js"></script>
    <script src="scode/uigod.js"></script>
</html>