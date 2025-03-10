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
            $stmt = $conn->prepare("INSERT INTO project (name, description) VALUES (?, ?)");
            $stmt->bind_param('ss', $projName, $projDesc);
        
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
            $projName = basename(trim($data['name']));
            tabses('add', $projName, $res);
        break;

        case $data['action'] === 'removeTab':
            $projName = basename(trim($data['name']));
            tabses('remove', $projName, $res);
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
                // Fetch teams from the database
                $query = "SELECT * FROM team";
                $result = $conn->query($query);

                $teams = []; // Array to store team data

                if ($result) {
                    if ($result->num_rows > 0) {
                        // Fetch each team row and build the response
                        while ($row = $result->fetch_assoc()) {
                            $teams[] = [
                                'id' => $row['teamid'],
                                'name' => $row['name'],
                                'descr' => $row['descr'],
                                'owemail' => $row['owemail']
                            ];
                        }
                    }
                } else {
                    errorm($res, 'bad', 'Error', 'Database query failed: ' . $conn->error);
                }

                $res['teams'] = $teams;
                break;


        case 'projects':
            // Query to fetch project details
            $query = "SELECT name, description FROM project";
            $result = $conn->query($query);

            $projects = []; // Array to store project data

            if ($result) {
                if ($result->num_rows > 0 && $_GET['action']==='projects') {
                    // Fetch each project row and build the response
                    while ($row = $result->fetch_assoc()) {
                        $res[]['projects'] = [
                            'name' => $row['name'],
                            'descr' => $row['description'],
                            'initials' => $_SESSION['fname'][0] . $_SESSION['lname'][0]
                        ];
                    }
                }
            } else {
                errorm($res, 'bad', 'Error', 'Database query failed: ' . $conn->error);
            }
            break;

            case 'tabs':
                if (!isset($_SESSION['tab'])) {
                    $_SESSION['tab'] = []; // Initialize empty tabs array if not set
                }
            
                $tabs = []; // Prepare an array to store tab data
                foreach ($_SESSION['tab'] as $tabName) {
                    $tabs[] = [
                        'tabs' => [
                            'name' => $tabName
                        ]
                    ];
                }
            
                // Merge tabs into the response
                $res = array_merge($res, $tabs);
            
                // Return JSON response
                header('Content-Type: application/json');
                echo json_encode($res);
            exit; // Ensure no additional output

        case 'directories':
            $projectName = $_GET['name'] ?? null;

            if ($projectName) {
                $projectPath = PROJECT . '/' . $projectName;
        
                if (is_dir($projectPath)) {
                    $directories = fetchDirectories($projectPath);
                    header('Content-Type: application/json');
                    echo json_encode(['directories' => $directories]);
                } else {
                    // Project not found
                    errorm($res, 'bad', 'DIR01: Project Not Found (404)', "The project '$projectName' does not exist.");
                }
            } else {
                // Project name not specified
                errorm($res, 'bad', 'DIR02: Missing Project Name (400)', 'No project name was specified in the request.');
            }
            exit;
            
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