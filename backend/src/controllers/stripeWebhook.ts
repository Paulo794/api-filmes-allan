import { Request, Response } from 'express';
import Stripe from 'stripe';
import pool from '../db';

import { stripe } from '../config/stripe';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    // IMPORTANTE: req.body aqui precisa ser o raw buffer!
    if (!sig || !endpointSecret) {
      throw new Error('Assinatura ou Webhook Secret ausente.');
    }
    
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`⚠️ Erro na validação do Webhook: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Tratar os eventos do Stripe
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Recupera o ID do usuário que passamos lá na criação do Checkout
    const userId = session.metadata?.userId;
    const stripeCustomerId = session.customer as string;

    if (userId) {
      try {
        await pool.query(
          'UPDATE usuarios SET is_premium = ?, stripe_customer_id = ? WHERE id = ?',
          [true, stripeCustomerId, parseInt(userId)]
        );
        console.log(`✅ Usuário ${userId} agora é PREMIUM! Pagamento confirmado.`);
      } catch (dbError) {
        console.error('Erro ao atualizar usuário para premium no banco:', dbError);
      }
    }
  }

  // Retorna 200 OK rapidamente para o Stripe saber que recebemos
  res.status(200).json({ received: true });
};
