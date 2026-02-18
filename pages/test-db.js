
import { query } from '../lib/db/connection';

export default function TestDB({ status, message, count }) {
    return (
        <div style={{ padding: '50px', color: 'white', background: '#100c1a', minHeight: '100vh' }}>
            <h1>System Diagnostics</h1>
            <p>Server Status: <strong>{status}</strong></p>
            <p>Message: {message}</p>
            <p>Blog Post Count: {count}</p>
        </div>
    );
}

export async function getServerSideProps() {
    try {
        // fast query
        const rows = await query('SELECT COUNT(*) as count FROM domain_memory WHERE category = "blog_post"');
        return {
            props: {
                status: 'ONLINE',
                message: 'Database connection successful.',
                count: rows[0].count
            }
        };
    } catch (error) {
        return {
            props: {
                status: 'ERROR',
                message: error.message,
                count: 0
            }
        };
    }
}
