import { Response } from "express";
import { Company, CompanyDoc } from "../models/Company";
import { User, UserDoc } from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";
import { hashPassword, validatePasswordStrength } from "../utils/password.utils";
import { validateEmail, validateUsername } from "../utils/validation.utils";
import { generateTokenPair } from "../utils/jwt.utils";
import mongoose from "mongoose";

/**
 * Cria uma nova empresa
 * 
 * Lógica especial:
 * 1. Se há usuário logado: cria empresa e promove usuário a admin
 * 2. Se não há usuário: cria usuário admin primeiro, depois cria empresa
 */
export const createCompany = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      company_name,
      description,
      website_url,
      logo_url,
      contact_email,
      address,
      phone_number,
      // Campos para criação de usuário (se não houver usuário logado)
      email,
      password,
      username,
    } = req.body;

    // Validação de campos obrigatórios da empresa
    if (!company_name || !description || !contact_email) {
      res.status(400).json({
        success: false,
        message: "Campos obrigatórios: company_name, description, contact_email",
      });
      return;
    }

    // Valida o email de contato da empresa
    const contactEmailValidation = validateEmail(contact_email);
    if (!contactEmailValidation.isValid) {
      res.status(400).json({
        success: false,
        message: `Email de contato inválido: ${contactEmailValidation.error}`,
      });
      return;
    }

    // Verifica se já existe empresa com esse email de contato
    const existingCompany = await Company.findOne({ 
      contact_email: contactEmailValidation.sanitized 
    });
    
    if (existingCompany) {
      res.status(409).json({
        success: false,
        message: "Já existe uma empresa com este email de contato",
      });
      return;
    }

    let userId: string;
    let userResponse: any;
    let tokens: any = null;
    let wasPromotedToAdmin = false;

    // Cenário 1: Usuário está logado
    if (req.user) {
      userId = req.user.userId;
      
      // Busca o usuário
      const user = await User.findById(userId) as UserDoc;
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
        return;
      }

      // Se o usuário não é admin, promove para admin
      if (user.type !== "admin" && user.type !== "owner") {
        await User.findByIdAndUpdate(userId, { type: "admin" });
        wasPromotedToAdmin = true;
      }

      userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        type: "admin",
        wasPromotedToAdmin,
      };
    } 
    // Cenário 2: Não há usuário logado - cria novo usuário admin
    else {
      // Valida campos obrigatórios para criação de usuário
      if (!email || !password || !username) {
        res.status(400).json({
          success: false,
          message: "Para criar empresa sem login, forneça: email, password, username",
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

      // Valida email do novo usuário
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

      // Cria o usuário admin
      const newUser = await User.create({
        username: usernameValidation.sanitized,
        email: emailValidation.sanitized,
        password: hashedPassword,
        type: "admin",
      });

      userId = newUser._id.toString();

      // Gera tokens para o novo usuário
      tokens = generateTokenPair({
        userId: newUser._id.toString(),
        email: newUser.email,
        type: newUser.type,
      });

      userResponse = {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        type: newUser.type,
        createdAt: newUser.createdAt,
      };
    }

    // Cria a empresa com owner_user_id
    const newCompany = await Company.create({
      company_name: company_name.trim(),
      owner_user_id: userId,
      description: description.trim(),
      website_url: website_url?.trim() || undefined,
      logo_url: logo_url?.trim() || undefined,
      contact_email: contactEmailValidation.sanitized,
      address: address?.trim() || undefined,
      phone_number: phone_number?.trim() || undefined,
      is_active: true,
    });

    // Vincula a empresa ao usuário (bi-directional relationship)
    await User.findByIdAndUpdate(userId, { company_id: newCompany._id });

    const responseData: any = {
      company: newCompany,
      user: userResponse,
    };

    // Se foi criado novo usuário, adiciona os tokens
    if (tokens) {
      responseData.accessToken = tokens.accessToken;
      responseData.refreshToken = tokens.refreshToken;
    }

    res.status(201).json({
      success: true,
      message: tokens 
        ? "Empresa e usuário admin criados com sucesso" 
        : "Empresa criada com sucesso",
      data: responseData,
    });
  } catch (error) {
    console.error("Erro ao criar empresa:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar empresa",
    });
  }
};

/**
 * Busca todas as empresas com paginação e filtros
 */
export const getAllCompanies = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      is_active,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Constrói o filtro
    const filter: any = {};

    if (is_active !== undefined) {
      filter.is_active = is_active === "true";
    }

    // Busca as empresas
    const companies = await Company.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const totalCompanies = await Company.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        companies,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCompanies / limitNum),
          totalCompanies,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar empresas",
    });
  }
};

/**
 * Busca uma empresa por ID
 */
export const getCompanyById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const parsedId: string = Array.isArray(id) ? id[0] : id;

    // Valida se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(parsedId)) {
      res.status(400).json({
        success: false,
        message: "ID de empresa inválido",
      });
      return;
    }

    const company = await Company.findById(parsedId);

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Empresa não encontrada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        company,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar empresa",
    });
  }
};

/**
 * Atualiza uma empresa (apenas admin)
 */
export const updateCompany = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const parsedId = Array.isArray(id) ? id[0] : id;

    // Valida se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(parsedId)) {
      res.status(400).json({
        success: false,
        message: "ID de empresa inválido",
      });
      return;
    }

    // Remove campos que não devem ser atualizados diretamente
    delete updateData._id;
    delete updateData.owner_user_id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Valida email de contato se fornecido
    if (updateData.contact_email) {
      const emailValidation = validateEmail(updateData.contact_email);
      if (!emailValidation.isValid) {
        res.status(400).json({
          success: false,
          message: `Email de contato inválido: ${emailValidation.error}`,
        });
        return;
      }
      updateData.contact_email = emailValidation.sanitized;
    }

    // Sanitiza strings
    if (updateData.company_name) updateData.company_name = updateData.company_name.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    if (updateData.website_url) updateData.website_url = updateData.website_url.trim();
    if (updateData.logo_url) updateData.logo_url = updateData.logo_url.trim();
    if (updateData.address) updateData.address = updateData.address.trim();
    if (updateData.phone_number) updateData.phone_number = updateData.phone_number.trim();

    const updatedCompany = await Company.findByIdAndUpdate(
      parsedId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      res.status(404).json({
        success: false,
        message: "Empresa não encontrada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Empresa atualizada com sucesso",
      data: {
        company: updatedCompany,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar empresa",
    });
  }
};

/**
 * Deleta uma empresa (apenas admin)
 */
export const deleteCompany = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const parsedId: string = Array.isArray(id) ? id[0] : id;

    // Valida se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(parsedId)) {
      res.status(400).json({
        success: false,
        message: "ID de empresa inválido",
      });
      return;
    }

    const deletedCompany = await Company.findByIdAndDelete(parsedId);

    if (!deletedCompany) {
      res.status(404).json({
        success: false,
        message: "Empresa não encontrada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Empresa deletada com sucesso",
      data: {
        company: deletedCompany,
      },
    });
  } catch (error) {
    console.error("Erro ao deletar empresa:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao deletar empresa",
    });
  }
};