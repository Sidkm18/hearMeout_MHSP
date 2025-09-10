import os
from pathlib import Path
import logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s]: %(message)s:')

list_of_files = ["src/__init__.py",            # init folder makes our project modular and makes it a local package so we can import any function from this project

                 "src/helper.py",
                 "src/prompt.py",
                 ".env",
                 "setup.py",
                 "app.py",
                 "research/trials.ipynb"
                 ]



for filepath in list_of_files:
    filepath=Path(filepath) #converts path to respective operating systems lingo
    filedir,filename=os.path.split(filepath)

    if filedir!="":
        os.makedirs(filedir,exist_ok=True)
        logging.info(f"Creating directory; {filedir} for the file: {filename}")
    if(not os.path.exists(filepath)) or (os.path.getsize(filepath)==0):
        with open(filepath,"w") as f:
            pass
            logging.info(f"Creating empty file: {filepath}")
    else:
        logging.info(f"{filename} already exists")