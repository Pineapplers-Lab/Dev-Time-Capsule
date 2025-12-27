// utils/apiClients.ts
export async function fetchOSVVulnerabilities(packageName: string, version: string) {
    const res = await fetch(`https://api.osv.dev/v1/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: { name: packageName }, version }),
    });
    return res.json();
}

export async function fetchGitHubAdvisories(repo: string, token: string) {
    const query = `
    query {
      repository(owner: "${repo.split("/")[0]}", name: "${repo.split("/")[1]}") {
        vulnerabilityAlerts(first: 10) {
          nodes {
            securityVulnerability {
              package { name }
              advisory { summary severity }
              vulnerableVersionRange
            }
          }
        }
      }
    }
  `;
    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `bearer ${token}` },
        body: JSON.stringify({ query }),
    });
    return res.json();
}
