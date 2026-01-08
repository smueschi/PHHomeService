# Deployment Guide

This project is built with Next.js and is optimized for deployment on **Vercel**.

## Prerequisites

1.  **GitHub Repository**: Ensure your code is pushed to GitHub (you have already done this).
2.  **Supabase Project**: You need your Supabase URL and Anon Key.

## Deploying to Vercel (Recommended)

1.  Go to [Vercel.com](https://vercel.com) and log in.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository: `PHHomeService`.
4.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Environment Variables**: Expand this section and add the following from your `.env.local`:
        *   `NEXT_PUBLIC_SUPABASE_URL`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5.  Click **"Deploy"**.

Vercel will build and deploy your site. You will get a live URL (e.g., `ph-home-service.vercel.app`).

## Verifying the Deployment

1.  Visit your live URL.
2.  Try to **Log In**. Use the same credentials you created in your Supabase Auth user table, or sign up if you enabled sign-ups.
3.  Try to **Book a Service**.
    *   Complete the booking form.
    *   Check your Supabase `bookings` table to see if the record appears.

## Troubleshooting

*   **Build Failures**: Check the logs on Vercel. Common issues are missing environment variables or type errors.
*   **Database Connections**: If bookings aren't saving, ensure you added the Environment Variables correctly in Vercel settings.
