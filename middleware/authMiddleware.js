export const authMiddleware = async (req, res, next) => {
    const userId = req.header("X-User-Id");

    if (!userId) {
        return res.status(401).json({ message: "No user ID, authorization denied" });
    }

    req.user = { id: userId };
    next();
};
