const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: true },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student',
    },

    // Profile fields (mainly used by faculty, all optional).
    department: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    officeLocation: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

// Never leak the password hash when a user is serialised to JSON.
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
