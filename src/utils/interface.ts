export interface IUser {
	name: string;
	email: string;
	password: string;
	phone: string;
	role: "admin" | "user";
	viaOauth: boolean;
	createdAt: Date;
}

import { Types } from "mongoose";
import {
	oAuthGHVerificationType,
	oAuthGitHubVerfiedUserResponse,
} from "./types";

export interface UserJWTInterface {
	email: string;
	_id: string;
	name: string;
	phone: string;
	role: "admin" | "user";
}

export interface IUserLogin {
	email: string;
	password: string;
}

export interface oAuthGHVerificationInterface {
	data: oAuthGHVerificationType;
	access_token: string;
}

export interface oAuthGitHubVerUserInterface {
	data: oAuthGitHubVerfiedUserResponse;
}

export interface IComment {
	message: string;
	date: Date;
	by: Types.ObjectId | string;
}
export interface IBlog {
	title: string;
	author: Types.ObjectId | string;
	body: string;
	date: Date;
	hidden: boolean;
	meta: {
		votes: number;
		favs: number;
	};
	comments: Array<Comment>;
}

// export interface IBlogComment {

// }
