import 'dotenv-safe/config'
import "reflect-metadata"

import express from 'express';

// @ts-ignore
const cors = require('cors')

import morgan from 'morgan'

const cron = require("cron");

//entities

//routes 
const user = require('./routes/user')
const charity = require('./routes/charity')
const donation = require('./routes/donation')

const main = async () => {
    const app = express();

    // @ts-ignore
    morgan.token('body', (req, res) => JSON.stringify(req.body));
    app.use(morgan(":remote-user [:date[clf]] ':method :status :url HTTP/:http-version' :body ':user-agent' - :response-time ms"));

    app.use(express.json());

    //cors 
    app.use(cors({ origin: ['http://localhost:3000', 'https://charity.eliaswambugu.com', 'https://dev.charity.eliaswambugu.com'] }))

    //middleware


    const validateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { body, method, query } = req;
        let session
        if (method === 'GET') {
            session = query.session as any 
            session = JSON.parse(session)
        } else if (method === 'POST') {
            session = body.session
        }

        if (session) {
            if (session.user) {
                next()
            } else {
                console.log('user not found')
                res.json({ success: false, error: 'User not found' }).status(400)
            }
        } else {
            console.log('no session')
            res.json({ success: false, error: 'User not logged in' }).status(400)
        }
    }
    app.use(validateUser)

    //routes
    app.use('/api/v1/user', user)
    app.use('/api/v1/donation', donation)
    app.use('/api/v1/charity', charity)

    app.get("/", (_, res: express.Response) => {
        res.send("Hello world");
    });

    app.use((_, res: express.Response) => {
        res.status(404).json({ status: "404" });
    });

    const cronJob = new cron.CronJob("0 */25 * * * *", () => {
        fetch(`https://${process.env.HEROKU_APP_NAME}.herokuapp.com`)
          .then((res:any) =>
            console.log(`response-ok: ${res.ok}, status: ${res.status}`)
          )
          .catch((error:any) => console.log(error));
      });
    
      cronJob.start();

    app.listen(process.env.PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${process.env.PORT}`);
    });
}

main()