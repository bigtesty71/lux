import { SessionProvider } from 'next-auth/react';
import '../styles/chat-widget.css';
import '../styles/globals.css';

export default function App({
    Component,
    pageProps: { session, ...pageProps }
}) {
    return (
        <SessionProvider session={session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
}