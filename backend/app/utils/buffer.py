import time
import os

def is_file_accessible(file_path, timeout=30, interval=1):
    """
    Wait until a file is fully available for reading.
    Safer version with timeout and better checks.
    """

    start_time = time.time()

    while True:
        # timeout protection
        if time.time() - start_time > timeout:
            raise TimeoutError(f"File not ready after {timeout}s: {file_path}")

        try:
            # check file exists first
            if not os.path.exists(file_path):
                time.sleep(interval)
                continue

            # try opening in read mode (safer than append)
            with open(file_path, 'rb') as f:
                f.read(1)

            # if no exception → file is accessible
            return True

        except (PermissionError, OSError):
            time.sleep(interval)