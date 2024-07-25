import { env } from "$env/dynamic/private";
import { generateFromDefaultEndpoint } from "$lib/server/generateFromDefaultEndpoint";
import type { EndpointMessage } from "../endpoints/endpoints";
import { logger } from "$lib/server/logger";
import { MessageUpdateType, type MessageUpdate } from "$lib/types/MessageUpdate";
import type { Conversation } from "$lib/types/Conversation";

export async function* generateTitleForConversation(
	conv: Conversation
): AsyncGenerator<MessageUpdate, undefined, undefined> {
	try {
		const userMessage = conv.messages.find((m) => m.from === "user");
		// HACK: detect if the conversation is new
		if (conv.title !== "Cuộc trò chuyện mới" || !userMessage) return;

		const prompt = userMessage.content;
		const title = (await generateTitle(prompt)) ?? "Cuộc trò chuyện mới";

		yield {
			type: MessageUpdateType.Title,
			title,
		};
	} catch (cause) {
		console.error(Error("Failed whilte generating title for conversation", { cause }));
	}
}

export async function generateTitle(prompt: string) {
	if (!env.LLM_SUMMARIZATION) {
		return prompt.split(/\s+/g).slice(0, 5).join(" ");
	}

	const messages: Array<EndpointMessage> = [
		{
			from: "system",
			content:
				"Bạn là một AI tóm tắt. Bạn sẽ không bao giờ trả lời trực tiếp câu hỏi của người dùng, mà hãy tóm tắt yêu cầu của người dùng thành một câu ngắn gọn trong vòng bốn từ. Luôn bắt đầu câu trả lời của bạn bằng một biểu tượng cảm xúc phù hợp với phần tóm tắt",
		},
		{
			"from": "assistant",
			"content": "🔢 Phép tính đơn giản"
		  },
		  {
			"from": "user",
			"content": "Tin tức mới nhất là gì?"
		  },
		  {
			"from": "assistant",
			"content": "📰 Tin tức mới nhất"
		  },
		  {
			"from": "user",
			"content": "Làm bánh pho mát ngon như thế nào?"
		  },
		  {
			"from": "assistant",
			"content": "🍰 Công thức bánh pho mát"
		  },
		  {
			"from": "user",
			"content": "Bộ phim yêu thích của bạn là gì? hãy trả lời ngắn gọn."
		  },
		  {
			"from": "assistant",
			"content": "🎥 Phim yêu thích"
		  },
		  {
			"from": "user",
			"content": "Giải thích khái niệm trí tuệ nhân tạo trong một câu"
		  },
		  {
			"from": "assistant",
			"content": "🤖 Định nghĩa AI"
		  },
		  {
			"from": "user",
			"content": "Vẽ một con mèo dễ thương"
		  },
		  {
			"from": "assistant",
			"content": "🐱 Vẽ mèo dễ thương"
		  },
		{ from: "user", content: prompt },
	];

	return await generateFromDefaultEndpoint({
		messages,
		preprompt:
			"Bạn là một AI tóm tắt. Bạn sẽ không bao giờ trả lời trực tiếp câu hỏi của người dùng, mà hãy tóm tắt yêu cầu của người dùng thành một câu ngắn gọn trong vòng bốn từ. Luôn bắt đầu câu trả lời của bạn bằng một biểu tượng cảm xúc phù hợp với phần tóm tắt",
		generateSettings: {
			max_new_tokens: 15,
		},
	})
		.then((summary) => {
			// add an emoji if none is found in the first three characters
			if (!/\p{Emoji}/u.test(summary.slice(0, 3))) {
				return "💬 " + summary;
			}
			return summary;
		})
		.catch((e) => {
			logger.error(e);
			return null;
		});
}
