import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Admin fields
    username: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },

    // Role: "admin" | "service"
    role: { type: String, enum: ["admin", "service"], default: "admin" },

    // Service user fields
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    company: { type: String, trim: true },
    matricula: { type: String, trim: true },
    province: { type: String, trim: true },
    phone: { type: String, trim: true },

    // Service approval status (replaces simple approved boolean)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },

    // Legacy field (kept for backwards compatibility)
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
