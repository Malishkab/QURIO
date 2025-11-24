import faqs from "../data/faq.json";

export function getFaqReply(userQuery) {
  const query = userQuery.toLowerCase().trim();

  const stopwords = ["what","is","the","in","of","does","are","to","for","a","an","how"];
  const cleanQuery = query
    .split(" ")
    .filter((word) => !stopwords.includes(word))
    .join(" ");

  let bestMatch = null;
  let bestScore = 0;

  faqs.forEach((faq) => {
    const faqQ = faq.question.toLowerCase();

    const cleanFaq = faqQ
      .split(" ")
      .filter((word) => !stopwords.includes(word))
      .join(" ");

    const qWords = cleanQuery.split(" ");
    const fWords = cleanFaq.split(" ");

    let common = 0;
    qWords.forEach((w) => {
      if (fWords.includes(w)) common++;
    });

    const score = common / Math.max(qWords.length, 1);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  });

  if (bestScore < 0.3)
    return "I’m not fully sure about this — could you ask in a more specific way?";

  return bestMatch.answer;
}
