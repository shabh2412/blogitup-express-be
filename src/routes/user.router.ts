import express from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { access } from "../permissions/acesses";

import { UserModel } from "../schemas/";
import axios from "axios";
import {
	IUser,
	IUserLogin,
	oAuthGHVerificationInterface,
} from "../utils/interface";
import { HydratedDocument } from "mongoose";
const userRoute = express.Router();
userRoute.use(express.json());

// // get all users
// userRoute.get("/", async (req, res) => {
// 	try {
// 		let data = await UserModel.find();
// 		res.send(data);
// 	} catch (err) {
// 		res.send(err.message);
// 	}
// });

// login
// check if the email and password hash matches or not.
userRoute.post<any, any, any, IUserLogin>("/login", async (req, res) => {
	let { email, password } = req.body;
	if (email && password) {
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
					res.status(200).send({
						data: userData,
						tokens: {
							primaryToken,
							refreshToken,
						},
					});
				} else {
					res.status(401).send({ message: "invalid credentials" });
				}
			} catch (err) {
				res.send(err);
			}
		} else {
			res.status(404).send("user does not exist.");
		}
	} else {
		res.send("incomplete data");
	}
});

const doesUserExistInDb = async (email: string) => {
	const user = await UserModel.findOne({ email });
	if (user) return true;
	return false;
};

// OAUTH
userRoute.post("/login/github", async (req, res) => {
	const { code, state } = req.query;
	// console.log(code, state);
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
			return res.status(200).send({
				data: userDataFromDB,
				tokens: {
					primaryToken,
					refreshToken,
				},
			});
		}
	} catch (error) {
		res.status(401).send({
			error,
		});
	}
});

// signup
userRoute.post<any, any, any, IUser>("/post", async (req, res) => {
	let data = req.body;
	if (data.name && data.email && data.password && data.phone) {
		try {
			const passwordHash = await argon2.hash(data.password);
			data.password = passwordHash;
			let user: HydratedDocument<IUser> = new UserModel(data);
			await user.save();
			res.status(201).send({ user });
		} catch (err) {
			res.send(err);
		}
	} else {
		res.send("body is missing required data.");
	}
});

// // admin only route
// userRoute.get("/allUsers", async (req, res) => {
// 	const auth = req.headers.authorization;
// 	// console.log(access);
// 	if (auth) {
// 		try {
// 			let token = auth.split(" ")[1];
// 			let verified = jwt.verify(token, "primaryToken");
// 			if (verified) {
// 				let role = verified.role;
// 				if (role === "admin") {
// 					let users = await UserModel.find({});
// 					res.send(users);
// 				} else {
// 					res.send({ message: "only admins are allowed" }, 401);
// 				}
// 			}
// 		} catch (error) {
// 			res.send(error.message);
// 		}
// 	} else {
// 		res.send(403);
// 	}
// });
// // userRoute.delete("/:user_id", async (req, res) => {
// // 	const token = req.headers;
// // });

// // get details of logged in user.
// userRoute.get("/", async (req, res) => {
// 	const authorization = req.headers.authorization;
// 	if (authorization) {
// 		const auth = authorization.split(" ");
// 		const token = {};
// 		token.refreshToken = auth[1];
// 		// console.log(token.refreshToken);
// 		try {
// 			let data = jwt.verify(token.refreshToken, "refreshToken");
// 			// console.log(data);
// 			if (data.email) {
// 				delete data.iat;
// 				delete data.exp;
// 				token.primaryToken = jwt.sign(data, "primaryToken");
// 				res.send({ user: data, tokens: token });
// 			} else {
// 				res.send(403);
// 			}
// 		} catch (err) {
// 			res.send(err.message);
// 		}
// 	} else {
// 		res.send({ message: "token is missing" }, 401);
// 	}
// });

// // refresh token
// userRoute.post("/refresh", async (req, res) => {
// 	const { refreshToken } = req.body;
// 	try {
// 		let verify = jwt.verify(refreshToken, "refreshToken");
// 		if (verify) {
// 			delete verify.iat;
// 			delete verify.exp;
// 			const primaryToken = jwt.sign(verify, "primaryToken");
// 			res.send({
// 				primaryToken,
// 				refreshToken,
// 			});
// 		} else {
// 			res.send({ message: "kindly login again" });
// 		}
// 	} catch (err) {
// 		res.send({ message: err.message });
// 	}
// });

export { userRoute };
