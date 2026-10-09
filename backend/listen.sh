#!/bin/bash
STRIPE_API_KEY=$(grep STRIPE_SECRET_KEY .env | cut -d '=' -f2) \
./stripe listen --events checkout.session.completed --forward-to localhost:8224/api/stripe/webhook
