import trim from "lodash/trim";

export const BACKEND_BASE_URL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3004`
    : `https://vigor.backend.vigor.ai`;

export const sendBackendRequest = async <T = any, U = any>(path: string, data: T):Promise<U> => {
  const endpoint = `${BACKEND_BASE_URL}/${trim(path, "/")}`;

  let rawResponse;
  let content;
  try {
    rawResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    content = await rawResponse.json();
  } catch (error) {
    throw new Error(`There was an error communicating with the backend`);
  }

  if (!rawResponse.ok) {
    throw new Error(content.error || `Request failed`);
  }
  return content;
};
