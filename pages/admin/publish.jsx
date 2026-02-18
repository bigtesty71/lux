
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
    const [isTransmitting, setIsTransmitting] = useState(false);

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        // Auto-generate slug from title
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    };

    const generateSimpleHtml = () => {
        return `<!DOCTYPE html>
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
</body>
</html>`;
    };

    const handleDownload = () => {
        const htmlContent = generateSimpleHtml();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}.html`;
        a.click();
    };

    const handleSendToGateway = async (e) => {
        if (e) e.preventDefault();
        setIsTransmitting(true);
        setStatus('📡 Sending to External Gateway...');

        try {
            const fullHtml = generateSimpleHtml();
            const res = await fetch('https://lux-3er5.vercel.app/api/blog/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    slug,
                    content: fullHtml,
                    plainText: content,
                    password,
                    category,
                    heroImage
                })
            });

            if (res.ok) {
                setStatus('✅ SUCCESSFULLY SENT TO GATEWAY!');
            } else {
                const data = await res.json();
                setStatus(`❌ Gateway Error: ${data.error || res.statusText}`);
            }
        } catch (err) {
            setStatus(`❌ Transmission Error: ${err.message}`);
        } finally {
            setIsTransmitting(false);
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
                        Download your post or send it directly to the gateway.
                    </p>
                </header>

                <form className="space-y-6">
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
                        <label className="block text-sm font-semibold text-gray-400 mb-2">CONTENT (TEXT/HTML)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-96 bg-[#1a1625] border border-gray-700 rounded p-4 text-gray-200 font-mono focus:border-[#ff0e59] outline-none resize-y"
                            placeholder="Write your thoughts here..."
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
                                className="bg-[#1a1625] border border-gray-700 rounded p-2 text-white w-48 text-sm focus:border-[#ff0e59] outline-none"
                                placeholder="Required"
                                required
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleDownload}
                            className="px-6 py-3 rounded-full border border-gray-600 text-gray-300 font-bold hover:bg-gray-800 hover:text-white transition-all text-sm uppercase"
                        >
                            DOWNLOAD HTML
                        </button>

                        <button
                            type="button"
                            onClick={handleSendToGateway}
                            disabled={isTransmitting}
                            className={`px-8 py-3 rounded-full font-bold text-white transition-all text-sm uppercase
                                ${isTransmitting
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#ff0e59] to-[#ff9140] hover:scale-105 shadow-lg shadow-red-900/50'
                                }`}
                        >
                            {isTransmitting ? 'Sending...' : 'SEND TO GATEWAY'}
                        </button>
                    </div>

                    {status && (
                        <div className={`p-4 rounded border ${status.includes('Error') || status.includes('Failed') ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'}`}>
                            {status}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
