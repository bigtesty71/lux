
import React from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MemoryStorage from '../../lib/memory/storage';

export default function BlogPost({ post, error }) {
    if (error) return <div className="p-10 text-red-500">{error}</div>;
    if (!post) return <div className="p-10 text-white">No post data for this slug.</div>;

    return (
        <div className="p-20 text-white bg-black min-h-screen">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="text-gray-400 mb-8">Author: {post.author} | Date: {post.publishedAt}</div>
            <div className="prose prose-invert max-w-none">
                <p>Content length: {post.content?.length || 0} characters.</p>
                <hr className="my-8 border-gray-800" />
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
        </div>
    );
}

export async function getServerSideProps(context) {
    const { slug } = context.params;

    try {
        const storage = new MemoryStorage(999);
        const memory = await storage.getDomainMemoryByKey('blog_post', slug);

        if (!memory) {
            return { props: { post: null, error: 'Transmission not found.' } };
        }

        let data = {};
        try {
            if (memory.structured_data) {
                data = JSON.parse(memory.structured_data);
            } else if (memory.context) {
                data = JSON.parse(memory.context);
            }
        } catch (parseErr) {
            console.error('JSON parse error:', parseErr);
            data = {};
        }

        // Force serialize everything through JSON to strip Date objects etc.
        const post = JSON.parse(JSON.stringify({
            title: memory.value || slug,
            content: data.content || '',
            heroImage: data.heroImage || null,
            category: data.category || 'General',
            publishedAt: data.publishedAt || (memory.updated_at ? String(memory.updated_at) : null),
            author: data.author || 'CompanionAI'
        }));

        return {
            props: { post, error: null }
        };

    } catch (error) {
        console.error('Blog Fetch Error:', error);
        return { props: { post: null, error: 'Failed to access neural memory: ' + error.message } };
    }
}
