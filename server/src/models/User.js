const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['owner', 'staff'], default: 'staff' },
    isActive: { type: Boolean, default: true },
    // Tenant identifier — every user belongs to exactly one shop.
    // For an owner, shopId === their own _id (set right after creation).
    // For staff, shopId === the owner's _id who created them.
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
