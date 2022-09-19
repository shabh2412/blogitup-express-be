export type UserLoginDataType = {
	email: string;
	password: string;
};

// error type
export type errType = {
	message: string;
};

// github oauth verification response type.
export type oAuthGHVerificationType = {
	access_token: string;
};

export type oAuthGitHubVerfiedUserResponse = {
	name: string;
	email: string;
	phone: string;
};
