import { NextFunction, Response, Request } from "express";
import admin from 'firebase-admin';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const idToken = req.headers.authorization?.split(' ')[1]; // Extract the token from the "Authorization" header

  if (!idToken) {
    res.status(401).send('Unauthorized: No token provided');
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Proceed with your logic (e.g., access the user data)
    //@ts-ignore
    req.user = decodedToken
    next()
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).send('Unauthorized: Invalid token');
    return;
  }
};

export default authMiddleware;