import express from "express";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";

import { UserModel } from "../models";
import axios from "axios";
import { IUser, IUserLogin } from "../utils/interface";
import { HydratedDocument } from "mongoose";

import {
	doesUserExistInDb,
	generateRefreshToken,
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
userRoute.post("/refresh", async (req, res) => {
	const { refreshToken } = req.body;
	res.send(generateRefreshToken(refreshToken));
});

// get all users
userRoute.get("/allUsers", async (req, res) => {
	let users = await UserModel.find({});
	res.send(users);
});

// delete user account
userRoute.delete("/:_id", async (req, res) => {
	let user = await UserModel.findByIdAndDelete(req.params._id);
	res.status(202).send(user);
});

export { userRoute };
