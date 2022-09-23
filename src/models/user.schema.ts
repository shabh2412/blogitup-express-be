import { Schema, model } from "mongoose";
import { IUser } from "../utils/interface";

const userSchema = new Schema<IUser>({
	name: String,
	email: { type: String, unique: true },
	password: String,
	phone: String,
	role: { type: String, enum: ["admin", "user"], default: "user" },
	viaOauth: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now() },
});

export const UserModel = model<IUser>("user", userSchema);
