require('dotenv').config();
const { exec } = require("child_process");

const truthAllowance = [
  "fact", "verified", "confirmed", "evidence", "accurate", "true", "reliable", "authentic", "actual",
  "correct", "genuine", "proven", "honest", "transparent", "clear", "precise", "based on evidence",
  "supported by data", "consistent", "unquestionable"
];

const falseAllowance = [
  "not", "not true", "unverified", "false", "incorrect", "misleading", "deceptive", "bogus", "fabricated",
  "fake", "contradictory", "untrue", "speculative", "unsubstantiated", "dubious", "misrepresented",
  "exaggerated", "distorted", "flawed", "unfounded", "unreliable", "inaccurate", "no evidence"
];

const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=the+earth+is+round&key=${process.env.API_KEY}`;

const analyzeClaim = (claim) => {
  const claimLower = claim.toLowerCase().trim();

  // Check for negations of truth words
  const hasNegatedTruth = truthAllowance.some(word =>
    claimLower.includes(`not ${word}`) ||
    claimLower.includes(`no ${word}`) ||
    claimLower.includes(`lacks ${word}`)
  );

  if (hasNegatedTruth) {
    return 'false';
  }

  // Check for direct false indicators
  const hasFalseWord = falseAllowance.some(word => claimLower.includes(word));
  if (hasFalseWord) {
    return 'false';
  }

  // Check for truth indicators
  const hasTruthWord = truthAllowance.some(word => claimLower.includes(word));
  if (hasTruthWord) {
    return 'true';
  }

  // If no clear indicators are found, consider it unverified
  return 'unverified';
}

exec(`curl -s "${url}"`, (error, stdout) => {
  if (error) {
    console.error("Error:", error);
    return;
  }

  try {
    const jsonResponse = JSON.parse(stdout);
    let claims = [];
    let scores = {
      truth: 0,
      false: 0,
      unverified: 0
    };

    jsonResponse.claims.forEach(claim => {
      const factCheck = claim.claimReview?.[0]?.textualRating ?? "Unknown";
      claims.push(factCheck);
      const claimTitle = claim.claimReview?.[0]?.title ?? "Unknown";
      console.log(`Title: ${claimTitle}, Claim Review: ${factCheck}`);

      // Analyze each claim and increment appropriate score
      const result = analyzeClaim(factCheck);
      scores[result]++;
    });

    //console.log('\nScoring Results:');
    //console.log(`Truth Score: ${scores.truth}`);
    //console.log(`False Score: ${scores.false}`);
    //console.log(`Unverified Score: ${scores.unverified}`);


    // verdict analysis


    // For debugging specific claims
    console.log('\nDetailed Analysis:');
    claims.forEach(claim => {
      console.log(`Claim: "${claim}" -> Scored as: ${analyzeClaim(claim)}`);
    });

  } catch (e) {
    console.error("Invalid JSON response", e);
  }
});

function get_verdict(truthScore, totalScore) {
  percentScore = (truthScore * 100) / totalScore
  console.log(percentScore)
}
