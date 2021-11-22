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
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req;
    let { email } = query;
    try {
        const user = yield prisma.user.findFirst({ where: { email }, include: { donations: { orderBy: { createdAt: 'asc' }, include: { charity: true } }, donatedCharities: true } });
        if (user) {
            const users = yield prisma.user.findMany({ orderBy: { total_donated: 'desc' } });
            let ranking = users.findIndex(aUser => aUser.email === email) + 1;
            res.json({ success: true, user, ranking }).status(200);
        }
        else {
            res.json({ success: false, error: "user not found" }).status(404);
        }
    }
    catch (e) {
        console.log(e);
        res.json({ success: false, error: 'An error has occurred' }).status(400);
    }
}));
router.get('/ranking', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req;
    let { session } = query;
    session = JSON.parse(session);
    try {
        const users = yield prisma.user.findMany({ orderBy: { total_donated: 'asc' } });
        let ranking = users.findIndex(aUser => aUser.email === session.user.email) + 1;
        console.log(ranking);
        res.json({ success: true, ranking }).status(200);
    }
    catch (e) {
        console.log(e);
        res.json({ success: false, error: 'An error has occurred' }).status(400);
    }
}));
router.get('/all', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({ orderBy: { total_donated: 'desc' }, include: { donations: { orderBy: { createdAt: 'desc' } }, donatedCharities: true } });
        console.log(users);
        res.json({ success: true, users }).status(200);
    }
    catch (e) {
        console.log(e);
        res.json({ success: false, error: 'An error has occurred' }).status(400);
    }
}));
module.exports = router;
//# sourceMappingURL=user.js.map