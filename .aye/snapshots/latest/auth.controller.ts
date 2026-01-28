import { Request, Response } from "express";
import { User, UserDoc } from "../models/User";
import { hashPassword, comparePassword, validatePasswordStrength } from "../utils/password.utils";
import { validateEmail, validateUsername } from "../utils/validation.utils";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt.utils";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * Registra um novo usuário
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, type } = req.body;

    // Validação de campos obrigatórios
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Username, email e senha são obrigatórios",
      });
      return;
    }

    // Valida username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      res.status(400).json({
        success: false,
        message: usernameValidation.error,
      });
      return;
    }

    // Valida email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      res.status(400).json({
        success: false,
        message: emailValidation.error,
      });
      return;
    }

    // Valida força da senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Senha fraca",
        errors: passwordValidation.errors,
      });
      return;
    }

    // Verifica se o email já existe
    const existingUser = await User.findOne({ 
      email: emailValidation.sanitized 
    });
    
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Email já cadastrado",
      });
      return;
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Cria o usuário
    const newUser = await User.create({
      username: usernameValidation.sanitized,
      email: emailValidation.sanitized,
      password: hashedPassword,
      type: type === "admin" ? "admin" : "customer", // Por padrão é customer
    });

    // Gera tokens
    const tokens = generateTokenPair({
      userId: newUser._id.toString(),
      email: newUser.email,
      type: newUser.type,
    });

    // Remove a senha da resposta
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      type: newUser.type,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      data: {
        user: userResponse,
        ...tokens,
      },
    });
  } catch (error) {
    console.error("Erro no signup:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar usuário",
    });
  }
};

/**
 * Faz login do usuário
 */
export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validação de campos obrigatórios
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email e senha são obrigatórios",
      });
      return;
    }

    // Valida formato do email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      res.status(400).json({
        success: false,
        message: emailValidation.error,
      });
      return;
    }

    // Busca o usuário
    const user = await User.findOne({ 
      email: emailValidation.sanitized 
    }) as UserDoc;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
      return;
    }

    // Verifica a senha
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
      return;
    }

    // Gera tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      type: user.type,
    });

    // Remove a senha da resposta
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      type: user.type,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Login realizado com sucesso",
      data: {
        user: userResponse,
        ...tokens,
      },
    });
  } catch (error) {
    console.error("Erro no signin:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao fazer login",
    });
  }
};

/**
 * Retorna os dados do usuário autenticado
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
      return;
    }

    const user = await User.findById(req.user.userId).select("-password") as UserDoc;

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar dados do usuário",
    });
  }
};

/**
 * Atualiza o access token usando o refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token é obrigatório",
      });
      return;
    }

    // Verifica o refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Busca o usuário
    const user = await User.findById(decoded.userId) as UserDoc;

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
      return;
    }

    // Gera novo par de tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      type: user.type,
    });

    res.status(200).json({
      success: true,
      message: "Token atualizado com sucesso",
      data: tokens,
    });
  } catch (error) {
    console.error("Erro ao atualizar token:", error);
    res.status(401).json({
      success: false,
      message: "Refresh token inválido ou expirado",
    });
  }
};

/**
 * Altera a senha do usuário autenticado
 */
export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Senha atual e nova senha são obrigatórias",
      });
      return;
    }

    // Valida força da nova senha
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Nova senha fraca",
        errors: passwordValidation.errors,
      });
      return;
    }

    // Busca o usuário
    const user = await User.findById(req.user.userId) as UserDoc;

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
      return;
    }

    // Verifica a senha atual
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Senha atual incorreta",
      });
      return;
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualiza a senha
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    res.status(200).json({
      success: true,
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao alterar senha",
    });
  }
};