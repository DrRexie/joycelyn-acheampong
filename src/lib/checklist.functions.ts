import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const schema = z.object({
  goals: z.string().trim().min(10, 'Tell us a little more about your goals').max(1500),
  coverage: z.string().trim().max(1500),
  topic: z.string().trim().max(60),
});

export const createChecklist = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { generateChecklist } = await import('./checklist.server');
    try {
      return { items: await generateChecklist(data) };
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      const message = status === 429 ? 'Our assistant is busy. Please try again in a minute.'
        : status === 402 ? 'The checklist assistant is temporarily unavailable.'
        : 'We couldn’t create your checklist right now. Please try again later.';
      return { error: message };
    }
  });
