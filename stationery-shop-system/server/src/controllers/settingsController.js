const ShopSettings = require('../models/ShopSettings');

// Singleton pattern — there should only ever be ONE settings document.
// getSettings creates it with defaults on first call if it doesn't exist yet.

// @desc  Get shop settings
// @route GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    let settings = await ShopSettings.findOne({ shopId: req.user.shopId });
    if (!settings) {
      settings = await ShopSettings.create({ shopId: req.user.shopId });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc  Update shop settings (owner only)
// @route PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    let settings = await ShopSettings.findOne({ shopId: req.user.shopId });
    if (!settings) {
      settings = await ShopSettings.create({ ...req.body, shopId: req.user.shopId });
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
