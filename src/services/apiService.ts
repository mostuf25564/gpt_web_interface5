import axios from 'axios';

export const sendAIRequest = async (url: string, role: string, payload: string) => {

  try {
    const response = await axios.post(url, {
      logic: role,
      q: payload
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};
