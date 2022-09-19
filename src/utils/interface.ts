export interface IUser {
	name: string;
	email: string;
	password: string;
	phone: string;
	role: "admin" | "user";
	viaOauth: boolean;
	createdAt: Date;
}

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
