import { Response } from "express";
import { Company, CompanyDoc } from "../models/Company";
import { User, UserDoc } from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";
import { hashPassword, validatePasswordStrength } from "../utils/password.utils";
import { validateEmail } from "../utils/validation.utils";
import { generateTokenPair } from "../utils/jwt.utils";
import mongoose from "mongoose";

/**
 * Cria uma nova empresa
 */
export const createCompany = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      logo_url,
      email: contact_email, // Map req.body.contact_email or email? Let's assume input matches form or adjust.
      // Based on previous code, input was company_name, contact_email.
      // Let's accept both for compatibility or stick to new schema.
      // Let's map from old input names to new schema if needed, or update input expectation.
      // Input: company_name, description, contact_email...
      company_name,
      address,
      phone_number,
      // User creation
      email,
      password,
      firstName,
      lastName
    } = req.body;

    const companyName = name || company_name;
    const companyEmail = contact_email || req.body.contact_email;

    // Validação de campos obrigatórios da empresa
    if (!companyName || !description || !companyEmail) {
      res.status(400).json({
        success: false,
        message: "Campos obrigatórios: name (or company_name), description, email (or contact_email)",
      });
      return;
    }

    // Valida o email de contato da empresa
    const contactEmailValidation = validateEmail(companyEmail);
    if (!contactEmailValidation.isValid) {
      res.status(400).json({
        success: false,
        message: `Email de contato inválido: ${contactEmailValidation.error}`,
      });
      return;
    }

    // Verifica se já existe empresa com esse email de contato
    const existingCompany = await Company.findOne({
      email: contactEmailValidation.sanitized
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

      const user = await User.findById(userId) as UserDoc;

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
        return;
      }

      if (user.role !== "admin" && user.role !== "vendor") {
        await User.findByIdAndUpdate(userId, { role: "vendor" });
        wasPromotedToAdmin = true;
      }

      userResponse = {
        _id: user._id,
        email: user.email,
        role: user.role === "customer" ? "vendor" : user.role,
        wasPromotedToAdmin,
      };
    }
    // Cenário 2: Não há usuário logado - cria novo usuário
    else {
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Para criar empresa sem login, forneça: email, password",
        });
        return;
      }

      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        res.status(400).json({
          success: false,
          message: emailValidation.error,
        });
        return;
      }

      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: "Senha fraca",
          errors: passwordValidation.errors,
        });
        return;
      }

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

      const hashedPassword = await hashPassword(password);

      const newUser = await User.create({
        email: emailValidation.sanitized,
        password: hashedPassword,
        role: "vendor",
        firstName,
        lastName
      });

      userId = newUser._id.toString();

      tokens = generateTokenPair({
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      userResponse = {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        createdAt: newUser.createdAt,
      };
    }

    // Cria a empresa
    const newCompany = await Company.create({
      name: companyName.trim(),
      slug: companyName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
      ownerId: userId,
      description: description.trim(),
      email: contactEmailValidation.sanitized,
      logo: { url: logo_url },
      address: { street: address },
      phone: phone_number,
      status: 'pending'
    });

    // Vincula a empresa ao usuário
    await User.findByIdAndUpdate(userId, { companyId: newCompany._id });

    const responseData: any = {
      company: newCompany,
      user: userResponse,
    };

    if (tokens) {
      responseData.accessToken = tokens.accessToken;
      responseData.refreshToken = tokens.refreshToken;
    }

    res.status(201).json({
      success: true,
      message: tokens
        ? "Empresa e usuário vendedor criados com sucesso"
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
      status, // changed from is_active to status
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

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
 * Atualiza uma empresa (apenas admin ou dono)
 */
export const updateCompany = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const parsedId = Array.isArray(id) ? id[0] : id;

    if (!mongoose.Types.ObjectId.isValid(parsedId)) {
      res.status(400).json({
        success: false,
        message: "ID de empresa inválido",
      });
      return;
    }

    // Remove protected fields
    delete updateData._id;
    delete updateData.ownerId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (updateData.email) {
      const emailValidation = validateEmail(updateData.email);
      if (!emailValidation.isValid) {
        res.status(400).json({
          success: false,
          message: `Email inválido: ${emailValidation.error}`,
        });
        return;
      }
      updateData.email = emailValidation.sanitized;
    }

    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.description) updateData.description = updateData.description.trim();

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