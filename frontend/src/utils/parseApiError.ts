import { GENERIC_ERROR } from '../constants';

export const parseApiError = async (res: Response): Promise<string> => {
  try {
    const text = await res.text();
    if (!text) return GENERIC_ERROR;

    try {
      const json = JSON.parse(text);

      if (json.errors) {
        const messages = Object.values(json.errors).flat() as string[];
        return messages.join('\n');
      }

      return json.title || json.message || text;
    } catch {
      return text;
    }
  } catch {
    return GENERIC_ERROR;
  }
}
