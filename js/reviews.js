/* ===========================
   CONFIG
=========================== */
document.addEventListener("DOMContentLoaded", () => {
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
/* End default reviews (seed) */

document.querySelectorAll(".sort-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {
    currentSort = btn.dataset.sort;
    renderReviews();

    // active state
    document.querySelectorAll(".sort-buttons button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
  });
});


/* Admin toggle button logic */
const Admin = {
  isEnabled() {
    return localStorage.getItem("isAdmin") === "true";
  },

  enable() {
    localStorage.setItem("isAdmin", "true");
    alert("Admin mode enabled 💖");
    renderReviews();
  },

  disable() {
    localStorage.removeItem("isAdmin");
    alert("Admin mode disabled");
    renderReviews();
  },

  toggle() {
    if (this.isEnabled()) {
      this.disable();
    } else {
      const pass = prompt("Enter admin password:");
      if (pass === "andelina123") {
        this.enable();
      } else {
        alert("Incorrect password");
      }
    }
  }
};

/* End admin toggle button logic */
document.getElementById("adminToggleBtn")
  ?.addEventListener("click", () => Admin.toggle());

/* ===========================
   SECRET ADMIN KEY COMBO
   =========================== */

// Example combo: Ctrl + Shift + A
document.addEventListener("keydown", (e) => {
  const isCombo =
    e.ctrlKey &&
    e.shiftKey &&
    e.key.toLowerCase() === "a";

  if (isCombo) {
    e.preventDefault();
    console.log("🛠 Admin combo activated");
    Admin.toggle();
  }
});


/* Render reviews section 2.0 */
// State
let currentSort = "newest";

//Sorting
function setSort(type) {
  currentSort = type;
  renderReviews();
}

// Render reviews
function renderReviews() {
  const container = document.querySelector("#reviewsContainer");
  container.innerHTML = "";

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

if (reviews.length === 0) {
  document.getElementById("avgNumber").textContent = "(0.0)";
  document.getElementById("reviewCount").textContent = "0";
  document.getElementById("avgStars").textContent = "☆☆☆☆☆";
  return;
}

  // SORTING
  if (currentSort === "highest") {
    reviews.sort((a, b) => b.rating - a.rating);
  } else if (currentSort === "lowest") {
    reviews.sort((a, b) => a.rating - b.rating);
  } else {
    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // AVERAGE RATING
  const total = reviews.reduce((sum, r) => sum + Number(r.rating), 0);
  const average = (total / reviews.length).toFixed(1);

  document.getElementById("avgNumber").textContent = `(${average})`;
  document.getElementById("reviewCount").textContent = reviews.length;

  const fullStars = Math.round(average);
  document.getElementById("avgStars").textContent = "★".repeat(fullStars);

  // RENDER CARDS
  reviews.forEach((r, index) => {
    container.innerHTML += `
      <div class="col-md-4">
        <div class="testimonial-card h-100">
          <div class="stars mb-2">${"★".repeat(r.rating)}</div>
          <p class="testimonial-quote">"${r.text}"</p>
          <h6 class="testimonial-author mt-3">
            — ${r.name || "Anonymous"}
          </h6>
          ${r.image ? `<img src="${r.image}" class="img-fluid rounded mt-3">` : ""}
          
          ${Admin.isEnabled() ? `
            <button
              class="btn admin-delete-btn mt-3"
              onclick="openDeleteModal(${index})"
            >
              Delete
            </button>
          ` : ""}

        </div>
      </div>
    `;
  });
}
/* End render reviews section 2.0 */

/* ===========================
   IMAGE LIGHTBOX
=========================== */
function setupImageLightbox() {
  const modalEl = document.getElementById("imageModal");
  const modal = new bootstrap.Modal(modalEl, {
    backdrop: true,
    keyboard: true
  });
  const modalImg = document.getElementById("modalImage");

  reviewsContainer.addEventListener("click", (e) => {
    if (
      e.target.tagName === "IMG" &&
      e.target.closest(".testimonial-card")
    ) {
      modalImg.src = e.target.src;
      modal.show();
    }
  });
}

const imageModalEl = document.getElementById("imageModal");

imageModalEl.addEventListener("hidden.bs.modal", () => {
  // Force restore scrolling
  document.body.style.overflow = "";
  document.body.classList.remove("modal-open");

  // Clean up any leftover backdrops
  document.querySelectorAll(".modal-backdrop").forEach(b => b.remove());
});

// Initialize lightbox after reviews are rendered
setupImageLightbox();

let pendingDeleteIndex = null;

/* Delete (ADMIN ONLY) function*/
function openDeleteModal(index) {
  if (!Admin.isEnabled()) return;

  pendingDeleteIndex = index;

  const modalEl = document.getElementById("deleteConfirmModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

document.getElementById("confirmDeleteBtn")?.addEventListener("click", () => {
  if (pendingDeleteIndex === null) return;

  const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.splice(pendingDeleteIndex, 1);
  localStorage.setItem("reviews", JSON.stringify(reviews));

  pendingDeleteIndex = null;

  bootstrap.Modal.getInstance(
    document.getElementById("deleteConfirmModal")
  ).hide();

  renderReviews();
});



/* STAR RATING */
stars.forEach((star) => {
  star.addEventListener("click", () => {
    const value = Number(star.dataset.value);
    ratingInput.value = value;

    stars.forEach((s) => {
      if (Number(s.dataset.value) <= value) {
        s.classList.remove("bi-star");
        s.classList.add("bi-star-fill", "active");
      } else {
        s.classList.remove("bi-star-fill", "active");
        s.classList.add("bi-star");
      }
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
setupImageLightbox();
}); // To close DOMContentLoaded