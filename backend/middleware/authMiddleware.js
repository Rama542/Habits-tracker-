export const authMiddleware = async (req, res, next) => {
    let userId = req.header("X-User-Id");

    // TEMPORARY FIX FOR PRESENTATION: Use default user ID if not logged in
    if (!userId) {
        console.log("⚠️ No user ID provided, using default demo user");
        userId = "675678901234567890123456"; // Default demo user ID
    }

    req.user = { id: userId };
    next();
};




















// export const authMiddleware = async (req, res, next) => {
//     const userId = req.header("X-User-Id");

//     if (!userId) {
//         return res.status(401).json({ message: "No user ID, authorization denied" });
//     }

//     req.user = { id: userId };
//     next();
// };
