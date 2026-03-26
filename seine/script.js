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
