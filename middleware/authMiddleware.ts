import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to verify the Google ID token
export const verifyGoogleToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return
    }

    try {
        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        });

        const payload = ticket.getPayload(); // Get user info from the token
        
        // Can extend Request type from express
        //@ts-ignore
        req.user = payload; // Attach user info to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
        return;
    }
};