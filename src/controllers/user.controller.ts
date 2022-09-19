import { HydratedDocument } from "mongoose";
import { UserModel } from "../models";
import { IUser } from "../utils/interface";
import argon2 from "argon2";
import jwt, { DecodeOptions, JwtPayload } from "jsonwebtoken";
import {
	errorWhileFindingUserInDb,
	userFound,
	signupControllerFailure,
	signupControllerSuccess,
	userLoginSuccessData,
	tokenType,
	generalErrorType,
} from "../utils/types";
import axios from "axios";

export const generateRefreshToken = (
	refreshToken: string
): tokenType | generalErrorType => {
	try {
		let verify: JwtPayload | string = jwt.verify(refreshToken, "refreshToken");
		if (typeof verify !== "string") {
			delete verify.iat;
			delete verify.exp;
			const primaryToken = jwt.sign(verify, "primaryToken", {
				expiresIn: "1 hour",
			});
			console.log(refreshToken);
			console.log(verify, primaryToken);
			return {
				primaryToken,
				refreshToken,
			};
		} else {
			return { message: "kindly login again" };
		}
	} catch (err) {
		return { message: err };
	}
};

export const getUserDetails = async (
	primaryToken: string
): Promise<userFound | errorWhileFindingUserInDb> => {
	try {
		let data: JwtPayload | string = jwt.verify(primaryToken, "primaryToken");
		if (typeof data !== "string") {
			delete data.iat;
			delete data.exp;
			let userPresentInDB: HydratedDocument<IUser> | null =
				await UserModel.findOne({
					email: data.email,
				});
			if (userPresentInDB) {
				const { _id, name, phone, email, role } = userPresentInDB;
				const userData: userLoginSuccessData = {
					_id,
					name,
					phone,
					email,
					role,
				};
				const primaryToken = jwt.sign(data, "primaryToken", {
					expiresIn: "1 hour",
				});
				let token = { primaryToken };
				return { data: userData, tokens: token };
			} else {
				return {
					message: "user not found in db",
				};
			}
		} else {
			return {
				message: data,
			};
		}
	} catch (err) {
		return { message: err };
	}
};

export const doesUserExistInDb = async (email: string): Promise<boolean> => {
	const user: HydratedDocument<IUser> | null = await UserModel.findOne({
		email,
	});
	if (user) return true;
	return false;
};

export const githubLogin = async (code: string) => {
	try {
		let response = await axios.post(
			`https://github.com/login/oauth/access_token`,
			null,
			{
				params: {
					client_id: "c6c281322a00b7b88b67",
					client_secret: "8cdd77e7580c67a7799522e5dc1e6bed5207c6e9",
					code,
				},
				headers: {
					accept: "application/json",
				},
			}
		);
		let resp = response.data;
		let userData = await axios.get("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${resp.access_token}`,
				accept: "application/json",
			},
		});
		let userDataFromGH = userData.data;
		let userExists = await doesUserExistInDb(userDataFromGH.email);
		if (!userExists) {
			const { name, email, phone } = userDataFromGH;
			const newUser = new UserModel({
				name,
				email,
				phone,
				viaOauth: true,
			});
			console.log(newUser);
			await newUser.save();
		}
		console.log(userExists);
		let user: HydratedDocument<IUser> | null = await UserModel.findOne({
			email: userDataFromGH.email,
		});
		if (user) {
			const userDataFromDB = {
				_id: user._id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				role: user.role || "user",
				viaOauth: user.viaOauth,
			};
			let primaryToken = jwt.sign(userDataFromDB, "primaryToken", {
				expiresIn: "1 hour",
			});
			let refreshToken = jwt.sign(userDataFromDB, "refreshToken", {
				expiresIn: "7 days",
			});
			return {
				data: userDataFromDB,
				tokens: {
					primaryToken,
					refreshToken,
				},
			};
		}
	} catch (error) {
		return {
			message: error,
		};
	}
};

export const loginController = async (
	email: string,
	password: string
): Promise<userFound | errorWhileFindingUserInDb> => {
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
					expiresIn: "4 days",
				});
				let refreshToken = jwt.sign(userData, "refreshToken", {
					expiresIn: "14 days",
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

export const signupController = async (
	data: IUser
): Promise<signupControllerSuccess | signupControllerFailure> => {
	try {
		const passwordHash = await argon2.hash(data.password);
		data.password = passwordHash;
		let user: HydratedDocument<IUser> = new UserModel(data);
		await user.save();
		return { user };
	} catch (err) {
		return { message: err };
	}
};
