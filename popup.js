// popup.js - where the logic is evaluated
// written by the Segfaulters - Backend - Saaim Japanwala

const API_KEY = 'AIzaSyD4_WYs53kQe00H1E3AvfIOYU3cVvj0B6o';
// please take out the api key when finished with the code - SJ

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

// created 2 arrays that have definite dos and donts for true and false statements, to handle edgecases

function analyzeClaim(claim) {
  const claimLower = claim.toLowerCase().trim();

  const hasNegatedTruth = truthAllowance.some(word =>
    claimLower.includes(`not ${word}`) ||
    claimLower.includes(`no ${word}`)
  ); // handeling negated values ("not true" = false, "not false" = true)

  if (hasNegatedTruth) return 'false';
  if (falseAllowance.some(word => claimLower.includes(word))) return 'false'; // checking if statement has any false values in it
  if (truthAllowance.some(word => claimLower.includes(word))) return 'true'; // checking if the statement has any true values in it
  return 'unverified';
}

function displayVerdict(scores) {
  // in this function we are getting the final verdict on the fact, if its real or bullshit
  // function input: scores = struct / dictionary
  // function output: htmldiv / the final verdict
  const resultsDiv = document.getElementById('results');
  let verdict;
  let className;

  if (scores.true > scores.false && scores.true > scores.unverified) {
    verdict = "Likely True";
    className = "true";
  } else if (scores.false > scores.true && scores.false > scores.unverified) {
    verdict = "Likely False";
    className = "false";
  } else {
    verdict = "No Definite Verdict";
    className = "unverified";
  }

  resultsDiv.innerHTML = `
    <div class="result ${className}">
      ${verdict}
    </div>
  `;
}

function getSources(sourceLen) {
  console.log('getSources called with sourceLen:', sourceLen);
  const resultsDiv = document.getElementById('sourceInfo');
  let sourceResponse;

  if (sourceLen >= 1) {
    sourceResponse = `Searched From ${sourceLen} Source(s)`;
    resultsDiv.innerHTML = `
      <div class="sourceInfo" id="sourceResponseDiv">
        ${sourceResponse}
      </div>
    `;
    // Add event listener after creating the element
    const sourceResponseDiv = document.getElementById('sourceResponseDiv');
    sourceResponseDiv.style.cursor = 'pointer';
    sourceResponseDiv.addEventListener('click', toggleSources);
  } else {
    sourceResponse = "Did not find any sources regarding the claim";
    resultsDiv.innerHTML = `
      <div class="sourceInfo">
        ${sourceResponse}
      </div>
    `;
  }
}

function saveSources(data) {
  console.log('saveSources called with data:', data);
  const resultsDiv = document.getElementById('sourceList');
  resultsDiv.innerHTML = '';

  if (data.claims) {
    let claimNum = 1;
    data.claims.forEach(claim => {
      const title = claim.text ?? "Unknown";
      const titleElement = document.createElement('h3');
      const claimant = claim.claimant ?? "Unknown";
      const claimantElement = document.createElement('p');
      const factChecker = claim.claimReview[0]?.publisher?.name ?? "Unknown";
      const factCheckerElement = document.createElement('p');
      const factCheckerResponse = claim.claimReview?.[0]?.textualRating ?? "No URL";
      const factCheckerResponseElement = document.createElement('p');
      const divElement = document.createElement('p')
      titleElement.textContent = title;
      claimantElement.textContent = `Claimed By: ${claimant}`;
      factCheckerElement.textContent = `Fact Checked By: ${factChecker}`;
      factCheckerResponseElement.textContent = `Response To Claim: "${factCheckerResponse}"`;
      divElement.textContent = `------------ Claim Number ${claimNum} ------------`;
      resultsDiv.appendChild(divElement);
      resultsDiv.appendChild(titleElement);
      resultsDiv.appendChild(claimantElement);
      resultsDiv.appendChild(factCheckerElement);
      resultsDiv.appendChild(factCheckerResponseElement);
      claimNum += 1
    });
  }
}

function toggleSources() {
  console.log('toggleSources called');
  const sourceList = document.getElementById('sourceList');
  if (sourceList) {
    console.log('Current display:', sourceList.style.display);
    sourceList.style.display = sourceList.style.display === 'none' ? 'block' : 'none';
    console.log('New display:', sourceList.style.display);
  } else {
    console.log('sourceList element not found');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // the "main" function
  chrome.storage.local.get(['selectedText'], function(result) { // getting the extracted text from "background.js" and analyzing it here
    if (result.selectedText) {
      const contentDiv = document.getElementById('content');
      contentDiv.textContent = `${result.selectedText} `;


      const searchRaw = result.selectedText
      const searchInput = result.selectedText.replace(/ /g, "+"); // since the text may have spaces and queries take " " = + we have to convert it
      const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${searchInput}&key=${API_KEY}`;

      fetch(url)
        .then(response => response.json())
        .then(data => {
          document.getElementById('loading').style.display = 'none';

          let scores = { true: 0, false: 0, unverified: 0 }; // lets initialize the struct, MAKE SURE EVERYTHING IS ZEROD (unless we rigging results 😏) -SJ
          if (!searchRaw.includes(" ")) {
            document.getElementById('results').innerHTML = `
                  <div class="result nostatement">
                    No Statement Detected 
                  </div>
                `;
            return;
          }
          else if (data.claims && data.claims.length > 0) {
            data.claims.forEach(claim => {
              const factCheck = claim.claimReview?.[0]?.textualRating ?? "Unknown"; // this is where the textual rating is evaluted
              scores[analyzeClaim(factCheck)]++;
            });
            sourceLength = data.claims.length
            console.log(`Calling This ${url}`)
            console.log(sourceLength)
            displayVerdict(scores); // displaying the verdict
            getSources(sourceLength)
            saveSources(data)
          } else {
            // edge case where no data is found 😔
            document.getElementById('results').innerHTML = `
              <div class="result unverified">
                No Credible Fact Checks Found<br>Proceed With Careful Judgement!
              </div>
            `;
          }
        })
        .catch(error => {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('results').innerHTML = `
            <div class="result unverified">
              Error Gathering Facts
            </div>
          `;
        });
    }
  });
});
