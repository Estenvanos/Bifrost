import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";

const router = Router();

/**
 * Exemplo de rota protegida - apenas usuários autenticados
 */
router.get("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Acesso permitido",
    user: req.user,
  });
});

/**
 * Exemplo de rota admin - apenas administradores
 */
router.get("/admin/users", authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  // Aqui você pode listar todos os usuários, etc.
  res.status(200).json({
    success: true,
    message: "Acesso admin permitido",
    admin: req.user,
  });
});

/**
 * Exemplo de rota que aceita tanto usuários autenticados quanto não autenticados
 */
router.get("/public-content", async (req: AuthRequest, res: Response) => {
  const message = req.user 
    ? `Olá ${req.user.email}, conteúdo personalizado!`
    : "Conteúdo público para visitantes";

  res.status(200).json({
    success: true,
    message,
    isAuthenticated: !!req.user,
  });
});

export default router;