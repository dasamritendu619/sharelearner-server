import leoProfanity from 'leo-profanity';
import { ApiError } from '../utils/ApiError.js';
import {asyncHandler} from '../utils/asyncHandeler.js';
leoProfanity.loadDictionary();

const moderateContent = asyncHandler(async(req, res, next) => {
    try {
        const { content } = req.body;
        console.log(content)
        // Check if content exists
        if (!content) {
            throw new ApiError(400,"Content cannot be empty.");
        }

        // Check for profanity
        if (leoProfanity.check(content)) {
            throw new ApiError(400,"Inappropriate content detected.");
        }

        // If content is clean, proceed to the next middleware or route handler
        return next();
    } catch (error) {
        next(error);
    }
    
});

export { moderateContent }
