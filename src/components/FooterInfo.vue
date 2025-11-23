<template>
  <footer class="footer">
    <div class="footer-inner">
      <!-- LOGO -->
      <div class="footer-left">
        <img src="https://placehold.co/160x45?text=Mazari" alt="Mazari Logo" class="footer-logo" />
        <p class="footer-text">Premium Autovermietung · Zuverlässig & Modern</p>
      </div>

      <!-- LINKS -->
      <div class="footer-center">
        <p>Impressum</p>
        <p>Datenschutz</p>
        <p>AGB</p>
        <p>Kontakt</p>
      </div>

      <!-- SOCIALS -->
      <div class="footer-right">
        <a class="social-icon"><i class="fa-brands fa-instagram"></i></a>
        <a class="social-icon"><i class="fa-brands fa-tiktok"></i></a>
        <a class="social-icon"><i class="fa-brands fa-youtube"></i></a>
      </div>
    </div>

    <!-- FOOTER BOTTOM -->
    <div class="footer-bottom">
      © {{ new Date().getFullYear() }} Mazari Autovermietung – Alle Rechte vorbehalten.
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap');

/* FOOTER */
.footer {
  background: #06457f;
  color: white;
  padding: 45px 20px 25px;
  font-family: 'Urbanist', sans-serif;
  border-top: 4px solid #a8c4ec;
  margin-top: auto;
}

/* MAIN FOOTER LAYOUT */
.footer-inner {
  max-width: 1300px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

/* LEFT SIDE */
.footer-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer-logo {
  width: 160px;
}

.footer-text {
  color: #e2eaf5;
  font-size: 14px;
  opacity: 0.85;
}

/* CENTER LINKS */
.footer-center {
  display: flex;
  gap: 30px;
  font-size: 15px;
  font-weight: 500;
  width: 40%;
  text-align: left;
}

.footer-center p {
  cursor: default;
  opacity: 0.85;
  transition: 0.2s;
}

.footer-center p:hover {
  opacity: 1;
}

/* RIGHT SIDE (SOCIALS) */
.footer-right {
  display: flex;
  gap: 12px;
}

.social-icon {
  width: 40px;
  height: 40px;
  background: white;
  color: #0f172a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1.25rem;
  transition: 0.25s;
  cursor: pointer;
}

.social-icon:hover {
  background: #a8c4ec;
  transform: translateY(-4px);
}

/* BOTTOM TEXT */
.footer-bottom {
  text-align: center;
  opacity: 0.65;
  font-size: 14px;
  margin-top: 25px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .footer-inner {
    flex-direction: column;
    gap: 40px;
    text-align: center;
  }

  .footer-right {
    justify-content: center;
  }
}
</style>
