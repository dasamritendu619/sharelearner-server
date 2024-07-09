import {ApiResponce} from "../utils/ApiResponse.js"

const errorHandler = (err, req, res, next) => {
    res.status(err.statusCode || 500)
    .json(new ApiResponce(err.statusCode || 500,null, err.message));
};

export default errorHandler;