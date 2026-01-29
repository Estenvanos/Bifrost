import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

const router = Router();

/**
 * Rate limiter para criação de produtos
 */
const createProductLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // Máximo 20 produtos por hora
  message: {
    success: false,
    message: "Muitas tentativas de criação de produto. Tente novamente mais tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/products
 * @desc    Cria um novo produto (usa company_id do usuário logado)
 * @access  Private (Admin only + must have company)
 */
router.post("/", authenticate, requireAdmin, createProductLimiter, createProduct);

/**
 * @route   GET /api/products
 * @desc    Busca todos os produtos com paginação e filtros
 * @access  Public
 */
router.get("/", getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Busca um produto por ID
 * @access  Public
 */
router.get("/:id", getProductById);

/**
 * @route   PUT /api/products/:id
 * @desc    Atualiza um produto (apenas da própria empresa)
 * @access  Private (Admin only + same company)
 */
router.put("/:id", authenticate, requireAdmin, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Deleta um produto (apenas da própria empresa)
 * @access  Private (Admin only + same company)
 */
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

export default router;