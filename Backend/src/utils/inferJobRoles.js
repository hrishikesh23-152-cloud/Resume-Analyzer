const FRONTEND_SKILLS = [
    { label: "React.js", patterns: ["react.js", "reactjs", "react"] },
    { label: "Next.js", patterns: ["next.js", "nextjs", "next"] },
    { label: "JavaScript", patterns: ["javascript", "js", "ecmascript"] },
    { label: "TypeScript", patterns: ["typescript", "ts"] },
    { label: "Vue.js", patterns: ["vue.js", "vuejs", "vue"] },
    { label: "Angular.js", patterns: ["angular.js", "angularjs", "angular"] },
    { label: "HTML/CSS", patterns: ["html", "css", "tailwind", "bootstrap", "sass", "scss"] }
];

const BACKEND_SKILLS = [
    { label: "Node.js", patterns: ["node.js", "nodejs", "node js", "express"] },
    { label: "Java", patterns: ["java", "spring", "springboot"] },
    { label: "Python", patterns: ["python", "django", "flask", "fastapi"] },
    { label: "Go", patterns: ["golang", "go lang", "go"] },
    { label: "C#/.NET", patterns: ["c#", ".net", "dotnet"] },
    { label: "C++", patterns: ["c++", "cpp"] },
    { label: "SQL/Databases", patterns: ["sql", "mysql", "postgresql", "postgres", "mongodb", "database"] },
    { label: "System Design", patterns: ["system design", "system-design", "rest api", "graphql"] },
    { label: "Microservices", patterns: ["microservices", "micro-services", "micro services"] }
];

const DEVOPS_SKILLS = [
    { label: "Docker", patterns: ["docker"] },
    { label: "Kubernetes", patterns: ["kubernetes", "k8s"] },
    { label: "AWS", patterns: ["aws", "amazon web services"] },
    { label: "Azure / GCP", patterns: ["azure", "gcp", "google cloud"] },
    { label: "Cloud & CI/CD", patterns: ["cloud", "ci/cd", "cicd", "devops", "terraform", "linux"] }
];

const DATA_AI_SKILLS = [
    { label: "Python", patterns: ["python"] },
    { label: "Machine Learning / AI", patterns: ["machine learning", "ml", "artificial intelligence", "ai", "tensorflow", "pytorch", "deep learning"] },
    { label: "Data Analysis", patterns: ["pandas", "numpy", "data analysis", "data science", "sql"] }
];

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasPattern(text, pattern) {
    const haystack = text.toLowerCase();
    const needle = pattern.toLowerCase();

    if (needle === "java") {
        return /(^|[^a-z0-9])java(?!script)([^a-z0-9]|$)/i.test(haystack);
    }

    if (needle === "go") {
        return /(^|[^a-z0-9])go([^a-z0-9]|$)/i.test(haystack) || haystack.includes("golang");
    }

    if (needle === "c#") {
        return haystack.includes("c#") || haystack.includes("c-sharp");
    }

    if (needle === "c++") {
        return haystack.includes("c++") || haystack.includes("cpp");
    }

    if (needle === "js" || needle === "ts" || needle === "ml" || needle === "ai") {
        const regex = new RegExp(`(^|[^a-z0-9])${escapeRegex(needle)}([^a-z0-9]|$)`, "i");
        return regex.test(haystack);
    }

    const regex = new RegExp(`(^|[^a-z0-9])${escapeRegex(needle)}([^a-z0-9]|$)`, "i");
    return regex.test(haystack);
}

function matchSkills(text, skillDefs) {
    return skillDefs
        .filter((skill) => skill.patterns.some((pattern) => hasPattern(text, pattern)))
        .map((skill) => skill.label);
}

function inferJobRoles(resumeText = "", extraText = "") {
    const source = `${resumeText}\n${extraText}`.trim();
    const roles = [];

    const frontendMatches = matchSkills(source, FRONTEND_SKILLS);
    const backendMatches = matchSkills(source, BACKEND_SKILLS);
    const devopsMatches = matchSkills(source, DEVOPS_SKILLS);
    const dataAiMatches = matchSkills(source, DATA_AI_SKILLS);

    if (frontendMatches.length) {
        roles.push({
            title: "Frontend Developer",
            matchedSkills: Array.from(new Set(frontendMatches))
        });
    }

    if (backendMatches.length) {
        roles.push({
            title: "Backend Developer",
            matchedSkills: Array.from(new Set(backendMatches))
        });
    }

    if (devopsMatches.length) {
        roles.push({
            title: "DevOps Engineer",
            matchedSkills: Array.from(new Set(devopsMatches))
        });
    }

    if (dataAiMatches.length >= 2) {
        roles.push({
            title: "Data Scientist / AI Engineer",
            matchedSkills: Array.from(new Set(dataAiMatches))
        });
    }

    if (roles.length === 0 && source.length > 0) {
        roles.push({
            title: "Software Engineer",
            matchedSkills: ["Software Development"]
        });
    }

    return {
        sourceLength: source.length,
        roles: roles.slice(0, 3)
    };
}

module.exports = {
    inferJobRoles
};

