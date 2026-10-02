const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs";

function mapAdzunaJob(job, roleTitle) {
    return {
        id: String(job.id),
        title: job.title || roleTitle,
        company: job.company?.display_name || "Company not listed",
        location: job.location?.display_name || "Location not listed",
        description: job.description || "",
        created: job.created || null,
        contractType: job.contract_time || job.contract_type || null,
        salaryMin: job.salary_min || null,
        salaryMax: job.salary_max || null,
        url: job.redirect_url || job.adref || null,
        role: roleTitle
    };
}

async function searchJobsByRole({ roleTitle, where, country, resultsPerPage = 6 }) {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    const countryCode = (country || process.env.ADZUNA_COUNTRY || "in").toLowerCase();

    if (!appId || !appKey) {
        throw new Error("Adzuna credentials are missing. Set ADZUNA_APP_ID and ADZUNA_APP_KEY in the backend .env file.");
    }

    const params = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        results_per_page: String(resultsPerPage),
        what: roleTitle,
        "content-type": "application/json"
    });

    if (where) {
        params.set("where", where);
    }

    const url = `${ADZUNA_BASE_URL}/${countryCode}/search/1?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        const body = await response.text();
        console.error("Adzuna API error:", response.status, body);
        throw new Error("Failed to fetch jobs from Adzuna");
    }

    const data = await response.json();
    const listings = Array.isArray(data.results) ? data.results : [];

    return {
        count: data.count || listings.length,
        jobs: listings.map((job) => mapAdzunaJob(job, roleTitle))
    };
}

async function searchJobsForRoles({ roles, where, country }) {
    const searches = await Promise.allSettled(
        roles.map((role) => searchJobsByRole({
            roleTitle: role.title,
            where,
            country
        }))
    );

    const jobs = [];
    const errors = [];

    searches.forEach((result, index) => {
        if (result.status === "fulfilled") {
            jobs.push(...result.value.jobs);
        } else {
            errors.push({
                role: roles[index].title,
                message: result.reason?.message || "Job search failed"
            });
        }
    });

    return { jobs, errors };
}

module.exports = {
    searchJobsForRoles
};
