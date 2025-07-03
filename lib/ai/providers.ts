import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// const anthropic = createAnthropic({
//   baseURL: 'https://openrouter.ai/api/v1/chat/completions',
//   apiKey: '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',
//   headers: {
//     Authorization: `Bearer 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`,
//     'Content-Type': 'application/json',
//     'HTTP-Referer': 'http://localhost:3000',
//     'X-Title': 'User-specific Tooling'
//   },
// });

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
    languageModels: {
      "chat-model": openai('gpt-4.1-2025-04-14'),//anthropic("claude-4-sonnet-20250514"), // Replace with anthropic model
      "chat-model-reasoning": wrapLanguageModel({
        model: xai('grok-3-mini-beta'),
        middleware: extractReasoningMiddleware({ tagName: "think" }),
      }),
      "title-model": xai("grok-2-1212"),
      "artifact-model": xai("grok-2-1212"),
    },
    imageModels: {
      "small-model": xai.image("grok-2-image"),
    },
    });
    //  'chat-model': xai('grok-2-vision-1212'),
    //     'chat-model-reasoning': wrapLanguageModel({
    //       model: xai('grok-3-mini-beta'),
    //       middleware: extractReasoningMiddleware({ tagName: 'think' }),
    //     }),
