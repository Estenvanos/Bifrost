import { Response } from "express";
import { Product, ProductDoc } from "../models/Product";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";
import mongoose from "mongoose";

/**
 * Cria um novo produto
 * Apenas admins/vendors com companyId podem criar produtos
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

    // Busca o usuário para pegar o companyId
    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
      return;
    }

    // Verifica se o usuário tem uma empresa vinculada
    if (!user.companyId) {
      res.status(403).json({
        success: false,
        message: "Você precisa estar vinculado a uma empresa para criar produtos",
      });
      return;
    }

    const {
      name,
      // legacy support or map input
      product_name,
      description,
      image_url, // simple input
      images, // array input
      price,
      category,
      tags
    } = req.body;

    const productName = name || product_name;

    // Validação de campos obrigatórios
    if (!productName || !description || !price || !category) {
      res.status(400).json({
        success: false,
        message: "Campos obrigatórios: name (or product_name), description, price, category",
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

    // Prepare images
    let productImages: any[] = [];
    if (images && Array.isArray(images)) {
      productImages = images;
    } else if (image_url) {
      productImages = [{ url: image_url, isPrimary: true }];
    }

    // Generate slug
    const slug = productName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    // Cria o produto com o companyId do usuário
    const newProduct = await Product.create({
      name: productName.trim(),
      slug,
      companyId: user.companyId,
      description: description.trim(),
      images: productImages,
      price,
      category: category.trim(),
      tags: tags || [],
      ratings: { average: 0, count: 0 },
      status: 'active'
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
      companyId, // corrected query param
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

    if (companyId) {
      filter.companyId = companyId;
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

    // Busca o usuário para verificar companyId
    const user = await User.findById(req.user.userId);

    if (!user || !user.companyId) {
      res.status(403).json({
        success: false,
        message: "Você não está vinculado a nenhuma empresa",
      });
      return;
    }

    // Busca o produto
    const product = await Product.findById(parsedId) as ProductDoc;

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
      return;
    }

    // Verifica se o produto pertence à empresa do usuário
    if (product.companyId.toString() !== user.companyId.toString()) {
      res.status(403).json({
        success: false,
        message: "Você só pode atualizar produtos da sua própria empresa",
      });
      return;
    }

    // Remove campos que não devem ser atualizados
    delete updateData._id;
    delete updateData.companyId;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.ratings; // ratings managed separately?

    // Valida o preço se fornecido
    if (updateData.price !== undefined && updateData.price <= 0) {
      res.status(400).json({
        success: false,
        message: "O preço deve ser maior que zero",
      });
      return;
    }

    // Sanitiza strings
    if (updateData.product_name) {
      updateData.name = updateData.product_name.trim();
      delete updateData.product_name;
    }
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    if (updateData.category) updateData.category = updateData.category.trim();

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

    if (!mongoose.Types.ObjectId.isValid(parsedId)) {
      res.status(400).json({
        success: false,
        message: "ID de produto inválido",
      });
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user || !user.companyId) {
      res.status(403).json({
        success: false,
        message: "Você não está vinculado a nenhuma empresa",
      });
      return;
    }

    const product = await Product.findById(parsedId) as ProductDoc;

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
      return;
    }

    if (product.companyId.toString() !== user.companyId.toString()) {
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