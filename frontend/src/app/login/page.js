import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Login - Dira News'
};

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Account</p>
        <h1>Login to your Dira feed</h1>
        <p>Return to saved preferences and personalized reading as the public website grows.</p>
        <AuthForm mode="login" />
        <p className="auth-switch">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
