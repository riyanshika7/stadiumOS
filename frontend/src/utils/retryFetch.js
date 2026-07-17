export async function retryFetch(url, options = {}, retries = 2, backoff = 1000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok && attempt < retries) {
        await new Promise((r) => setTimeout(r, backoff * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, backoff * (attempt + 1)));
    }
  }
  throw new Error(`Failed after ${retries + 1} attempts`);
}

export async function retryFetchJson(url, options = {}, retries = 2, backoff = 1000) {
  const res = await retryFetch(url, options, retries, backoff);
  return res.json();
}
