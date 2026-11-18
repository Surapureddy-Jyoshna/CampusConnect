// CampusConnect - Batch-Personalized RAG Engine Implementation
// Based on: "CampusConnect – A RAG-based AI Chatbot for College Information Retrieval"
// Supports Batch-Specific Personalization (P1, P2, E1, E2, E3, E4) and Batch Notices

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll',
  'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s',
  'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s',
  'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your',
  'yours', 'yourself', 'yourselves', 'please', 'tell', 'want', 'know', 'give', 'my', 'our'
]);

export function cleanAndNormalize(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s\d]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text, removeStopwords = true) {
  const cleaned = cleanAndNormalize(text);
  if (!cleaned) return [];
  const words = cleaned.split(' ').filter(w => w.length > 1);
  if (!removeStopwords) return words;
  return words.filter(w => !STOPWORDS.has(w));
}

export function stem(word) {
  if (word.length <= 3) return word;
  return word.replace(/(ing|edly|ingly|ed|ies|es|s|ly|ment|tion)$/, '');
}

export function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export function fuzzySimilarity(str1, str2) {
  const s1 = cleanAndNormalize(str1);
  const s2 = cleanAndNormalize(str2);
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const dist = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return Math.max(0, 1 - dist / maxLen);
}

export function segmentDocument(text, chunkSize = 200, overlap = 40) {
  const words = text.split(/\s+/);
  if (words.length <= chunkSize) {
    return [text.trim()];
  }

  const chunks = [];
  let startIndex = 0;
  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkWords = words.slice(startIndex, endIndex);
    chunks.push(chunkWords.join(' '));
    if (endIndex >= words.length) break;
    startIndex += chunkSize - overlap;
  }
  return chunks;
}

/**
 * Batch-Personalized RAG Query Engine
 * @param {string} query - Student question
 * @param {string} studentBatch - 'P1' | 'P2' | 'E1' | 'E2' | 'E3' | 'E4' | 'All'
 * @param {Array} knowledgeItems - FAQ / Knowledge items
 * @param {Array} documentChunks - Segmented text chunks
 * @param {Array} notices - Live batch notices
 */
export function queryRAGEngine(query, studentBatch = 'E3', knowledgeItems = [], documentChunks = [], notices = []) {
  const startTime = Date.now();
  const cleanedQuery = cleanAndNormalize(query);
  const queryTokens = tokenize(query);
  const stemmedQueryTokens = queryTokens.map(stem);

  if (!cleanedQuery || queryTokens.length === 0) {
    return {
      answer: `Please enter your question regarding **${studentBatch}** batch exams, fees, timetable, notices, or general campus facilities.`,
      confidence: 0,
      sources: [],
      latencyMs: Date.now() - startTime,
      matchedItem: null,
      category: 'general',
      personalizedFor: studentBatch
    };
  }

  // Detect query category intent
  let intentCategory = 'general';
  if (/exam|timetable|mid|test|quarterly|board|preparatory|arrear|revaluation|hall ticket|semester exam|iat/i.test(query)) {
    intentCategory = 'exams';
  } else if (/fee|tuition|hostel fee|mess fee|bus fee|cost|charge|payment|bank|upi/i.test(query)) {
    intentCategory = 'fee';
  } else if (/holiday|vacation|leave|pongal|diwali|break|reopening|calendar/i.test(query)) {
    intentCategory = 'holidays';
  } else if (/placement|job|recruitment|drive|package|salary|internship|tcs|infosys|zoho/i.test(query)) {
    intentCategory = 'placement';
  } else if (/notice|circular|announcement|latest news/i.test(query)) {
    intentCategory = 'notice';
  } else if (/library|timing|facility|gym|canteen|food|sports|hostel/i.test(query)) {
    intentCategory = 'facilities';
  } else if (/attendance|regulation|rule|condonation/i.test(query)) {
    intentCategory = 'rules';
  }

  // Normalize student batch
  const activeBatch = (studentBatch || 'All').toUpperCase();

  // --- GREETING INTENT HANDLER ---
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|greetings)\b/i.test(cleanedQuery)) {
    return {
      answer: `👋 **Hello! Welcome to CampusConnect AI.**\n\nI am personalized for **Batch ${activeBatch}**. You can ask me:\n- 📅 **"When are the ${activeBatch} exams?"**\n- 💳 **"${activeBatch} fee structure & payment deadlines"**\n- 🌴 **"When are the Diwali & Pongal holidays?"**\n- 💼 **"Upcoming placement drives & companies"**\n- 📊 **"What is my attendance?"**\n- 👨‍🏫 **"Who is my faculty advisor?"**\n\nHow can I help you today?`,
      confidence: 1.0,
      sources: [`CampusConnect Assistant [Batch ${activeBatch}]`],
      latencyMs: Date.now() - startTime,
      matchedItem: null,
      category: 'general',
      personalizedFor: activeBatch
    };
  }

  // --- TIER 0: Check Batch-Specific Notices First if query asks for notices/circulars ---
  if (intentCategory === 'notice' || /notice|circular|announcement|update/i.test(query)) {
    const matchingNotices = notices.filter(n => {
      const batches = n.targetBatches || ['All'];
      return batches.includes('All') || batches.includes(activeBatch);
    });

    if (matchingNotices.length > 0) {
      // Find notice with highest keyword overlap
      let bestNotice = null;
      let maxScore = -1;

      for (const notice of matchingNotices) {
        const cleanTitle = cleanAndNormalize(notice.title);
        let score = 0;

        // Exact or strong title match
        if (cleanedQuery.includes(cleanTitle) || cleanTitle.includes(cleanedQuery)) {
          score += 20;
        }

        const noticeTokens = tokenize(notice.title + ' ' + notice.content).map(stem);
        const overlap = noticeTokens.filter(t => stemmedQueryTokens.includes(t)).length;
        score += overlap;

        if (overlap > 0 && notice.targetBatches && notice.targetBatches.includes(activeBatch)) {
          score += 2;
        }

        if (score > maxScore) {
          maxScore = score;
          bestNotice = notice;
        }
      }

      if (bestNotice && maxScore > 0) {
        return {
          answer: `### 📢 Official Circular for Batch ${bestNotice.targetBatches.join(', ')}\n\n**${bestNotice.title}**\n\n${bestNotice.content}\n\n*Posted by: ${bestNotice.postedBy} | Priority: ${bestNotice.priority.toUpperCase()}*`,
          confidence: 0.95,
          sources: [`Notice Board: ${bestNotice.title}`],
          category: bestNotice.category,
          latencyMs: Date.now() - startTime,
          retrievalType: 'Live Batch Notice',
          personalizedFor: activeBatch
        };
      }
    }
  }

  // --- TIER 1: Score Knowledge Items with Batch Personalization Weighting ---
  const scoredKnowledge = knowledgeItems.map(item => {
    let score = 0;
    const itemBatches = (item.targetBatches && item.targetBatches.length > 0) ? item.targetBatches : ['All'];
    const isTargetBatchMatch = itemBatches.includes(activeBatch) || itemBatches.includes('All') || activeBatch === 'ALL';
    const isExplicitBatchMatch = itemBatches.includes(activeBatch);

    const itemTokens = tokenize(item.title + ' ' + (item.tags || []).join(' ') + ' ' + (item.queryPatterns || []).join(' ')).map(stem);
    const itemTokensSet = new Set(itemTokens);

    // 1. Direct query pattern matching
    if (item.queryPatterns && Array.isArray(item.queryPatterns)) {
      for (const pattern of item.queryPatterns) {
        const cleanPattern = cleanAndNormalize(pattern);
        if (cleanedQuery === cleanPattern) {
          score = Math.max(score, 0.95);
        } else if (cleanedQuery.includes(cleanPattern) || cleanPattern.includes(cleanedQuery)) {
          score = Math.max(score, 0.85);
        } else {
          const sim = fuzzySimilarity(cleanedQuery, cleanPattern);
          if (sim > 0.72) {
            score = Math.max(score, sim * 0.82);
          }
        }
      }
    }

    // 2. Token overlap
    let matchCount = 0;
    for (const qt of stemmedQueryTokens) {
      if (itemTokensSet.has(qt)) {
        matchCount++;
      }
    }

    if (queryTokens.length > 0) {
      const overlapRatio = matchCount / queryTokens.length;
      score = Math.max(score, overlapRatio * 0.80);
    }

    // 3. Category match bonus
    if (item.category === intentCategory && intentCategory !== 'general') {
      score += 0.15;
    }

    // 4. BATCH PERSONALIZATION BONUS / PENALTY (CRITICAL)
    if (isExplicitBatchMatch) {
      score += 0.35; // Huge boost for items explicitly meant for this student's year/batch!
    } else if (isTargetBatchMatch) {
      score += 0.05; // Universal/All batches item
    } else {
      score -= 0.40; // Penalize answers meant for different years (e.g. don't show P1 exams to an E4 student)
    }

    return {
      item,
      score: Math.min(1.0, Math.max(0, score)),
      isExplicitBatchMatch
    };
  });

  scoredKnowledge.sort((a, b) => b.score - a.score);
  const bestKnowledge = scoredKnowledge[0];

  // If we have a strong match (>= 0.40)
  if (bestKnowledge && bestKnowledge.score >= 0.40) {
    const latencyMs = Date.now() - startTime;
    const batchTag = (bestKnowledge.item.targetBatches && !bestKnowledge.item.targetBatches.includes('All'))
      ? ` [Personalized for ${activeBatch} Batch]`
      : ' [Universal Campus Info]';

    return {
      answer: bestKnowledge.item.answer,
      confidence: Math.round(bestKnowledge.score * 100) / 100,
      sources: [`${bestKnowledge.item.sourceDocument || 'Official Knowledge Base'}${batchTag}`],
      category: bestKnowledge.item.category,
      matchedItem: bestKnowledge.item,
      latencyMs,
      retrievalType: `Personalized (${activeBatch})`,
      personalizedFor: activeBatch
    };
  }

  // --- TIER 2: Search in Live Batch Notices Content (Strict Whole-Word Matching) ---
  const relevantNotices = notices.filter(n => {
    const batches = n.targetBatches || ['All'];
    return batches.includes('All') || batches.includes(activeBatch);
  });

  let bestNoticeMatch = null;
  let bestNoticeScore = 0;

  for (const n of relevantNotices) {
    const noticeWordTokens = tokenize(n.title + ' ' + n.content, true).map(stem);
    const noticeWordSet = new Set(noticeWordTokens);
    // Count exact stemmed token matches (only for meaningful words length >= 3 to prevent loose false matches)
    const significantMatches = stemmedQueryTokens.filter(t => t.length >= 3 && noticeWordSet.has(t));
    if (significantMatches.length >= 2) {
      const score = significantMatches.length / Math.max(queryTokens.length, 1);
      if (score > bestNoticeScore) {
        bestNoticeScore = score;
        bestNoticeMatch = n;
      }
    }
  }

  if (bestNoticeMatch && bestNoticeScore >= 0.35) {
    return {
      answer: `### 📌 Related Notice for Batch ${bestNoticeMatch.targetBatches.join(', ')}\n\n**${bestNoticeMatch.title}**\n\n${bestNoticeMatch.content}\n\n*Posted by: ${bestNoticeMatch.postedBy} on ${new Date(bestNoticeMatch.createdAt).toLocaleDateString()}*`,
      confidence: Math.round(bestNoticeScore * 100) / 100,
      sources: [`Official Notice Board: ${bestNoticeMatch.title}`],
      category: bestNoticeMatch.category,
      latencyMs: Date.now() - startTime,
      retrievalType: `Batch Notice Match (${activeBatch})`,
      personalizedFor: activeBatch
    };
  }

  // --- TIER 3: Document Chunks Fallback ---
  if (documentChunks.length > 0) {
    for (const chunk of documentChunks) {
      const chunkText = cleanAndNormalize(chunk.content);
      const matches = queryTokens.filter(t => chunkText.includes(t));
      if (matches.length >= 2) {
        return {
          answer: `Based on institutional documentation (**${chunk.docTitle}**):\n\n${chunk.content}`,
          confidence: 0.65,
          sources: [chunk.docTitle],
          category: chunk.category || intentCategory,
          latencyMs: Date.now() - startTime,
          retrievalType: 'RAG Document Retrieval',
          personalizedFor: activeBatch
        };
      }
    }
  }

  // --- Fallback Message ---
  const latencyMs = Date.now() - startTime;
  return {
    answer: `Sorry, the requested information for **Batch ${activeBatch}** is not available in the system yet. Please check the **Batch Notices** on your dashboard or contact the Academic Coordinator.`,
    confidence: 0.15,
    sources: ['System Fallback Handler'],
    category: intentCategory,
    matchedItem: null,
    latencyMs,
    retrievalType: 'Fallback',
    personalizedFor: activeBatch
  };
}
