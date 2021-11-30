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
require("dotenv-safe/config");
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors = require('cors');
const morgan_1 = __importDefault(require("morgan"));
const cron = require("cron");
const fetch = require('node-fetch');
const user = require('./routes/user');
const charity = require('./routes/charity');
const donation = require('./routes/donation');
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    morgan_1.default.token('body', (req, res) => JSON.stringify(req.body));
    app.use((0, morgan_1.default)(":remote-user [:date[clf]] ':method :status :url HTTP/:http-version' :body ':user-agent' - :response-time ms"));
    app.use(express_1.default.json());
    app.use(cors({ origin: ['http://localhost:3000', 'https://charity.eliaswambugu.com', 'https://dev.charity.eliaswambugu.com'] }));
    const validateUser = (req, res, next) => {
        const { body, method, query } = req;
        let session;
        if (method === 'GET') {
            if (query.session) {
                session = query.session;
                session = JSON.parse(session);
            }
            else {
                if (req.path === '/') {
                    session = 'default-route';
                }
            }
        }
        else if (method === 'POST') {
            session = body.session;
        }
        if (session === 'default-route') {
            next();
        }
        else if (session) {
            if (session.user) {
                next();
            }
            else {
                console.log('user not found');
                res.json({ success: false, error: 'User not found' }).status(400);
            }
        }
        else {
            console.log('no session');
            res.json({ success: false, error: 'User not logged in' }).status(400);
        }
    };
    app.use(validateUser);
    app.use('/api/v1/user', user);
    app.use('/api/v1/donation', donation);
    app.use('/api/v1/charity', charity);
    app.get("/", (_, res) => {
        res.send("Hello world");
    });
    app.use((_, res) => {
        res.status(404).json({ status: "404" });
    });
    const cronJob = new cron.CronJob("0 */25 * * * *", () => {
        fetch(`${process.env.HEROKU_APP_NAME}`)
            .then((res) => console.log(`response-ok: ${res.ok}, status: ${res.status}`))
            .catch((error) => console.log(error));
    });
    cronJob.start();
    app.listen(process.env.PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${process.env.PORT}`);
    });
});
main();
//# sourceMappingURL=index.js.map