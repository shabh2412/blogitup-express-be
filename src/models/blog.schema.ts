import { model, Schema } from "mongoose";
import { IBlog } from "../utils/interface";

const blogSchema = new Schema<IBlog>({
	title: { type: String, required: true },
	author: { type: Schema.Types.ObjectId, ref: "user" },
	body: { type: String, required: true },
	comments: {
		type: [
			{
				type: Schema.Types.ObjectId,
				ref: "comment",
			},
		],
		default: [],
	},
	date: { type: Date, default: Date.now },
	hidden: { type: Boolean, default: false },
	meta: {
		votes: { type: Number, default: 0 },
		favs: { type: Number, default: 0 },
	},
});

export const BlogModel = model<IBlog>("blog", blogSchema);
