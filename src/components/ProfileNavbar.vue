<template>
  <nav class="profile-navbar">
    <div class="profile-nav-inner">
      <img src="https://placehold.co/160x50?text=LOGO" alt="Logo" class="logo" />
    </div>
  </nav>
</template>

<style scoped>
.profile-navbar {
  width: 100%;
  background: #06457f;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-nav-inner {
  max-width: 1400px;
  width: 100%;
  padding: 0 32px;
  height: 88px;
  display: flex;
  align-items: center;
}

.logo {
  height: 48px;
  object-fit: contain;
}
</style>
