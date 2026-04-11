import isAdmin from "../helper/isAdmin.js";
import postAgentModel from "../entities/postAgent.model.js";

class PostAgentController {
    async postAgent(req, res) {
        try {
            // const userId = req.user.id;
            // await isAdmin(userId);

            // Pass req.body or required data to model, not res
            const result = await postAgentModel.postAgent(res);
        } catch (error) {
            console.error("Error in post agent controller:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default new PostAgentController();