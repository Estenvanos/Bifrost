"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Cria um novo produto
 * Apenas admins/vendors com companyId podem criar produtos
 */
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Usuário não autenticado",
            });
            return;
        }
        // Busca o usuário para pegar o companyId
        const user = yield User_1.User.findById(req.user.userId);
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
        const { name, 
        // legacy support or map input
        product_name, description, image_url, // simple input
        images, // array input
        price, category, tags } = req.body;
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
        let productImages = [];
        if (images && Array.isArray(images)) {
            productImages = images;
        }
        else if (image_url) {
            productImages = [{ url: image_url, isPrimary: true }];
        }
        // Generate slug
        const slug = productName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
        // Cria o produto com o companyId do usuário
        const newProduct = yield Product_1.Product.create({
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
    }
    catch (error) {
        console.error("Erro ao criar produto:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao criar produto",
        });
    }
});
exports.createProduct = createProduct;
/**
 * Busca todos os produtos com paginação e filtros
 */
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = "1", limit = "10", category, tags, minPrice, maxPrice, companyId, // corrected query param
         } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Constrói o filtro
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (tags) {
            filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = parseFloat(minPrice);
            if (maxPrice)
                filter.price.$lte = parseFloat(maxPrice);
        }
        if (companyId) {
            filter.companyId = companyId;
        }
        // Busca os produtos
        const products = yield Product_1.Product.find(filter)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const totalProducts = yield Product_1.Product.countDocuments(filter);
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
    }
    catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar produtos",
        });
    }
});
exports.getAllProducts = getAllProducts;
/**
 * Busca um produto por ID
 */
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const parsedId = Array.isArray(id) ? id[0] : id;
        // Valida se o ID é válido
        if (!mongoose_1.default.Types.ObjectId.isValid(parsedId)) {
            res.status(400).json({
                success: false,
                message: "ID de produto inválido",
            });
            return;
        }
        const product = yield Product_1.Product.findById(parsedId);
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
    }
    catch (error) {
        console.error("Erro ao buscar produto:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar produto",
        });
    }
});
exports.getProductById = getProductById;
/**
 * Atualiza um produto
 */
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Usuário não autenticado",
            });
            return;
        }
        const { id } = req.params;
        const parsedId = Array.isArray(id) ? id[0] : id;
        const updateData = req.body;
        // Valida se o ID é válido
        if (!mongoose_1.default.Types.ObjectId.isValid(parsedId)) {
            res.status(400).json({
                success: false,
                message: "ID de produto inválido",
            });
            return;
        }
        // Busca o usuário para verificar companyId
        const user = yield User_1.User.findById(req.user.userId);
        if (!user || !user.companyId) {
            res.status(403).json({
                success: false,
                message: "Você não está vinculado a nenhuma empresa",
            });
            return;
        }
        // Busca o produto
        const product = yield Product_1.Product.findById(parsedId);
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
        if (updateData.name)
            updateData.name = updateData.name.trim();
        if (updateData.description)
            updateData.description = updateData.description.trim();
        if (updateData.category)
            updateData.category = updateData.category.trim();
        const updatedProduct = yield Product_1.Product.findByIdAndUpdate(parsedId, { $set: updateData }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            message: "Produto atualizado com sucesso",
            data: {
                product: updatedProduct,
            },
        });
    }
    catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao atualizar produto",
        });
    }
});
exports.updateProduct = updateProduct;
/**
 * Deleta um produto
 */
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Usuário não autenticado",
            });
            return;
        }
        const { id } = req.params;
        const parsedId = Array.isArray(id) ? id[0] : id;
        if (!mongoose_1.default.Types.ObjectId.isValid(parsedId)) {
            res.status(400).json({
                success: false,
                message: "ID de produto inválido",
            });
            return;
        }
        const user = yield User_1.User.findById(req.user.userId);
        if (!user || !user.companyId) {
            res.status(403).json({
                success: false,
                message: "Você não está vinculado a nenhuma empresa",
            });
            return;
        }
        const product = yield Product_1.Product.findById(parsedId);
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
        yield Product_1.Product.findByIdAndDelete(parsedId);
        res.status(200).json({
            success: true,
            message: "Produto deletado com sucesso",
            data: {
                product,
            },
        });
    }
    catch (error) {
        console.error("Erro ao deletar produto:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao deletar produto",
        });
    }
});
exports.deleteProduct = deleteProduct;
