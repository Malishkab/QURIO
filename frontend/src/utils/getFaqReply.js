import faqs from "../data/faq.json";

export function getFaqReply(userQuery) {
  const query = userQuery.toLowerCase().trim();

  // Handle greetings first
  const greetings = ["hi", "hello", "hey"];
  if (greetings.includes(query)) {
    return "Hi! I’m QURIO  I can help you with FAQs about Thapar, attendance policy, placement info, campus facilities, and more. How can I assist you today?";
  }

  // Add hardcoded FAQ example
  if (query.includes("attendance")) {
    return "Thapar follows strict 75% attendance policy.";
  }

  // Preprocess → remove stopwords
  const stopwords = ["what", "is", "the", "in", "of", "does", "are", "to", "for", "a", "an", "how"];
  const cleanQuery = query
    .split(" ")
    .filter((word) => !stopwords.includes(word))
    .join(" ");

  let bestMatch = null;
  let bestScore = 0;

  faqs.forEach((faq) => {
    const faqQ = faq.question.toLowerCase();

    // Convert FAQ question
    const cleanFaq = faqQ
      .split(" ")
      .filter((word) => !stopwords.includes(word))
      .join(" ");

    // Keyword overlap score
    const qWords = cleanQuery.split(" ");
    const fWords = cleanFaq.split(" ");

    let common = 0;
    qWords.forEach((qw) => {
      if (fWords.includes(qw)) common++;
    });

    const score = common / Math.max(qWords.length, 1);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  });

  // Threshold to avoid wrong matches
  if (bestScore < 0.3) {
    return "I’m not fully sure about this. Can you try asking more specifically?";
  }

  return bestMatch.answer;
}
