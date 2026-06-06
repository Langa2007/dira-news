import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Create account - Dira News'
};

export default function SignupPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Personal feed</p>
        <h1>Create your Dira account</h1>
        <p>Start with an account now. Preference syncing and deeper personalization can be layered in as the platform matures.</p>
        <AuthForm mode="signup" />
        <p className="auth-switch">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
