import importlib.util
import subprocess
import sys

if importlib.util.find_spec("kagglehub") is None:
    print("> kagglehub not found, installing...")
    subprocess.check_call([
        sys.executable,
        "-m",
        "pip",
        "install",
        "kagglehub"
    ])

import kagglehub
import os
import shutil

def download_hotel_dataset():
    data_dir = "data"
    data_name = "Datafiniti_Hotel_Reviews_Jun19.csv"
    os.makedirs(data_dir, exist_ok=True)
    
    file_path = os.path.join(data_dir, data_name)
    
    if os.path.exists(file_path):
        print("> dataset already downloaded")
        return True
    
    print("> downloading dataset from Kaggle...")
    try:
        path = kagglehub.dataset_download("datafiniti/hotel-reviews")
        
        # Find and copy the target file
        copied = False
        for root, _, files in os.walk(path):
            for file in files:
                if file == data_name:
                    src = os.path.join(root, file)
                    shutil.copy2(src, file_path)
                    print(f"> file saved to: {file_path}")
                    copied = True
                    break
            if copied:
                break
        
        if not copied:
            print("> could not find Jun19 file in download")
            return False
        
        # Clean up cache
        try:
            cache_dir = os.path.dirname(os.path.dirname(path))
            if os.path.exists(cache_dir):
                shutil.rmtree(cache_dir)
                print("> Kaggle cache cleaned up.")
        except Exception as e:
            print(f"> error: could not delete cache folder: {e}")
        
        return True
        
    except Exception as e:
        print(f"> dataset download failed: {e}")
        return False

if __name__ == "__main__":
    download_hotel_dataset()