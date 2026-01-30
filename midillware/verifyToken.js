import jwt from "jsonwebtoken"
export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token Not Provided" })
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Invalid Token" })
        }

        const decoded = jwt.verify(token, "THIS IS SECRET STRING")
        req.user = decoded;
        next()
    } catch (error) {
        res.status(401).json({ message: "Unauthorize User" })
    }
}