import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function generateChecklist(input: { goals: string; coverage: string; topic: string }) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error('AI is not configured');
  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: 'https://ai.gateway.lovable.dev/v1',
    apiKey,
    headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' },
    fetch: async (url, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set('X-Lovable-AIG-Run-ID', runId);
      const res = await fetch(url, { ...init, headers });
      runId ??= res.headers.get('X-Lovable-AIG-Run-ID') ?? undefined;
      return res;
    },
  });
  const result = streamText({
    model: provider.responses('openai/gpt-6-astra'),
    instructions:
      'You help visitors prepare for a free consultation with Joycelyn Acheampong, a licensed life insurance advisor in Carteret, NJ. ' +
      'Write a personalized preparation checklist of 6 to 9 items: documents to gather, facts to know, and questions to ask. ' +
      'Each item is one short, practical sentence. Do not recommend specific policies, prices, or insurers, and do not give legal or tax advice. ' +
      'Output only the items, one per line, each starting with "- ".',
    prompt: `Interested in: ${input.topic}\nGoals: ${input.goals}\nCurrent coverage: ${input.coverage || 'Not provided'}`,
    providerOptions: {
      openai: { store: false, forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', include: ['reasoning.encrypted_content'] },
    },
  });
  const text = await result.text;
  const items = text.split('\n').map(l => l.replace(/^\s*[-*•\d.)]+\s*/, '').trim()).filter(Boolean).slice(0, 12);
  if (!items.length) throw new Error('No checklist was returned. Please try again later.');
  return items;
}
