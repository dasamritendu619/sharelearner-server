import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";

const healthCheck = asyncHandler(async (req, res) => {
    // return response
    return res
        .status(200)
        .json(new ApiResponce(200, "Ok", "Server is up and running"));
});

export { healthCheck };