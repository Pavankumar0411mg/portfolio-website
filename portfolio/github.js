// GitHub API integration
const GITHUB_USERNAME = 'Pavankumar0411mg'; // Your GitHub username

async function fetchGitHubProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
        const repos = await response.json();
        
        if (response.ok) {
            // Fetch releases for each repo
            const reposWithReleases = await Promise.all(
                repos.map(async (repo) => {
                    try {
                        const releaseResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/releases/latest`);
                        if (releaseResponse.ok) {
                            const release = await releaseResponse.json();
                            repo.latestRelease = release;
                        }
                    } catch (error) {
                        console.log(`No release found for ${repo.name}`);
                    }
                    return repo;
                })
            );
            displayProjects(reposWithReleases);
        } else {
            console.error('Error fetching repositories:', repos.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayProjects(repos) {
    const projectsGrid = document.querySelector('.projects-grid');
    
    // Clear existing projects
    projectsGrid.innerHTML = '';
    
    repos.forEach(repo => {
        if (!repo.fork) { // Skip forked repositories
            const projectCard = createProjectCard(repo);
            projectsGrid.appendChild(projectCard);
        }
    });
}

function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.cursor = 'pointer';
    card.onclick = () => window.open(repo.html_url, '_blank');
    
    // Get primary language or default
    const language = repo.language || 'Code';
    
    // Create project image (you can customize this)
    const imageUrl = `https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}`;
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${repo.name}" onerror="this.src='https://via.placeholder.com/400x250?text=${repo.name}'">
        <div class="project-content">
            <h3>${repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
            <p>${repo.description || 'No description available'}</p>
            <div class="project-tech">
                ${language ? `<span>${language}</span>` : ''}
                ${repo.topics ? repo.topics.slice(0, 3).map(topic => `<span>${topic}</span>`).join('') : ''}
            </div>
            <div class="project-links">
                ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="btn small" onclick="event.stopPropagation()">Live Demo</a>` : `<a href="https://${GITHUB_USERNAME}.github.io/${repo.name}/" target="_blank" class="btn small" onclick="event.stopPropagation()">Live Demo</a>`}
                ${repo.latestRelease ? `<a href="${repo.latestRelease.html_url}" target="_blank" class="btn small" onclick="event.stopPropagation()">Release</a>` : ''}
                <a href="${repo.html_url}" target="_blank" class="btn small secondary" onclick="event.stopPropagation()">GitHub</a>
            </div>
        </div>
    `;
    
    return card;
}

// Load projects when page loads
document.addEventListener('DOMContentLoaded', fetchGitHubProjects);