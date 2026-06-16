from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from app.utils.buffer import is_file_accessible
import time
import requests
import os

# 1. Store last processed times (for modified/updated content of files)
last_processed_times = {}
DEBOUNCE_SECONDS = 3

# 2. Create Event Handler class. 
# This inherits from watchdog's base class.
class DocumentHandler(FileSystemEventHandler):
    
    #3 . Ensure the file is done being updated/written before sending index request
    def process_file(self, file_path):
        file_path = os.path.abspath(file_path)
        current_time = time.time()
        
        if file_path in last_processed_times:
            time_since_last = current_time - last_processed_times[file_path]
            if time_since_last < DEBOUNCE_SECONDS:
                return
        last_processed_times[file_path] = current_time
        
        if is_file_accessible(file_path=file_path):
            try:
                response = requests.post(
                    "http://127.0.0.1:8000/index",
                    params={"file_path": file_path}
                )
                print("API response",response.json())
            except requests.exceptions.ConnectionError:
                print("Connection Error")
            finally:
                # This ensures any queued events check against THIS exact moment.
                last_processed_times[file_path] = time.time()
    
    # A built-in watchdog function that triggers automatically
    def on_created(self, event):
        # skip if folder
        if event.is_directory:
            return
        
        # [YOUR LOGIC HERE: Just print a message to the terminal saying "New file detected: <path>"]
        print(f"New file at path: {event.src_path}")
        self.process_file(event.src_path)
            
    def on_modified(self, event):
        # skip if folder
        if event.is_directory:
            return 
        self.process_file(event.src_path)

def start_watching(folder_to_watch: str):
    """Starts the background observer."""
    
    # 4. Initialize the custom handler and the watchdog Observer
    event_handler = DocumentHandler()
    observer = Observer()
    
    # 5. Tell the observer what folder to look at, and tell it to look inside sub-folders
    observer.schedule(event_handler, path=folder_to_watch, recursive=True)
    
    # 6. Start the engine
    observer.start()
    print(f"Watcher started! Scanning folder: {folder_to_watch}")
    
    try:
        # Keep the script running (checking every 1 second)
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("Watcher stopped.")
        
    observer.join()

# For testing: If you run this file directly, start watching a test folder
if __name__ == "__main__":
    # Create a temporary folder path here to test with
    test_folder = "./dev_data/test_docs"
    start_watching(test_folder)