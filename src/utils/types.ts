export type UserLoginDataType = {
	email: string;
	password: string;
};

export type userLoginSuccessData = {
	_id: any;
	name: string;
	email: string;
	phone: string;
	role: "admin" | "user";
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

export type tokenType = {
	primaryToken?: string;
	refreshToken?: string;
};

export type loginControllerSuccess = {
	data: userLoginSuccessData;
	tokens: {
		primaryToken: string;
		refreshToken: string;
	};
};

export type loginControllerFailure = {
	message: string | any;
};
