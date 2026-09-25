import type { Metadata } from 'next';
import type { FC } from 'react';
import { NewPasswordForm } from './new-password-form';
import { RequestResetForm } from './request-reset-form';

export const metadata: Metadata = { title: 'Reset your password', robots: { index: false } };

// The emailed link lands here via better-auth with ?token=… or, if it expired, ?error=INVALID_TOKEN.
const ResetPasswordPage: FC<PageProps<'/reset-password'>> = async ({ searchParams }) => {
  const { token, error } = await searchParams;

  return (
    <main className='mx-auto max-w-md px-6 py-24'>
      <div className='rounded-4xl bg-paper p-8'>
        {typeof token === 'string' ? (
          <NewPasswordForm token={token} />
        ) : (
          <RequestResetForm hasExpiredLink={error !== undefined} />
        )}
      </div>
    </main>
  );
};

export default ResetPasswordPage;
