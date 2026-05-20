import { promises as fs } from 'fs'
import path from 'path'
import { GoogleAuth, type JWTInput } from 'google-auth-library'

let credentialsCache: JWTInput | null | undefined
let accessTokenUnavailableLogged = false

const normalizePrivateKey = (value?: string) =>
  value ? value.replace(/\\n/g, '\n') : value

const parseJsonCredentials = (raw?: string | null): JWTInput | null => {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw) as JWTInput
    if (parsed.private_key) {
      parsed.private_key = normalizePrivateKey(parsed.private_key)
    }
    return parsed
  } catch {
    return null
  }
}

const parseBase64Credentials = (raw?: string | null): JWTInput | null => {
  if (!raw?.trim()) return null
  try {
    return parseJsonCredentials(Buffer.from(raw, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

const loadFileCredentials = async (
  filePath?: string | null
): Promise<JWTInput | null> => {
  if (!filePath?.trim()) return null
  if (process.platform !== 'win32' && /^[a-z]:[\\/]/i.test(filePath)) {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS
    return null
  }

  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath)
    const content = await fs.readFile(resolvedPath, 'utf8')
    return parseJsonCredentials(content)
  } catch {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS
    return null
  }
}

export const getGoogleCredentials = async (): Promise<JWTInput | undefined> => {
  if (credentialsCache !== undefined) return credentialsCache ?? undefined

  const fromJson = parseJsonCredentials(process.env.GCP_SERVICE_ACCOUNT_JSON)
  if (fromJson) {
    credentialsCache = fromJson
    return fromJson
  }

  const fromBase64 = parseBase64Credentials(process.env.GCP_SERVICE_ACCOUNT_JSON_BASE64)
  if (fromBase64) {
    credentialsCache = fromBase64
    return fromBase64
  }

  const fromFile = await loadFileCredentials(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  if (fromFile) {
    credentialsCache = fromFile
    return fromFile
  }

  credentialsCache = null
  return undefined
}

export const getGoogleAccessToken = async (): Promise<string | null> => {
  try {
    const credentials = await getGoogleCredentials()
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      credentials
    })
    const token = await auth.getAccessToken()
    return token ?? null
  } catch (error) {
    if (!accessTokenUnavailableLogged) {
      accessTokenUnavailableLogged = true
      console.warn(
        'Google access token unavailable:',
        error instanceof Error ? error.message : error
      )
    }
    return null
  }
}

export const getGeminiModelId = () =>
  process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash-lite'

export const generateGeminiText = async ({
  prompt,
  temperature = 0.2,
  maxOutputTokens = 1000
}: {
  prompt: string
  temperature?: number
  maxOutputTokens?: number
}): Promise<string | null> => {
  const projectId = process.env.GCP_PROJECT_ID
  const location = process.env.GCP_LOCATION || 'us-central1'
  const modelId = getGeminiModelId()
  if (!projectId) return null

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) return null

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens }
    })
  })

  if (!response.ok) {
    console.error('Gemini generation error:', await response.text())
    return null
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
}
