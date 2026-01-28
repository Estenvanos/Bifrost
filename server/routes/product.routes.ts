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
 * Previne spam de criação
 */
const createProductLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 produtos por hora
  message: {
    success: false,
    message: "Muitas tentativas de criação de produto. Tente novamente mais tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/products
 * @desc    Cria um novo produto
 * @access  Private (Admin only)
 */
router.post("/", authenticate, requireAdmin, createProductLimiter, createProduct);

/**
 * @route   GET /api/products
 * @desc    Busca todos os produtos com paginação e filtros
 * @access  Public
 * @query   page - Número da página (default: 1)
 * @query   limit - Itens por página (default: 10)
 * @query   category - Filtrar por categoria
 * @query   tags - Filtrar por tags
 * @query   minPrice - Preço mínimo
 * @query   maxPrice - Preço máximo
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
 * @desc    Atualiza um produto
 * @access  Private (Admin only)
 */
router.put("/:id", authenticate, requireAdmin, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Deleta um produto
 * @access  Private (Admin only)
 */
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

export default router;