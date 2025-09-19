const Lead = require("../models/Lead");
const { processCSVFile, validateCSVStructure, cleanupTempFile } = require("../utils/csvProcessor");


const uploadLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No CSV file uploaded" });
    }

    const filePath = req.file.path;

    await validateCSVStructure(filePath);
    const leads = await processCSVFile(filePath);

    await Lead.deleteMany({});
    const savedLeads = await Lead.insertMany(leads);

    cleanupTempFile(filePath);

    res.status(200).json({
      success: true,
      message: `Uploaded ${savedLeads.length} leads`,
      data: { count: savedLeads.length, leads: savedLeads }
    });
  } catch (error) {
    if (req.file) cleanupTempFile(req.file.path);
    res.status(400).json({ success: false, message: error.message });
  }
};



module.exports = { uploadLeads};
