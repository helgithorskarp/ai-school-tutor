document.addEventListener("DOMContentLoaded", () => {
  sidebar = document.getElementById("sidebar");
  sidebarIcon = document.getElementById("sidebar-icon");

  sidebar.addEventListener("click", () => {
    sidebar.style.width = "80px";
    sidebarIcon.style.display = "none";
  });
});
