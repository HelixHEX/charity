import express from 'express'

const router = express.Router();

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

router.post('/create', async (req: express.Request, res: express.Response) => {
    const { body } = req;
    const { session, name, description } = body;
    try {
        if (session) {
            if (session.user.email === process.env.ADMIN) {
                const user = await prisma.user.findFirst({ where: { email: session.email } })
                if (user) {
                    console.log(user)
                    const newCharity = await prisma.charity.create({
                        data: {
                            name,
                            description,
                            creatorId: user.id
                        }
                    })
                    console.log(newCharity)
                    res.json({ success: true, charity: newCharity }).status(200)
                } else {
                    res.json({ success: false, error: 'User not found' }).status(404)
                }

            } else {
                res.json({ success: false, error: 'Invalid access' }).status(403)
            }
        } else {
            res.json({ success: false, error: 'User not logged' }).status(400)
        }
    } catch (e) {
        console.log(e)
        res.json({ success: false, error: 'An error has occurred' }).status(400)
    }
})

router.get('/all', async (_, res) => {
    try {
        const charities = await prisma.charity.findMany({ include: { donations: true, likedBy: true }, orderBy: {name: 'asc'} })
        console.log(charities)
        res.json({ success: true, charities }).status(200)
    } catch (e) {
        console.log(e)
        res.json({ success: false, error: 'An error has occurred' }).status(400)
    }
})

router.get('/:id', async (req, res) => {
    const { query } = req;
    const { id } = query as any
    try {
        const charity = await prisma.charity.findFirst({ where: { id }, include: { donations: { include: { user: true } } }, orderBy: {createdAt: 'asc'} })
        if (charity) {
            console.log(charity)
            res.json({ success: true, charity }).status(200)
        } else {
            res.json({ success: false, error: 'Charity not found' }).status(404)
        }
    } catch (e) {
        console.log(e)
        res.json({ success: false, error: 'An error has occurred' }).status(400)
    }
})


module.exports = router