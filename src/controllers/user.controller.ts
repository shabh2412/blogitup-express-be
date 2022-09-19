import { HydratedDocument } from "mongoose";
import { UserModel } from "../models";
import { IUser } from "../utils/interface";
import argon2 from "argon2";
import jwt, { DecodeOptions } from "jsonwebtoken";
import { loginControllerFailure, loginControllerSuccess } from "../utils/types";

export const loginController = async (
	email: string,
	password: string
): Promise<loginControllerSuccess | loginControllerFailure> => {
	let user: HydratedDocument<IUser> | null = await UserModel.findOne({
		email,
	});
	if (user) {
		try {
			const matched = await argon2.verify(user.password, password);
			const userData = {
				_id: user._id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				role: user.role || "user",
			};
			if (matched) {
				let primaryToken = jwt.sign(userData, "primaryToken", {
					expiresIn: "1 hour",
				});
				let refreshToken = jwt.sign(userData, "refreshToken", {
					expiresIn: "7 days",
				});
				return {
					data: userData,
					tokens: {
						primaryToken,
						refreshToken,
					},
				};
			} else {
				return { message: "invalid credentials" };
			}
		} catch (err) {
			return { message: err };
		}
	} else {
		return { message: "user does not exist." };
	}
};
