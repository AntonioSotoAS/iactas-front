import { useUser } from "./use-user"

export function useApiKey() {
  const { user } = useUser()
  
  // Verificar si el usuario tiene API key
  const hasApiKey = user?.api_key && user.api_key.trim() !== ""
  
  return {
    hasApiKey,
    apiKey: user?.api_key || "",
    isMissingApiKey: !hasApiKey
  }
}
