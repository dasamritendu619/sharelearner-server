import {Router} from 'express';
import {
    searchPosts,
    searchUser,
    getSearchSuggestions
} from '../controllers/search.controller.js';
import {checkCurrentUser} from '../middlewares/auth.middleware.js';

const router=Router();

router.route('/posts').get(checkCurrentUser,searchPosts);
router.route('/users').get(checkCurrentUser,searchUser);
router.route('/suggestions').get(getSearchSuggestions);

export default router;