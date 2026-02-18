
import React from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MemoryStorage from '../../lib/memory/storage';

export default function BlogPost({ post, error }) {
    if (error) {
        return (
            <div className="min-h-screen bg-[#100c1a] text-white flex items-center justify-center font-sans">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-[#ff0e59] mb-4">404</h1>
                    <p className="text-gray-400">{error}</p>
                    <a href="/" className="mt-8 inline-block text-white border border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition">Return Home</a>
                </div>
            </div>
        );
    }

    if (!post) {
        return <div className="p-8 text-white bg-[#100c1a] min-h-screen font-sans">Loading...</div>;
    }

    const { title, content, publishedAt, author, heroImage, category } = post;

    // Render raw HTML if legacy content (starts with <)
    const isHtml = content.trim().startsWith('<');

    return (
        <div className="min-h-screen bg-[#100c1a] text-white font-sans">
            <Head>
                <title>{title} | CompanionAI Life</title>
            </Head>

            {/* Hero Image Section - Hide if legacy HTML to avoid duplicates */}
            {(heroImage && !isHtml) && (
                <div className="w-full h-80 relative overflow-hidden bg-[#000000]">
                    <img
                        src={heroImage}
                        alt={title}
                        className="w-full h-full object-cover opacity-90"
                        style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#100c1a] via-transparent to-transparent"></div>
                </div>
            )}

            {/* Main Content Area */}
            <main className={`max-w-3xl mx-auto px-6 pb-20 ${(heroImage && !isHtml) ? '-mt-20 relative z-10' : 'pt-20'}`}>
                <header className="mb-10 text-center">
                    {category && (
                        <span className="inline-block bg-[#ff0e59] text-white text-xs font-bold px-3 py-1 rounded-full mb-4 shadow-lg">
                            {category}
                        </span>
                    )}
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#ff3131] via-[#ff0e59] to-[#ff9140] mb-4 drop-shadow-lg" style={{ fontFamily: 'Komorebi, sans-serif' }}>
                        {title}
                    </h1>
                    <div className="flex justify-center items-center text-gray-400 text-sm gap-4">
                        <span>By {author}</span>
                        <span>•</span>
                        <span>{new Date(publishedAt).toLocaleDateString()}</span>
                    </div>
                </header>

                <article className="prose prose-invert prose-lg max-w-none">
                    {/* If content is raw HTML (Legacy), render dangerously. Else Markdown. */}
                    {isHtml ? (
                        <div
                            className="legacy-post-content"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-gray-200">
                            {content}
                        </ReactMarkdown>
                    )}
                </article>

                <div className="mt-16 border-t border-gray-800 pt-8 text-center">
                    <p className="text-gray-400 mb-4">Want to dive deeper into these concepts?</p>
                    <button
                        onClick={() => window.location.href = `/?message=I just read "${title}". What are your thoughts?`}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff0e59] to-[#ff9140] text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-orange-900/50"
                    >
                        Discuss with Lux
                    </button>
                </div>
                <footer className="py-12 text-center text-gray-400 border-t border-gray-900 mt-20">
                    <p className="text-lg font-medium mb-4">
                        Lux AI developed by <a href="https://companain.life" style={{ color: '#ff9140', fontWeight: 'bold' }} className="hover:text-yellow-300 hover:underline">Companion AI Life</a> with <a href="https://memorykeep.cloud" style={{ color: '#ff9140', fontWeight: 'bold' }} className="hover:text-yellow-300 hover:underline">MemoryKeep</a> technology.
                    </p>
                    <p className="text-sm text-gray-600">© 2026 CompanionAI Life. The Revolution will be Digitized.</p>
                </footer>
            </main>
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

        // Ensure all values are serializable (no Date objects, no undefined)
        return {
            props: {
                post: {
                    title: memory.value || slug,
                    content: data.content || '',
                    heroImage: data.heroImage || null,
                    category: data.category || 'General',
                    publishedAt: data.publishedAt || (memory.updated_at ? String(memory.updated_at) : null),
                    author: data.author || 'CompanionAI'
                },
                error: null
            }
        };

    } catch (error) {
        console.error('Blog Fetch Error:', error);
        return { props: { post: null, error: 'Failed to access neural memory: ' + error.message } };
    }
}
