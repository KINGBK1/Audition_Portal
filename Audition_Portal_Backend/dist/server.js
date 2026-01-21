"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("./passport/passport"));
const express_session_1 = __importDefault(require("express-session"));
const client_1 = require("@prisma/client"); // Added 'Prisma' for error handling
const register_1 = __importDefault(require("./routes/register"));
const auth_1 = __importDefault(require("./routes/auth"));
const quiz_1 = __importDefault(require("./routes/quiz"));
const picUpload_1 = __importDefault(require("./routes/picUpload"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const verifyJWT_1 = require("./middleware/verifyJWT");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const round2_1 = __importDefault(require("./routes/round2"));
const adminRoundOne_route_1 = __importDefault(require("./routes/adminRoundOne.route"));
const adminRoundTwo_route_1 = __importDefault(require("./routes/adminRoundTwo.route"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
console.log("Prisma DB URL:", process.env.DATABASE_URL);
const prisma = new client_1.PrismaClient();
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3001", "http://localhost:3000", "https://audition-portal-ke8e.vercel.app", "https://audition-portal-ke8e-i4q7qtepi-kingbk1s-projects.vercel.app" , "https://dev.auditions.nitdgplug.org"
    ],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true if using HTTPS
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log("Connected to the database");
    }
    catch (err) {
        console.error(err);
    }
}
app.get("/api/user", verifyJWT_1.verifyJWT, async (req, res) => {
    try {
        // Cast req.user to your PrismaUser model specifically
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
        });
        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(userData);
    }
    catch (error) {
        console.error("Failed to fetch user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/api/verify-admin", verifyJWT_1.verifyAdmin, (req, res) => {
    res.json({
        message: "Token is valid",
        user: req.user,
    });
});
// Added a basic response for the root path
app.get("/", (req, res) => {
    res.send("API is running.");
});
app.get("/api/verify-token", verifyJWT_1.verifyJWT, (req, res) => {
    // If the token is valid, the verifyJWT middleware will allow this function to run
    res.json({
        message: "Token is valid",
        user: req.user,
    });
});
app.put("/api/update-user-info", verifyJWT_1.verifyJWT, async (req, res) => {
    const { contact, gender, specialization } = req.body;
    try {
        // Get user ID from authenticated request
        if (req?.user) {
            // Use destructuring and type assertion for clarity
            const { id: userId } = req.user;
            // Update user in database using Prisma
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    contact,
                    gender,
                    specialization,
                },
            });
            const newToken = jsonwebtoken_1.default.sign({ user: updatedUser }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
            res.cookie("token", newToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });
            res.json(updatedUser);
        }
        else {
            res.status(401).json({ error: "User not authenticated" });
        }
    }
    catch (error) {
        console.error("Error updating user info:", error);
        // --- IMPROVED ERROR HANDLING ---
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            // P2025: Record to update was not found
            if (error.code === "P2025") {
                return res
                    .status(404)
                    .json({ error: "User not found or session invalid." });
            }
            // P2002: Unique constraint failure (e.g., trying to set contact to an already existing number)
            if (error.code === "P2002") {
                return res
                    .status(400)
                    .json({
                    error: "Validation failed: A user with this data already exists.",
                });
            }
            // General Prisma validation error (e.g., wrong type)
            return res
                .status(400)
                .json({ error: "Invalid data provided for update." });
        }
        // 500 for all other, unexpected errors
        res
            .status(500)
            .json({
            error: "Failed to update user info due to an internal server issue.",
        });
    }
});
app.get("/admin/profile", verifyJWT_1.verifyAdmin, (req, res) => {
    res.redirect(process.env.FRONTEND_HOME_URL + "/admin/profile");
});
app.use("/pic", picUpload_1.default);
app.use("/auth", auth_1.default);
app.use("/admin/login", register_1.default);
app.use("/api/quiz", quiz_1.default);
app.use("/api/round2", round2_1.default);
app.use("/api/admin/r1", adminRoundOne_route_1.default);
app.use("/api/admin/r2", adminRoundTwo_route_1.default);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    connectToDatabase();
    console.log("Server is running on port", PORT);
});
