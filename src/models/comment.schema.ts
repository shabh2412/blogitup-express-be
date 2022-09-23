import { IComment } from "../utils/interface";

import { Schema, model } from "mongoose";

const commentSchema = new Schema<IComment>({
	message: String,
	date: { type: Date, default: Date.now },
	by: { type: Schema.Types.ObjectId, ref: "user" },
});

export const CommentModel = model<IComment>("comment", commentSchema);

// export { CommentModel };
