export function translateAuthError(error: any): string {
  if (!error) return "Ocorreu um erro desconhecido";
  
  const message = error?.message || error?.error_description || String(error);

  if (message.includes("Invalid login credentials")) {
    return "Credenciais de login inválidas.";
  }
  if (message.includes("User already registered") || message.includes("already registered")) {
    return "Este usuário já está cadastrado.";
  }
  if (message.includes("Password should be at least 6 characters")) {
    return "A senha deve ter no mínimo 6 caracteres.";
  }
  if (message.includes("Email not confirmed")) {
    return "E-mail ainda não confirmado.";
  }

  // Generic fallback if not caught
  return message;
}
