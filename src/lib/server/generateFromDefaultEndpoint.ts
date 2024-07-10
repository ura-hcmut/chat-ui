import { smallModel } from "$lib/server/models";
import type { EndpointMessage } from "./endpoints/endpoints";

export async function generateFromDefaultEndpoint({
	messages,
	preprompt,
	generateSettings,
}: {
	messages: EndpointMessage[];
	preprompt?: string;
	generateSettings?: Record<string, unknown>;
}): Promise<string> {
	const endpoint = await smallModel.getEndpoint();

	const tokenStream = await endpoint({ messages, preprompt, generateSettings });
	let cumulativeText = "";
	for await (const output of tokenStream) {
		// if not generated_text is here it means the generation is not done
		cumulativeText += output.token.text;
		// if (output.generated_text) {
		// 	let generated_text = output.generated_text;
		
	}
	if (cumulativeText) return cumulativeText;
	throw new Error("Generation failed");
}
