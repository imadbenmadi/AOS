const { Users, Stores, Products ,UserActions} = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/Verify_user");
const Verify_Admin = require("../Middleware/Verify_Admin");
const CommentProduct = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;
        const Comment = req.body.Comment;
        if (!userId || !productId || !Comment)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const Already_Commentd = product_in_db.Comments.some(
            (item) => item.user == userId
        );
        if (Already_Commentd) {
            return res
                .status(400)
                .json({ error: "user already Commentd this product." });
        }
        product_in_db.Comments.push({ user: userId, Comment: Comment });
        await product_in_db.save();
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            userActions.Commented_Products.push({
                Comment: Comment,
                productId: productId,
                time: new Date(),
            });
            await userActions.save();
        }
        return res.status(200).json({
            message: "Product Commentd successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const Delete_CommentProduct = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const Already_Commentd = product_in_db.Comments.some(
            (item) => item.user == userId
        );
        if (!Already_Commentd) {
            return res
                .status(400)
                .json({ error: "user didn't Comment this product." });
        }
        const CommentIndex = product_in_db.Comments.findIndex(
            (item) => item.user == userId
        );
        product_in_db.Comments.splice(CommentIndex, 1);
        await product_in_db.save();
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            const CommentIndex = userActions.Commented_Products.findIndex(
                (item) => item.productId == productId
            );
            if(CommentIndex != -1){
                userActions.Commented_Products.splice(CommentIndex, 1);
                await userActions.save();
            }
        }
        return res.status(200).json({
            message: "Product Comment deleted successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const get_product_userComment = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const userComments = product_in_db.Comments.filter(
            (item) => item.user == userId
        );
        if (!userComments) {
            return res
                .status(404)
                .json({ error: "User didn't Comment this product." });
        }
        return res.status(200).json(userComments);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const Etid_Comment = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({
            error: "Unauthorized: Invalid",
        });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId || !req.body.Comment)
            return res.status(409).json({ error: "Messing Data" });

        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const userComments = product_in_db.Comments.filter(
            (item) => item.user == userId
        );
        if (!userComments) {
            return res
                .status(404)
                .json({ error: "User didn't Comment this product." });
        }
        const CommentIndex = product_in_db.Comments.findIndex(
            (item) => item.user == userId
        );
        if (CommentIndex == -1)
            return res.status(404).json({
                error: "User didn't Comment this product.",
            });
        
        if (product_in_db.Comments[CommentIndex].user != isAuth.decoded.userId)
            return res.status(401).json({
                error: "Unauthorized ",
            });
        else if (
            product_in_db.Comments[CommentIndex].Comment != req.body.Comment
        ) {
            product_in_db.Comments[CommentIndex].Comment = req.body.Comment;
            await product_in_db.save();
        }
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            const CommentIndex = userActions.Commented_Products.findIndex(
                (item) => item.productId == productId
            );
            if(CommentIndex != -1){
                userActions.Commented_Products[CommentIndex].Comment = req.body.Comment;
                userActions.Commented_Products[CommentIndex].time = new Date();
                await userActions.save();
            }
        }
        return res.status(200).json({
            message: "Product Comment edited successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
module.exports = {
    CommentProduct,
    Delete_CommentProduct,
    get_product_userComment,
    Etid_Comment,
};
