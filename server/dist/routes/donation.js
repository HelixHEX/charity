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
router.get('/:user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req;
    let { session } = query;
    try {
        session = JSON.parse(session);
        const user = yield prisma.user.findFirst({ where: { email: session.user.email } });
        if (user) {
            const donations = yield prisma.donation.findMany({ where: { userId: user.id }, include: { charity: true }, orderBy: { createdAt: 'desc' } });
            console.log(donations);
            res.json({ success: true, donations }).status(200);
        }
        else {
            res.json({ success: false, error: 'User not found' }).status(404);
        }
    }
    catch (e) {
        console.log(e);
        res.json({ success: false, error: 'An error has occurred' }).status(400);
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    const { charityId, session, amount, anonymous } = body;
    try {
        const user = yield prisma.user.findFirst({ where: { email: session.user.email }, include: { donatedCharities: true } });
        if (user) {
            if (user.total_donated < 50000 && amount + user.total_donated < 50000) {
                const charity = yield prisma.charity.findFirst({ where: { id: charityId } });
                if (charity) {
                    const donation = yield prisma.donation.create({
                        data: {
                            amount: parseFloat(amount),
                            charityId: charity.id,
                            userId: user.id,
                            anonymous
                        }
                    });
                    yield prisma.charity.update({
                        where: { id: charityId },
                        data: {
                            totalDonations: charity.totalDonations + parseFloat(amount)
                        }
                    });
                    if (!(user.donatedCharities.find(dCharity => dCharity.id === charity.id))) {
                        yield prisma.user.update({
                            where: { email: session.user.email },
                            data: {
                                donatedCharities: { connect: { id: charity.id } }
                            }
                        });
                    }
                    yield prisma.user.update({
                        where: { id: user.id },
                        data: {
                            total_donated: user.total_donated + parseFloat(amount)
                        }
                    });
                    console.log(donation);
                    console.log(charity);
                    res.json({ success: true }).status(200);
                }
                else {
                    console.log('charity not found');
                    res.json({ success: false, error: 'Charity not found' }).status(404);
                }
            }
            else {
                res.json({ success: false, error: "You've run out of money :(" }).status(400);
            }
        }
        else {
            console.log('user not found');
            res.json({ success: false, error: 'User not found' }).status(404);
        }
    }
    catch (e) {
        console.log(e);
        res.json({ success: false, error: 'An error has occurred' }).status(400);
    }
}));
router.post('/clear', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req;
    let { email } = query;
    try {
        if (email === process.env.ADMIN) {
            yield prisma.donation.deleteMany({});
            res.json({ success: true });
        }
        else {
            res.json({ success: false, error: "invalid access" });
        }
    }
    catch (e) {
        console.log(e);
        res.json({ success: false, error: 'An error has occurred' }).status(400);
    }
}));
module.exports = router;
//# sourceMappingURL=donation.js.map