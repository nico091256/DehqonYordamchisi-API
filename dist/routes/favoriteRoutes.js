"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favoriteController_1 = require("../controllers/favoriteController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.post('/toggle', favoriteController_1.toggleFavorite);
router.get('/', favoriteController_1.getMyFavorites);
exports.default = router;
//# sourceMappingURL=favoriteRoutes.js.map