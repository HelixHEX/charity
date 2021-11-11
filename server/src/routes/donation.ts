import express from 'express'

const router = express.Router();

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

router.get('/:user', async (req, res) => {
    const { query } = req;
    let { session } = query as any
    try {
        session = JSON.parse(session)
        const user = await prisma.user.findFirst({ where: { email: session.user.email } })
        if (user) {
            const donations = await prisma.donation.findMany({ where: { userId: user.id }, include: { charity: true }, orderBy: { createdAt: 'desc' } })
            console.log(donations)
            res.json({ success: true, donations }).status(200)
        } else {
            res.json({ success: false, error: 'User not found' }).status(404)
        }
    } catch (e) {
        console.log(e)
        res.json({ success: false, error: 'An error has occurred' }).status(400)
    }
})


router.post('/', async (req, res) => {
    const { body } = req;
    const { charityId, session, amount, anonymous } = body;
    try {
        const user = await prisma.user.findFirst({ where: { email: session.user.email }, include: { donatedCharities: true } })
        if (user) {
            if (user.total_donated < 50000 && amount + user.total_donated < 50000) {
                const charity = await prisma.charity.findFirst({ where: { id: charityId } })
                if (charity) {
                    const donation = await prisma.donation.create({
                        data: {
                            amount: parseFloat(amount),
                            charityId: charity.id,
                            userId: user.id,
                            anonymous
                        }
                    })
                    await prisma.charity.update({
                        where: { id: charityId },
                        data: {
                            totalDonations: charity.totalDonations + parseFloat(amount)
                        }
                    })
                    if (!(user.donatedCharities.find(dCharity => dCharity.id === charity.id))) {
                        await prisma.user.update({
                            where: { email: session.user.email },
                            data: {
                                donatedCharities: { connect: { id: charity.id } }
                            }
                        })
                    }
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            total_donated: user.total_donated + parseFloat(amount)
                        }
                    })
                    console.log(donation)
                    console.log(charity)
                    res.json({ success: true }).status(200)
                } else {
                    console.log('charity not found')
                    res.json({ success: false, error: 'Charity not found' }).status(404)
                }
            } else {
                res.json({success: false, error: "You've run out of money :("}).status(400)
            }
        } else {
            console.log('user not found')
            res.json({ success: false, error: 'User not found' }).status(404)
        }
    } catch (e) {
        console.log(e)
        res.json({ success: false, error: 'An error has occurred' }).status(400)
    }
})

router.post('/clear', async (req, res) => {
    const { query } = req;
    let { email } = query as any
    try {
        if (email === process.env.ADMIN) {
            await prisma.donation.deleteMany({})
            // await prisma.charity.deleteMany({})
            res.json({ success: true })
        } else {
            res.json({ success: false, error: "invalid access" })
        }
    } catch (e) {
        console.log(e)
        res.json({ success: false, error: 'An error has occurred' }).status(400)
    }
});
module.exports = router