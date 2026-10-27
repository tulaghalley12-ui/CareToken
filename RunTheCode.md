1. Configure MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/hospital_token_db
PORT=5000
JWT_SECRET=super_secret_hospital_jwt_key_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development

2. Seed Initial Admin & Demo Clinical Data
# Create Initial Administrator (admin@hospital.org / Admin@Secure2026)
cd server
npm run seed:admin

# Populate demo clinical departments, doctors, and schedules
npm run seed:demo

3. Run Automated Test
cd server
npm test

4. Start the Application
# Terminal 1 - Backend Server
cd server
npm run dev

# Terminal 2 - Frontend Client
cd client
npm run dev



Not Necessary if the code is working properly
# if error occurs regarding client folder was installed on a different operating system (windows) and then copied into linux codespace.
rm -rf node_modules package-lock.json
npm install
npm run dev