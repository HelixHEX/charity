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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
router.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    const { session, name, description } = body;
    try {
        if (session) {
            if (session.user.email === process.env.ADMIN) {
                const user = yield prisma.user.findFirst({ where: { email: session.email } });
                if (user) {
                    console.log(user);
                    const newCharity = yield prisma.charity.create({
                        data: {
                            name,
                            description,
                            creatorId: user.id
                        }
                    });
                    console.log(newCharity);
                    res.json({ success: true, charity: newCharity }).status(200);
                }
                else {
                    res.json({ success: false, error: 'User not found' }).status(404);
                }
            }
            else {
                res.json({ success: false, error: 'Invalid access' }).status(403);
            }
        }
        else {
            res.json({ success: false, error: 'User not logged' }).status(400);
        }
    }
    catch (e) {
        console.log(e);
        res.json({ success: false, error: 'An error has occurred' }).status(400);
    }
}));
router.get('/all', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const charities = yield prisma.charity.findMany({ include: { donations: true, likedBy: true }, orderBy: { name: 'asc' } });
        console.log(charities);
        res.json({ success: true, charities }).status(200);
    }
    catch (e) {
        console.log(e);
        res.json({ success: false, error: 'An error has occurred' }).status(400);
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req;
    const { id } = query;
    try {
        const charity = yield prisma.charity.findFirst({ where: { id }, include: { donations: { include: { user: true } } }, orderBy: { createdAt: 'asc' } });
        if (charity) {
            console.log(charity);
            res.json({ success: true, charity }).status(200);
        }
        else {
            res.json({ success: false, error: 'Charity not found' }).status(404);
        }
    }
    catch (e) {
        console.log(e);
        res.json({ success: false, error: 'An error has occurred' }).status(400);
    }
}));
module.exports = router;
//# sourceMappingURL=charity.js.map