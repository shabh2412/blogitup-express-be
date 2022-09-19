import express from "express";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";

import { UserModel } from "../models";
import axios from "axios";
import { IUser, IUserLogin } from "../utils/interface";
import { HydratedDocument } from "mongoose";

import {
	doesUserExistInDb,
	getUserDetails,
	githubLogin,
	loginController,
	signupController,
} from "../controllers/user.controller";
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
		res.send(await loginController(email, password));
	} else {
		res.send("incomplete data");
	}
});

// OAUTH
userRoute.post<any, any, any, any, { code: string }>(
	"/login/github",
	async (req, res) => {
		const { code } = req.query;
		// console.log(code, state);
		res.send(await githubLogin(code));
	}
);

// signup
userRoute.post<any, any, any, IUser>("/post", async (req, res) => {
	let data = req.body;
	if (data.name && data.email && data.password && data.phone) {
		res.send(await signupController(data));
	} else {
		res.send({ message: "body is missing required data." });
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

// get details of logged in user.
userRoute.get("/", async (req, res) => {
	const authorization: string | undefined = req.headers.authorization;
	if (authorization) {
		const auth: string[] = authorization.split(" ");
		let refreshToken: string = auth[1];
		// console.log(token.refreshToken);
		if (refreshToken) {
			res.send(await getUserDetails(refreshToken));
		} else {
			res.send({
				message: "token not provided.",
			});
		}
	} else {
		res.status(401).send({ message: "token is missing" });
	}
});

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
