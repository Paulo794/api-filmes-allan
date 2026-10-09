import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { stripe } from '../config/stripe';

export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.APP_URL || 'http://localhost:3001';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/success`,
      cancel_url: `${appUrl}/cancel`,
      metadata: {
        userId: userId.toString(),
      },
    } as any);

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Erro ao criar checkout session:', error);
    res.status(500).json({ error: 'Erro interno ao comunicar com o provedor de pagamentos.' });
  }
};
