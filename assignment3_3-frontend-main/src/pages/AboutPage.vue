<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-info-circle text-primary"></i> About</h1>
      <p class="text-muted">Learn more about our recipe application</p>
    </div>

    <div class="row">
      <div class="col-lg-8 mx-auto">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Welcome to Recipe Hub</h2>
            <p class="lead">
              Your ultimate destination for discovering, creating, and sharing
              amazing recipes!
            </p>

            <h3>Features</h3>
            <div class="row mt-4">
              <div class="col-md-6">
                <h5>
                  <i class="fas fa-search text-primary"></i> Recipe Search
                </h5>
                <p>
                  Search through thousands of recipes with advanced filtering
                  options by cuisine, diet, and ingredients.
                </p>
              </div>
              <div class="col-md-6">
                <h5><i class="fas fa-heart text-danger"></i> Favorites</h5>
                <p>
                  Save your favorite recipes and access them anytime from your
                  personal collection.
                </p>
              </div>
              <div class="col-md-6">
                <h5>
                  <i class="fas fa-users text-success"></i> Family Recipes
                </h5>
                <p>
                  Store and organize your cherished family recipes passed down
                  through generations.
                </p>
              </div>
              <div class="col-md-6">
                <h5><i class="fas fa-book text-info"></i> My Recipes</h5>
                <p>
                  Create and manage your own recipe collection with custom
                  ingredients and instructions.
                </p>
              </div>
            </div>
            <h3 class="mt-4">Development Team</h3>
            <p class="lead">
              This recipe application was developed as part of a web development
              course, showcasing modern web technologies including Vue.js,
              Node.js, Express, and MySQL.
            </p>

            <div class="row mt-4">
              <div class="col-md-6 text-center">
                <div class="team-member-card">
                  <i class="fas fa-user-circle fa-4x text-primary mb-3"></i>
                  <h4>Amit Dvash</h4>
                  <p class="text-muted">Student</p>
                  <a
                    href="https://github.com/WED-2023/316127653"
                    target="_blank"
                    class="btn btn-outline-primary btn-sm"
                  >
                    <i class="fab fa-github"></i> Personal Project
                  </a>
                </div>
              </div>
              <div class="col-md-6 text-center">
                <div class="team-member-card">
                  <i class="fas fa-user-circle fa-4x text-success mb-3"></i>
                  <h4>Yali Katz</h4>
                  <p class="text-muted">Student</p>
                  <a
                    href="https://github.com/WED-2023/211381009"
                    target="_blank"
                    class="btn btn-outline-success btn-sm"
                  >
                    <i class="fab fa-github"></i> Personal Project
                  </a>
                </div>
              </div>
            </div>

            <div class="shared-project-section mt-5">
              <h4 class="text-center">Shared Project</h4>
              <p class="text-center text-muted mb-4">
                Our collaborative work combining the best of both developers'
                skills
              </p>
              <div class="text-center">
                <a
                  href="https://github.com/WED-2023/assignment2-211381009_316127653_assignment2"
                  target="_blank"
                  class="btn btn-dark btn-lg"
                >
                  <i class="fab fa-github"></i> View Shared Project Repository
                </a>
              </div>
            </div>

            <h3 class="mt-5">Project Overview</h3>
            <div class="row mt-3">
              <div class="col-md-4">
                <div class="tech-item">
                  <i class="fab fa-vuejs fa-2x text-success"></i>
                  <h5>Vue.js Frontend</h5>
                  <p class="small">
                    Modern reactive user interface with component-based
                    architecture
                  </p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="tech-item">
                  <i class="fab fa-node-js fa-2x text-success"></i>
                  <h5>Node.js Backend</h5>
                  <p class="small">
                    RESTful API with Express framework for robust server-side
                    functionality
                  </p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="tech-item">
                  <i class="fas fa-database fa-2x text-primary"></i>
                  <h5>MySQL Database</h5>
                  <p class="small">
                    Reliable data storage for users, recipes, and application
                    state
                  </p>
                </div>
              </div>
            </div>

            <div class="text-center mt-5">
              <router-link
                :to="{ name: 'main' }"
                class="btn btn-primary btn-lg"
              >
                <i class="fas fa-home"></i> Back to Home
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutPage",
};
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #dee2e6;
}

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
}

.lead {
  color: #6c757d;
}

h5 i {
  margin-right: 8px;
}

.team-member-card {
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  margin-bottom: 20px;
  transition: transform 0.2s ease-in-out;
}

.team-member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.shared-project-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 30px;
  border-radius: 15px;
  border: 1px solid #dee2e6;
}

.tech-item {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}

.tech-item i {
  margin-bottom: 15px;
}

.tech-item h5 {
  color: #495057;
  margin-bottom: 10px;
}

.tech-item .small {
  color: #6c757d;
  line-height: 1.4;
}

/* Link styling */
a[target="_blank"] {
  text-decoration: none;
}

a[target="_blank"]:hover {
  text-decoration: none;
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .team-member-card {
    margin-bottom: 30px;
  }

  .shared-project-section {
    padding: 20px;
  }
}
</style>
