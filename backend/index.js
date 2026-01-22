const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://your-frontend.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// Routes
const employeeRoute = require("./Routes/employeeRoutes");
const userRoute = require("./Routes/userRoutes");
const feedbackRoute = require("./Routes/feedbackRoutes");
const departmentRoute = require("./Routes/departmentRoutes");
const taskRoute = require("./Routes/taskRoutes");
const taskAssignmentRoute = require("./Routes/taskAssignmentRoutes");
const teamRoute = require("./Routes/teamRoutes");
const performanceRoutes = require("./Routes/performanceRoutes");
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
app.use("/api/perfor", performanceRoutes);
app.use("/api", calendarRoutes);
app.use("/api", managerRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/project-team", projectTeamRoutes);

// Root
app.get("/", (req, res) => {
  res.send("✅ API is running!");
});

// Dynamic PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
