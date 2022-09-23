import { CommentModel } from "../models/comment.schema";
import { json } from "body-parser";
import { Router } from "express";
import { IBlog } from "../utils/interface";
import { getBlogs, postBlog } from "../controllers/blogs.controller";

console.log(CommentModel);
const blogRoute = Router();

blogRoute.use(json());

blogRoute.get("/", async (req, res) => {
	const blogs = await getBlogs();
	res.send(blogs);
});

blogRoute.post<any, any, any, IBlog>("/post", async (req, res) => {
	const auth: string | undefined = req.headers.authorization;
	try {
		if (auth) {
			let response = await postBlog(auth, req.body);
			res.send(response);
		} else {
			res.status(401).send({
				message: "unauthorized...",
			});
		}
	} catch (err) {
		res.send({ message: err });
	}
});

// blogRoute.post("/comment", async (req, res) => {
// 	const authHeader = req.headers.authorization;
// 	if (authHeader && authHeader.length > 0) {
// 		const tokenArr = authHeader.split(" ");
// 		if (tokenArr[1]) {
// 			try {
// 				// const verify = jwt.verify(tokenArr[1], "primaryToken");
// 				const body = req.body;
// 				console.log(body);
// 				const blog = await BlogModel.findById(body._id);
// 				if (blog) {
// 					const newComment = new CommentModel({
// 						message: body.comment,
// 						// by: verify._id,
// 					});
// 					await newComment.save();
// 					// const { comments } = blog;
// 					// if (newComment) blog.comments.push(newComment);
// 					blog.save();
// 					res.send(blog);
// 				}
// 			} catch (err) {
// 				res.status(403).send({
// 					err: err,
// 				});
// 			}
// 		} else {
// 			res.status(401).send("token not provided");
// 		}
// 	} else {
// 		res.send(401);
// 	}
// });

export { blogRoute };
