// Handle review form submission
document.addEventListener("DOMContentLoaded", function () {
  const reviewForm = document.querySelector(".review-form");
  const photoInput = document.getElementById("review-photo");
  const analyzeButton = document.getElementById("analyse-photo");
  const reviewTextarea = document.getElementById("review-text");
  const summarizeButton = document.getElementById("summarize-reviews");

  // Load reviews from JSON file
  loadReviews();

  // Initially disable the analyze button
  if (analyzeButton) {
    analyzeButton.disabled = true;
  }

  // Handle textarea blur event (when focus leaves)
  if (reviewTextarea) {
    reviewTextarea.addEventListener("blur", async function () {
      const textContent = this.value.trim();
      console.log("=== Review Textarea Focus Lost ===");
      console.log("Current text length:", textContent.length);
      console.log("Current text content:", textContent);

      // Call proofRead function if there's any content
      if (textContent.length > 0) {
        console.log("Calling proofRead function...");
        const correctedReview = await proofRead(textContent);
        if (correctedReview && correctedReview.length > 0) {
          this.value = correctedReview;
        }
      }

      console.log("=== End Textarea Analysis ===");
    });
  }

  // Enable/disable analyze button based on file selection
  if (photoInput && analyzeButton) {
    photoInput.addEventListener("change", function () {
      if (this.files && this.files.length > 0) {
        analyzeButton.disabled = false;
      } else {
        analyzeButton.disabled = true;
      }
    });

    // Handle analyze button click
    analyzeButton.addEventListener("click", async function () {
      if (photoInput.files && photoInput.files.length > 0) {
        const file = photoInput.files[0];
        console.log("=== Photo Analysis ===");
        console.log("Analyzing file:", file.name);
        console.log("File size:", file.size, "bytes");
        console.log("File type:", file.type);

        const recommendedComment = await analyseImage(file);
        console.log("=== Analysis Complete ===");

        if (
          recommendedComment &&
          recommendedComment.title &&
          recommendedComment.review
        ) {
          const reviewTitleInput = document.getElementById("review-title");
          if (reviewTitleInput && recommendedComment.title) {
            reviewTitleInput.value = recommendedComment.title;
          }

          reviewTextarea.value = recommendedComment.review;
          reviewTextarea.value = recommendedComment.review;
        }
      }
    });
  }

  // Handle summarize button click
  if (summarizeButton) {
    if ("Summarizer" in self) {
      summarizeButton.addEventListener("click", async function () {
        console.log("=== Summarizing Reviews ===");

        try {
          // Fetch the reviews from the JSON file
          const response = await fetch("reviews.json");
          const reviews = await response.json();

          const sum = await summarize(reviews);
          const summarizationDiv = document.getElementById("summarization");
          if (summarizationDiv && sum) {
            summarizationDiv.textContent = sum;
          }
          
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }

        console.log("=== End Review Summary ===");
      });
    }
  }

  if (reviewForm) {
    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent actual form submission

      // Get form data
      const formData = new FormData(reviewForm);

      console.log("=== Review Form Submission ===");

      // Get rating value
      const rating = formData.get("rating");
      console.log("Rating:", rating);

      // Get review title
      const reviewTitle = formData.get("review-title");
      console.log("Review Title:", reviewTitle);

      // Get review text
      const reviewText = formData.get("review-text");
      console.log("Review Text:", reviewText);

      // Get photo file
      const reviewPhoto = formData.get("review-photo");
      if (reviewPhoto && reviewPhoto.size > 0) {
        console.log(
          "Photo:",
          reviewPhoto.name,
          "(Size:",
          reviewPhoto.size,
          "bytes)"
        );
      } else {
        console.log("Photo: No file selected");
      }

      console.log("=== End of Form Data ===");
    });
  }
});

async function proofRead(text) {
  if ("Proofreader" in self) {
    const proofReader = await Proofreader.create({
      expectedInputLanguages: ["en"],
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      },
    });

    const proofreadResult = await proofReader.proofread(text);
    console.log(proofreadResult);

    return proofreadResult.correctedInput;

  }
}

async function analyseImage(image) {
  const session = await LanguageModel.create({
    expectedInputs: [{ type: "image" }],
  });

  // const prompt = `
  // This is the image of a product. Generate a description for a review mentioning its condition.
  // in one sentence only, tell how you felt when you received this product.
  
  // Then, also generate a title for the review.
  // Only output a JSON object { title, review}
  // `;
  const prompt = `
    Voici une facture. Peux-tu m'extraire le numéro de la facture ainsi que le montant total
  `

  // const schema = {
  //   title: "string",
  //   description: "string",
  // };
  const schema = {
    numero: "string",
    montant: "string"
  }

  const response = await session.prompt(
    [
      {
        role: "user",
        content: [
          { type: "text", value: prompt },
          { type: "image", value: image },
        ],
      },
   ],
   {
     responseConstraint: schema,
   }
  );
  console.log(response);
  // return JSON.parse(response);
}

async function summarize(data) {
  if ('Summarizer' in self) {
    const summarizer = await Summarizer.create({
      type: "key-points",
      expectedInputLanguages: ["en"],
      outputLanguage: "en",
      expectedContextLanguages: ["en"],
      sharedContext: "These are review for an article give as a stringify json. Give me a sumarry of what people think",
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      }
    })

    const response = await summarizer.summarize(JSON.stringify(data));

    return response;
  }
}
// Function to load and display reviews from JSON
async function loadReviews() {
  try {
    const response = await fetch('reviews.json');
    const reviews = await response.json();
    
    const reviewsContainer = document.getElementById('reviews-container');
    if (!reviewsContainer) {
      console.error('Reviews container not found');
      return;
    }
    
    // Clear existing content
    reviewsContainer.innerHTML = '';
    
    // Generate HTML for each review
    reviews.forEach(review => {
      const reviewElement = createReviewElement(review);
      reviewsContainer.appendChild(reviewElement);
    });
    
    console.log(`Loaded ${reviews.length} reviews from JSON`);
    
  } catch (error) {
    console.error('Error loading reviews:', error);
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer) {
      reviewsContainer.innerHTML = '<p>Error loading reviews. Please try again later.</p>';
    }
  }
}

// Function to create a review element
function createReviewElement(review) {
  const reviewDiv = document.createElement('div');
  reviewDiv.className = 'review';
  
  // Generate stars based on rating
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  
  // Format date
  const formattedDate = new Date(review.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  reviewDiv.innerHTML = `
    <div class="review-header">
      <div class="reviewer-info">
        <span class="reviewer-name">${review.name}</span>
        <span class="review-date">${formattedDate}</span>
      </div>
      <div class="review-rating">${stars}</div>
    </div>
    <div class="review-title">
      <h4>${review.title}</h4>
    </div>
    <div class="review-content">
      <p>${review.review}</p>
    </div>
  `;
  
  return reviewDiv;
}

// async function summarize(data) {
//   const availability = await Summarizer.availability();
//   if (availability === "unavailable") {
//     // The Summarizer API isn't usable.
//     return;
//   }

//   const summarizer = await Summarizer.create({
//     type: "key-points",
//     expectedInputLanguages: ["en"],
//     outputLanguage: "en",
//     expectedContextLanguages: ["en"],
//     sharedContext:
//       "These are review for an article give as a stringify json. Give me a sumarry of what people think",
//     monitor(m) {
//       m.addEventListener("downloadprogress", (e) => {
//         console.log(`Downloaded ${e.loaded * 100}%`);
//       });
//     },
//   });

//   const response = await summarizer.summarize(JSON.stringify(data));
//   console.log(response);

//   return response;
// }

// async function analyseImage(image) {
//   const languageModelAPISupported = "LanguageModel" in self;

//   if (languageModelAPISupported) {
//     const session = await LanguageModel.create({
//       expectedInputs: [{ type: "image" }],
//     });

//     const prompt = `
//     This is the image of a product. Generate a description for a review mentioning its condition.
//     in one sentence only, tell how you felt when you received this product.

//     Then, also generate a title for the review.
//     Only output a JSON object { title, review}
//     `;

//     const schema = {
//       title: "string",
//       description: "string",
//     };

//     const response = await session.prompt(
//       [
//         {
//           role: "user",
//           content: [
//             { type: "text", value: prompt },
//             { type: "image", value: image },
//           ],
//         },
//       ],
//       {
//         responseConstraint: schema,
//       }
//     );
//     console.log(response);

//     return JSON.parse(response);
//   }
// }

// async function proofRead(text) {
//   const proofreaderAPISupported = "Proofreader" in self;

//   if (proofreaderAPISupported) {
//     const proofReader = await Proofreader.create({
//       expectedInputLanguages: ["en"],
//       monitor(m) {
//         m.addEventListener("downloadprogress", (e) => {
//           console.log(`Downloaded ${e.loaded * 100}%`);
//         });
//       },
//     });
//     const proofreadResult = await proofReader.proofread(text);
//     console.log(text);
//     console.log(proofreadResult);

//     return proofreadResult.correctedInput;
//   }
// }