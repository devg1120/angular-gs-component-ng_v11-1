import os

#for curDir, dirs, files in os.walk("."):
#    print(curDir)
#    print(dirs)
#    print(files)

for curDir, dirs, files in os.walk("."):
    for file in files:
        if file.endswith(".d.ts"):
            new_file = file.replace('.d.ts', '.ts')
            #print(file)
            #print(new_file)
            oldpath = os.path.join(curDir, file)
            newpath = os.path.join(curDir, new_file)
            os.rename(oldpath, newpath)
