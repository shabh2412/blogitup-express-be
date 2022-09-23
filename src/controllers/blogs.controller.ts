import jwt, { JwtPayload } from "jsonwebtoken";
import { HydratedDocument } from "mongoose";
import { BlogModel, UserModel } from "../models";
import { IBlog, IUser } from "../utils/interface";

export const getBlogs = async () => {
	const blogs = await BlogModel.find()
		.populate("author", "name")
		.populate({
			path: "comments",
			populate: {
				path: "by",
				model: "user",
				select: "name",
			},
		});
	return blogs;
};

export const postBlog = async (auth: string, blogData: IBlog) => {
	const prim = auth.split(" ")[1];
	try {
		const data: JwtPayload | string = jwt.verify(prim, "primaryToken");
		if (typeof data !== "string") {
			const { email } = data;
			let userFound: HydratedDocument<IUser> | null = await UserModel.findOne({
				email,
			});
			if (userFound) {
				let { _id } = userFound;
				if (_id) {
					// res.send({ _id });
					if (blogData.title && blogData.body) {
						blogData.author = _id;
						const blogPost = new BlogModel(blogData);
						await blogPost.save();
						return {
							status: 201,
							blogPost,
						};
					} else {
						return {
							status: 403,
						};
					}
				} else {
					return {
						status: 404,
						message: "user not found",
					};
				}
			}
		}
	} catch (err) {
		return {
			message: err,
		};
	}
};

