import express from "express";
import mongoose from "mongoose";
import { config } from "../config/config";
import bodyParser from "body-parser";
import cors from "cors";
import { userRoute } from "./routes/user.router";
import { blogRoute } from "./routes/blog.router";

const port: number | string = process.env.PORT || config.env.dev.port;
const dbConfig = config.env.dev.dbConfig;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
	res.sendFile(process.cwd() + "/package.json");
});

app.use("/users", userRoute);
app.use("/blogs", blogRoute);

mongoose
	.connect(dbConfig.url)
	.then(() => {
		app.listen(port, () => {
			console.log(
				`DB Connected to: ${dbConfig.url} \nServer running on port: ${port}`
			);
		});
	})
	.catch((err) => {
		console.log(err);
	});
