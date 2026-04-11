import College from "../models/College.js";

// Create a new college
export const createCollege = async (req, res) => {
  try {
    const { name, location, type, year, departments } = req.body;
    console.log(name, location, type, year, departments)
    // Simple validation
    if (!name || !location || !type || !year || !departments) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCollege = await College.create({
      name,
      location,
      type,
      year,
      departments
    });

    res.status(201).json({ success: true, college: newCollege });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all colleges
export const getColleges = async (req, res) => {
  try {
    const colleges = await College.findAll();
    res.status(200).json({ success: true, colleges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get a single college
export const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await College.findByPk(id);

    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    res.status(200).json({ success: true, college });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update college
export const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, type, year, departments } = req.body;

    const college = await College.findByPk(id);
    if (!college) return res.status(404).json({ success: false, message: "College not found" });

    await college.update({ name, location, type, year, departments });

    res.status(200).json({ success: true, college });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete college
export const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await College.findByPk(id);
    if (!college) return res.status(404).json({ success: false, message: "College not found" });

    await college.destroy();
    res.status(200).json({ success: true, message: "College deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
