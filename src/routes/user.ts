import express, { Request, Response, NextFunction } from "express";
import User from "../models/User";

const router = express.Router();
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check if user profile exists
        const user = await User.findOne({'email': req.body.email}).exec();
        if (!user) {
            // Create user
            const userData = {
                name: req.body.name,
                email: req.body.email,
                authProdivers: 'Google'
            }
            const user = new User(userData)
            await user.save()
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send("error creating user")
    }
    res.status(200).send("success")
})
export default router;