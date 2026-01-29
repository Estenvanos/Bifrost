import { Response } from "express";
import { Product, ProductDoc } from "../models/Product";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";
import mongoose from "mongoose";

/**
 * Cria um novo produto
 * Apenas admins com company_id podem criar produtos
 * Produtos são automaticamente vinculados à empresa do usuário
 */
export const createProduct = async (
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

    // Busca o usuário para pegar o company_id
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
      return;
    }

    // Verifica se o usuário tem uma empresa vinculada
    if (!user.company_id) {
      res.status(403).json({
        success: false,
        message: "Você precisa estar vinculado a uma empresa para criar produtos",
      });
      return;
    }

    const { product_name, description, image_url, price, category, tags } = req.body;

    // Validação de campos obrigatórios
    if (!product_name || !description || !price || !category) {
      res.status(400).json({
        success: false,
        message: "Campos obrigatórios: product_name, description, price, category",
      });
      return;
    }

    // Valida se o preço é positivo
    if (price <= 0) {
      res.status(400).json({
        success: false,
        message: "O preço deve ser maior que zero",
      });
      return;
    }

    // Cria o produto com o company_id do usuário
    const newProduct = await Product.create({
      product_name: product_name.trim(),
      company_id: user.company_id.toString(),
      description: description.trim(),
      image_url: image_url?.trim() || undefined,
      price,
      category: category.trim(),
      tags: tags || [],
      rating: 0,
      review_count: 0,
    });

    res.status(201).json({
      success: true,
      message: "Produto criado com sucesso",
      data: {
        product: newProduct,
      },
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar produto",
    });
  }
};

/**
 * Busca todos os produtos com paginação e filtros
 * Acesso público
 */
export const getAllProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      category,
      tags,
      minPrice,
      maxPrice,
      company_id,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Constrói o filtro
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (tags) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
    }

    if (company_id) {
      filter.company_id = company_id;
    }

    // Busca os produtos
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalProducts / limitNum),
          totalProducts,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar produtos",
    });
  }
};

/**
 * Busca um produto por ID
 * Acesso público
 */
export const getProductById = async (
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
        message: "ID de produto inválido",
      });
      return;
    }

    const product = await Product.findById(parsedId);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar produto",
    });
  }
};

/**
 * Atualiza um produto
 * Apenas admin da mesma empresa pode atualizar
 */
export const updateProduct = async (
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

    const { id } = req.params;
    const parsedId: string = Array.isArray(id) ? id[0] : id;
    const updateData = req.body;

    // Valida se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(parsedId)) {
      res.status(400).json({
        success: false,
        message: "ID de produto inválido",
      });
      return;
    }

    // Busca o usuário para verificar company_id
    const user = await User.findById(req.user.userId);
    
    if (!user || !user.company_id) {
      res.status(403).json({
        success: false,
        message: "Você não está vinculado a nenhuma empresa",
      });
      return;
    }

    // Busca o produto
    const product = await Product.findById(parsedId);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
      return;
    }

    // Verifica se o produto pertence à empresa do usuário (FIX: convert to strings)
    if (product.company_id !== user.company_id.toString()) {
      res.status(403).json({
        success: false,
        message: "Você só pode atualizar produtos da sua própria empresa",
      });
      return;
    }

    // Remove campos que não devem ser atualizados
    delete updateData._id;
    delete updateData.company_id; // Não permite trocar de empresa
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.rating;
    delete updateData.review_count;
    delete updateData.vector;
    delete updateData.vector_version;

    // Valida o preço se fornecido
    if (updateData.price !== undefined && updateData.price <= 0) {
      res.status(400).json({
        success: false,
        message: "O preço deve ser maior que zero",
      });
      return;
    }

    // Sanitiza strings
    if (updateData.product_name) updateData.product_name = updateData.product_name.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    if (updateData.category) updateData.category = updateData.category.trim();
    if (updateData.image_url) updateData.image_url = updateData.image_url.trim();

    // FIX: Use findByIdAndUpdate instead of updateOne
    const updatedProduct = await Product.findByIdAndUpdate(
      parsedId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Produto atualizado com sucesso",
      data: {
        product: updatedProduct,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar produto",
    });
  }
};

/**
 * Deleta um produto
 * Apenas admin da mesma empresa pode deletar
 */
export const deleteProduct = async (
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

    const { id } = req.params;
    const parsedId: string = Array.isArray(id) ? id[0] : id;

    // Valida se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(parsedId)) {
      res.status(400).json({
        success: false,
        message: "ID de produto inválido",
      });
      return;
    }

    // Busca o usuário para verificar company_id
    const user = await User.findById(req.user.userId);
    
    if (!user || !user.company_id) {
      res.status(403).json({
        success: false,
        message: "Você não está vinculado a nenhuma empresa",
      });
      return;
    }

    // Busca o produto
    const product = await Product.findById(parsedId);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
      return;
    }

    // Verifica se o produto pertence à empresa do usuário (FIX: convert to strings)
    if (product.company_id !== user.company_id.toString()) {
      res.status(403).json({
        success: false,
        message: "Você só pode deletar produtos da sua própria empresa",
      });
      return;
    }

    await Product.findByIdAndDelete(parsedId);

    res.status(200).json({
      success: true,
      message: "Produto deletado com sucesso",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao deletar produto",
    });
  }
};