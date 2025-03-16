<?php

$start_time = microtime(true);
$start_memory = memory_get_usage();
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Array to store AJAX Values
ob_start(); // Start output buffering
include "header.php";
ob_end_clean(); // Clear the buffer without sending output

// Login System
if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $data = json_decode(file_get_contents('php://input'), true);
    $jsonFile = 'projectname.json';

    switch(true){
        // Signup
        case $data['action'] === 'signup':
            $email = $data['semail'];
            $fname = ucfirst(strtolower($data['fname'])); // Capitalize the first letter and make the rest lowercase
            $lname = ucfirst(strtolower($data['lname'])); // Capitalize the first letter and make the rest lowercase
            $cpsw = $data['scpsw'];
            $psw = $data['spsw'];
            $plan = $conn->real_escape_string('AB Tester');
            $color =$conn->real_escape_string('#D85509');

            // Initialize an array to hold the names of empty fields
            $emptyFields = [];
            $invalidName = [];
            $pswConditions = [];

            //Empty Fields
            if (empty($email)) $emptyFields[] = 'Email';
            if (empty($fname)) $emptyFields[] = 'First Name';
            if (empty($lname)) $emptyFields[] = 'Last Name';
            if (empty($psw)) $emptyFields[] = 'Password';
            if (empty($cpsw)) $emptyFields[] = 'Confirm Password';

            //Invalid Name
            if (!preg_match('/^[A-Za-z]+$/', $fname)) $invalidName[] = 'First Name';
            if (!preg_match('/^[A-Za-z]+$/', $lname)) $invalidName[] = 'Last Name';

            //Incorrect Password
            if (strlen($psw) < 8 || strlen($psw) > 20) $pswconditions[] = '8-20 characters';
            if (!preg_match('/[A-Z]/', $psw)) $pswconditions[] = 'at least one capital letter';
            if (!preg_match('/[a-z]/', $psw)) $pswconditions[] = 'at least one small letter';
            if (!preg_match('/[0-9]/', $psw)) $pswconditions[] = 'at least one number';
            if (!preg_match('/[^A-Za-z0-9]/', $psw)) $pswconditions[] = 'no special characters';
            
            switch(true){
                case !empty($emptyFields):
                    if (count($emptyFields) > 1) {
                        // Separate the last item with an & and join the rest with commas
                        $lastField = array_pop($emptyFields);
                        $fieldsList = implode(', ', $emptyFields) . ' & ' . $lastField;
                    } else {
                        $fieldsList = $emptyFields[0]; // Only one field is missing
                    }
                    errorm($res, 'bad', 'SE01: Missing Information', 'The following fields are required: ' . $fieldsList);
                break;

                case !empty($invalidName):
                    if (count($invalidName) > 1) {
                        // Separate the last item with an & and join the rest with commas
                        $lastField = array_pop($invalidName);
                        $fieldsList = implode(', ', $invalidName) . ' & ' . $lastField;
                    } else {
                        $fieldsList = $invalidName[0]; // Only one field is missing
                    }
                    errorm($res, 'bad', 'SE01: '.$fieldsList.' Invalid', 'The following fields are required: <br />' . $fieldsList . '<br /><br /> Must be filled using Uppercase and lowercase letters only.');
                break;

                case !filter_var($email, FILTER_VALIDATE_EMAIL):
                    errorm($res, 'bad', 'SE02: Email Invalid', 'The email you\'ve entered is invalid, please check and try again.');
                break;

                case strlen($psw) < 8 || strlen($psw) > 20 || !preg_match('/[A-Za-z]/', $psw) || !preg_match('/[0-9]/', $psw) || !preg_match('/[^A-Za-z0-9]/', $psw):
                    // Create an ordered list for the password conditions
                    $pswconditionsList = '';
                    foreach ($pswconditions as $condition) {
                        $pswconditionsList .= '<li>' . htmlspecialchars($condition) . '</li>';
                    }
                
                    errorm($res, 'bad', 'SE04: Password Invalid', 'The password you\'ve entered is invalid, please make sure it contains: <ol>' . $pswconditionsList . '</ol>');
                break;
                case $psw !== $cpsw:
                    errorm($res, 'bad', 'SE05: Passwords Don\'t Match', 'The passwords you\'ve entered do not match, please check and try again.');
                break;
                default:
                    // Prevent SQL Injection using prepared statements
                    $email = $conn->real_escape_string($email);
                    $fname = $conn->real_escape_string($fname);
                    $lname = $conn->real_escape_string($lname);
                    $psw = $conn->real_escape_string($psw);

                    // Check if the email is already in use
                    $sql = "SELECT * FROM users WHERE email = '$email'";
                    $result = $conn->query($sql);

                    if($result->num_rows > 0){
                        errorm($res, 'bad', 'SE06: Email Already Exists', 'The email you\'ve entered is already in use, please try another one.');
                    }else{
                        $salt = bin2hex(random_bytes(16)); // Generate a random salt
                        $pepper = '0625661901newagedesigntz'; // A secret pepper (if used)
                        $combined = $salt.$psw.$pepper; // Combine password with salt and pepper before hashing

                        // Combine password with salt and pepper before hashing
                        $hashedPassword = password_hash($combined, PASSWORD_BCRYPT);

                         // INSERT Query (still not ideal)
                        $sql = "INSERT INTO users (email, fname, lname, color, plan, psw, salt) 
                        VALUES ('$email', '$fname', '$lname', '$color', '$plan', '$hashedPassword', '$salt')";

                        // Insert user into database
                        if ($conn->query($sql) === TRUE) {
                            // Get user data again using SELECT
                            $stmt = $conn->prepare("SELECT email, fname, lname, color, plan FROM users WHERE email = ?");
                            $stmt->bind_param("s", $email);
                            $stmt->execute();
                            $result = $stmt->get_result();
                            
                            if ($row = $result->fetch_assoc()) {
                                errorm($res, 'good', 'Signup Success', 'You\'ve successfully signed up, please wait.');
                                $_SESSION['email'] = $row['email'];
                                $_SESSION['fname'] = $row['fname'];
                                $_SESSION['lname'] = $row['lname'];
                                $_SESSION['color'] = $row['color'];
                                $_SESSION['plan'] = $row['plan'];
                            }
                        }

                    }
                break;
            
            }
        break;
        

        // Login
        case $data['action'] === 'login':
            $email = $data['lemail'] ?? '';
            $psw = $data['lpsw'] ?? '';
        
            // Initialize an array to hold the names of empty fields
            $emptyFields = [];
        
            // Check each field and push the field name to the array if it is empty
            if (empty($email)) $emptyFields[] = 'Email';
            if (empty($psw)) $emptyFields[] = 'Password';
        
            switch (true) {
                case !empty($emptyFields):
                    if (count($emptyFields) > 1) {
                        $lastField = array_pop($emptyFields);
                        $fieldsList = implode(', ', $emptyFields) . ' & ' . $lastField;
                    } else {
                        $fieldsList = $emptyFields[0];
                    }
                    errorm($res, 'bad', 'LE01: Missing Information', 'The following fields are required: ' . $fieldsList);
                    break;
        
                case !filter_var($email, FILTER_VALIDATE_EMAIL):
                    errorm($res, 'bad', 'LE02: Email Invalid', 'The email you\'ve entered is invalid, please check and try again.');
                    break;
        
                default:
                    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
                    $stmt->bind_param("s", $email);
                    $stmt->execute();
                    $result = $stmt->get_result();
        
                    if ($result->num_rows === 0) {
                        errorm($res, 'bad', 'LE03: Email Not Found', 'The email you\'ve entered does not exist, please check and try again.');
                    } else {
                        $row = $result->fetch_assoc();
                        $salt = $row['salt'];
                        $pepper = '0625661901newagedesigntz';
                        $combined = $salt.$psw.$pepper;
        
                        if (password_verify($combined, $row['psw'])) {
                            errorm($res, 'good', 'Login Success', 'You\'ve successfully logged in.');
                            $_SESSION['email'] = $row['email'];
                            $_SESSION['fname'] = $row['fname'];
                            $_SESSION['lname'] = $row['lname'];
                            $_SESSION['color'] = $row['color'];
                            $_SESSION['plan'] = $row['plan'];

                            // Regenerate the session ID for security
                        } else {
                            errorm($res, 'bad', 'LE04: Incorrect Password', 'The password you\'ve entered is incorrect.');
                        }
                    }
                break;
            }
        break;

        // Logout
        case $data['action'] === 'logout':
            session_unset();
            session_destroy();
            errorm($res, 'good', 'Logout Success', 'You\'ve successfully logged out.');
        break;
        // Create project
        case $data['action'] === 'createProject':
            $teamId = trim($data['tid']);
            $projName = trim($data['pname']);
            $projDesc = trim($data['pdesc']);
        
            if (empty($projName)) {
                errorm($res, 'bad', "PR01 : Project Name Empty", "The Project name is important, please enter the project name and try again.");
                break;
            }
        
            // Check if the project name already exists
            $stmt = $conn->prepare("SELECT id FROM project WHERE name = ? LIMIT 1");
            $stmt->bind_param('s', $projName);
            $stmt->execute();
            $result = $stmt->get_result();
        
            if ($result->num_rows > 0) {
                errorm($res, 'bad', "PR03 : Duplicate Project Name", "A project named '$projName' already exists. Please choose a different name.");
                $stmt->close();
                break;
            }
        
            $stmt->close(); // Close the statement after the existence check
        
            // Insert project into the database
            $stmt = $conn->prepare("INSERT INTO project (name, description, teamid) VALUES (?, ?, ?)");
            $stmt->bind_param('ssi', $projName, $projDesc, $teamId);
        
            if ($stmt->execute()) {
                // Create folder after successful DB insert
                createFolder($projName);
                errorm($res, 'info', "PR02 : Project Created", "Project '$projName' has been created successfully.");
                tabses('add', $projName, $res);
                
            } else {
                errorm($res, 'bad', "PR02 : Project Creation Failed", "Failed to create project in the database. Error: " . $stmt->error);
            }
        
            $stmt->close();
        break;

        // Delete Project
        case $data['action'] === 'deleteProject':
            $projName = basename(trim($data['name'])); // Sanitize project name

            if (empty($projName)) {
                errorm($res, 'bad', "PR04 : Project Name Empty", "The Project name is required to delete a project. Please provide the name and try again.");
                break;
            }

            $folderPath = rtrim(PROJECT, '/') . '/' . ltrim($projName, '/');
            $folderPath = str_replace('\\', '/', $folderPath); // Normalize slashes

            // Attempt to delete the folder first
            try {
                if (is_dir($folderPath)) {
                    deleteFolder($folderPath); // Pass the full path to deleteFolder
                    errorm($res, 'info', "PR05 : Folder Deleted", "Project folder '$projName' has been deleted successfully.");

                    // Proceed to delete the project from the database
                    $stmt = $conn->prepare("DELETE FROM project WHERE name = ?");
                    $stmt->bind_param('s', $projName);
                    tabses('remove', $projName, $res);

                    if ($stmt->execute()) {
                        if ($stmt->affected_rows > 0) {
                            errorm($res, 'info', "PR06 : Project Deleted", "Project '$projName' has been deleted from the database successfully.");
                        } else {
                            errorm($res, 'bad', "PR07 : Project Not Found", "No project named '$projName' was found in the database.");
                        }
                    } else {
                        errorm($res, 'bad', "PR08 : Project Deletion Failed", "Failed to delete project from the database. Error: " . $stmt->error);
                    }

                    $stmt->close();
                } else {
                    errorm($res, 'bad', "PR09 : Folder Not Found", "Folder '$folderPath' does not exist. The database entry was not deleted.");
                }
            } catch (Exception $e) {
                errorm($res, 'bad', "PR10 : Folder Deletion Failed", "Error while deleting folder '$folderPath': " . $e->getMessage());
            }
        break;
        // Create Team
        case $data['action'] === 'createTeam':
            $teamName = $data['teamname'];
            $teamDesc = $data['teamdesc'];
            $owner = $_SESSION['email'];

            // Ensure session is set
            if (empty($owner)) {
                errorm($res, 'bad', 'CT05: Session Error', 'User session not found. Please log in again.');
                break;
            }

            // Check if the team name is empty
            if (empty($teamName)) {
                errorm($res, 'bad', 'CT01: Team Name Empty', 'The team name is required, please enter a name and try again.');
                break;
            }

            // Prevent SQL injection
            $teamName = $conn->real_escape_string($teamName);

            // Check if the team already exists
            $stmt = $conn->prepare("SELECT teamid FROM team WHERE name = ? LIMIT 1");
            $stmt->bind_param('s', $teamName);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                errorm($res, 'bad', 'CT02: Duplicate Team Name', "A team named '$teamName' already exists. Please choose a different name.");
                $stmt->close();
                break;
            }
            $stmt->close(); // Close after checking

            // Insert new team into database
            $stmt = $conn->prepare("INSERT INTO team (`name`, `descr`, `owemail`) VALUES (?, ?, ?)");
            $stmt->bind_param('sss', $teamName, $teamDesc, $owner);

            if ($stmt->execute()) {
                errorm($res, 'info', 'CT03: Team Created', "Team '$teamName' has been created successfully.");
            } else {
                errorm($res, 'bad', 'CT04: Team Creation Failed', 'Failed to create team in the database. Error: ' . $stmt->error);
            }

            $stmt->close(); // ✅ Ensure statement is closed
        break;

        case $data['action'] === 'addTab':
            $id = trim($data['id']);
            $email = $_SESSION['email'];
        
            // Use prepared statements to prevent SQL injection
            $stmt = $conn->prepare("SELECT * FROM user_tabs WHERE projectid = ? AND email = ?");
            $stmt->bind_param("is", $id, $email);
            $stmt->execute();
            $result = $stmt->get_result();
        
            if ($result->num_rows > 0) { 
                errorm($res, 'info', 'CT01: The Tab already exists', 'You\'ve already opened this tab, please access it in the top navbar');
                echo json_encode($res);
                exit();
            }
        
            // Insert tab if it doesn't exist
            $stmt = $conn->prepare("INSERT INTO user_tabs (email, projectid) VALUES (?, ?)");
            $stmt->bind_param("si", $email, $id);
            
            if ($stmt->execute()) {
                errorm($res, 'info', 'CT02: Tab created successfully', 'Please select the specified tab to gain access to your project');
                echo json_encode($res);
                exit();
            } else {
                errorm($res, 'bad', 'DB01: Failed to insert tab', 'Failed to insert tab in the database. Error: ' . $stmt->error);
            }
        
            errorm($res, 'info', 'It works', $id . ' ' . $email);

        break;
        
        case $data['action'] === 'closetab':
            $id = trim($data['id']);
            $email = $_SESSION['email'];
        
            // Use prepared statements to prevent SQL injection
            $stmt = $conn->prepare("SELECT * FROM user_tabs WHERE projectid = ? AND email = ?");
            $stmt->bind_param("is", $id, $email);
            $stmt->execute();
            $result = $stmt->get_result();
        
            if ($result->num_rows > 0) { 
                // Use prepared statements to delete the tab
                $stmt = $conn->prepare("DELETE FROM user_tabs WHERE projectid = ? AND email = ?");
                $stmt->bind_param("is", $id, $email);
                $stmt->execute();
        
                if ($stmt->affected_rows > 0) { // ✅ Check if the deletion was successful
                    errorm($res, 'info', 'CE01: Tab removed successfully', 'The tab was successfully removed.');
                } else {
                    errorm($res, 'bad', 'CE02: Tab removal failed', 'No tab was deleted.');
                }
            } else {
                errorm($res, 'bad', 'CE03: Tab not found', 'The tab does not exist or does not belong to you.');
            }
        
        break;
        
    }
}
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    switch ($_GET['action']) {
        case 'session':
            $res['session'] = isset($_SESSION['email'], $_SESSION['fname'], $_SESSION['lname'], $_SESSION['plan'], $_SESSION['color']) 
            ? ['email' => $_SESSION['email'], 'fname' => $_SESSION['fname'], 'lname' => $_SESSION['lname'], 'plan' => $_SESSION['plan'], 'color' => $_SESSION['color']] 
            : null;
        break;

        case 'teams':
            $email = $_SESSION['email']; // Get the logged-in user's email

            // Fetch teams where the user is the owner OR a member
            $query = "SELECT DISTINCT t.teamid, t.name, t.descr, t.owemail 
                    FROM team t
                    LEFT JOIN tmembers m ON t.teamid = m.teamid
                    WHERE t.owemail = ? OR m.uemail = ?";

            $stmt = $conn->prepare($query);
            $stmt->bind_param("ss", $email, $email);
            $stmt->execute();
            $result = $stmt->get_result();

            $teams = [];
            while ($row = $result->fetch_assoc()) {
                $teams[] = [
                    'id' => $row['teamid'],
                    'name' => $row['name'],
                    'descr' => $row['descr'],
                    'owemail' => $row['owemail']
                ];
            }


            $res['teams'] = $teams;
        break;

        case 'delete-team': 
            $id = intval($_GET['id']); // Ensure the ID is an integer

            // Start a transaction to ensure both deletions are completed successfully
            $conn->begin_transaction();

            try {
                // Check if the team exists
                $query = "SELECT teamid FROM team WHERE teamid = ?";
                $stmt = $conn->prepare($query);
                $stmt->bind_param('i', $id);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows === 0) {
                    errorm($res, 'bad', 'DEL00: Team Missing', 'No team found.');
                    exit;
                }

                // Delete projects associated with the team
                $deleteProjectsQuery = $conn->prepare("DELETE FROM project WHERE teamid = ?");
                $deleteProjectsQuery->bind_param('i', $id);
                $deleteProjectsQuery->execute();

                // Delete the team
                $deleteTeamQuery = $conn->prepare("DELETE FROM team WHERE teamid = ?");
                $deleteTeamQuery->bind_param('i', $id);
                $deleteTeamQuery->execute();

                // Commit the transaction
                $conn->commit();

                errorm($res, 'info', 'DEL01: Team Deleted', 'Team and associated projects deleted successfully.');
            } catch (Exception $e) {
                // Rollback the transaction in case of an error
                $conn->rollback();
                errorm($res, 'bad', 'DEL02: Delete Error', 'Failed to delete team and projects: ' . $e->getMessage());
            }

            // Close the statements
            $stmt->close();
            $deleteProjectsQuery->close();
            $deleteTeamQuery->close();


        break;
        case 'projects':
            // Query to fetch project details
            $tid = intval($_GET['id']);
            $query = "SELECT * FROM project WHERE teamid = $tid";
            $result = $conn->query($query);

            $projects = []; // Array to store project data
            if ($result) {
                if ($result->num_rows > 0) {
                    // Fetch each team row and build the response
                    while ($row = $result->fetch_assoc()) {
                        $projects[] = [
                            'id' => $row['id'],
                            'name' => $row['name'],
                            'descr' => $row['description']
                        ];
                    }
                }
            } else {
                errorm($res, 'bad', 'Error', 'Database query failed: ' . $conn->error);
            }
            $res['projects'] = $projects;
        break;


        case 'delete-project':
            $projectId = intval($_GET['id']);

            // Check if the project exists
            $query = "SELECT id FROM project WHERE id = $projectId";
            $result = $conn->query($query);

            if ($result->num_rows === 0) {
                errorm($res, 'bad', 'DEL00 : Project Missing', 'No project found.');
                exit;
            }

            // Delete the project
            $deleteQuery = $conn->prepare("DELETE FROM project WHERE id = ?");
            if ($deleteQuery->execute([$projectId])) {
                errorm($res, 'info', 'DEL01 : Project Deleted', 'Project deleted successfully.');
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete project."]);
                errorm($res, 'red', 'DEL02 : Delete Error', 'Failed to delete project.');
            }
        break;

        case 'share-link':
            $tid = intval($_GET['id']);
            $query = "SELECT * FROM team WHERE teamId = $tid";
            $result = $conn->query($query);
        
            $link = null; // Initialize the variable
        
            if ($result) {
                if ($result->num_rows > 0) {
                    $row = $result->fetch_assoc(); // Get first row only
                    $link = "http://localhost/multicore/dev.weave.io/index?action=joint&join=" . $row['invite_link'];
                }
            } else {
                errorm($res, 'bad', 'Error', 'Database query failed: ' . $conn->error);
            }
        
            $res['link'] = $link;
        break;
        case 'fetch_tabs':
            if (!isset($_SESSION['email'])) {
                $res['error'] = "User not authenticated.";
                break;
            }
        
            $email = $_SESSION['email'];
        
            // Use prepared statements to prevent SQL injection
            $query = $conn->prepare("
                SELECT user_tabs.projectid, project.name 
                FROM user_tabs 
                INNER JOIN project ON user_tabs.projectid = project.id 
                WHERE user_tabs.email = ?
            ");
        
            $query->bind_param('s', $email);
            $query->execute();
            $result = $query->get_result();
        
            $tabs = [];
            while ($row = $result->fetch_assoc()) {
                $tabs[] = [
                    'id' => $row['projectid'],
                    'name' => $row['name']
                ];
            }
        
            $res['tabs'] = $tabs;
        break;
            
        default:
            errorm($res, 'bad', 'Error', "Unsupported action: {$_GET['action']}");
        break;
    }
    
}

else{
    errorm($res, 'bad', 'CE01: Unauthorized Access', 'You don\'t have access to view this page, please Go back, thankyou: ');
}
$end_time = microtime(true);

// Calculate execution time
$execution_time = $end_time - $start_time;

$end_memory = memory_get_usage();
$peak_memory = memory_get_peak_usage();
// Display the current response error message along with the status

// errorm($res,$res['errormsg']['success'],$res['errormsg']['head'],$res['errormsg']['message'].'<br><br>Execution time: ' . round($execution_time, 3) . ' seconds<br>Memory used: ' . round(($end_memory - $start_memory) / 1024 / 1024, 3) . ' MBs<br>Peak memory usage: ' . round($peak_memory / 1024 / 1024, 3) . ' MBs');

echo json_encode($res);