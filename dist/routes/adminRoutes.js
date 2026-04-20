"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['ADMIN']));
router.get('/dashboard', adminController_1.getDashboardStats);
router.get('/users', adminController_1.getAllUsers);
router.patch('/users/:id', adminController_1.manageUser);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map