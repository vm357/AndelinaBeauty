/* ===========================
   CONFIG
=========================== */

// Admin toggle (ONLY true for you)
const IS_ADMIN = false; 
// Set this to true when YOU want delete buttons visible

/* DOM elements */

const reviewsContainer = document.getElementById("reviewsContainer");
const form = document.getElementById("reviewForm");
const ratingInput = document.getElementById("rating");
const imageInput = document.getElementById("reviewImage");
const imagePreview = document.getElementById("imagePreview");
const stars = document.querySelectorAll(".star-rating i");

/* Default reviews (seed) */

const defaultReviews = [
  {
    name: "Sarah J.",
    rating: 5,
    text: "Andelina Beauty transformed my nail game!",
    image: null,
    date: "2026-01-01"
  }
];

if (!localStorage.getItem("reviews")) {
  localStorage.setItem("reviews", JSON.stringify(defaultReviews));
}

/* ===========================
   Render reviews function */

function renderReviews() {
  reviewsContainer.innerHTML = "";

  const reviews = JSON.parse(localStorage.getItem("reviews")) || [];

  reviews.forEach((r, index) => {
    reviewsContainer.innerHTML += `
      <div class="col-md-4">
        <div class="testimonial-card h-100">
          <div class="stars">${"★".repeat(r.rating)}</div>

          <p class="testimonial-quote">
            “${r.text}”
          </p>

          <h6 class="testimonial-author">
            — ${r.name || "Anonymous"}
          </h6>

          ${r.image ? `<img src="${r.image}" class="img-fluid rounded mt-3">` : ""}

          ${
            IS_ADMIN
              ? `<button class="btn btn-sm btn-outline-danger mt-3"
                   onclick="deleteReview(${index})">
                   Delete
                 </button>`
              : ""
          }
        </div>
      </div>
    `;
  });
}

/* Delete (ADMIN ONLY) function*/

function deleteReview(index) {
  if (!IS_ADMIN) return;

  const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.splice(index, 1);
  localStorage.setItem("reviews", JSON.stringify(reviews));
  renderReviews();
}

/* STAR RATING */

stars.forEach(star => {
  star.addEventListener("click", () => {
    const value = star.dataset.value;
    ratingInput.value = value;

    stars.forEach(s => {
      s.classList.toggle("active", s.dataset.value <= value);
    });
  });
});

/* Image preview */

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.src = reader.result;
    imagePreview.classList.remove("d-none");
  };
  reader.readAsDataURL(file);
});

/* Form submit  */

form.addEventListener("submit", e => {
  e.preventDefault();

  const rating = ratingInput.value;
  const text = form.querySelector("textarea").value.trim();
  const name = document.getElementById("reviewName").value.trim();
  const image = imagePreview.src || null;

  if (!rating || !text) {
    alert("Please add a rating and comment 💕");
    return;
  }

  const review = {
    name: name || "Anonymous",
    rating: Number(rating),
    text,
    image,
    date: new Date().toLocaleDateString()
  };

  const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.push(review);
  localStorage.setItem("reviews", JSON.stringify(reviews));

  form.reset();
  imagePreview.classList.add("d-none");
  stars.forEach(s => s.classList.remove("active"));

  renderReviews();
  alert("Thank you for your review! 🌸");
});

/* ===========================
   INIT
=========================== */

renderReviews();
