<!--
    // Uses my framework (UIGod) to handle the frontend and backend dynamically.
    // Uses google's material design icons for the frontend.
    // Weave.io 1.0.0 - Author: Timothy Christopher Awinia.
    // Uses my personal CSS template.
-->
        
        <?php
        
            // Enable error reporting for all kinds of errors
            ini_set('display_startup_errors', 1);
            ini_set('display_errors', 1); // Disable default error display
            error_reporting(E_ALL); // Report all errors
            $database = "weave.io";
            $server = "localhost";
            $username = "root";
            $password = "";
            // Create a connection
            // file deepcode ignore HardcodedCredential: <please specify a reason of ignoring this> it works fine
            $conn = new mysqli($server, $username, $password, $database);

            // Check the connection
            if ($conn->connect_error) {
                die("Connection failed: " . $conn->connect_error);
            }
            define('PROJECT',  __DIR__ . '/projects'); // Base directory for projects
            // Example directory path
            session_start();
            
           
            
            if (!isset($_SESSION['tab'])) {
                $_SESSION['tab'] = []; // Initialize empty tabs array if not set
            }

            function tabses($operation, $tabvalue, &$res = null) {
                // Validate operation
                if (!in_array($operation, ['add', 'remove'])) {
                    if ($res) {
                        errorm($res, 'bad', 'TB02: Invalid Operation', "Operation '$operation' is not supported.");
                    }
                    return;
                }

                switch ($operation) {
                    case 'add':
                        // Ensure the tab value is unique before adding
                        if (!in_array($tabvalue, $_SESSION['tab'])) {
                            $_SESSION['tab'][] = $tabvalue;
                        } else {
                            if ($res) {
                                errorm($res, 'info', 'TB03: Tab Exists', "Tab '$tabvalue' already exists in the session.");
                            }
                        }
                        break;

                    case 'remove':
                        // Search and remove the tab value
                        $key = array_search($tabvalue, $_SESSION['tab']);
                        if ($key !== false) {
                            unset($_SESSION['tab'][$key]);
                            // Re-index the array to prevent gaps in numeric keys
                            $_SESSION['tab'] = array_values($_SESSION['tab']);
                        } else {
                            if ($res) {
                                errorm($res, 'bad', 'TB01: Tab Not Found', "Tab '$tabvalue' not found. Please check the input.");
                            }
                        }
                        break;
                }
            }

            ini_set('display_errors', 0); // Disable default error display
            error_reporting(E_ALL); // Report all errors

            // Custom error handler function to catch errors and return them as JSON
            function customErrorHandler($errno, $errstr, $errfile, $errline) {
                // Prepare the error message in a structured format
                $errorMsg = [
                    'success' => 'bad',
                    'head' => 'PHP Error',
                    'message' => "Error: [$errno] $errstr in $errfile on line $errline"
                ];
                
                // Send the error message as a JSON response
                header('Content-Type: application/json');
                echo json_encode(['errormsg' => $errorMsg]);
                exit; // Terminate the script after handling the error
            }

            // Catch uncaught exceptions and fatal errors using this function
            set_error_handler('customErrorHandler');

            // Capture fatal errors (e.g., syntax errors, out of memory, etc.)
            register_shutdown_function(function () {
                $error = error_get_last();
                if ($error !== NULL) {
                    $errorMsg = [
                        'success' => 'bad',
                        'head' => 'Fatal Error',
                        'message' => "Fatal Error: {$error['message']} in {$error['file']} on line {$error['line']}"
                    ];

                    // Send the error as a JSON response
                    header('Content-Type: application/json');
                    echo json_encode(['errormsg' => $errorMsg]);
                    exit;
                }
            });


            $res = [
                'errormsg' => ['success' => '', 'head' => '', 'message' => '']
            ];
            function errorm(&$res, $state, $head, $message){
                $res['errormsg'] = [
                    'success' => $state,
                    'head' => $head,
                    'message' => $message
                ];

            }
            function appendToJsonFile(string $filePath, array $newData, bool $prettyPrint = true){
                try {
                    // Ensure the directory exists
                    $directory = dirname($filePath);
                    if (!is_dir($directory)) {
                        if (!mkdir($directory, 0755, true)) {
                            return "Failed to create directory: $directory";
                        }
                    }

                    // Check if the JSON file exists
                    if (file_exists($filePath)) {
                        $existingData = json_decode(file_get_contents($filePath), true);
                        if (!is_array($existingData)) {
                            $existingData = []; // Initialize as an empty array if content is invalid
                        }
                    } else {
                        $existingData = []; // Initialize as an empty array if file doesn't exist
                    }

                    // Append the new data to the array
                    $existingData[] = $newData;

                    // Encode the updated data back to JSON format
                    $jsonOptions = $prettyPrint ? JSON_PRETTY_PRINT : 0;
                    $jsonContent = json_encode($existingData, $jsonOptions);

                    // Save the JSON data to the file
                    file_put_contents($filePath, $jsonContent, LOCK_EX);

                    return true; // Successfully written to the file
                } catch (Exception $e) {
                    return "An error occurred: " . $e->getMessage(); // Return the error message
                }
            }
            // Function to create a folder
            function createFolder($projectName) {
                $projectName = strtolower(trim($projectName));
                $projectName = preg_replace('/[^a-z0-9\s]/', '', $projectName);
                $projectName = preg_replace('/\s+/', '-', $projectName);

                $folderPath = PROJECT . '/' . $projectName;
                $jsonPath = $folderPath . '/'.$projectName.'.json';
                global $res;

                // Check if the project folder already exists
                if (!is_dir($folderPath)) {
                    if (mkdir($folderPath, 0777, true)) {
                        errorm($res, 'info', 'PR11 : Folder Created', "Folder '$projectName' created successfully.");

                        // Define the JSON structure
                        $structure = [
                            [
                                "html" => new stdClass(),
                                "css" => new stdClass(),
                                "js" => new stdClass(),
                                "php" => new stdClass(),
                                "mysql" => new stdClass()
                            ]
                        ];

                        // Convert structure to JSON
                        $jsonData = json_encode($structure, JSON_PRETTY_PRINT);

                        // Write to structure.json
                        if (file_put_contents($jsonPath, $jsonData)) {
                            errorm($res, 'info', 'PR16 : JSON Created', "Structure JSON created successfully in '$projectName'.");
                        } else {
                            errorm($res, 'bad', 'PR17 : JSON Failed', "Failed to write structure.json in '$projectName'.");
                        }

                    } else {
                        errorm($res, 'bad', 'PR12 : Folder Failed', "Failed to create folder '$projectName'.");
                    }
                } else {
                    errorm($res, 'bad', 'PR13 : Folder Exists', "Folder '$projectName' already exists.");
                }
            }
            function deleteFolder($projectName) {
                $projectName = strtolower(trim($projectName));
                $projectName = preg_replace('/[^a-z0-9\s]/', '', $projectName);
                $projectName = preg_replace('/\s+/', '-', $projectName);

                $folderPath = PROJECT . '/' . $projectName;
                global $res;

                if (!is_dir($folderPath)) {
                    errorm($res, 'bad', 'PR21 : Folder Missing', "Project folder '$projectName' does not exist.");
                    return;
                }

                // Recursively delete files and subdirectories
                $it = new RecursiveDirectoryIterator($folderPath, RecursiveDirectoryIterator::SKIP_DOTS);
                $files = new RecursiveIteratorIterator($it, RecursiveIteratorIterator::CHILD_FIRST);

                foreach ($files as $file) {
                    if ($file->isDir()) {
                        rmdir($file->getRealPath());
                    } else {
                        unlink($file->getRealPath());
                    }
                }

                // Delete the main folder itself
                if (rmdir($folderPath)) {
                    errorm($res, 'info', 'PR22 : Folder Deleted', "Project folder '$projectName' and its contents have been deleted.");
                } else {
                    errorm($res, 'bad', 'PR23 : Deletion Failed', "Failed to delete folder '$projectName'. Check permissions.");
                }
            }


            function fetchDirectories($directory) {
                $result = [];
                $items = scandir($directory);
            
                foreach ($items as $item) {
                    if ($item === '.' || $item === '..') {
                        continue; // Skip current and parent directory links
                    }
            
                    $itemPath = $directory . '/' . $item;
            
                    if (is_dir($itemPath)) {
                        // Recursively fetch subdirectories and files
                        $result[] = [
                            'type' => 'folder',
                            'name' => $item,
                            'content' => fetchDirectories($itemPath)
                        ];
                    } else {
                        // Add files directly
                        $result[] = [
                            'type' => 'file',
                            'name' => $item
                        ];
                    }
                }
                return $result;
            }
            
            
        ?>

