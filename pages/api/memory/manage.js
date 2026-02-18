
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import MemoryStorage from '../../../lib/memory/storage';
import MemoryRetrieval from '../../../lib/memory/retrieval';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const memberId = session.user.id;
  const storage = new MemoryStorage(memberId);
  const retrieval = new MemoryRetrieval(memberId);

  switch (req.method) {
    case 'GET':
      // Search memories
      const { q, limit = 20 } = req.query;

      if (q) {
        const results = await retrieval.retrieveRelevant(q, parseInt(limit));
        return res.status(200).json({ results });
      } else {
        // Just return a generic message or handle recent
        return res.status(200).json({ message: 'Input search query to retrieve memories.' });
      }

    case 'POST':
      // Save memory (explicit user request)
      const memoryData = req.body;
      const result = await storage.saveMemory(memoryData);

      return res.status(201).json({
        success: true,
        message: 'Memory saved successfully',
        result
      });

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}