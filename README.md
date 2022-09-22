# SebMedia<br>
SebMedia is the social media platform designed with user privacy in mind. Social media companies today gather as much data as they can on their users. SebMedia does none of that. SebMedia only collects the essential data needed to run the service, and nothing more.<br>

Privacy-oriented social media platforms do not have to compromise on functionality. SebMedia has many different features that everyone will love, such as:

 1. Publishing posts with just text or text + image
 2. Following friends, family, and other users on SebMedia
 3. Edit posts - Never get embarrased by typos ever again
 4. History Viewer - A way to view the history of edits on a post. Want to see the original post before it was edited? Or maybe the timeline of edits? Or go to a specific edit, for example the 5th or 8th one? History Viewer is essentially a time machine for SebMedia posts.

SebMedia even has some features that you won't find on other social media platforms:

 1. Edit posts up to 20 times and with history viewer see when the posts were edited, and see each edit's individual changes.
 2. See what your posts are going to look like before you publish them with post preview.

SebMedia protects your privacy, and has a great set of features. It's the well-rounded social media platform for all!

**How to run on your own system**<br>
SebMedia was designed from the ground up to be able to be downloaded and used by anyone. Here is details on how to get the frontend, backend, and tests to run on your system.

**Get everything (frontend, backend, and Redis) running via Docker Compose**<br>

 1. Pull the code from GitHub
 2. On line 28 of docker-compose.yml, remove the #
 3. Replace ``MongoDB`` on line 28 with the uri for the MongoDB database you want to use
 5. In the root directory, create a .env file
 6. In line 1 of the .env file, write ``REDIS_STORE="store-directory-here"`` and replace store-directory-here with a folder path to be used for Redis cache store
 7. In line 2 of the .env file, write ``UPLOAD_DIR="upload-dir-here"`` and replace upload-dir-here with a folder path to be used to store images that users upload
 8. Start Docker
 9. Once Docker has started, in the code directory, run the command ``docker-compose up --build``
 10. Once the docker images have built and the containers start up, open your browser and go to ``http://localhost``

If everything was successful, a login page will show up.<br>
If anything other than that happens, it was not successful.<br>

***Get everything (frontend, backend, Redis) running without Docker***<br>
This tutorial assumes you already have Redis installed and have it running on your system. If you don't, follow this guide: https://redis.io/docs/getting-started/

 1. Pull the code from GitHub
 2. In the backend folder, run the command ``npm install``
 3. In the frontend folder, run the command ``npm install``
 4. Go into the backend folder and create a new folder called uploads (this is where the images that users upload will be stored)
 5. Still in the backend folder, create a .env file
 6. In the 1st line, write ``MONGODB_URI="uri-here"``. Replace ``uri-here`` with the uri to your MongoDB database
 7. In the 2nd line, write ``REDIS_URL="url-here"``. Replace ``url-here`` with the url to the Redis cache running on your system (if you are running Redis with default settings the url will be ``redis://127.0.0.1:6379``)
 8. In the backend folder, run the command ``npm start``
 9. In the frontend folder, also run the command ``npm start`` (may ask for administrator password as the react development server will run on port 80, and generally any port under 1024 needs administrator permissions. If you want to run this without your administrator password, go to package.json in the frontend folder and change the ``PORT=80`` part in ``scripts.start`` and change 80 to the port you want to use)
 10. Once both the backend and frontend have launched, open a browser and open ``http://localhost`` OR ``http://localhost:port-you-chose-here`` if you changed the port in step 7

If everything was successful, a login page will show up.<br>
If anything other than that happens, it was not successful.<br>

**Installation Instructions Authenticity**<br>
Both ***Get everything (frontend, backend, and Redis) running via Docker Compose*** and ***Get everything (frontend, backend, Redis) running without Docker***'s instructions were followed on macOS 11 (Big Sur) and macOS 13 (Ventura) and everything worked as intended.
