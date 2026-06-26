const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  let response
  try {
    response = await fetch(url, {
      ...options,
      headers:
        options.body instanceof FormData
          ? options.headers
          : { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch (err) {
    // Network failure (offline, CORS, backend down) — never let this throw an unhandled blank screen
    throw new ApiError('Could not reach the LexiFlow server. Check your connection and try again.', 0)
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    try {
      const body = await response.json()
      detail = body.detail || body.message || detail
    } catch {
      // response had no JSON body — keep default detail
    }
    throw new ApiError(detail, response.status)
  }

  return response.json()
}

/** POST /api/extract-pdf — multipart/form-data: file */
export function extractPdf(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/api/extract-pdf', { method: 'POST', body: formData })
}

/** POST /api/readability — { text } */
export function getReadability(text) {
  return request('/api/readability', { method: 'POST', body: JSON.stringify({ text }) })
}

/** POST /api/simplify — { text, level: 'simplified' | 'very_simple' | 'eli5' } */
export function simplifyText(text, level) {
  return request('/api/simplify', { method: 'POST', body: JSON.stringify({ text, level }) })
}

/** POST /api/dyslexia-rewrite — { text } */
export function dyslexiaRewrite(text) {
  return request('/api/dyslexia-rewrite', { method: 'POST', body: JSON.stringify({ text }) })
}

/** POST /api/key-points — { text } */
export function getKeyPoints(text) {
  return request('/api/key-points', { method: 'POST', body: JSON.stringify({ text }) })
}

/** POST /api/summary — { text } */
export function getSummary(text) {
  return request('/api/summary', { method: 'POST', body: JSON.stringify({ text }) })
}

/** POST /api/quiz — { text } */
export function generateQuiz(text) {
  return request('/api/quiz', { method: 'POST', body: JSON.stringify({ text }) })
}

/** POST /api/why-confused — { selected_text, surrounding_context } */
export function whyAmIConfused(selectedText, surroundingContext) {
  return request('/api/why-confused', {
    method: 'POST',
    body: JSON.stringify({ selected_text: selectedText, surrounding_context: surroundingContext }),
  })
}

export { ApiError, API_BASE_URL }
