<template>
  <div>
    <header class="navbar">
      <router-link to="/" class="logo">Autovermietung</router-link>

      <nav class="nav-right">
        <router-link to="/vehicles">Fahrzeuge</router-link>
        <router-link to="/login" class="btn">Login</router-link>
        <router-link to="/register" class="btn">Registrieren</router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #eee;
}
.nav-right {
  display: flex;
  gap: 20px;
}
.btn {
  padding: 8px 15px;
  border: 1px solid black;
  border-radius: 5px;
}
</style>
