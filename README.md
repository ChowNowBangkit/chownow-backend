# ChowNow Backend
Backend service for a food ordering and recommendation application.
## Description
This is a JavaScript code built using Node.js, so make sure you have Node.js installed on your system. This service uses MySQL as the database, so you also need to run MySQL on your system.
## Getting Started
1. Clone the Repository

Clone this repository and open it using your preferred code editor.
```
git clone https://github.com/ChowNowBangkit/chownow-backend.git
```

2. Machine Learning Model

Supposedly you have trained the model (from the Machine-Learning repository), download the model file with the .json file format (or you can download it manually [here](https://drive.google.com/drive/folders/1YbaybolX5l3W-se95kdcl9t2x1iirn52?usp=sharing) and name it "model (8).json" (to match with the scripts), then download the .bin file and name it "group1-shard1of1.bin" (to match with the scripts).

3. GCS Bucket

The model.json and group1-shard1of1.bin is supposed to be stored in Google Cloud Storage, so you have to make your own GCS Bucket, make a folder named "model-in-prod" inside the bucket, then upload the model.json and group1-shard1of1.bin to that folder, then copy the public link of the model.json and store it in .env file

4. Environment Configuration

In the root directory of this project, create a new file named .env to provide the necessary configurations. Provide these details in the .env file:
```
# PORT of the server, e.g., 3000
PORT=""

# Public Model URL from GCS Bucket
MODEL_URL=""

# Your database username, e.g., root
DB_USER=""

# Your database password
DB_PASSWORD=""

# Your database hostname, e.g., localhost/Database IP Address
DB_HOSTN=""

# Your database name, e.g., chownow-db
DB_NAME=""

# Access token secret, no need to change
ACCESS_TOKEN_SECRET="youraccesstokensecret"

# Refresh token secret, no need to change
REFRESH_TOKEN_SECRET="yourrefreshtokensecret"

# Your Midtrans server key
MIDTRANS_SERVER_KEY=""

# Your Midtrans client key
MIDTRANS_CLIENT_KEY=""

# Your GCS bucket name
GCS_BUCKET=""

# project_id from your sa-credentials.json file
GCLOUD_PROJECT=""

# client_email from your sa-credentials.json file
GCLOUD_CLIENT_EMAIL=""

# private_key from your sa-credentials.json file
GCLOUD_PRIVATE_KEY=""

# Whitelisted IP addresses for CORS, e.g., http://localhost;http://localhost:3000 (use semicolon to separate)
WHITELISTED=""
```
5. Install Dependencies

Open the terminal in the project's root directory, then run the following command to install the dependencies:
```
npm install
```

6. Running the Application
   
Run the app using the command:

`node ./src/server/server.js` or `npm run start`

7. API Documentation

You can check the public API documentation that we used for the mobile app here.


