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
            function createFolder($folderName) {
                $folderPath = PROJECT . '/' . $folderName; // Full path for the main folder
                global $res;
            
                // Check if the folder already exists
                if (!is_dir($folderPath)) {
                    // Attempt to create the main folder
                    if (mkdir($folderPath, 0777, true)) {
                        errorm($res, 'info', 'PR11 : Folder Created', "Folder '$folderName' created successfully at '$folderPath'.");
            
                        // Create the subfolders
                        $subfolders = ['media', 'styles', 'scripts'];
                        foreach ($subfolders as $subfolder) {
                            $subfolderPath = $folderPath . '/' . $subfolder;
                            if (!mkdir($subfolderPath, 0777, true)) {
                                errorm($res, 'bad', 'PR14 : Subfolder Failed', "Failed to create subfolder '$subfolder' in '$folderName'. Please check permissions.");
                            } else {
                                errorm($res, 'info', 'PR15 : Subfolder Created', "Subfolder '$subfolder' created successfully in '$folderName'.");
                            }
                        }
                    } else {
                        errorm($res, 'bad', 'PR12 : Folder Failed', "Failed to create folder '$folderName'. Please check permissions.");
                    }
                } else {
                    errorm($res, 'bad', 'PR13 : Folder Exists', "Folder '$folderName' already exists.");
                }
            }
            function deleteProject($projName) {
                $folderPath = rtrim(PROJECT, '/') . '/' . ltrim($projName, '/');
                $folderPath = str_replace('\\', '/', $folderPath); // Normalize slashes
            
                // Check if the path exists
                if (!file_exists($folderPath)) {
                    throw new Exception("Path '$folderPath' does not exist.");
                }
            
                // Check if it's a file
                if (is_file($folderPath)) {
                    if (!unlink($folderPath)) {
                        throw new Exception("Failed to delete file '$folderPath'. Check permissions.");
                    }
                    echo "File '$projName' deleted successfully.";
                    return;
                }
            
                // Check if it's a directory
                if (is_dir($folderPath)) {
                    $files = array_diff(scandir($folderPath), ['.', '..']);
            
                    // Check if the folder has subdirectories or files
                    if (!empty($files)) {
                        foreach ($files as $file) {
                            $filePath = "$folderPath/$file";
                            if (is_dir($filePath)) {
                                // Recursive call for subdirectories
                                deleteProject($filePath);
                            } else {
                                if (!unlink($filePath)) {
                                    throw new Exception("Failed to delete file '$filePath'. Check permissions.");
                                }
                            }
                        }
                    }
            
                    // Delete the main folder after clearing contents
                    if (!rmdir($folderPath)) {
                        throw new Exception("Failed to delete folder '$folderPath'. Check permissions.");
                    }
                    echo "Folder '$projName' and its contents deleted successfully.";
                } else {
                    throw new Exception("Path '$folderPath' is neither a file nor a directory.");
                }
            }
            function deleteFolder($folderPath) {
                if (!is_dir($folderPath)) {
                    throw new Exception("Folder '$folderPath' does not exist.");
                }
            
                $files = array_diff(scandir($folderPath), ['.', '..']);
                foreach ($files as $file) {
                    $filePath = "$folderPath/$file";
                    if (is_dir($filePath)) {
                        deleteFolder($filePath); // Recursive call for subdirectories
                    } else {
                        if (!unlink($filePath)) {
                            throw new Exception("Failed to delete file '$filePath'. Check permissions.");
                        }
                    }
                }
            
                if (!rmdir($folderPath)) {
                    throw new Exception("Failed to delete folder '$folderPath'. Check permissions.");
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

