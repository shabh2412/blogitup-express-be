export const config = {
	env: {
		dev: {
			port: 8080,
			dbConfig: {
				url: "mongodb://localhost:27017/myBlogs",
			},
		},
		// production configs come here.
		prod: {
			port: 8080,
			dbConfig: {
				url: `mongodb+srv://rishabh-mongo:mongodb-free@cluster0.v9a14sg.mongodb.net/myBlogs?retryWrites=true&w=majority`,
			},
		},
	},
};
