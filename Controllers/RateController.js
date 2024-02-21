const { Users, Stores, Products, UserActions } = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/Verify_user");
const Verify_Admin = require("../Middleware/Verify_Admin");
const RateProduct = async (req, res) => {
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

    const user_in_db = await Users.findById(req.params.userId);
    if (!user_in_db) {
        return res.status(404).json({ error: "User not found." });
    }

    try {
        const userId = req.params.userId;
        const productId = req.params.productId;
        const rate = req.body.rate;
        if (typeof rate != "number")
            return res.status(409).json({ error: "Rate must be a number" });
        if (rate < 1 || rate > 5)
            return res
                .status(409)
                .json({ error: "Rate must be between 1 and 5" });
        if (!userId || !productId || !rate)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const Already_Rated = product_in_db.Ratings.some(
            (item) => item.user == userId
        );
        if (Already_Rated) {
            return res
                .status(400)
                .json({ error: "user already rated this product." });
        }
        product_in_db.Ratings.push({ user: userId, rate: rate });
        await product_in_db.save();
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            userActions.Rated_Products.push({
                rate: rate,
                productId: req.params.productId,
                time: new Date(),
            });
            await userActions.save();
        }
        return res.status(200).json({
            message: "Product rated successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const Delete_RateProduct = async (req, res) => {
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
        const Already_Rated = product_in_db.Ratings.some(
            (item) => item.user == userId
        );
        if (!Already_Rated) {
            return res
                .status(400)
                .json({ error: "user didn't rate this product." });
        }
        const rateIndex = product_in_db.Ratings.findIndex(
            (item) => item.user == userId
        );
        product_in_db.Ratings.splice(rateIndex, 1);
        await product_in_db.save();
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            const productIndex = userActions.Rated_Products.findIndex(
                (item) => item.productId == productId
            );
            if (productIndex !== -1) {
                userActions.Rated_Products.splice(productIndex, 1);
                await userActions.save();
            }
        }
        return res.status(200).json({
            message: "Product rate deleted successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const get_product_userRate = async (req, res) => {
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
        const userRateindex = product_in_db.Ratings.findIndex((item) => {
            return item.user == userId;
        });

        if (userRateindex === -1)
            return res
                .status(404)
                .json({ error: "User didn't rate this product." });

        // const userRateindex = product_in_db.Ratings.find(

        //     (item) => item.user == userId
        // );
        // if (!userRateindex) {
        //     return res.status(404).json({ error: "User didn't rate this product." });
        // }
        return res.status(200).json(product_in_db.Ratings[userRateindex].rate);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const Edit_RateProduct = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({
            error: "Unauthorized: Invalid token",
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
        const rate = req.body.rate;
        if (!userId || !productId || !rate)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const userRateindex = product_in_db.Ratings.findIndex((item) => {
            return item.user == userId;
        });

        if (userRateindex === -1)
            return res
                .status(404)
                .json({ error: "User didn't rate this product." });
        const Already_Rated = product_in_db.Ratings.some(
            (item) => item.user == userId
        );
        if (!Already_Rated) {
            return res
                .status(400)
                .json({ error: "user didn't rate this product." });
        }
        product_in_db.Ratings[userRateindex].rate = rate;
        await product_in_db.save();
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            const productIndex = userActions.Rated_Products.findIndex(
                (item) => item.productId == productId
            );
            if (productIndex !== -1) {
                userActions.Rated_Products[productIndex].time = new Date();
                userActions.Rated_Products[productIndex].rate = rate;
                await userActions.save();
            }
        }
        return res.status(200).json({
            message: "Product rate edited successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const RateStore = async (req, res) => {
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
        const StoreId = req.params.storeId;
        const rate = req.body.rate;
        console.log(userId, StoreId, rate);
        if (typeof rate != "number")
            return res.status(409).json({ error: "Rate must be a number" });
        if (rate < 1 || rate > 5)
            return res
                .status(409)
                .json({ error: "Rate must be between 1 and 5" });
        if (!userId || !StoreId || !rate)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const Store_in_db = await Stores.findById(StoreId);
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        const Already_Rated = Store_in_db.Ratings.some(
            (item) => item.userId == userId
        );
        if (Already_Rated) {
            return res
                .status(400)
                .json({ error: "user already rated this Store." });
        }
        Store_in_db.Ratings.push({ userId: userId, rate: rate });
        await Store_in_db.save();
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            userActions.Rated_Stores.push({
                rate: rate,
                storeId: StoreId,
                time: new Date(),
            });
            await userActions.save();
        }
        return res.status(200).json({
            message: "Store rated successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const Delete_RateStore = async (req, res) => {
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
        const StoreId = req.params.storeId;
        if (!userId || !StoreId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const Store_in_db = await Stores.findById(StoreId);
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        const Already_Rated = Store_in_db.Ratings.some(
            (item) => item.userId == userId
        );
        if (!Already_Rated) {
            return res
                .status(400)
                .json({ error: "user didn't rate this Store." });
        }
        const rateIndex = Store_in_db.Ratings.findIndex(
            (item) => item.userId == userId
        );
        Store_in_db.Ratings.splice(rateIndex, 1);
        await Store_in_db.save();
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            const StoresIndex = userActions.Rated_Stores.findIndex(
                (item) => item.storeId == StoreId
            );
            if (StoresIndex !== -1) {
                userActions.Rated_Stores.splice(StoresIndex, 1);
                await userActions.save();
            }
        }
        return res.status(200).json({
            message: "Store rate deleted successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const get_Store_userRate = async (req, res) => {
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
        const StoreId = req.params.storeId;
        if (!userId || !StoreId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const Store_in_db = await Stores.findById(StoreId);
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        const userRate = Store_in_db.Ratings.find(
            (item) => item.userId == userId
        );
        if (!userRate) {
            return res
                .status(404)
                .json({ error: "User didn't rate this Store." });
        }
        return res.status(200).json(userRate);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const Edit_RateStore = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({
            error: "Unauthorized: Invalid token",
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
        const StoreId = req.params.storeId;
        const rate = req.body.rate;
        if (!userId || !StoreId || !rate)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const Store_in_db = await Stores.findById(StoreId);
        if (!Store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        const userRate = Store_in_db.Ratings.find(
            (item) => item.userId == userId
        );
        if (!userRate) {
            return res
                .status(404)
                .json({ error: "User didn't rate this Store." });
        }
        const Already_Rated = Store_in_db.Ratings.some(
            (item) => item.userId == userId
        );
        if (!Already_Rated) {
            return res
                .status(400)
                .json({ error: "user didn't rate this Store." });
        }
        userRate.rate = rate;
        await Store_in_db.save();
         const userActions = await UserActions.findOne({ userId: userId });
         if (userActions) {
             const StoresIndex = userActions.Rated_Stores.findIndex(
                 (item) => item.storeId == StoreId
             );
             if (StoresIndex !== -1) {
                 userActions.Rated_Stores[StoresIndex].time = new Date();
                 userActions.Rated_Stores[StoresIndex].rate = rate;
                 await userActions.save();
             }
         }
        return res.status(200).json({
            message: "Store rate edited successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
module.exports = {
    RateProduct,
    Delete_RateProduct,
    get_product_userRate,
    RateStore,
    Delete_RateStore,
    get_Store_userRate,
    Edit_RateStore,
    Edit_RateProduct,
};
