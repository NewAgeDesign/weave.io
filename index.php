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
        <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css'>
        <link rel="icon" href="scode/bolt.svg" type="image/svg+xml">
        <meta name="author" content="New Age Design TZ">
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
                <span>
                    <img src="scode/bolt.svg" alt="scode/bolt.svg">
                    <b>WeaveIO</b>
                </span>
                <span></span>
                <span class="members">
                    <span class="avatar" style="background-color:rgb(190, 46, 13);">AB</span>
                    <span class="avatar" style="background-color:rgb(19, 105, 180);">BC</span>
                    <span class="avatar" style="background-color:rgb(16, 131, 43);">CD</span>
                    <span class="avatar" style="background-color:rgb(167, 125, 2);">DE</span>
                    <span class="avatar more">+3</span>
                </span>

            </header>
            <main class="dash">
                <span class="lpanel">
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
                                <div id="projectOverlay" class="overlay">
                                    <div id="modal" class="modal forms">
                                        <span class="title">
                                            <b>Create New Project</b>
                                            <icon id="pcloseModalBtn" class="close-button">close</icon>
                                        </span>
                                        <form action="scode/function.php" method="POST">
                                            <span class="input">
                                                <input type="text" name="pname" id="pname">
                                                <label for="pname">Project Name</label>
                                            </span>
                                            <span class="input">
                                                <textarea name="pdesc" id="pdesc" data-limit="50"></textarea>
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

                            <span class="team">
                                <span class="item shine">
                                </span>
                            </span>

                        </span>
                    </span>

                    <icon id="logout">logout <p>Logout</p></icon>
                </span>
                <span class="projects">
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
                </span>
            </main>
        </section>
    </body>
    <script type="module" src="scode/script.js"></script>
    <script src="scode/uigod.js"></script>
</html>