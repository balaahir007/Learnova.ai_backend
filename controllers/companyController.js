import Company from "../models/company.js";
import User from "../models/userSchema.js";

export const createOrUpdateCompany = async (req, res) => {
  try {
    const { name, logo, location, description } = req.body;
    const userId = req.user?.id; 

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let company;
    if (user.companyId) {
      company = await Company.findByPk(user.companyId);
      if (company) {
        await company.update({ name, logo, location, description });
      }
    } else {
      company = await Company.create({ name, logo, location, description });
      await user.update({ companyId: company.id });
    }

    res.status(200).json({ message: "Company saved successfully", company });
  } catch (error) {
    console.error("Company save error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getCompanyDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findByPk(userId, { include: Company });
    if (!user || !user.Company)
      return res.status(404).json({ message: "Company not found" });

    res.status(200).json(user.Company);
  } catch (error) {
    console.error("Get company error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
