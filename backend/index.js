const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Import other route modules
const employeeRoute = require("./Routes/employeeRoutes");
const userRoute = require("./Routes/userRoutes");
const feedbackRoute = require("./Routes/feedbackRoutes");
const departmentRoute = require("./Routes/departmentRoutes");
const taskRoute = require("./Routes/taskRoutes");
const taskAssignmentRoute = require("./Routes/taskAssignmentRoutes");
const teamRoute = require("./Routes/teamRoutes");
const performanceRoutes = require('./Routes/performanceRoutes');
const calendarRoutes = require("./Routes/calendarRoutes");
const managerRoutes = require("./Routes/managerRoutes");
const attendanceRoutes = require("./Routes/attendanceRoutes");
const chatsRoutes = require("./Routes/chatsRoutes");
const projectRoutes = require("./Routes/projectRoutes");
const projectTeamRoutes = require("./Routes/projectTeamRoutes");

// Mount routes
app.use("/api", employeeRoute);
app.use("/api", userRoute);
app.use("/api", feedbackRoute);
app.use("/api", departmentRoute);
app.use("/api", taskRoute);
app.use("/api", taskAssignmentRoute);
app.use("/api", teamRoute);
app.use('/api/perfor', performanceRoutes);
app.use("/api", calendarRoutes);
app.use("/api", managerRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/chats", chatsRoutes);

// Mount project-specific routes under /api/projects
app.use("/api/projects", projectRoutes);
// Mount project-team routes under /api/project-team
app.use("/api/project-team", projectTeamRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ API is running! Use /api/{resource} to access data.");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});