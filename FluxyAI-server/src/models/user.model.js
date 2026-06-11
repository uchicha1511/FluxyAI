import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// TTL for 5 minutes. User data should be deleted if not verified in 5 minutes of the registeration.
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
    
  this.password = await bcrypt.hash(this.password, 10);
 
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);