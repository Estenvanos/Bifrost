import validator from "validator";

/**
 * Valida e sanitiza email
 */
export const validateEmail = (email: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} => {
  const trimmed = email.trim().toLowerCase();

  if (!validator.isEmail(trimmed)) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: "Email inválido",
    };
  }

  return {
    isValid: true,
    sanitized: validator.normalizeEmail(trimmed) || trimmed,
  };
};

/**
 * Valida e sanitiza username
 */
export const validateUsername = (username: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} => {
  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: "Username deve ter no mínimo 3 caracteres",
    };
  }

  if (trimmed.length > 30) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: "Username deve ter no máximo 30 caracteres",
    };
  }

  // Permite apenas letras, números, underscore e hífen
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: "Username deve conter apenas letras, números, underscore e hífen",
    };
  }

  return {
    isValid: true,
    sanitized: trimmed,
  };
};

/**
 * Sanitiza string removendo caracteres perigosos
 */
export const sanitizeString = (str: string): string => {
  return validator.escape(str.trim());
};