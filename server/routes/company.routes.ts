import { Router } from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller";
import { optionalAuthenticate, requireAdmin, authenticate } from "../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

const router = Router();

/**
 * Rate limiter para criação de empresas
 * Previne spam de criação
 */
const createCompanyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Máximo 5 empresas por hora
  message: {
    success: false,
    message: "Muitas tentativas de criação de empresa. Tente novamente mais tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/companies
 * @desc    Cria uma nova empresa
 * @access  Public (mas cria usuário admin se não houver login)
 * 
 * Lógica especial:
 * - Se usuário está logado: cria empresa e promove usuário a admin
 * - Se não está logado: cria usuário admin primeiro, depois cria empresa
 */
router.post("/", optionalAuthenticate, createCompanyLimiter, createCompany);

/**
 * @route   GET /api/companies
 * @desc    Busca todas as empresas com paginação
 * @access  Public
 * @query   page - Número da página (default: 1)
 * @query   limit - Itens por página (default: 10)
 * @query   is_active - Filtrar por status ativo (true/false)
 */
router.get("/", getAllCompanies);

/**
 * @route   GET /api/companies/:id
 * @desc    Busca uma empresa por ID
 * @access  Public
 */
router.get("/:id", getCompanyById);

/**
 * @route   PUT /api/companies/:id
 * @desc    Atualiza uma empresa
 * @access  Private (Admin only)
 */
router.put("/:id", authenticate, requireAdmin, updateCompany);

/**
 * @route   DELETE /api/companies/:id
 * @desc    Deleta uma empresa
 * @access  Private (Admin only)
 */
router.delete("/:id", authenticate, requireAdmin, deleteCompany);

export default router;