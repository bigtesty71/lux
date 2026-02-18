
import React, { useState } from 'react';
import Head from 'next/head';

export default function BlogPublisher() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [password, setPassword] = useState('');
    const [heroImage, setHeroImage] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        // Auto-generate slug from title
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    };

    const handleDownload = () => {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | CompanionAI Life</title>
    <style>
        body { background: #100c1a; color: white; font-family: sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
        h1 { color: #ff0e59; font-size: 2.5rem; }
        .hero { width: 100%; height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 2rem; }
        .meta { color: #888; font-size: 0.9rem; margin-bottom: 2rem; }
        a { color: #ff9140; }
    </style>
</head>
<body>
    ${heroImage ? `<img src="${heroImage}" class="hero" alt="Hero">` : ''}
    <h1>${title}</h1>
    <div className="meta">Category: ${category} | By CompanionAI</div>
    <div className="content">
        ${content.replace(/\n/g, '<br>')} 
    </div>
    <!-- Note: For full markdown support on your PHP site, you'd need a JS parser or render it server-side. This is a raw dump. -->
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}.html`;
        a.click();
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        setIsPublishing(true);
        setStatus('Analyzing content with Lux...');

        try {
            const res = await fetch('/api/blog/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, slug, content, password, heroImage, category })
            });

            const data = await res.json();

            if (data.success) {
                setStatus(`✅ Published! Lux has learned this. View at /blog/${slug}`);
                // Optional: Clear form
            } else {
                setStatus(`❌ Error: ${data.error}`);
            }
        } catch (err) {
            setStatus(`❌ Network Error: ${err.message}`);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#100c1a] text-white font-sans p-8">
            <Head>
                <title>CompanionAI Life Publisher</title>
            </Head>

            <div className="max-w-4xl mx-auto">
                <header className="mb-8 border-b border-gray-800 pb-4">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ff3131] to-[#ff9140]">
                        CompanionAI Life Publisher
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Publish content to the world and to Lux's Memory simultaneously.
                    </p>
                </header>

                <form onSubmit={handlePublish} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">TITLE</label>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                className="w-full bg-[#1a1625] border border-gray-700 rounded p-3 text-white focus:border-[#ff0e59] outline-none"
                                placeholder="Enter article title..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">SLUG (URL)</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full bg-[#1a1625] border border-gray-700 rounded p-3 text-gray-300 focus:border-[#ff0e59] outline-none"
                                placeholder="my-cool-article"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">HERO IMAGE URL</label>
                            <input
                                type="text"
                                value={heroImage}
                                onChange={(e) => setHeroImage(e.target.value)}
                                className="w-full bg-[#1a1625] border border-gray-700 rounded p-3 text-white focus:border-[#ff0e59] outline-none"
                                placeholder="https://... or /assets/images/tree.png"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">CATEGORY</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-[#1a1625] border border-gray-700 rounded p-3 text-gray-300 focus:border-[#ff0e59] outline-none"
                                placeholder="AI, Philosophy, Tech..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">CONTENT (MARKDOWN)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-96 bg-[#1a1625] border border-gray-700 rounded p-4 text-gray-200 font-mono focus:border-[#ff0e59] outline-none resize-y"
                            placeholder="# Write your thoughts here..."
                            required
                        />
                    </div>

                    <div className="flex items-center gap-4 border-t border-gray-800 pt-6">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">ADMIN KEY</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-[#1a1625] border border-gray-700 rounded p-2 text-white w-48 text-sm"
                                placeholder="Required"
                                required
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleDownload}
                            className="px-6 py-3 rounded-full border border-[#ff0e59] text-[#ff0e59] font-bold hover:bg-[#ff0e59]/10 transition-all"
                        >
                            DOWNLOAD HTML
                        </button>

                        <button
                            type="submit"
                            disabled={isPublishing}
                            className={`px-8 py-3 rounded-full font-bold text-white transition-all
                ${isPublishing
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#ff0e59] to-[#ff9140] hover:scale-105 shadow-lg shadow-red-900/50'
                                }`}
                        >
                            {isPublishing ? 'Analyzing & Saving...' : 'PUBLISH TO NEURAL NET'}
                        </button>
                    </div>

                    {status && (
                        <div className={`p-4 rounded border ${status.includes('Error') ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'}`}>
                            {status}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
