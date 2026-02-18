import Head from 'next/head';
import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget.jsx';
import { query } from '@/lib/db/connection.js';

export default function Home({ posts }) {
  return (
    <div className="min-h-screen bg-[#100c1a] font-sans text-white">
      <Head>
        <title>CompanionAI Life | The Revolution</title>
        <meta name="description" content="Join the AI Intelligence Revolution with Lux." />
      </Head>

      {/* Hero Section - Full Screen for maximum impact, no overlay */}
      <header className="relative w-full h-screen overflow-hidden">
        <img
          src="/assets/images/hero.png"
          alt="CompanionAI Life - Change is Here"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </header>

      {/* Main Content - Starts naturally below the full-screen hero */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        {/* Rolling Gallery of Blogs */}
        <section>
          <h2 className="text-5xl font-[Komorebi] mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#ff3131] to-[#ff9140]" style={{ fontFamily: 'Komorebi, sans-serif' }}>
            Latest Transmissions
          </h2>

          {(!posts || posts.length === 0) ? (
            <div className="text-center text-gray-500 py-20">
              <p>No transmissions received yet.</p>
              <Link href="/admin/publish" className="text-[#ff0e59] hover:underline mt-4 block">
                Initialize Transmission Protocol (Admin)
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                  <div className="bg-[#1a1625] rounded-xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 border border-gray-800 hover:border-[#ff0e59] flex flex-col h-full">
                    {/* Card Image - Strict Height */}
                    <div className="h-48 w-full overflow-hidden relative bg-black">
                      {post.heroImage ? (
                        <img
                          src={post.heroImage}
                          alt={post.title}
                          className="w-full h-full object-cover absolute inset-0"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#2a2438] to-[#100c1a] flex items-center justify-center">
                          <span className="text-4xl">🧬</span>
                        </div>
                      )}

                      {post.category && (
                        <span className="absolute top-4 right-4 bg-[#ff0e59] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {post.category}
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-[#ff0e59] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {getFormattedDate(post.publishedAt)} • By CompanionAI
                      </p>
                      <div className="text-gray-500 text-sm line-clamp-3">
                        {/* Strip HTML if needed here, but excerpt logic below handles substring */}
                        {post.excerpt.replace(/<[^>]+>/g, '')}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="py-12 text-center text-gray-400 border-t border-gray-900 mt-20">
        <p className="text-lg font-medium mb-4">
          Lux AI developed by <a href="https://companain.life" style={{ color: '#ff9140', fontWeight: 'bold' }} className="hover:text-yellow-300 hover:underline">Companion AI Life</a> with <a href="https://memorykeep.cloud" style={{ color: '#ff9140', fontWeight: 'bold' }} className="hover:text-yellow-300 hover:underline">MemoryKeep</a> technology.
        </p>
        <p className="text-sm text-gray-600">© 2026 CompanionAI Life. The Revolution will be Digitized.</p>
      </footer>

      <ChatWidget />
    </div>
  );
}

function getFormattedDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return 'Unknown Date';
  }
}

export async function getServerSideProps() {
  try {
    // 2. Query all blog posts directly using imported query function
    // We select category='blog_post' and order by updated_at (SCHEMA FIX)
    const rows = await query(
      `SELECT * FROM domain_memory WHERE category = 'blog_post' ORDER BY updated_at DESC LIMIT 20`
    );

    const posts = rows.map(row => {
      let data = { category: 'General', publishedAt: null };
      try {
        // SCHEMA FIX: context -> structured_data
        if (row.structured_data) {
          data = JSON.parse(row.structured_data);
        } else if (row.context) { // Fallback just in case
          data = JSON.parse(row.context);
        }
      } catch (e) {
        console.error('JSON Parse Error for row:', row.id);
      }

      return {
        slug: row.key_field,
        title: row.value,
        heroImage: data.heroImage || null,
        category: data.category || 'Legacy Archive',
        publishedAt: data.publishedAt || row.updated_at,
        excerpt: data.content ? data.content.substring(0, 150) + '...' : ''
      };
    });

    return {
      props: { posts: JSON.parse(JSON.stringify(posts)) },
    };

  } catch (error) {
    console.error('Homepage Fetch Error:', error);
    return { props: { posts: [] } };
  }
}